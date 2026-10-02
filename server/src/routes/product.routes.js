const express = require('express');
const ProductController = require('../controllers/product.controller');
const reviewRoutes = require('./review.routes');
const questionRoutes = require('./question.routes');
const validate = require('../middlewares/validate.middleware');
const { productQuerySchema } = require('../validators/product.validator');

const router = express.Router();

router.get('/', validate(productQuerySchema), ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/:slug', ProductController.getProductBySlug);

// Nested Review & Question Routes
router.use('/:productId/reviews', reviewRoutes);
router.use('/:productId/questions', questionRoutes);

module.exports = router;
