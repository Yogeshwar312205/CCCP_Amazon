const ShopService = require('../services/shop.service');

class ShopController {
  // ── Public storefront routes ──────────────────────────────────────────────

  static async getShopBySlug(req, res, next) {
    try {
      const shop = await ShopService.getShopBySlug(req.params.slug);
      res.json({ success: true, data: shop });
    } catch (err) { next(err); }
  }

  static async getShopProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const data = await ShopService.getShopProducts(req.params.id, { page, limit });
      res.json({ success: true, data: data.products, pagination: data.pagination });
    } catch (err) { next(err); }
  }

  // ── Seller-facing shop management ─────────────────────────────────────────

  static async registerShop(req, res, next) {
    try {
      const shop = await ShopService.registerShop(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Shop application submitted. Pending Super Admin approval.',
        data: shop,
      });
    } catch (err) { next(err); }
  }

  static async getOwnShop(req, res, next) {
    try {
      const shop = await ShopService.getSellerOwnShop(req.user.id);
      res.json({ success: true, data: shop });
    } catch (err) { next(err); }
  }

  static async updateOwnShop(req, res, next) {
    try {
      const shop = await ShopService.updateShop(req.user.id, req.body);
      res.json({ success: true, message: 'Shop updated successfully.', data: shop });
    } catch (err) { next(err); }
  }
}

module.exports = ShopController;
