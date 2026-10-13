const { Category, Product } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./audit.service');

class AdminCategoryService {
  /**
   * List all categories (flat or tree) with product count and parent info
   */
  static async getCategories({ search = '', flat = false } = {}) {
    const where = {};
    if (search && search.trim()) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { slug: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    if (flat || flat === 'true') {
      return await Category.findAll({
        where,
        include: [
          { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
          { model: Product, as: 'products', attributes: ['id'] },
        ],
        order: [['parentId', 'ASC'], ['displayOrder', 'ASC'], ['name', 'ASC']],
      });
    }

    return await Category.findAll({
      where: { ...where, parentId: null },
      include: [
        {
          model: Category,
          as: 'subcategories',
          include: [{ model: Product, as: 'products', attributes: ['id'] }],
        },
        { model: Product, as: 'products', attributes: ['id'] },
      ],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']],
    });
  }

  /**
   * Create a new category
   */
  static async createCategory(categoryData, adminId = null) {
    let { name, slug, description, parentId, displayOrder, isActive } = categoryData;
    if (!name || !name.trim()) {
      const error = new Error('Category name is required');
      error.statusCode = 400;
      throw error;
    }
    name = name.trim();

    if (!slug || !slug.trim()) {
      slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    } else {
      slug = slug
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Ensure unique slug
    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      slug += `-${Math.random().toString(36).substring(2, 6)}`;
    }

    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        const error = new Error('Parent category not found');
        error.statusCode = 404;
        throw error;
      }
    }

    const category = await Category.create({
      name,
      slug,
      description: description || null,
      parentId: parentId ? parseInt(parentId, 10) : null,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await AuditService.log({
      userId: adminId,
      action: 'CREATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: category.id,
      newValues: { name: category.name, slug: category.slug, parentId: category.parentId },
    });

    return category;
  }

  /**
   * Update category
   */
  static async updateCategory(id, categoryData, adminId = null) {
    const category = await Category.findByPk(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const oldValues = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      displayOrder: category.displayOrder,
    };

    if (categoryData.parentId !== undefined && categoryData.parentId !== null) {
      const pId = parseInt(categoryData.parentId, 10);
      if (pId === category.id) {
        const error = new Error('A category cannot be its own parent');
        error.statusCode = 400;
        throw error;
      }
      category.parentId = pId;
    } else if (categoryData.parentId === null) {
      category.parentId = null;
    }

    if (categoryData.slug && categoryData.slug !== category.slug) {
      let slug = categoryData.slug
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existing = await Category.findOne({ where: { slug } });
      if (existing && existing.id !== category.id) {
        const error = new Error(`Category with slug '${slug}' already exists`);
        error.statusCode = 400;
        throw error;
      }
      category.slug = slug;
    }

    if (categoryData.name !== undefined) category.name = categoryData.name.trim();
    if (categoryData.description !== undefined) category.description = categoryData.description;
    if (categoryData.displayOrder !== undefined) category.displayOrder = parseInt(categoryData.displayOrder, 10);
    if (categoryData.isActive !== undefined) category.isActive = categoryData.isActive;

    await category.save();

    await AuditService.log({
      userId: adminId,
      action: 'UPDATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: category.id,
      oldValues,
      newValues: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        isActive: category.isActive,
        displayOrder: category.displayOrder,
      },
    });

    return category;
  }

  /**
   * Toggle category active status
   */
  static async toggleCategoryStatus(id, adminId = null) {
    const category = await Category.findByPk(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = category.isActive;
    category.isActive = !category.isActive;
    await category.save();

    await AuditService.log({
      userId: adminId,
      action: 'TOGGLE_CATEGORY_STATUS',
      entityType: 'CATEGORY',
      entityId: category.id,
      oldValues: { isActive: oldStatus },
      newValues: { isActive: category.isActive },
    });

    return category;
  }

  /**
   * Delete category
   */
  static async deleteCategory(id, adminId = null) {
    const category = await Category.findByPk(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      const error = new Error(
        `Cannot delete category. There are ${productCount} product(s) assigned to this category.`
      );
      error.statusCode = 400;
      throw error;
    }

    const subCount = await Category.count({ where: { parentId: id } });
    if (subCount > 0) {
      const error = new Error(
        `Cannot delete category. It has ${subCount} subcategory/subcategories. Please delete or reassign them first.`
      );
      error.statusCode = 400;
      throw error;
    }

    await category.destroy();

    await AuditService.log({
      userId: adminId,
      action: 'DELETE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: id,
      oldValues: { name: category.name, slug: category.slug },
    });

    return { success: true, message: 'Category deleted successfully' };
  }
}

module.exports = AdminCategoryService;
