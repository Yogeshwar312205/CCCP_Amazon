const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const SuperAdminController = require('../controllers/superadmin.controller');

// All Super Admin routes require auth + SUPER_ADMIN role
router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

// ── Shop Governance ────────────────────────────────────────────────────────
router.get('/shops', SuperAdminController.getShops);
router.get('/shops/:id', SuperAdminController.getShopById);
router.put('/shops/:id/approve', SuperAdminController.approveShop);
router.put('/shops/:id/reject', SuperAdminController.rejectShop);
router.put('/shops/:id/suspend', SuperAdminController.suspendShop);

// ── Commission Management ──────────────────────────────────────────────────
router.get('/commission', SuperAdminController.getCategoryCommissions);
router.post('/commission', SuperAdminController.setCategoryCommission);

// ── Platform Settings ──────────────────────────────────────────────────────
router.get('/settings', SuperAdminController.getSettings);
router.put('/settings', SuperAdminController.updateSettings);

// ── Boost Campaign Approval ────────────────────────────────────────────────
router.get('/boosts', SuperAdminController.getBoostRequests);
router.put('/boosts/:id/approve', SuperAdminController.approveBoost);
router.put('/boosts/:id/reject', SuperAdminController.rejectBoost);

// ── Payout Ledger ─────────────────────────────────────────────────────────
router.get('/payouts', SuperAdminController.getPendingPayouts);
router.put('/payouts/:id/release', SuperAdminController.releasePayout);

// ── Dispute Resolution / A-to-Z ───────────────────────────────────────────
// :id here is the SellerOrder ID
router.put('/seller-orders/:id/force-refund', SuperAdminController.forceRefund);

// ── Business Intelligence ─────────────────────────────────────────────────
router.get('/analytics/overview', SuperAdminController.getBusinessIntelligence);
router.get('/analytics/top-stores-revenue', SuperAdminController.getTopShopsByRevenue);
router.get('/analytics/top-stores-refunds', SuperAdminController.getTopShopsByRefundRate);
router.get('/analytics/gmv-trend', SuperAdminController.getGMVTrend);

module.exports = router;
