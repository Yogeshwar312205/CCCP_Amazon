const AdminAnalyticsService = require('../services/admin.analytics.service');
const AdminProductService = require('../services/admin.product.service');
const AdminInventoryService = require('../services/admin.inventory.service');
const AdminOrderService = require('../services/admin.order.service');
const AdminReturnService = require('../services/admin.return.service');
const AdminCouponService = require('../services/admin.coupon.service');
const AdminCategoryService = require('../services/admin.category.service');
const AdminManagementService = require('../services/admin.management.service');
const AuditService = require('../services/audit.service');

class AdminController {
  // Analytics
  static async getOverview(req, res, next) {
    try {
      const data = await AdminAnalyticsService.getOverviewStats(req.user);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getSalesChart(req, res, next) {
    try {
      const days = parseInt(req.query.days, 10) || 14;
      const data = await AdminAnalyticsService.getSalesChartData(days, req.user);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getTopProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 5;
      const data = await AdminAnalyticsService.getTopProducts(limit, req.user);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // Products
  static async getProducts(req, res, next) {
    try {
      const data = await AdminProductService.getProducts(req.query, req.user);
      res.json({ success: true, data: data.products, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  static async createProduct(req, res, next) {
    try {
      const product = await AdminProductService.createProduct(req.body, req.files, req.user);
      res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (err) { next(err); }
  }

  static async updateProduct(req, res, next) {
    try {
      const product = await AdminProductService.updateProduct(
        parseInt(req.params.id, 10),
        req.body,
        req.files,
        req.user
      );
      res.json({ success: true, message: 'Product updated successfully', data: product });
    } catch (err) { next(err); }
  }

  static async toggleProductStatus(req, res, next) {
    try {
      const product = await AdminProductService.toggleProductStatus(parseInt(req.params.id, 10), req.user);
      res.json({ success: true, message: `Product ${product.isActive ? 'activated' : 'deactivated'}`, data: product });
    } catch (err) { next(err); }
  }

  // Inventory
  static async getInventory(req, res, next) {
    try {
      const data = await AdminInventoryService.getInventory(req.query, req.user);
      res.json({ success: true, data: data.inventory, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  static async adjustStock(req, res, next) {
    try {
      const result = await AdminInventoryService.adjustStock(
        parseInt(req.params.id, 10),
        req.body,
        req.user
      );
      res.json({ success: true, message: 'Stock adjusted successfully', data: result });
    } catch (err) { next(err); }
  }

  static async getInventoryHistory(req, res, next) {
    try {
      const history = await AdminInventoryService.getTransactionHistory(parseInt(req.params.id, 10), req.user);
      res.json({ success: true, data: history });
    } catch (err) { next(err); }
  }

  // Orders
  static async getOrders(req, res, next) {
    try {
      const data = await AdminOrderService.getOrders(req.query, req.user);
      res.json({ success: true, data: data.orders, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  static async getOrderById(req, res, next) {
    try {
      const order = await AdminOrderService.getOrderById(parseInt(req.params.id, 10), req.user);
      res.json({ success: true, data: order });
    } catch (err) { next(err); }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const order = await AdminOrderService.updateOrderStatus(
        parseInt(req.params.id, 10),
        req.body,
        req.user
      );
      res.json({ success: true, message: 'Order status updated successfully', data: order });
    } catch (err) { next(err); }
  }

  // Returns
  static async getReturns(req, res, next) {
    try {
      const data = await AdminReturnService.getReturns(req.query, req.user);
      res.json({ success: true, data: data.returns, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  static async processReturn(req, res, next) {
    try {
      const returnRecord = await AdminReturnService.processReturn(
        parseInt(req.params.id, 10),
        req.body,
        req.user
      );
      res.json({ success: true, message: 'Return processed successfully', data: returnRecord });
    } catch (err) { next(err); }
  }

  // Coupons
  static async getCoupons(req, res, next) {
    try {
      const coupons = await AdminCouponService.getCoupons();
      res.json({ success: true, data: coupons });
    } catch (err) { next(err); }
  }

  static async createCoupon(req, res, next) {
    try {
      const coupon = await AdminCouponService.createCoupon(req.body, req.user.id);
      res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
    } catch (err) { next(err); }
  }

  static async toggleCouponStatus(req, res, next) {
    try {
      const coupon = await AdminCouponService.toggleCouponStatus(parseInt(req.params.id, 10), req.user.id);
      res.json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, data: coupon });
    } catch (err) { next(err); }
  }

  // Categories
  static async getCategories(req, res, next) {
    try {
      const data = await AdminCategoryService.getCategories({
        search: req.query.search,
        flat: req.query.flat === 'true',
        adminId: req.query.adminId,
      }, req.user);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async createCategory(req, res, next) {
    try {
      const category = await AdminCategoryService.createCategory(req.body, req.user);
      res.status(201).json({ success: true, message: 'Category created successfully', data: category });
    } catch (err) { next(err); }
  }

  static async updateCategory(req, res, next) {
    try {
      const category = await AdminCategoryService.updateCategory(
        parseInt(req.params.id, 10),
        req.body,
        req.user
      );
      res.json({ success: true, message: 'Category updated successfully', data: category });
    } catch (err) { next(err); }
  }

  static async toggleCategoryStatus(req, res, next) {
    try {
      const category = await AdminCategoryService.toggleCategoryStatus(
        parseInt(req.params.id, 10),
        req.user
      );
      res.json({
        success: true,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'}`,
        data: category,
      });
    } catch (err) { next(err); }
  }

  static async deleteCategory(req, res, next) {
    try {
      const result = await AdminCategoryService.deleteCategory(
        parseInt(req.params.id, 10),
        req.user
      );
      res.json({ success: true, message: result.message });
    } catch (err) { next(err); }
  }

  // Admin Management (SUPER_ADMIN only)
  static async getAdmins(req, res, next) {
    try {
      const data = await AdminManagementService.getAdmins(req.query);
      res.json({ success: true, data: data.admins, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  static async createAdmin(req, res, next) {
    try {
      const admin = await AdminManagementService.createAdmin(req.body, req.user.id);
      res.status(201).json({ success: true, message: 'Admin account created successfully', data: admin });
    } catch (err) { next(err); }
  }

  static async updateAdminStatus(req, res, next) {
    try {
      const admin = await AdminManagementService.updateAdminStatus(
        parseInt(req.params.id, 10),
        req.body,
        req.user.id
      );
      res.json({ success: true, message: `Admin account ${admin.isActive ? 'activated' : 'deactivated'} successfully`, data: admin });
    } catch (err) { next(err); }
  }

  // Audit Logs (SUPER_ADMIN only)
  static async getAuditLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const { action, entityType, startDate, endDate } = req.query;
      const data = await AuditService.getLogs({
        page,
        limit,
        action,
        entityType,
        startDate,
        endDate,
      });
      res.json({
        success: true,
        data: data.logs,
        pagination: data.pagination,
      });
    } catch (err) { next(err); }
  }
}

module.exports = AdminController;
