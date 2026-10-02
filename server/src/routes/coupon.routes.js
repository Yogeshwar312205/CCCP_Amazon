const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { validateCoupon } = require('../controllers/order.controller');
const { validateCouponSchema } = require('../validators/order.validator');

router.use(authenticate);
router.use(authorize('CUSTOMER', 'ADMIN', 'SUPER_ADMIN'));

// POST /api/v1/coupons/validate
router.post('/validate', validate(validateCouponSchema), validateCoupon);

module.exports = router;
