const { Wishlist, WishlistItem, Product, ProductImage } = require('../models');

class WishlistService {
  static async getOrCreateWishlist(userId) {
    let wishlist = await Wishlist.findOne({ where: { userId } });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId });
    }
    return wishlist;
  }

  static async getUserWishlist(userId) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const fullWishlist = await Wishlist.findByPk(wishlist.id, {
      include: [
        {
          model: WishlistItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'title', 'slug', 'basePrice', 'salePrice', 'brand', 'averageRating'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                },
              ],
            },
          ],
        },
      ],
    });

    return {
      wishlistId: wishlist.id,
      items: fullWishlist.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
      })),
    };
  }

  static async addItem(userId, productId) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      const error = new Error('Product not found or unavailable');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    const existing = await WishlistItem.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    if (!existing) {
      await WishlistItem.create({
        wishlistId: wishlist.id,
        productId,
      });
    }

    return await this.getUserWishlist(userId);
  }

  static async removeItem(userId, productId) {
    const wishlist = await this.getOrCreateWishlist(userId);
    await WishlistItem.destroy({
      where: { wishlistId: wishlist.id, productId },
    });
    return await this.getUserWishlist(userId);
  }
}

module.exports = WishlistService;
