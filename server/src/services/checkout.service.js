const {
  sequelize,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  Inventory,
  InventoryTransaction,
  Address,
  Order,
  OrderItem,
  Coupon,
  CouponUsage,
  Notification,
  Shop,
  SellerOrder,
  Category,
  CategoryCommission,
  PlatformSettings,
} = require('../models');
const CouponService = require('./coupon.service');
const PaymentService = require('./payment.service');

class CheckoutService {
  /**
   * Resolve the effective commission rate for a given shop + product category.
   * Resolution order:
   *   1. shop.commissionRate (seller-specific override, if set)
   *   2. CategoryCommission for the product's category (if exists)
   *   3. PlatformSettings.defaultCommissionRate (global fallback)
   */
  static async resolveCommissionRate(shop, categoryId) {
    if (shop.commissionRate !== null && shop.commissionRate !== undefined) {
      return parseFloat(shop.commissionRate);
    }

    const categoryComm = await CategoryCommission.findOne({
      where: { categoryId },
    });
    if (categoryComm) {
      return parseFloat(categoryComm.commissionRate);
    }

    const settings = await PlatformSettings.getSingleton();
    return parseFloat(settings.defaultCommissionRate);
  }

  static async processCheckout(userId, checkoutData) {
    const { shippingAddressId, billingAddressId, couponCode, paymentMethod, simulateFailure } = checkoutData;

    const transaction = await sequelize.transaction();

    try {
      // 1. Fetch User Cart
      const cart = await Cart.findOne({
        where: { userId },
        include: [
          {
            model: CartItem,
            as: 'items',
            include: [
              { model: Product, as: 'product' },
              { model: ProductVariant, as: 'variant' },
            ],
          },
        ],
        transaction,
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        const error = new Error('Shopping cart is empty');
        error.statusCode = 400;
        error.code = 'EMPTY_CART';
        throw error;
      }

      // 2. Fetch Shipping Address
      const shippingAddress = await Address.findOne({
        where: { id: shippingAddressId, userId },
        transaction,
      });

      if (!shippingAddress) {
        const error = new Error('Invalid shipping address selected');
        error.statusCode = 400;
        error.code = 'INVALID_ADDRESS';
        throw error;
      }

      // Address snapshot JSON
      const addressSnapshot = {
        fullName: shippingAddress.fullName,
        streetAddress: shippingAddress.streetAddress,
        apartmentSuite: shippingAddress.apartmentSuite,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      };

      // 3. Process Cart Items, Lock Inventory Rows FOR UPDATE, Recalculate Totals
      let subtotalAmount = 0;
      const verifiedOrderItems = [];
      const inventoryUpdates = [];

      for (const item of cart.items) {
        const product = item.product;
        const variant = item.variant;

        if (!product || !product.isActive) {
          const error = new Error(`Product '${item.product?.title || 'Item'}' is unavailable`);
          error.statusCode = 400;
          error.code = 'PRODUCT_UNAVAILABLE';
          throw error;
        }

        // Verify seller's shop is ACTIVE (skip check for platform products with no shopId)
        if (product.shopId) {
          const shop = await Shop.findByPk(product.shopId, { transaction });
          if (!shop || shop.status !== 'ACTIVE') {
            const error = new Error(`The seller for '${product.title}' is currently unavailable.`);
            error.statusCode = 400;
            error.code = 'SELLER_UNAVAILABLE';
            throw error;
          }
        }

        // Lock Inventory row FOR UPDATE
        const inventory = await Inventory.findOne({
          where: variant ? { variantId: variant.id } : { productId: product.id },
          lock: transaction.LOCK.UPDATE,
          transaction,
        });

        const availableStock = inventory
          ? inventory.stockQuantity
          : variant
          ? variant.stockQuantity
          : 10;

        if (availableStock < item.quantity) {
          const error = new Error(
            `Insufficient stock for '${product.title}${variant ? ` (${variant.variantName})` : ''}'. Available: ${availableStock}, Requested: ${item.quantity}`
          );
          error.statusCode = 400;
          error.code = 'INSUFFICIENT_STOCK';
          throw error;
        }

        // Fetch Authoritative DB Price
        const unitPrice = variant
          ? parseFloat(variant.price)
          : product.salePrice
          ? parseFloat(product.salePrice)
          : parseFloat(product.basePrice);

        const itemSubtotal = unitPrice * item.quantity;
        subtotalAmount += itemSubtotal;

        verifiedOrderItems.push({
          productId: product.id,
          variantId: variant ? variant.id : null,
          productName: product.title,
          sku: variant ? variant.sku : product.sku,
          unitPrice,
          quantity: item.quantity,
          subtotal: parseFloat(itemSubtotal.toFixed(2)),
          shopId: product.shopId || null,
          categoryId: product.categoryId,
        });

        inventoryUpdates.push({
          inventory,
          quantityDeducted: item.quantity,
        });
      }

      // 4. Validate Coupon Discount (if provided)
      let discountAmount = 0;
      let couponRecord = null;

      if (couponCode && couponCode.trim()) {
        const couponVal = await CouponService.validateCoupon(couponCode, subtotalAmount, userId);
        discountAmount = couponVal.discountAmount;
        couponRecord = await Coupon.findByPk(couponVal.couponId, { transaction });
      }

      // 5. Compute Taxes & Shipping
      const shippingFee = subtotalAmount > 100 ? 0.00 : 10.00;
      const taxAmount = parseFloat(((subtotalAmount - discountAmount) * 0.08).toFixed(2));
      const totalAmount = parseFloat((subtotalAmount - discountAmount + shippingFee + taxAmount).toFixed(2));

      // 6. Generate Unique Order Number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

      // 7. Create Master Order Record
      const order = await Order.create(
        {
          orderNumber,
          userId,
          shippingAddressId,
          billingAddressId: billingAddressId || shippingAddressId,
          shippingAddressSnapshot: addressSnapshot,
          subtotalAmount: parseFloat(subtotalAmount.toFixed(2)),
          discountAmount: parseFloat(discountAmount.toFixed(2)),
          shippingFee,
          taxAmount,
          totalAmount,
          status: 'PROCESSING',
          placedAt: new Date(),
        },
        { transaction }
      );

      // 8. Create Order Items (without sellerOrderId yet — assigned in step 9)
      const orderItemRecords = verifiedOrderItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        shopId: item.shopId,
      }));
      const createdItems = await OrderItem.bulkCreate(orderItemRecords, {
        transaction,
        returning: true,
      });

