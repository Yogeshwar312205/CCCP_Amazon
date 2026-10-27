const { Op } = require('sequelize');
const { Shop, User, Product, ProductImage, Review, sequelize } = require('../models');

class ShopService {
  /**
   * Register a new shop for a SELLER user.
   * The shop is created with status PENDING until Super Admin approves.
   */
  static async registerShop(userId, shopData) {
    // One seller = one shop
    const existing = await Shop.findOne({ where: { userId } });
    if (existing) {
      const error = new Error('You already have a registered shop.');
      error.statusCode = 409;
      error.code = 'SHOP_ALREADY_EXISTS';
      throw error;
    }

    const slug = shopData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check name/slug uniqueness
    const conflict = await Shop.findOne({
      where: { [Op.or]: [{ name: shopData.name }, { slug }] },
    });
    if (conflict) {
      const error = new Error('A shop with this name already exists.');
      error.statusCode = 409;
      error.code = 'SHOP_NAME_TAKEN';
      throw error;
    }

    const shop = await Shop.create({
      userId,
      name: shopData.name,
      slug,
      description: shopData.description || null,
      businessRegNo: shopData.businessRegNo || null,
      taxId: shopData.taxId || null,
      bankAccountInfo: shopData.bankAccountInfo || null,
      status: 'PENDING',
    });

    return shop;
  }

  /**
   * Get shop profile (public storefront view — by slug).
   */
  static async getShopBySlug(slug) {
    const shop = await Shop.findOne({
      where: { slug, status: 'ACTIVE' },
      include: [{ model: User, as: 'owner', attributes: ['firstName', 'lastName'] }],
      attributes: { exclude: ['bankAccountInfo', 'taxId', 'businessRegNo', 'userId'] },
    });

    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      error.code = 'SHOP_NOT_FOUND';
      throw error;
    }

    return shop;
  }

  /**
   * Get shop products (public listing).
   */
  static async getShopProducts(shopId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: { shopId, isActive: true },
      include: [
        { model: ProductImage, as: 'images', attributes: ['imageUrl', 'altText', 'isPrimary'] },
      ],
      limit,
      offset,
      order: [
        [sequelize.literal('isBoosted'), 'DESC'],
        ['averageRating', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    return {
      products: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  /**
   * Get the seller's own shop profile (includes sensitive KYC fields).
   */
  static async getSellerOwnShop(userId) {
    const shop = await Shop.findOne({ where: { userId } });
    if (!shop) {
      const error = new Error('No shop found for this account.');
      error.statusCode = 404;
      error.code = 'SHOP_NOT_FOUND';
      throw error;
    }
    return shop;
  }

  /**
   * Update seller's own shop profile.
   */
  static async updateShop(userId, updates) {
    const shop = await Shop.findOne({ where: { userId } });
    if (!shop) {
      const error = new Error('Shop not found.');
      error.statusCode = 404;
      throw error;
    }

    const allowed = ['description', 'logoUrl', 'bannerUrl', 'bankAccountInfo', 'businessRegNo', 'taxId'];
    allowed.forEach((field) => {
      if (updates[field] !== undefined) shop[field] = updates[field];
    });

    await shop.save();
    return shop;
  }
}

module.exports = ShopService;
