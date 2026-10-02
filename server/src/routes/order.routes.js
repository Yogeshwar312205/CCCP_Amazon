const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { checkout, getOrders, getOrderById, cancelOrder, validateCoupon } = require('../controllers/order.controller');
const { checkoutSchema, cancelOrderSchema, validateCouponSchema } = require('../validators/order.validator');

// All order routes require authentication
router.use(authenticate);
router.use(authorize('CUSTOMER', 'ADMIN', 'SUPER_ADMIN'));

// POST /api/v1/orders/checkout
router.post('/checkout', validate(checkoutSchema), checkout);

// GET /api/v1/orders
router.get('/', getOrders);

// GET /api/v1/orders/:id
router.get('/:id', getOrderById);

// POST /api/v1/orders/:id/cancel
router.post('/:id/cancel', validate(cancelOrderSchema), cancelOrder);

module.exports = router;
