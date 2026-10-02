const express = require('express');
const WishlistController = require('../controllers/wishlist.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('CUSTOMER'));

router.get('/', WishlistController.getWishlist);
router.post('/items', WishlistController.addItem);
router.delete('/items/:productId', WishlistController.removeItem);

module.exports = router;
