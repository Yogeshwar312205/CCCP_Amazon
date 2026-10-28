const {
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Inventory,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./audit.service');

class AdminProductService {
  /**
   * List products with pagination and filters
   */
  static async getProducts({ page = 1, limit = 10, search = '', categoryId = null, isActive = null }) {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (page - 1) * limit;
    const where = {};

    if (search && search.trim()) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search.trim()}%` } },
        { sku: { [Op.like]: `%${search.trim()}%` } },
        { brand: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary'] },
        {
          model: ProductVariant,
          as: 'variants',
          include: [{ model: Inventory, as: 'inventory', attributes: ['stockQuantity', 'lowStockThreshold'] }],
        },
        { model: Inventory, as: 'inventory', attributes: ['stockQuantity', 'lowStockThreshold'] },
      ],
      distinct: true,
    });

    return {
      products,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Create Product + Variants + Inventory records (Atomic Transaction)
   */
  static async createProduct(productData, files = [], adminId = null) {
    const transaction = await sequelize.transaction();

    try {
      const {
        title,
        sku,
        brand,
        categoryId,
        shortDescription,
        description,
        basePrice,
        salePrice,
        isFeatured,
        isActive,
        variants = [],
      } = productData;

      // Auto-generate slug
      let slug = productData.slug;
      if (!slug) {
        slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        // Append random string to guarantee uniqueness
        slug += `-${Math.random().toString(36).substring(2, 6)}`;
      }

      // 1. Create Base Product
      const product = await Product.create(
        {
          title,
          slug,
          sku,
          brand,
          categoryId,
          shortDescription,
          description,
          basePrice,
          salePrice: salePrice || null,
          isFeatured: isFeatured || false,
          isActive: isActive !== undefined ? isActive : true,
        },
        { transaction }
      );

      // 2. Create Variants & Inventory
      if (variants && variants.length > 0) {
        for (const v of variants) {
          const variant = await ProductVariant.create(
            {
              productId: product.id,
              sku: v.sku,
              variantName: v.variantName,
              price: v.price,
              stockQuantity: v.stockQuantity || 0,
              isActive: true,
            },
            { transaction }
          );

          await Inventory.create(
            {
              productId: product.id,
              variantId: variant.id,
              stockQuantity: v.stockQuantity || 0,
              lowStockThreshold: v.lowStockThreshold || 5,
            },
            { transaction }
          );
        }
      } else {
        // Base product inventory without variants
        await Inventory.create(
          {
            productId: product.id,
            variantId: null,
            stockQuantity: productData.stockQuantity || 10,
            lowStockThreshold: 5,
          },
          { transaction }
        );
      }

      // 3. Attach Uploaded Images
      if (files && files.length > 0) {
        const imageRecords = files.map((file, idx) => ({
          productId: product.id,
          imageUrl: `/uploads/${file.filename}`,
          altText: product.title,
          isPrimary: idx === 0,
        }));
        await ProductImage.bulkCreate(imageRecords, { transaction });
      }

      await transaction.commit();

      await AuditService.log({
        userId: adminId,
        action: 'CREATE_PRODUCT',
        entityType: 'PRODUCT',
        entityId: product.id,
        oldValues: null,
        newValues: { title: product.title, sku: product.sku, basePrice: product.basePrice },
      });

      return await Product.findByPk(product.id, {
        include: [
          { model: ProductVariant, as: 'variants' },
          { model: ProductImage, as: 'images' },
        ],
      });
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Update Product
   */
  static async updateProduct(productId, updateData, adminId = null) {
    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    const oldValues = {
      title: product.title,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      isActive: product.isActive,
    };

    await product.update(updateData);

    await AuditService.log({
      userId: adminId,
      action: 'UPDATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: product.id,
      oldValues,
      newValues: updateData,
    });

    return product;
  }

  /**
   * Deactivate / Soft Delete Product
   */
  static async toggleProductStatus(productId, adminId = null) {
    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = product.isActive;
    product.isActive = !product.isActive;
    await product.save();

    await AuditService.log({
      userId: adminId,
      action: 'TOGGLE_PRODUCT_STATUS',
      entityType: 'PRODUCT',
      entityId: product.id,
      oldValues: { isActive: previousStatus },
      newValues: { isActive: product.isActive },
    });

    return product;
  }
}

module.exports = AdminProductService;
