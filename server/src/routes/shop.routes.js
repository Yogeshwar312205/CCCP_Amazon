const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const ShopController = require('../controllers/shop.controller');

// ── Public storefront routes (no auth required) ────────────────────────────

// GET /shops/:slug — public shop profile page
router.get('/:slug', ShopController.getShopBySlug);

// GET /shops/:id/products — public product listing for a shop
router.get('/:id/products', ShopController.getShopProducts);

// ── Seller shop management (auth required) ─────────────────────────────────
// These allow a SELLER to register/view/update their own shop.
// The requireActiveShop middleware is NOT used here because the seller
// needs to view/update even while PENDING.

router.post('/register', authenticate, authorize('SELLER'), ShopController.registerShop);
router.get('/me/profile', authenticate, authorize('SELLER'), ShopController.getOwnShop);
router.put('/me/profile', authenticate, authorize('SELLER'), ShopController.updateOwnShop);

module.exports = router;