      // 9. Multi-Vendor Order Splitting — create one SellerOrder per shop
      // Group cart items by shopId (null = platform-owned legacy products, no split needed)
      const shopGroups = {};
      for (let i = 0; i < verifiedOrderItems.length; i++) {
        const item = verifiedOrderItems[i];
        const key = item.shopId ? String(item.shopId) : '__platform__';
        if (!shopGroups[key]) {
          shopGroups[key] = { shopId: item.shopId, categoryId: item.categoryId, items: [] };
        }
        shopGroups[key].items.push({ ...item, createdItemId: createdItems[i].id });
      }

      for (const [key, group] of Object.entries(shopGroups)) {
        if (!group.shopId) continue; // skip platform-owned products (no escrow split)

        const shop = await Shop.findByPk(group.shopId, { transaction });
        const commRate = await CheckoutService.resolveCommissionRate(shop, group.categoryId);

        const groupSubtotal = group.items.reduce((sum, i) => sum + i.subtotal, 0);
        const platformFee = parseFloat((groupSubtotal * (commRate / 100)).toFixed(2));
        const sellerEarnings = parseFloat((groupSubtotal - platformFee).toFixed(2));

        // Create SellerOrder
        const sellerOrder = await SellerOrder.create(
          {
            orderId: order.id,
            shopId: group.shopId,
            subtotal: parseFloat(groupSubtotal.toFixed(2)),
            platformFee,
            sellerEarnings,
            status: 'PROCESSING',
          },
          { transaction }
        );

        // Link OrderItems to this SellerOrder
        const itemIds = group.items.map((i) => i.createdItemId);
        await OrderItem.update(
          { sellerOrderId: sellerOrder.id },
          { where: { id: itemIds }, transaction }
        );

        // Lock escrow: add seller earnings to shop's escrowBalance
        await Shop.increment('escrowBalance', {
          by: sellerEarnings,
          where: { id: group.shopId },
          transaction,
        });

        // Increment shop's total orders counter
        await Shop.increment('totalOrders', {
          by: 1,
          where: { id: group.shopId },
          transaction,
        });

        // Notify the seller
        await Notification.create(
          {
            userId: shop.userId,
            title: 'New Order Received!',
            message: `You have a new order #${order.orderNumber} for $${groupSubtotal.toFixed(2)}.`,
            type: 'ORDER_STATUS',
            link: `/seller/orders`,
          },
          { transaction }
        );
      }

      // 10. Process Mock Payment
      const paymentResult = await PaymentService.processMockPayment(
        order.id,
        totalAmount,
        paymentMethod || 'MOCK_GATEWAY',
        simulateFailure || false,
        transaction
      );

      if (!paymentResult.success) {
        order.status = 'PENDING';
        await order.save({ transaction });

        await transaction.commit();
        return {
          success: false,
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentStatus: 'FAILED',
          message: 'Payment simulation failed. Order created as PENDING.',
        };
      }

      // 11. Deduct Inventory Stock & Log Inventory Transactions
      for (const update of inventoryUpdates) {
        if (update.inventory) {
          update.inventory.stockQuantity -= update.quantityDeducted;
          await update.inventory.save({ transaction });

          await InventoryTransaction.create(
            {
              inventoryId: update.inventory.id,
              quantityChange: -update.quantityDeducted,
              type: 'PURCHASE',
              referenceId: order.orderNumber,
              performedBy: userId,
              notes: `Order placement #${order.orderNumber}`,
            },
            { transaction }
          );
        }
      }

      // 12. Record Coupon Usage
      if (couponRecord) {
        couponRecord.usageCount += 1;
        await couponRecord.save({ transaction });

        await CouponUsage.create(
          {
            couponId: couponRecord.id,
            userId,
            orderId: order.id,
          },
          { transaction }
        );
      }

      // 13. Clear User Cart Items
      await CartItem.destroy({ where: { cartId: cart.id }, transaction });

      // 14. Create Customer Notification
      await Notification.create(
        {
          userId,
          title: 'Order Placed Successfully!',
          message: `Your order #${order.orderNumber} for $${totalAmount.toFixed(2)} has been placed and is currently being processed.`,
          type: 'ORDER_STATUS',
          link: `/orders/${order.id}`,
        },
        { transaction }
      );

      await transaction.commit();

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
      };
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}

module.exports = CheckoutService;
