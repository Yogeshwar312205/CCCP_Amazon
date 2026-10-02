const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { getReturns, requestReturn } = require('../controllers/return.controller');
const { requestReturnSchema } = require('../validators/order.validator');

router.use(authenticate);
router.use(authorize('CUSTOMER', 'ADMIN', 'SUPER_ADMIN'));

// GET /api/v1/returns
router.get('/', getReturns);

// POST /api/v1/returns
router.post('/', validate(requestReturnSchema), requestReturn);

module.exports = router;
