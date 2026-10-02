const WishlistService = require('../services/wishlist.service');

class WishlistController {
  static async getWishlist(req, res, next) {
    try {
      const wishlist = await WishlistService.getUserWishlist(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Wishlist retrieved successfully',
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req, res, next) {
    try {
      const { productId } = req.body;
      const wishlist = await WishlistService.addItem(req.user.id, productId);
      return res.status(200).json({
        success: true,
        message: 'Item added to wishlist',
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      const wishlist = await WishlistService.removeItem(req.user.id, productId);
      return res.status(200).json({
        success: true,
        message: 'Item removed from wishlist',
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WishlistController;
