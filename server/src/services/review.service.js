const { Review, ReviewImage, Product, Order, OrderItem, User, sequelize } = require('../models');

class ReviewService {
  static async getProductReviews(productId) {
    return await Review.findAll({
      where: { productId, status: 'APPROVED' },
      include: [
        { model: User, as: 'author', attributes: ['firstName', 'lastName'] },
        { model: ReviewImage, as: 'images', attributes: ['imageUrl'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  static async addReview(userId, productId, reviewData, files = []) {
    const transaction = await sequelize.transaction();
    try {
      const product = await Product.findByPk(productId, { transaction });
      if (!product || !product.isActive) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      // Check for existing review by user
      const existing = await Review.findOne({
        where: { productId, userId },
        transaction,
      });
      if (existing) {
        const error = new Error('You have already submitted a review for this product');
        error.statusCode = 400;
        error.code = 'DUPLICATE_REVIEW';
        throw error;
      }

      // Check verified purchase status (User has an order with status 'DELIVERED' containing product)
      const verifiedOrder = await Order.findOne({
        where: { userId, status: 'DELIVERED' },
        include: [{ model: OrderItem, as: 'items', where: { productId } }],
        transaction,
      });

      const isVerifiedPurchase = !!verifiedOrder;

      // Create Review
      const review = await Review.create(
        {
          productId,
          userId,
          rating: parseInt(reviewData.rating, 10),
          title: reviewData.title,
          comment: reviewData.comment,
          isVerifiedPurchase,
          status: 'APPROVED', // Default approved for fast demo
        },
        { transaction }
      );

      // Save Review Images
      if (files && files.length > 0) {
        const imageRecords = files.map((file) => ({
          reviewId: review.id,
          imageUrl: `/uploads/${file.filename}`,
        }));
        await ReviewImage.bulkCreate(imageRecords, { transaction });
      }

      // Recalculate average rating & total reviews on Product
      const allReviews = await Review.findAll({
        where: { productId, status: 'APPROVED' },
        attributes: ['rating'],
        transaction,
      });

      const totalCount = allReviews.length;
      const sumRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = totalCount > 0 ? parseFloat((sumRating / totalCount).toFixed(2)) : 0.0;

      await product.update(
        {
          averageRating: avgRating,
          totalReviews: totalCount,
        },
        { transaction }
      );

      await transaction.commit();
      return await Review.findByPk(review.id, {
        include: [
          { model: User, as: 'author', attributes: ['firstName', 'lastName'] },
          { model: ReviewImage, as: 'images', attributes: ['imageUrl'] },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = ReviewService;
