const {
  Order,
  OrderItem,
  Payment,
  User,
  Product,
  ProductImage,
  Inventory,
  InventoryTransaction,
  Notification,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./audit.service');

class AdminOrderService {
  /**
   * List all orders with filters
   */
  static async getOrders({ page = 1, limit = 10, status = '', search = '' }) {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search && search.trim()) {
      where[Op.or] = [
        { orderNumber: { [Op.like]: `%${search.trim()}%` } },
        { trackingNumber: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['placedAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: Payment, as: 'payment', attributes: ['status', 'paymentMethod', 'transactionId'] },
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'productName', 'quantity', 'unitPrice', 'subtotal'],
        },
      ],
      distinct: true,
    });

    return {
      orders,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get single order detail
   */
  static async getOrderById(orderId) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: Payment, as: 'payment' },
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
      ],
    });

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  /**
   * Update Order Status & Fulfillment Tracking
   */
  static async updateOrderStatus(orderId, { status, carrier, trackingNumber, notes }, adminId) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, {
        include: [
          { model: OrderItem, as: 'items' },
          { model: Payment, as: 'payment' },
        ],
        transaction,
      });

      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      const previousStatus = order.status;
      order.status = status;

      if (status === 'SHIPPED') {
        if (carrier) order.carrier = carrier;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        order.shippedAt = new Date();
      } else if (status === 'DELIVERED') {
        order.deliveredAt = new Date();
      } else if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        // Restock inventory and refund payment
        if (order.payment) {
          order.payment.status = 'REFUNDED';
          await order.payment.save({ transaction });
        }

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
                performedBy: adminId,
                notes: `Admin cancellation #${order.orderNumber}: ${notes || 'Cancelled by store manager'}`,
              },
              { transaction }
            );
          }
        }
      }

      await order.save({ transaction });

      // Notify customer of status change
      await Notification.create(
        {
          userId: order.userId,
          title: `Order Status Update: ${status}`,
          message:
            status === 'SHIPPED'
              ? `Your order #${order.orderNumber} has shipped with ${carrier || 'our courier'}. Tracking Number: ${trackingNumber || 'Available in account'}.`
              : `Your order #${order.orderNumber} is now ${status.toLowerCase()}.`,
          type: 'ORDER_STATUS',
          link: `/orders/${order.id}`,
        },
        { transaction }
      );

      await transaction.commit();

      await AuditService.log({
        userId: adminId,
        action: 'UPDATE_ORDER_STATUS',
        entityType: 'ORDER',
        entityId: order.id,
        oldValues: { status: previousStatus },
        newValues: { status, carrier, trackingNumber, notes },
      });

      return order;
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}

module.exports = AdminOrderService;
