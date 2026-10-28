const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

class AuditService {
  /**
   * Log an administrative mutation or security-sensitive event
   */
  static async log({
    userId,
    action,
    entityType,
    entityId = null,
    oldValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null,
    req = null,
    transaction = null,
  }) {
    try {
      let finalIp = ipAddress;
      let finalAgent = userAgent;
      let finalUserId = userId;

      if (req) {
        if (!finalIp) {
          finalIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.connection?.remoteAddress || null;
        }
        if (!finalAgent) {
          finalAgent = req.get ? req.get('user-agent') : req.headers?.['user-agent'] || null;
        }
        if (!finalUserId && req.user) {
          finalUserId = req.user.id;
        }
      }

      return await AuditLog.create(
        {
          userId: finalUserId,
          action,
          entityType,
          entityId,
          oldValues,
          newValues,
          ipAddress: finalIp ? String(finalIp).slice(0, 45) : null,
          userAgent: finalAgent ? String(finalAgent).slice(0, 255) : null,
        },
        transaction ? { transaction } : undefined
      );
    } catch (err) {
      // Non-fatal: audit log failures must not break the main operation
      process.stderr.write(`AuditService log error (non-fatal): ${err.message}\n`);
      return null;
    }
  }

  /**
   * Fetch paginated audit logs (SUPER_ADMIN only)
   */
  static async getLogs({
    page = 1,
    limit = 20,
    action = '',
    entityType = '',
    startDate = null,
    endDate = null,
  } = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
        },
      ],
    });

    return {
      logs,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

module.exports = AuditService;
