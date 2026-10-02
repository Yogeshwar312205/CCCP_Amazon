const {
  Order,
  OrderItem,
  Payment,
  Product,
  ProductImage,
  Inventory,
  InventoryTransaction,
  Notification,
  sequelize,
} = require('../models');

class OrderService {
  static async getUserOrders(userId) {
    return await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'title', 'slug'],
              include: [{ model: ProductImage, as: 'images', attributes: ['imageUrl', 'isPrimary'] }],
            },
          ],
        },
        { model: Payment, as: 'payment', attributes: ['status', 'paymentMethod', 'transactionId'] },
      ],
      order: [['placedAt', 'DESC']],
    });
  }

  static async getOrderById(userId, orderId) {
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'title', 'slug'],
              include: [{ model: ProductImage, as: 'images', attributes: ['imageUrl', 'isPrimary'] }],
            },
          ],
        },
        { model: Payment, as: 'payment' },
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

  static async cancelOrder(userId, orderId, reason) {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.findOne({
        where: { id: orderId, userId },
        include: [
          { model: OrderItem, as: 'items' },
          { model: Payment, as: 'payment' },
        ],
        transaction,
      });

      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        error.code = 'ORDER_NOT_FOUND';
        throw error;
      }

      if (!['PENDING', 'PROCESSING'].includes(order.status)) {
        const error = new Error(`Order cannot be cancelled in '${order.status}' state`);
        error.statusCode = 400;
        error.code = 'INVALID_ORDER_STATE';
        throw error;
      }

      // 1. Update Order Status
      order.status = 'CANCELLED';
      await order.save({ transaction });

      // 2. Refund Payment Status
      if (order.payment) {
        order.payment.status = 'REFUNDED';
        await order.payment.save({ transaction });
      }

      // 3. Restore Stock in Inventory
      for (const item of order.items) {
        const inventory = await Inventory.findOne({
          where: item.variantId ? { variantId: item.variantId } : { productId: item.productId },
          transaction,
        });

        if (inventory) {
          inventory.stockQuantity += item.quantity;
          await inventory.save({ transaction });

          await InventoryTransaction.create(
            {
              inventoryId: inventory.id,
              quantityChange: item.quantity,
              type: 'RESTOCK',
              referenceId: order.orderNumber,
              performedBy: userId,
              notes: `Order cancellation #${order.orderNumber}: ${reason || 'Customer requested'}`,
            },
            { transaction }
          );
        }
      }

      // 4. Create Customer Notification
      await Notification.create(
        {
          userId,
          title: 'Order Cancelled',
          message: `Your order #${order.orderNumber} has been cancelled and refunded. Reason: ${reason || 'Customer request'}`,
          type: 'ORDER_STATUS',
          link: `/orders/${order.id}`,
        },
        { transaction }
      );

      await transaction.commit();
      return order;
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}

module.exports = OrderService;
