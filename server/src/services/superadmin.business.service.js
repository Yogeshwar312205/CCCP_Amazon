const { Op } = require('sequelize');
const {
  Shop,
  User,
  Product,
  SellerOrder,
  Order,
  OrderItem,
  ProductBoost,
  CategoryCommission,
  Category,
  PlatformSettings,
  Return,
  Refund,
  Notification,
  sequelize,
} = require('../models');

class SuperAdminBusinessService {
  // ─── SHOP GOVERNANCE ──────────────────────────────────────────────────────────

  /**
   * Get all shops with optional status filter + pagination.
   */
  static async getShops({ status, page = 1, limit = 20 } = {}) {
    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows } = await Shop.findAndCountAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
      ],
      attributes: { exclude: ['bankAccountInfo'] }, // never expose bank details in list views
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      shops: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  /**
   * Get single shop detail including KYC fields (for Super Admin review).
   */
  static async getShopById(id) {
    const shop = await Shop.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
      ],
    });
    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }
    return shop;
  }

  /**
   * Approve a PENDING shop → ACTIVE.
   */
  static async approveShop(shopId, adminUserId) {
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }
    if (shop.status !== 'PENDING') {
      const error = new Error(`Shop is already ${shop.status}. Only PENDING shops can be approved.`);
      error.statusCode = 400;
      throw error;
    }
    shop.status = 'ACTIVE';
    shop.rejectionReason = null;
    await shop.save();

    await Notification.create({
      userId: shop.userId,
      title: 'Shop Approved!',
      message: 'Congratulations! Your shop has been approved and is now live on the marketplace.',
      type: 'ORDER_STATUS',
      link: '/seller',
    });

    return shop;
  }

  /**
   * Reject a PENDING shop with a reason.
   */
  static async rejectShop(shopId, reason, adminUserId) {
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }
    shop.status = 'REJECTED';
    shop.rejectionReason = reason || 'Application did not meet platform requirements.';
    await shop.save();

    await Notification.create({
      userId: shop.userId,
      title: 'Shop Application Rejected',
      message: `Your shop application was not approved. Reason: ${shop.rejectionReason}`,
      type: 'ORDER_STATUS',
      link: '/seller/shop',
    });

    return shop;
  }

  /**
   * Suspend an ACTIVE shop (kill-switch).
   */
  static async suspendShop(shopId, reason, adminUserId) {
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }
    shop.status = 'SUSPENDED';
    shop.rejectionReason = reason || 'Suspended by platform admin.';
    await shop.save();

    // Deactivate all shop products
    await Product.update({ isActive: false }, { where: { shopId } });

    await Notification.create({
      userId: shop.userId,
      title: 'Shop Suspended',
      message: `Your shop has been suspended. Reason: ${shop.rejectionReason}. Contact support to appeal.`,
      type: 'ORDER_STATUS',
      link: '/seller/shop',
    });

    return shop;
  }

  // ─── COMMISSION MANAGEMENT ────────────────────────────────────────────────────

  /**
   * Get all category commission rates.
   */
  static async getCategoryCommissions() {
    return CategoryCommission.findAll({
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Upsert commission rate for a category.
   */
  static async setCategoryCommission(categoryId, commissionRate, label) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const [record, created] = await CategoryCommission.findOrCreate({
      where: { categoryId },
      defaults: { categoryId, commissionRate, label: label || category.name },
    });

    if (!created) {
      record.commissionRate = commissionRate;
      if (label) record.label = label;
      await record.save();
    }

    return record;
  }

  /**
   * Get and update platform-level settings.
   */
  static async getSettings() {
    return PlatformSettings.getSingleton();
  }

  static async updateSettings(updates) {
    const settings = await PlatformSettings.getSingleton();
    const allowed = [
      'defaultCommissionRate',
      'escrowReturnWindowDays',
      'maxBoostProductsPer10',
      'autoSuspendRefundRateThreshold',
    ];
    allowed.forEach((key) => {
      if (updates[key] !== undefined) settings[key] = updates[key];
    });
    await settings.save();
    return settings;
  }

  // ─── PAYOUT MANAGEMENT ────────────────────────────────────────────────────────

  /**
   * Get shops with available balance (pending payout disbursement).
   */
  static async getPendingPayouts({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Shop.findAndCountAll({
      where: {
        availableBalance: { [Op.gt]: 0 },
        status: 'ACTIVE',
      },
      include: [
        { model: User, as: 'owner', attributes: ['firstName', 'lastName', 'email'] },
      ],
      attributes: ['id', 'name', 'availableBalance', 'escrowBalance', 'totalOrders'],
      order: [['availableBalance', 'DESC']],
      limit,
      offset,
    });

    return {
      payouts: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  /**
   * Release payout for a shop — move availableBalance to 0 (simulates bank disbursement).
   */
  static async releasePayout(shopId, adminUserId) {
    const t = await sequelize.transaction();
    try {
      const shop = await Shop.findByPk(shopId, { transaction: t, lock: true });
      if (!shop || shop.availableBalance <= 0) {
        const error = new Error('No available balance to release for this shop.');
        error.statusCode = 400;
        throw error;
      }

      const amount = parseFloat(shop.availableBalance);
      shop.availableBalance = 0.00;
      await shop.save({ transaction: t });

      await Notification.create(
        {
          userId: shop.userId,
          title: 'Payout Released',
          message: `$${amount.toFixed(2)} has been disbursed to your registered bank account.`,
          type: 'ORDER_STATUS',
          link: '/seller/balance',
        },
        { transaction: t }
      );

      await t.commit();
      return { shopId, amountReleased: amount };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // ─── DISPUTE / A-to-Z GUARANTEE ───────────────────────────────────────────────

  /**
   * Force a refund from seller escrow to customer.
   * Deducts from shop.escrowBalance, marks SellerOrder as REFUNDED.
   */
  static async forceRefund(sellerOrderId, adminUserId) {
    const t = await sequelize.transaction();
    try {
      const sellerOrder = await SellerOrder.findByPk(sellerOrderId, {
        include: [{ model: Shop, as: 'shop' }],
        transaction: t,
        lock: true,
      });

      if (!sellerOrder) {
        const error = new Error('Seller order not found.');
        error.statusCode = 404;
        throw error;
      }

      if (sellerOrder.status === 'REFUNDED') {
        const error = new Error('This order has already been refunded.');
        error.statusCode = 400;
        throw error;
      }

      const shop = sellerOrder.shop;
      const refundAmount = parseFloat(sellerOrder.sellerEarnings);

      // Deduct from escrow (or available if already released)
      if (parseFloat(shop.escrowBalance) >= refundAmount) {
        await Shop.decrement('escrowBalance', { by: refundAmount, where: { id: shop.id }, transaction: t });
      } else if (parseFloat(shop.availableBalance) >= refundAmount) {
        await Shop.decrement('availableBalance', { by: refundAmount, where: { id: shop.id }, transaction: t });
      } else {
        const error = new Error('Insufficient shop balance to process this refund.');
        error.statusCode = 400;
        throw error;
      }

      sellerOrder.status = 'REFUNDED';
      await sellerOrder.save({ transaction: t });

      // Notify seller
      await Notification.create(
        {
          userId: shop.userId,
          title: 'Forced Refund Applied',
          message: `A refund of $${refundAmount.toFixed(2)} has been applied to order #${sellerOrder.orderId} by platform admin.`,
          type: 'ORDER_STATUS',
          link: '/seller/orders',
        },
        { transaction: t }
      );

      await t.commit();
      return { sellerOrderId, refundAmount };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // ─── BUSINESS INTELLIGENCE ────────────────────────────────────────────────────

  /**
   * Executive dashboard: GMV, platform net revenue, take rate, active shop count.
   */
  static async getBusinessIntelligence() {
    const [gmvData] = await sequelize.query(
      `SELECT
        COALESCE(SUM(so.subtotal), 0)          AS gmv,
        COALESCE(SUM(so.platform_fee), 0)      AS platformNetRevenue,
        COALESCE(SUM(so.seller_earnings), 0)   AS totalSellerEarnings
       FROM seller_orders so
       WHERE so.status NOT IN ('CANCELLED', 'REFUNDED')`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const takeRate =
      gmvData.gmv > 0
        ? ((gmvData.platformNetRevenue / gmvData.gmv) * 100).toFixed(2)
        : 0;

    const activeShops = await Shop.count({ where: { status: 'ACTIVE' } });
    const pendingShops = await Shop.count({ where: { status: 'PENDING' } });
    const suspendedShops = await Shop.count({ where: { status: 'SUSPENDED' } });

    return {
      gmv: parseFloat(gmvData.gmv),
      platformNetRevenue: parseFloat(gmvData.platformNetRevenue),
      totalSellerEarnings: parseFloat(gmvData.totalSellerEarnings),
      effectiveTakeRate: parseFloat(takeRate),
      shopStats: { active: activeShops, pending: pendingShops, suspended: suspendedShops },
    };
  }

  /**
   * Top 10 shops by revenue.
   */
  static async getTopShopsByRevenue(limit = 10) {
    return sequelize.query(
      `SELECT
        s.id, s.name, s.slug, s.average_rating AS averageRating,
        s.total_orders AS totalOrders, s.refund_rate AS refundRate,
        COALESCE(SUM(so.seller_earnings), 0) AS totalRevenue
       FROM shops s
       LEFT JOIN seller_orders so ON so.shop_id = s.id
         AND so.status NOT IN ('CANCELLED', 'REFUNDED')
       WHERE s.status = 'ACTIVE'
       GROUP BY s.id
       ORDER BY totalRevenue DESC
       LIMIT :limit`,
      { replacements: { limit }, type: sequelize.QueryTypes.SELECT }
    );
  }

  /**
   * Top 10 shops by refund rate (problem stores to investigate).
   */
  static async getTopShopsByRefundRate(limit = 10) {
    return Shop.findAll({
      where: { status: 'ACTIVE', totalOrders: { [Op.gt]: 5 } },
      attributes: ['id', 'name', 'slug', 'refundRate', 'totalOrders', 'averageRating'],
      include: [
        { model: User, as: 'owner', attributes: ['email'] },
      ],
      order: [['refundRate', 'DESC']],
      limit,
    });
  }

  /**
   * Monthly GMV trend (last N months).
   */
  static async getGMVTrend(months = 6) {
    return sequelize.query(
      `SELECT
        DATE_FORMAT(so.created_at, '%Y-%m') AS month,
        COALESCE(SUM(so.subtotal), 0)       AS gmv,
        COALESCE(SUM(so.platform_fee), 0)   AS platformRevenue,
        COUNT(*)                             AS orderCount
       FROM seller_orders so
       WHERE so.status NOT IN ('CANCELLED', 'REFUNDED')
         AND so.created_at >= DATE_SUB(NOW(), INTERVAL :months MONTH)
       GROUP BY month
       ORDER BY month ASC`,
      { replacements: { months }, type: sequelize.QueryTypes.SELECT }
    );
  }
}

module.exports = SuperAdminBusinessService;
