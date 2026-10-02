const CartService = require('../services/cart.service');

class CartController {
  static async getCart(req, res, next) {
    try {
      const cart = await CartService.getUserCart(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req, res, next) {
    try {
      const { productId, variantId, quantity } = req.body;
      const cart = await CartService.addItem(req.user.id, productId, variantId, quantity);
      return res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuantity(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const cart = await CartService.updateItemQuantity(req.user.id, id, quantity);
      return res.status(200).json({
        success: true,
        message: 'Cart item quantity updated',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req, res, next) {
    try {
      const { id } = req.params;
      const cart = await CartService.removeItem(req.user.id, id);
      return res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req, res, next) {
    try {
      const cart = await CartService.clearCart(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CartController;
