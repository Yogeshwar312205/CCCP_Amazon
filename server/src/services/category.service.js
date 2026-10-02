const { Category } = require('../models');

class CategoryService {
  static async getCategoryTree() {
    const categories = await Category.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
        },
      ],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']],
    });

    // Return root categories (where parentId is null)
    return categories.filter((cat) => cat.parentId === null);
  }

  static async getCategoryBySlug(slug) {
    const category = await Category.findOne({
      where: { slug, isActive: true },
      include: [{ model: Category, as: 'subcategories', where: { isActive: true }, required: false }],
    });

    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 44;
      error.code = 'CATEGORY_NOT_FOUND';
      throw error;
    }
    return category;
  }
}

module.exports = CategoryService;
