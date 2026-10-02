const {
  Return,
  Refund,
  Order,
  Payment,
  User,
  Notification,
  sequelize,
} = require('../models');
const AuditService = require('./audit.service');

class AdminReturnService {
  /**
   * List all return requests
   */
  static async getReturns({ page = 1, limit = 15, status = '' }) {
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
          include: [{ model: Payment, as: 'payment', attributes: ['status', 'amount', 'paymentMethod'] }],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
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
  static async processReturn(returnId, { action, adminNotes }, adminId) {
    const transaction = await sequelize.transaction();

    try {
      const returnRecord = await Return.findByPk(returnId, {
        include: [
          {
            model: Order,
            as: 'order',
            include: [{ model: Payment, as: 'payment' }],
          },
        ],
        transaction,
      });

      if (!returnRecord) {
        const error = new Error('Return request not found');
        error.statusCode = 404;
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

          // 2. Update Payment status
          if (returnRecord.order.payment) {
            returnRecord.order.payment.status = 'REFUNDED';
            await returnRecord.order.save({ transaction });
          }

          // 3. Create Refund record
          await Refund.create(
            {
              returnId: returnRecord.id,
              paymentId: returnRecord.order.payment?.id || null,
              amount: returnRecord.order.totalAmount,
              reason: returnRecord.reason,
              status: 'COMPLETED',
              processedAt: new Date(),
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
