const ProductService = require('../services/product.service');

class ProductController {
  static async getProducts(req, res, next) {
    try {
      const result = await ProductService.queryProducts(req.query);
      return res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: result.products,
        meta: {
          pagination: result.pagination,
          availableBrands: result.availableBrands,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFeaturedProducts(req, res, next) {
    try {
      const products = await ProductService.getFeaturedProducts();
      return res.status(200).json({
        success: true,
        message: 'Featured products retrieved',
        data: { products },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlug(req, res, next) {
    try {
      const product = await ProductService.getProductBySlug(req.params.slug);
      return res.status(200).json({
        success: true,
        message: 'Product details retrieved',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
