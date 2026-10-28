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
  static ensureProductAccess(product, currentUser) {
    if (currentUser && currentUser.role === 'ADMIN' && product.createdBy !== currentUser.id) {
      const error = new Error('Access denied. You can only manage your own products.');
      error.statusCode = 403;
      error.code = 'PRODUCT_ACCESS_DENIED';
      throw error;
    }
  }

  /**
   * List products with pagination and filters
   */
  static async getProducts({ page = 1, limit = 10, search = '', categoryId = null, isActive = null, adminId = null } = {}, currentUser = null) {
    page = Math.max(parseInt(page, 10) || 1, 1);
    limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;
    const where = {};

    if (currentUser?.role === 'ADMIN') {
      where.createdBy = currentUser.id;
    } else if (currentUser?.role === 'SUPER_ADMIN' && adminId) {
      where.createdBy = parseInt(adminId, 10);
    }

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
        { model: Inventory, as: 'inventories', attributes: ['id', 'variantId', 'stockQuantity', 'lowStockThreshold'] },
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
  static async createProduct(productData, files = [], currentUser = null) {
    const transaction = await sequelize.transaction();
    const adminId = currentUser?.role === 'SUPER_ADMIN' && productData.adminId
      ? parseInt(productData.adminId, 10)
      : currentUser?.id ?? null;

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
          createdBy: adminId,
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
        newValues: { title: product.title, sku: product.sku, basePrice: product.basePrice, createdBy: adminId },
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
  static async updateProduct(productId, updateData, files = [], currentUser = null) {
    const transaction = await sequelize.transaction();
    const uploadedFiles = Array.isArray(files) ? files : [];
    const adminId = currentUser?.id ?? null;

    try {
      const product = await Product.findByPk(productId, { transaction });
      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      this.ensureProductAccess(product, currentUser);

      const oldValues = {
        title: product.title,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        isActive: product.isActive,
      };

      await product.update(updateData, { transaction });

      if (uploadedFiles.length > 0) {
        await ProductImage.destroy({ where: { productId }, transaction });
        await ProductImage.bulkCreate(
          uploadedFiles.map((file, index) => ({
            productId,
            imageUrl: `/uploads/${file.filename}`,
            altText: product.title,
            isPrimary: index === 0,
            displayOrder: index,
          })),
          { transaction }
        );
      }

      await transaction.commit();

      await AuditService.log({
        userId: adminId,
        action: 'UPDATE_PRODUCT',
        entityType: 'PRODUCT',
        entityId: product.id,
        oldValues,
        newValues: {
          ...updateData,
          createdBy: product.createdBy,
          ...(uploadedFiles.length > 0 ? { imageCount: uploadedFiles.length, imagesReplaced: true } : {}),
        },
      });

      return await Product.findByPk(productId, {
        include: [{ model: ProductImage, as: 'images' }],
      });
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw error;
    }
  }

  /**
   * Deactivate / Soft Delete Product
   */
  static async toggleProductStatus(productId, currentUser = null) {
    const adminId = currentUser?.id ?? null;
    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    this.ensureProductAccess(product, currentUser);

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
