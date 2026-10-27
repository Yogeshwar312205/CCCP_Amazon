const { Op } = require('sequelize');
const { ProductBoost, Product, Shop, PlatformSettings, sequelize } = require('../models');

class BoostService {
  /**
   * Seller submits a product boost request.
   * Validates: product belongs to seller's shop, shop rating >= 4.0, product has stock.
   */
  static async requestBoost(shopId, { productId, budget, durationDays }) {
    // Verify product belongs to this shop
    const product = await Product.findOne({ where: { id: productId, shopId, isActive: true } });
    if (!product) {
      const error = new Error('Product not found in your shop or is inactive.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    const shop = await Shop.findByPk(shopId);
    if (parseFloat(shop.averageRating) < 4.0) {
      const error = new Error(
        `Your shop rating (${shop.averageRating}) must be at least 4.0 to submit a boost request.`
      );
      error.statusCode = 400;
      error.code = 'RATING_TOO_LOW';
      throw error;
    }

    // Only one active/requested boost per product at a time
    const existing = await ProductBoost.findOne({
      where: { productId, status: { [Op.in]: ['REQUESTED', 'APPROVED'] } },
    });
    if (existing) {
      const error = new Error('This product already has an active or pending boost campaign.');
      error.statusCode = 409;
      error.code = 'BOOST_ALREADY_EXISTS';
      throw error;
    }

    const boost = await ProductBoost.create({
      shopId,
      productId,
      budget: parseFloat(budget),
      status: 'REQUESTED',
    });

    return boost;
  }

  /**
   * Super Admin approves a boost campaign.
   * Sets the campaign active dates and sets Product.isBoosted = true.
   */
  static async approveBoost(boostId, { durationDays = 7, boostFactor = 2 } = {}) {
    const boost = await ProductBoost.findByPk(boostId, {
      include: [{ model: Product, as: 'product' }],
    });

    if (!boost) {
      const error = new Error('Boost request not found.');
      error.statusCode = 404;
      throw error;
    }

    if (boost.status !== 'REQUESTED') {
      const error = new Error(`Cannot approve a boost with status '${boost.status}'.`);
      error.statusCode = 400;
      throw error;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    boost.status = 'APPROVED';
    boost.startDate = startDate;
    boost.endDate = endDate;
    boost.boostFactor = boostFactor;
    await boost.save();

    // Activate the boost flag on the product
    await Product.update({ isBoosted: true }, { where: { id: boost.productId } });

    return boost;
  }

  /**
   * Super Admin rejects a boost campaign.
   */
  static async rejectBoost(boostId, reason) {
    const boost = await ProductBoost.findByPk(boostId);
    if (!boost) {
      const error = new Error('Boost request not found.');
      error.statusCode = 404;
      throw error;
    }
    boost.status = 'REJECTED';
    boost.rejectionReason = reason || 'Not specified.';
    await boost.save();
    return boost;
  }

  /**
   * Cron job: expire boosts whose endDate has passed.
   * Called by the escrow scheduler — runs hourly.
   */
  static async expireStaleBoosts() {
    const now = new Date();

    const expired = await ProductBoost.findAll({
      where: {
        status: 'APPROVED',
        endDate: { [Op.lt]: now },
      },
      attributes: ['id', 'productId'],
    });

    if (expired.length === 0) return 0;

    const expiredIds = expired.map((b) => b.id);
    const expiredProductIds = [...new Set(expired.map((b) => b.productId))];

    await ProductBoost.update({ status: 'EXPIRED' }, { where: { id: expiredIds } });

    // Turn off isBoosted on affected products that have no other active boost
    for (const productId of expiredProductIds) {
      const activeBoost = await ProductBoost.findOne({
        where: { productId, status: 'APPROVED' },
      });
      if (!activeBoost) {
        await Product.update({ isBoosted: false }, { where: { id: productId } });
      }
    }

    return expired.length;
  }
}

module.exports = BoostService;
