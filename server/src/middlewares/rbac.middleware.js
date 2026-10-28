const { Shop } = require('../models');

/**
 * authorize(...allowedRoles)
 * Standard role-based access control middleware.
 * Usage: router.use(authorize('SELLER', 'SUPER_ADMIN'))
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
        error: { code: 'FORBIDDEN' },
      });
    }

    next();
  };
};

/**
 * requireActiveShop
 * Middleware for SELLER routes. Fetches the seller's Shop, verifies it is
 * ACTIVE, and attaches it as req.shop for downstream use.
 *
 * Returns 403 if the shop is PENDING/SUSPENDED/REJECTED.
 * Returns 404 if the user has no shop registered yet.
 */
const requireActiveShop = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ where: { userId: req.user.id } });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'No shop registered for this account. Please register a shop first.',
        error: { code: 'SHOP_NOT_FOUND' },
      });
    }

    if (shop.status !== 'ACTIVE') {
      const messages = {
        PENDING: 'Your shop is pending approval by the platform admin.',
        SUSPENDED: 'Your shop has been suspended. Please contact support.',
        REJECTED: `Your shop application was rejected. Reason: ${shop.rejectionReason || 'Not specified.'}`,
      };
      return res.status(403).json({
        success: false,
        message: messages[shop.status] || 'Shop is not active.',
        error: { code: `SHOP_${shop.status}` },
      });
    }

    req.shop = shop;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * requireShopOwnership(paramKey)
 * Verifies the requesting seller actually owns the shop identified by a route
 * param (e.g. :shopId). Use after requireActiveShop for nested resource routes.
 *
 * Usage: router.get('/:shopId/products', requireShopOwnership('shopId'), ...)
 */
const requireShopOwnership = (paramKey = 'shopId') => {
  return (req, res, next) => {
    const paramId = parseInt(req.params[paramKey], 10);
    if (req.shop && req.shop.id !== paramId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this shop\'s resources.',
        error: { code: 'FORBIDDEN' },
      });
    }
    next();
  };
};

module.exports = authorize;
module.exports.authorize = authorize;
module.exports.requireActiveShop = requireActiveShop;
module.exports.requireShopOwnership = requireShopOwnership;
