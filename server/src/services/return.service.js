const { Return, Order, Notification } = require('../models');

class ReturnService {
  static async getUserReturns(userId) {
    return await Return.findAll({
      where: { userId },
      include: [{ model: Order, as: 'order', attributes: ['orderNumber', 'totalAmount', 'placedAt'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  static async requestReturn(userId, orderId, reason, details) {
    const order = await Order.findOne({ where: { id: orderId, userId } });

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.status !== 'DELIVERED') {
      const error = new Error('Return can only be requested for delivered orders');
      error.statusCode = 400;
      error.code = 'ORDER_NOT_DELIVERED';
      throw error;
    }

    const existing = await Return.findOne({ where: { orderId } });
    if (existing) {
      const error = new Error('A return request already exists for this order');
      error.statusCode = 400;
      error.code = 'RETURN_ALREADY_EXISTS';
      throw error;
    }

    const returnRecord = await Return.create({
      orderId,
      userId,
      reason,
      details: details || null,
      status: 'REQUESTED',
    });

    await Notification.create({
      userId,
      title: 'Return Request Received',
      message: `Your return request for order #${order.orderNumber} has been received and is under review.`,
      type: 'ORDER_STATUS',
      link: `/returns/${returnRecord.id}`,
    });

    return returnRecord;
  }
}

module.exports = ReturnService;
