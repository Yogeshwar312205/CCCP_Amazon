const { Coupon, CouponUsage } = require('../models');

class CouponService {
  static async validateCoupon(code, subtotal, userId) {
    const coupon = await Coupon.findOne({
      where: {
        code: code.trim().toUpperCase(),
        isActive: true,
      },
    });

    if (!coupon) {
      const error = new Error('Invalid coupon code');
      error.statusCode = 404;
      error.code = 'INVALID_COUPON';
      throw error;
    }

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      const error = new Error('Coupon code has expired or is not yet active');
      error.statusCode = 400;
      error.code = 'COUPON_EXPIRED';
      throw error;
    }

    if (subtotal < parseFloat(coupon.minimumOrderAmount)) {
      const error = new Error(
        `Minimum order amount of $${parseFloat(coupon.minimumOrderAmount).toFixed(2)} required for this coupon`
      );
      error.statusCode = 400;
      error.code = 'MINIMUM_ORDER_NOT_MET';
      throw error;
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      const error = new Error('Coupon usage limit reached');
      error.statusCode = 400;
      error.code = 'COUPON_LIMIT_REACHED';
      throw error;
    }

    // Check user per-customer usage limit (1 per customer)
    if (userId) {
      const userUsage = await CouponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsage > 0) {
        const error = new Error('You have already redeemed this coupon code');
        error.statusCode = 400;
        error.code = 'COUPON_ALREADY_USED';
        throw error;
      }
    }

    // Calculate discount
    let discountAmount;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * parseFloat(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount && discountAmount > parseFloat(coupon.maxDiscountAmount)) {
        discountAmount = parseFloat(coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = parseFloat(coupon.discountValue);
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: parseFloat(coupon.discountValue),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
    };
  }
}

module.exports = CouponService;
