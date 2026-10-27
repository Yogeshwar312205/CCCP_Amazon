const { Cart, CartItem, Product, ProductVariant, ProductImage, Inventory } = require('../models');

class CartService {
  static async getOrCreateCart(userId) {
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }
    return cart;
  }

  static async getUserCart(userId) {
    const cart = await this.getOrCreateCart(userId);

    const fullCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'title', 'slug', 'basePrice', 'salePrice', 'brand'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                },
                {
                  model: Inventory,
                  as: 'inventory',
                  attributes: ['stockQuantity'],
                },
              ],
            },
            {
              model: ProductVariant,
              as: 'variant',
              attributes: ['id', 'sku', 'variantName', 'price', 'stockQuantity'],
              include: [
                {
                  model: Inventory,
                  as: 'inventory',
                  attributes: ['stockQuantity'],
                },
              ],
            },
          ],
        },
      ],
    });

    // Calculate items count and authoritative subtotal
    let totalItems = 0;
    let subtotal = 0;

    const items = fullCart.items.map((item) => {
      const itemPrice = item.variant
        ? parseFloat(item.variant.price)
        : item.product.salePrice
        ? parseFloat(item.product.salePrice)
        : parseFloat(item.product.basePrice);

      const availableStock = item.variant
        ? item.variant.inventory?.stockQuantity ?? item.variant.stockQuantity
        : item.product.inventory?.stockQuantity ?? 10;

      const itemTotal = itemPrice * item.quantity;
      totalItems += item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemTotal,
        availableStock,
        product: item.product,
        variant: item.variant,
      };
    });

    return {
      cartId: cart.id,
      items,
      totalItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
    };
  }

  static async addItem(userId, productId, variantId, quantity) {
    const cart = await this.getOrCreateCart(userId);

    // Fetch Product & Variant to verify stock
    const product = await Product.findByPk(productId, {
      include: [{ model: Inventory, as: 'inventory' }],
    });

    if (!product || !product.isActive) {
      const error = new Error('Product not found or unavailable');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    let availableStock = product.inventory?.stockQuantity ?? 10;
    let variant;

    if (variantId) {
      variant = await ProductVariant.findOne({
        where: { id: variantId, productId, isActive: true },
        include: [{ model: Inventory, as: 'inventory' }],
      });
      if (!variant) {
        const error = new Error('Product variant not found');
        error.statusCode = 404;
        error.code = 'VARIANT_NOT_FOUND';
        throw error;
      }
      availableStock = variant.inventory?.stockQuantity ?? variant.stockQuantity;
    }

    // Check existing cart item quantity
    const existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > availableStock) {
      const error = new Error(
        `Cannot add item. Requested total (${newQty}) exceeds available stock (${availableStock}).`
      );
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    if (existingItem) {
      existingItem.quantity = newQty;
      await existingItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
      });
    }

    return await this.getUserCart(userId);
  }

  static async updateItemQuantity(userId, cartItemId, newQuantity) {
    const cart = await this.getOrCreateCart(userId);

    const item = await CartItem.findOne({
      where: { id: cartItemId, cartId: cart.id },
      include: [
        { model: Product, as: 'product', include: [{ model: Inventory, as: 'inventory' }] },
        { model: ProductVariant, as: 'variant', include: [{ model: Inventory, as: 'inventory' }] },
      ],
    });

    if (!item) {
      const error = new Error('Cart item not found');
      error.statusCode = 404;
      error.code = 'ITEM_NOT_FOUND';
      throw error;
    }

    const availableStock = item.variant
      ? item.variant.inventory?.stockQuantity ?? item.variant.stockQuantity
      : item.product.inventory?.stockQuantity ?? 10;

    if (newQuantity > availableStock) {
      const error = new Error(`Requested quantity (${newQuantity}) exceeds available stock (${availableStock}).`);
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    item.quantity = newQuantity;
    await item.save();

    return await this.getUserCart(userId);
  }

  static async removeItem(userId, cartItemId) {
    const cart = await this.getOrCreateCart(userId);
    await CartItem.destroy({ where: { id: cartItemId, cartId: cart.id } });
    return await this.getUserCart(userId);
  }

  static async clearCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    await CartItem.destroy({ where: { cartId: cart.id } });
    return await this.getUserCart(userId);
  }
}

module.exports = CartService;
