const SellerOrderService = require('../services/seller.order.service');
const SellerProductService = require('../services/seller.product.service');
const BoostService = require('../services/boost.service');
const { Shop } = require('../models');

class SellerController {
  // ── Orders ────────────────────────────────────────────────────────────────

  static async getOrders(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const data = await SellerOrderService.getSellerOrders(req.shop.id, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        status,
      });
      res.json({ success: true, data: data.orders, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  static async getOrderById(req, res, next) {
    try {
      const order = await SellerOrderService.getSellerOrderById(
        parseInt(req.params.id, 10),
        req.shop.id
      );
      res.json({ success: true, data: order });
    } catch (err) { next(err); }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const order = await SellerOrderService.updateOrderStatus(
        parseInt(req.params.id, 10),
        req.shop.id,
        req.body,
        req.user.id
      );
      res.json({ success: true, message: 'Order status updated.', data: order });
    } catch (err) { next(err); }
  }

  static async getAnalytics(req, res, next) {
    try {
      const data = await SellerOrderService.getSellerAnalytics(req.shop.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // ── Products ──────────────────────────────────────────────────────────────

  static async getProducts(req, res, next) {
    try {
      const data = await SellerProductService.getProducts(req.shop.id, req.query);
      res.json({ success: true, data: data.products, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  static async getProductById(req, res, next) {
    try {
      const product = await SellerProductService.getProductById(
        parseInt(req.params.id, 10),
        req.shop.id
      );
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  }

  static async createProduct(req, res, next) {
    try {
      const product = await SellerProductService.createProduct(
        req.shop.id,
        req.body,
        req.files || []
      );
      res.status(201).json({ success: true, message: 'Product created.', data: product });
    } catch (err) { next(err); }
  }

  static async updateProduct(req, res, next) {
    try {
      const product = await SellerProductService.updateProduct(
        parseInt(req.params.id, 10),
        req.shop.id,
        req.body
      );
      res.json({ success: true, message: 'Product updated.', data: product });
    } catch (err) { next(err); }
  }

  static async toggleProductStatus(req, res, next) {
    try {
      const product = await SellerProductService.toggleProductStatus(
        parseInt(req.params.id, 10),
        req.shop.id
      );
      res.json({
        success: true,
        message: `Product ${product.isActive ? 'activated' : 'deactivated'}.`,
        data: product,
      });
    } catch (err) { next(err); }
  }

  // ── Boosts ────────────────────────────────────────────────────────────────

  static async getBoosts(req, res, next) {
    try {
      const { ProductBoost } = require('../models');
      const { Op } = require('sequelize');
      const boosts = await ProductBoost.findAll({
        where: { shopId: req.shop.id },
        include: [{ model: require('../models').Product, as: 'product', attributes: ['title', 'sku', 'averageRating'] }],
        order: [['createdAt', 'DESC']],
      });
      res.json({ success: true, data: boosts });
    } catch (err) { next(err); }
  }

  static async requestBoost(req, res, next) {
    try {
      const boost = await BoostService.requestBoost(req.shop.id, req.body);
      res.status(201).json({ success: true, message: 'Boost request submitted.', data: boost });
    } catch (err) { next(err); }
  }

  // ── Balance ───────────────────────────────────────────────────────────────

  static async getBalance(req, res, next) {
    try {
      const shop = await Shop.findByPk(req.shop.id, {
        attributes: ['id', 'name', 'escrowBalance', 'availableBalance'],
      });
      res.json({ success: true, data: shop });
    } catch (err) { next(err); }
  }
}

module.exports = SellerController;
