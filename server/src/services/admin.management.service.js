const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Product, Category, Order, OrderItem, Return } = require('../models');
const AuditService = require('./audit.service');

class AdminManagementService {
  static sanitizeUser(user) {
    const userJson = user.toJSON();
    delete userJson.password;
    return userJson;
  }

  static async getAdmins({ page = 1, limit = 10, search = '', status = '' } = {}) {
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNumber - 1) * pageSize;
    const where = {
      role: { [Op.in]: ['ADMIN', 'SUPER_ADMIN'] },
    };

    const searchTerm = search ? String(search).trim() : '';
    if (searchTerm) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${searchTerm}%` } },
        { lastName: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    if (status === 'active' || status === 'inactive') {
      where.isActive = status === 'active';
    }

    const { count, rows: admins } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    const adminsWithStats = await Promise.all(admins.map(async (admin) => {
      const ownerWhere = { createdBy: admin.id };
      const [productCount, categoryCount, orderCount, returnCount] = await Promise.all([
        Product.count({ where: ownerWhere }),
        Category.count({ where: ownerWhere }),
        Order.count({
          distinct: true,
          include: [{
            model: OrderItem,
            as: 'items',
            required: true,
            include: [{ model: Product, as: 'product', where: ownerWhere, attributes: [] }],
          }],
        }),
        Return.count({
          distinct: true,
          include: [{
            model: Order,
            as: 'order',
            required: true,
            include: [{
              model: OrderItem,
              as: 'items',
              required: true,
              include: [{ model: Product, as: 'product', where: ownerWhere, attributes: [] }],
            }],
          }],
        }),
      ]);
      return {
        ...admin.toJSON(),
        stats: { productCount, categoryCount, orderCount, returnCount },
      };
    }));

    return {
      admins: adminsWithStats,
      pagination: {
        total: count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  static async createAdmin(adminData, createdByUserId = null) {
    const firstName = String(adminData.firstName || '').trim();
    const lastName = String(adminData.lastName || '').trim();
    const email = String(adminData.email || '').trim().toLowerCase();
    const password = String(adminData.password || '');
    const phone = adminData.phone ? String(adminData.phone).trim() : null;
    const isActive = adminData.isActive !== undefined ? Boolean(adminData.isActive) : true;

    if (!firstName || !lastName) {
      const error = new Error('First name and last name are required');
      error.statusCode = 400;
      error.code = 'INVALID_NAME';
      throw error;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = new Error('A valid admin email is required');
      error.statusCode = 400;
      error.code = 'INVALID_EMAIL';
      throw error;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      const error = new Error('Password must be at least 8 characters, include upper/lowercase letters and a number');
      error.statusCode = 400;
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    if (adminData.role && adminData.role !== 'ADMIN') {
      const error = new Error('Privilege escalation is not allowed. Admin accounts must use the ADMIN role.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_ROLE';
      throw error;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('An admin account with this email already exists');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'ADMIN',
      isActive,
    });

    await AuditService.log({
      userId: createdByUserId,
      action: 'CREATE_ADMIN_ACCOUNT',
      entityType: 'ADMIN_USER',
      entityId: newAdmin.id,
      newValues: {
        id: newAdmin.id,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
      },
    });

    return this.sanitizeUser(newAdmin);
  }

  static async updateAdminStatus(adminId, { isActive }, actingUserId = null) {
    const targetUser = await User.findByPk(adminId);

    if (!targetUser) {
      const error = new Error('Admin account not found');
      error.statusCode = 404;
      error.code = 'ADMIN_NOT_FOUND';
      throw error;
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      const error = new Error('Super admin accounts cannot be modified through admin management');
      error.statusCode = 403;
      error.code = 'SUPER_ADMIN_PROTECTED';
      throw error;
    }

    if (actingUserId && targetUser.id === actingUserId) {
      const error = new Error('You cannot change your own admin status');
      error.statusCode = 403;
      error.code = 'SELF_STATUS_CHANGE_FORBIDDEN';
      throw error;
    }

    const previousStatus = targetUser.isActive;
    const nextStatus = Boolean(isActive);
    targetUser.isActive = nextStatus;
    await targetUser.save();

    await AuditService.log({
      userId: actingUserId,
      action: nextStatus ? 'ACTIVATE_ADMIN_ACCOUNT' : 'DEACTIVATE_ADMIN_ACCOUNT',
      entityType: 'ADMIN_USER',
      entityId: targetUser.id,
      oldValues: { isActive: previousStatus },
      newValues: { isActive: nextStatus },
    });

    return this.sanitizeUser(targetUser);
  }
}

module.exports = AdminManagementService;
