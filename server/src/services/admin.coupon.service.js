const { Coupon, CouponUsage, Order, User } = require('../models');

class AdminCouponService {
  /**
   * List all coupons with usage stats
   */
  static async getCoupons() {
    return await Coupon.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: CouponUsage,
          as: 'usages',
          attributes: ['id', 'usedAt'],
          include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
            { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'totalAmount'] },
          ],
        },
      ],
    });
  }

  /**
   * Create new coupon
   */
  static async createCoupon(couponData) {
    const existing = await Coupon.findOne({ where: { code: couponData.code } });
    if (existing) {
      const error = new Error(`Coupon with code '${couponData.code}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    const payload = {
      ...couponData,
      startDate: couponData.startDate || new Date(),
      endDate: couponData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    return await Coupon.create(payload);
  }

  /**
   * Toggle Coupon active status
   */
  static async toggleCouponStatus(couponId) {
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      throw error;
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
  }
}

module.exports = AdminCouponService;
