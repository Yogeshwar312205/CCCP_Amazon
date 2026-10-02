const CheckoutService = require('../services/checkout.service');
const OrderService = require('../services/order.service');
const CouponService = require('../services/coupon.service');

const checkout = async (req, res, next) => {
  try {
    const result = await CheckoutService.processCheckout(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Order placed successfully', data: result });
  } catch (err) { next(err); }
};

const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const orders = await OrderService.getUserOrders(req.user.id, page, limit);
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await OrderService.getOrderById(req.user.id, parseInt(req.params.id));
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await OrderService.cancelOrder(req.user.id, parseInt(req.params.id), req.body.reason);
    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (err) { next(err); }
};

const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const result = await CouponService.validateCoupon(code, parseFloat(subtotal), req.user.id);
    res.json({
      success: true,
      data: {
        valid: true,
        coupon: {
          code: result.code,
          discountType: result.discountType,
          discountValue: parseFloat(result.discountValue),
          maxDiscount: result.maxDiscount ? parseFloat(result.maxDiscount) : null,
          minOrderValue: parseFloat(result.minOrderValue),
        },
        discountAmount: result.discountAmount,
      },
    });
  } catch (err) {
    if (err.statusCode === 400 || err.code === 'COUPON_INVALID') {
      return res.status(400).json({ success: false, error: { message: err.message, code: err.code } });
    }
    next(err);
  }
};

module.exports = { checkout, getOrders, getOrderById, cancelOrder, validateCoupon };
