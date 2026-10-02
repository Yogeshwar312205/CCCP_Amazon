const AddressService = require('../services/address.service');
const { RecentlyViewed, Product, ProductImage } = require('../models');

class UserController {
  // Address Management
  static async getAddresses(req, res, next) {
    try {
      const addresses = await AddressService.getUserAddresses(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Addresses retrieved successfully',
        data: { addresses },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createAddress(req, res, next) {
    try {
      const address = await AddressService.createAddress(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Address created successfully',
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req, res, next) {
    try {
      const address = await AddressService.updateAddress(req.user.id, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req, res, next) {
    try {
      await AddressService.deleteAddress(req.user.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Recently Viewed Products
  static async getRecentlyViewed(req, res, next) {
    try {
      const recent = await RecentlyViewed.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'title', 'slug', 'basePrice', 'salePrice', 'averageRating'],
            include: [{ model: ProductImage, as: 'images', attributes: ['imageUrl', 'isPrimary'] }],
          },
        ],
        order: [['viewedAt', 'DESC']],
        limit: 10,
      });

      return res.status(200).json({
        success: true,
        message: 'Recently viewed products retrieved',
        data: { recentlyViewed: recent.map((r) => r.product) },
      });
    } catch (error) {
      next(error);
    }
  }

  static async trackRecentlyViewed(req, res, next) {
    try {
      const { productId } = req.body;
      await RecentlyViewed.upsert({
        userId: req.user.id,
        productId,
        viewedAt: new Date(),
      });
      return res.status(200).json({
        success: true,
        message: 'Recently viewed product tracked',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
