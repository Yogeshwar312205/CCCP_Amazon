const SuperAdminBusinessService = require('../services/superadmin.business.service');
const BoostService = require('../services/boost.service');
const { ProductBoost, Product, Shop } = require('../models');

class SuperAdminController {
  // ── Shop Governance ────────────────────────────────────────────────────────

  static async getShops(req, res, next) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const data = await SuperAdminBusinessService.getShops({
        status,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });
      res.json({ success: true, data: data.shops, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  static async getShopById(req, res, next) {
    try {
      const shop = await SuperAdminBusinessService.getShopById(parseInt(req.params.id, 10));
      res.json({ success: true, data: shop });
    } catch (err) { next(err); }
  }

  static async approveShop(req, res, next) {
    try {
      const shop = await SuperAdminBusinessService.approveShop(
        parseInt(req.params.id, 10),
        req.user.id
      );
      res.json({ success: true, message: 'Shop approved and is now live.', data: shop });
    } catch (err) { next(err); }
  }

  static async rejectShop(req, res, next) {
    try {
      const shop = await SuperAdminBusinessService.rejectShop(
        parseInt(req.params.id, 10),
        req.body.reason,
        req.user.id
      );
      res.json({ success: true, message: 'Shop rejected.', data: shop });
    } catch (err) { next(err); }
  }

  static async suspendShop(req, res, next) {
    try {
      const shop = await SuperAdminBusinessService.suspendShop(
        parseInt(req.params.id, 10),
        req.body.reason,
        req.user.id
      );
      res.json({ success: true, message: 'Shop suspended and all products deactivated.', data: shop });
    } catch (err) { next(err); }
  }

  // ── Commission Management ──────────────────────────────────────────────────

  static async getCategoryCommissions(req, res, next) {
    try {
      const data = await SuperAdminBusinessService.getCategoryCommissions();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async setCategoryCommission(req, res, next) {
    try {
      const { categoryId, commissionRate, label } = req.body;
      const record = await SuperAdminBusinessService.setCategoryCommission(
        categoryId,
        commissionRate,
        label
      );
      res.json({ success: true, message: 'Commission rate updated.', data: record });
    } catch (err) { next(err); }
  }

  // ── Platform Settings ──────────────────────────────────────────────────────

  static async getSettings(req, res, next) {
    try {
      const settings = await SuperAdminBusinessService.getSettings();
      res.json({ success: true, data: settings });
    } catch (err) { next(err); }
  }

  static async updateSettings(req, res, next) {
    try {
      const settings = await SuperAdminBusinessService.updateSettings(req.body);
      res.json({ success: true, message: 'Platform settings updated.', data: settings });
    } catch (err) { next(err); }
  }

  // ── Boost Management ──────────────────────────────────────────────────────

  static async getBoostRequests(req, res, next) {
    try {
      const { status = 'REQUESTED' } = req.query;
      const boosts = await ProductBoost.findAll({
        where: status !== 'ALL' ? { status } : {},
        include: [
          { model: Product, as: 'product', attributes: ['title', 'sku', 'averageRating', 'totalReviews'] },
          {
            model: Shop,
            as: 'shop',
            attributes: ['id', 'name', 'averageRating', 'status', 'totalOrders'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.json({ success: true, data: boosts });
    } catch (err) { next(err); }
  }

  static async approveBoost(req, res, next) {
    try {
      const boost = await BoostService.approveBoost(parseInt(req.params.id, 10), req.body);
      res.json({ success: true, message: 'Boost campaign approved.', data: boost });
    } catch (err) { next(err); }
  }

  static async rejectBoost(req, res, next) {
    try {
      const boost = await BoostService.rejectBoost(parseInt(req.params.id, 10), req.body.reason);
      res.json({ success: true, message: 'Boost campaign rejected.', data: boost });
    } catch (err) { next(err); }
  }

  // ── Payout Management ─────────────────────────────────────────────────────

  static async getPendingPayouts(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const data = await SuperAdminBusinessService.getPendingPayouts({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });
      res.json({ success: true, data: data.payouts, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  static async releasePayout(req, res, next) {
    try {
      const result = await SuperAdminBusinessService.releasePayout(
        parseInt(req.params.id, 10),
        req.user.id
      );
      res.json({ success: true, message: `$${result.amountReleased.toFixed(2)} released to vendor.`, data: result });
    } catch (err) { next(err); }
  }

  // ── Dispute Resolution / A-to-Z Guarantee ─────────────────────────────────

  static async forceRefund(req, res, next) {
    try {
      const result = await SuperAdminBusinessService.forceRefund(
        parseInt(req.params.id, 10),
        req.user.id
      );
      res.json({ success: true, message: `Force refund of $${result.refundAmount.toFixed(2)} applied.`, data: result });
    } catch (err) { next(err); }
  }

  // ── Business Intelligence ─────────────────────────────────────────────────

  static async getBusinessIntelligence(req, res, next) {
    try {
      const data = await SuperAdminBusinessService.getBusinessIntelligence();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getTopShopsByRevenue(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const data = await SuperAdminBusinessService.getTopShopsByRevenue(limit);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getTopShopsByRefundRate(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const data = await SuperAdminBusinessService.getTopShopsByRefundRate(limit);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getGMVTrend(req, res, next) {
    try {
      const months = parseInt(req.query.months, 10) || 6;
      const data = await SuperAdminBusinessService.getGMVTrend(months);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

module.exports = SuperAdminController;
