const ReviewService = require('../services/review.service');

class ReviewController {
  static async getReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const reviews = await ReviewService.getProductReviews(productId);
      return res.status(200).json({
        success: true,
        message: 'Product reviews retrieved',
        data: { reviews },
      });
    } catch (error) {
      next(error);
    }
  }

  static async addReview(req, res, next) {
    try {
      const { productId } = req.params;
      const review = await ReviewService.addReview(req.user.id, productId, req.body, req.files);
      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
