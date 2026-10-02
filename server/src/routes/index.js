const express = require('express');
const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');
const userRoutes = require('./user.routes');
const orderRoutes = require('./order.routes');
const returnRoutes = require('./return.routes');
const couponRoutes = require('./coupon.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');
const healthRoutes = require('./health.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/returns', returnRoutes);
router.use('/coupons', couponRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/health', healthRoutes);

module.exports = router;
