const {
  Return,
  Refund,
  Order,
  OrderItem,
  Product,
  Payment,
  User,
  Notification,
  sequelize,
} = require('../models');
const AuditService = require('./audit.service');

class AdminReturnService {
  static ensureReturnAccess(returnRecord, currentUser) {
    if (
      currentUser?.role === 'ADMIN' &&
      !returnRecord.order?.items?.some((item) => item.product?.createdBy === currentUser.id)
    ) {
      const error = new Error('Access denied. You can only manage returns for your products.');
      error.statusCode = 403;
      error.code = 'RETURN_ACCESS_DENIED';
      throw error;
    }
  }

  /**
   * List all return requests
   */
  static async getReturns({ page = 1, limit = 15, status = '', adminId = null }, currentUser = null) {
    page = Math.max(parseInt(page, 10) || 1, 1);
    limit = Math.min(Math.max(parseInt(limit, 10) || 15, 1), 100);
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows: returns } = await Return.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'placedAt'],
          required: currentUser?.role === 'ADMIN' || (currentUser?.role === 'SUPER_ADMIN' && adminId),
          include: [
            {
              model: OrderItem,
              as: 'items',
              required: currentUser?.role === 'ADMIN' || (currentUser?.role === 'SUPER_ADMIN' && adminId),
              include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'createdBy'],
                where: currentUser?.role === 'ADMIN'
                  ? { createdBy: currentUser.id }
                  : currentUser?.role === 'SUPER_ADMIN' && adminId
                    ? { createdBy: parseInt(adminId, 10) }
                    : undefined,
              }],
            },
            { model: Payment, as: 'payment', attributes: ['status', 'amount', 'paymentMethod'] },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      subQuery: false,
    });

    return {
      returns,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Process Return Request State Machine & Trigger Refund
   */
  static async processReturn(returnId, { action, adminNotes }, currentUser) {
    const transaction = await sequelize.transaction();

    try {
      const returnRecord = await Return.findByPk(returnId, {
        include: [
          {
            model: Order,
            as: 'order',
            include: [
              { model: Payment, as: 'payment' },
              {
                model: OrderItem,
                as: 'items',
                include: [{
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'createdBy'],
                }],
              },
            ],
          },
        ],
        transaction,
      });

      if (!returnRecord) {
        const error = new Error('Return request not found');
        error.statusCode = 404;
        throw error;
      }

      this.ensureReturnAccess(returnRecord, currentUser);
      const adminId = currentUser.id;
      const allowedTransitions = {
        APPROVE: ['REQUESTED'],
        REJECT: ['REQUESTED'],
        RECEIVE: ['APPROVED'],
        COMPLETE_REFUND: ['ITEM_RECEIVED'],
      };

      if (!allowedTransitions[action]?.includes(returnRecord.status)) {
        const error = new Error(
          `Cannot ${action.toLowerCase().replace('_', ' ')} a return in ${returnRecord.status} status`
        );
        error.statusCode = 400;
        error.code = 'INVALID_RETURN_TRANSITION';
        throw error;
      }

      let newStatus;
      let notificationMsg = '';

      switch (action) {
        case 'APPROVE':
          newStatus = 'APPROVED';
          notificationMsg = `Your return request for order #${returnRecord.order.orderNumber} has been approved. Please ship the item back.`;
          break;

        case 'REJECT':
          newStatus = 'REJECTED';
          notificationMsg = `Your return request for order #${returnRecord.order.orderNumber} was not approved. ${adminNotes || ''}`;
          break;

        case 'RECEIVE':
          newStatus = 'ITEM_RECEIVED';
          notificationMsg = `Your returned item for order #${returnRecord.order.orderNumber} has been received by our warehouse. Inspection is underway.`;
          break;

        case 'COMPLETE_REFUND': {
          newStatus = 'COMPLETED';
          notificationMsg = `Your return for order #${returnRecord.order.orderNumber} is complete. A full refund of $${parseFloat(returnRecord.order.totalAmount).toFixed(2)} has been issued.`;

          // 1. Update Order status
          returnRecord.order.status = 'RETURNED';
          await returnRecord.order.save({ transaction });

          const existingRefund = await Refund.findOne({
            where: { returnId: returnRecord.id },
            transaction,
            lock: transaction.LOCK.UPDATE,
          });

          if (existingRefund) {
            const error = new Error('A refund has already been processed for this return');
            error.statusCode = 409;
            error.code = 'REFUND_ALREADY_PROCESSED';
            throw error;
          }

          // 2. Update Payment status
          if (returnRecord.order.payment) {
            returnRecord.order.payment.status = 'REFUNDED';
            await returnRecord.order.payment.save({ transaction });
          }

          // 3. Create Refund record
          await Refund.create(
            {
              returnId: returnRecord.id,
              orderId: returnRecord.order.id,
              amount: returnRecord.order.totalAmount,
              status: 'PROCESSED',
              processedBy: adminId,
              transactionReference: `REFUND-MOCK-${Date.now()}-${returnRecord.id}`,
            },
            { transaction }
          );
          break;
        }

        default: {
          const error = new Error('Invalid action');
          error.statusCode = 400;
          throw error;
        }
      }

      returnRecord.status = newStatus;
      if (adminNotes) {
        returnRecord.details = returnRecord.details
          ? `${returnRecord.details}\n[Admin]: ${adminNotes}`
          : `[Admin]: ${adminNotes}`;
      }
      await returnRecord.save({ transaction });

      // Create Customer Notification
      await Notification.create(
        {
          userId: returnRecord.userId,
          title: `Return Request: ${newStatus.replace('_', ' ')}`,
          message: notificationMsg,
          type: 'ORDER_STATUS',
          link: `/returns`,
        },
        { transaction }
      );

      await transaction.commit();

      await AuditService.log({
        userId: adminId,
        action: `RETURN_${action}`,
        entityType: 'RETURN',
        entityId: returnRecord.id,
        oldValues: null,
        newValues: { status: newStatus, adminNotes },
      });

      return returnRecord;
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}

module.exports = AdminReturnService;
