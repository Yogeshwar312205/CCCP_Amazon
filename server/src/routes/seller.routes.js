const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const { requireActiveShop } = require('../middlewares/rbac.middleware');
const upload = require('../middlewares/upload.middleware');
const SellerController = require('../controllers/seller.controller');

// All seller routes require authentication + SELLER role + active shop
router.use(authenticate);
router.use(authorize('SELLER'));
router.use(requireActiveShop);

// ── Orders ────────────────────────────────────────────────────────────────
router.get('/orders', SellerController.getOrders);
router.get('/orders/:id', SellerController.getOrderById);
router.put('/orders/:id/status', SellerController.updateOrderStatus);

// ── Analytics ─────────────────────────────────────────────────────────────
router.get('/analytics', SellerController.getAnalytics);

// ── Products ──────────────────────────────────────────────────────────────
router.get('/products', SellerController.getProducts);
router.get('/products/:id', SellerController.getProductById);
router.post('/products', upload.array('images', 5), SellerController.createProduct);
router.put('/products/:id', SellerController.updateProduct);
router.patch('/products/:id/toggle-status', SellerController.toggleProductStatus);

// ── Boost Campaigns ───────────────────────────────────────────────────────
router.get('/boosts', SellerController.getBoosts);
router.post('/boosts', SellerController.requestBoost);

// ── Balance & Payouts ─────────────────────────────────────────────────────
router.get('/balance', SellerController.getBalance);

module.exports = router;
