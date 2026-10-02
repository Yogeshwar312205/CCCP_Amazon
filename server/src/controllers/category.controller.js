const CategoryService = require('../services/category.service');

class CategoryController {
  static async getCategories(req, res, next) {
    try {
      const tree = await CategoryService.getCategoryTree();
      return res.status(200).json({
        success: true,
        message: 'Category tree retrieved',
        data: { categories: tree },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBySlug(req, res, next) {
    try {
      const category = await CategoryService.getCategoryBySlug(req.params.slug);
      return res.status(200).json({
        success: true,
        message: 'Category details retrieved',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
