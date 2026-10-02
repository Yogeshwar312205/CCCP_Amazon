const express = require('express');
const CartController = require('../controllers/cart.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { addToCartSchema, updateCartItemSchema } = require('../validators/cart.validator');

const router = express.Router();

router.use(authenticate);
router.use(authorize('CUSTOMER'));

router.get('/', CartController.getCart);
router.post('/items', validate(addToCartSchema), CartController.addItem);
router.put('/items/:id', validate(updateCartItemSchema), CartController.updateQuantity);
router.delete('/items/:id', CartController.removeItem);
router.delete('/', CartController.clearCart);

module.exports = router;
