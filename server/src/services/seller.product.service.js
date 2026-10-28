const { Op } = require('sequelize');
const {
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Inventory,
  sequelize,
} = require('../models');

/**
 * SellerProductService
 * All operations are scoped to the calling seller's shopId.
 * Sellers cannot view or modify products from other shops.
 */
class SellerProductService {
  static async getProducts(shopId, { page = 1, limit = 20, search = '', categoryId, isActive } = {}) {
    const offset = (page - 1) * limit;
    const where = { shopId };

    if (search && search.trim()) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search.trim()}%` } },
        { sku: { [Op.like]: `%${search.trim()}%` } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary'] },
        { model: Inventory, as: 'inventory', attributes: ['stockQuantity', 'lowStockThreshold'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      products: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  static async getProductById(productId, shopId) {
    const product = await Product.findOne({
      where: { id: productId, shopId },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: ProductImage, as: 'images' },
        {
          model: ProductVariant,
          as: 'variants',
          include: [{ model: Inventory, as: 'inventory' }],
        },
        { model: Inventory, as: 'inventory' },
      ],
    });

    if (!product) {
      const error = new Error('Product not found in your shop.');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }
    return product;
  }

  static async createProduct(shopId, productData, files = []) {
    const t = await sequelize.transaction();
    try {
      const {
        title, sku, brand, categoryId, shortDescription, description,
        basePrice, salePrice, isFeatured, isActive, variants = [], stockQuantity,
      } = productData;

      // Sellers can only use existing platform categories
      const category = await Category.findByPk(categoryId);
      if (!category) {
        const error = new Error('Invalid category. Please choose from an existing platform category.');
        error.statusCode = 400;
        throw error;
      }

      let slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      slug += `-${Math.random().toString(36).substring(2, 6)}`;

      const product = await Product.create(
        {
          shopId,
          title,
          slug,
          sku,
          brand: brand || null,
          categoryId,
          shortDescription: shortDescription || null,
          description,
          basePrice,
          salePrice: salePrice || null,
          isFeatured: false, // sellers cannot self-feature; Super Admin controls this
          isActive: isActive !== undefined ? isActive : true,
        },
        { transaction: t }
      );

      if (variants && variants.length > 0) {
        for (const v of variants) {
          const variant = await ProductVariant.create(
            { productId: product.id, sku: v.sku, variantName: v.variantName, price: v.price, stockQuantity: v.stockQuantity || 0, isActive: true },
            { transaction: t }
          );
          await Inventory.create(
            { productId: product.id, variantId: variant.id, stockQuantity: v.stockQuantity || 0, lowStockThreshold: v.lowStockThreshold || 5 },
            { transaction: t }
          );
        }
      } else {
        await Inventory.create(
          { productId: product.id, variantId: null, stockQuantity: stockQuantity || 0, lowStockThreshold: 5 },
          { transaction: t }
        );
      }

      if (files && files.length > 0) {
        const imageRecords = files.map((file, idx) => ({
          productId: product.id,
          imageUrl: `/uploads/${file.filename}`,
          altText: title,
          isPrimary: idx === 0,
        }));
        await ProductImage.bulkCreate(imageRecords, { transaction: t });
      }

      await t.commit();
      return SellerProductService.getProductById(product.id, shopId);
    } catch (err) {
      if (!t.finished) await t.rollback();
      throw err;
    }
  }

  static async updateProduct(productId, shopId, updates) {
    const product = await Product.findOne({ where: { id: productId, shopId } });
    if (!product) {
      const error = new Error('Product not found in your shop.');
      error.statusCode = 404;
      throw error;
    }

    const allowed = [
      'title', 'brand', 'shortDescription', 'description',
      'basePrice', 'salePrice', 'isActive', 'categoryId',
    ];
    allowed.forEach((key) => {
      if (updates[key] !== undefined) product[key] = updates[key];
    });

    await product.save();
    return product;
  }

  static async toggleProductStatus(productId, shopId) {
    const product = await Product.findOne({ where: { id: productId, shopId } });
    if (!product) {
      const error = new Error('Product not found in your shop.');
      error.statusCode = 404;
      throw error;
    }
    product.isActive = !product.isActive;
    await product.save();
    return product;
  }
}

module.exports = SellerProductService;
