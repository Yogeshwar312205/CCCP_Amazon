const { Op } = require('sequelize');
const {
  SellerOrder,
  Order,
  OrderItem,
  Product,
  ProductVariant,
  User,
  Address,
  Notification,
  sequelize,
} = require('../models');

class SellerOrderService {
  /**
   * Get all SellerOrders belonging to the seller's shop.
   */
  static async getSellerOrders(shopId, { page = 1, limit = 20, status } = {}) {
    const where = { shopId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows } = await SellerOrder.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'masterOrder',
          attributes: ['orderNumber', 'totalAmount', 'placedAt', 'shippingAddressSnapshot'],
          include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
          ],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['title', 'sku'] },
            { model: ProductVariant, as: 'variant', attributes: ['variantName', 'sku'] },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      orders: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  /**
   * Get single SellerOrder by ID (verifies shop ownership).
   */
  static async getSellerOrderById(id, shopId) {
    const order = await SellerOrder.findOne({
      where: { id, shopId },
      include: [
        {
          model: Order,
          as: 'masterOrder',
          attributes: ['orderNumber', 'totalAmount', 'placedAt', 'shippingAddressSnapshot', 'status'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['title', 'sku', 'basePrice'] },
            { model: ProductVariant, as: 'variant', attributes: ['variantName', 'sku', 'price'] },
          ],
        },
      ],
    });

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    return order;
  }

  /**
   * Update fulfillment status of a SellerOrder.
   * Allowed transitions:
   *   PROCESSING → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
   *   Any → CANCELLED (only while PROCESSING or PACKED)
   */
  static async updateOrderStatus(id, shopId, { status, trackingNumber, carrier }, performedByUserId) {
    const VALID_TRANSITIONS = {
      PROCESSING: ['PACKED', 'CANCELLED'],
      PACKED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['OUT_FOR_DELIVERY'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
    };

    const sellerOrder = await SellerOrder.findOne({ where: { id, shopId } });
    if (!sellerOrder) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    const allowed = VALID_TRANSITIONS[sellerOrder.status] || [];
    if (!allowed.includes(status)) {
      const error = new Error(
        `Cannot transition order from '${sellerOrder.status}' to '${status}'.`
      );
      error.statusCode = 400;
      error.code = 'INVALID_STATUS_TRANSITION';
      throw error;
    }

    sellerOrder.status = status;
    if (trackingNumber) sellerOrder.trackingNumber = trackingNumber;
    if (carrier) sellerOrder.carrier = carrier;
    if (status === 'DELIVERED') sellerOrder.deliveredAt = new Date();

    await sellerOrder.save();

    // Notify the customer
    const masterOrder = await Order.findByPk(sellerOrder.orderId, {
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName'] }],
    });

    if (masterOrder?.user) {
      const statusMessages = {
        PACKED: 'Your order has been packed and is awaiting pickup.',
        SHIPPED: `Your order has been shipped. Tracking: ${trackingNumber || 'N/A'}`,
        OUT_FOR_DELIVERY: 'Your order is out for delivery today!',
        DELIVERED: 'Your order has been delivered. Enjoy!',
        CANCELLED: 'A seller has cancelled part of your order.',
      };

      await Notification.create({
        userId: masterOrder.user.id,
        title: `Order Update: ${status.replace(/_/g, ' ')}`,
        message: statusMessages[status] || `Order status changed to ${status}`,
        type: 'ORDER_STATUS',
        link: `/orders/${sellerOrder.orderId}`,
      });
    }

    return sellerOrder;
  }

  /**
   * Get seller analytics overview (last 30 days).
   */
  static async getSellerAnalytics(shopId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [revenueStats] = await sequelize.query(
      `SELECT
        COUNT(*) AS totalOrders,
        COALESCE(SUM(seller_earnings), 0) AS totalEarnings,
        COALESCE(SUM(platform_fee), 0) AS totalPlatformFees,
        COALESCE(SUM(subtotal), 0) AS totalGMV
       FROM seller_orders
       WHERE shop_id = :shopId
         AND created_at >= :from
         AND status NOT IN ('CANCELLED', 'REFUNDED')`,
      { replacements: { shopId, from: thirtyDaysAgo }, type: sequelize.QueryTypes.SELECT }
    );

    const pendingEscrow = await SellerOrder.sum('sellerEarnings', {
      where: { shopId, payoutSettled: false, status: 'DELIVERED' },
    });

    return {
      last30Days: revenueStats,
      pendingEscrowAmount: pendingEscrow || 0,
    };
  }
}

module.exports = SellerOrderService;
