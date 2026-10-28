const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const AdminController = require('../controllers/admin.controller');
const {
  createProductSchema,
  updateProductSchema,
  inventoryAdjustSchema,
  updateOrderStatusSchema,
  processReturnSchema,
  createCouponSchema,
  createCategorySchema,
  updateCategorySchema,
} = require('../validators/admin.validator');

// Admin routes are available to ADMIN, SELLER, and SUPER_ADMIN accounts.
router.use(authenticate);
router.use(authorize('ADMIN', 'SELLER', 'SUPER_ADMIN'));

// Analytics
router.get('/analytics/overview', AdminController.getOverview);
router.get('/analytics/sales-chart', AdminController.getSalesChart);
router.get('/analytics/top-products', AdminController.getTopProducts);

// Products
router.get('/products', AdminController.getProducts);
router.post('/products', upload.array('images', 5), validate(createProductSchema), AdminController.createProduct);
router.put('/products/:id', validate(updateProductSchema), AdminController.updateProduct);
router.patch('/products/:id/toggle-status', AdminController.toggleProductStatus);

// Categories
router.get('/categories', AdminController.getCategories);
router.post('/categories', validate(createCategorySchema), AdminController.createCategory);
router.put('/categories/:id', validate(updateCategorySchema), AdminController.updateCategory);
router.patch('/categories/:id/toggle-status', AdminController.toggleCategoryStatus);
router.delete('/categories/:id', AdminController.deleteCategory);

// Inventory
router.get('/inventory', AdminController.getInventory);
router.post('/inventory/:id/adjust', validate(inventoryAdjustSchema), AdminController.adjustStock);
router.get('/inventory/:id/history', AdminController.getInventoryHistory);

// Orders
router.get('/orders', AdminController.getOrders);
router.get('/orders/:id', AdminController.getOrderById);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), AdminController.updateOrderStatus);

// Returns
router.get('/returns', AdminController.getReturns);
router.put('/returns/:id', validate(processReturnSchema), AdminController.processReturn);

// Coupons
router.get('/coupons', AdminController.getCoupons);
router.post('/coupons', validate(createCouponSchema), AdminController.createCoupon);
router.patch('/coupons/:id/toggle-status', AdminController.toggleCouponStatus);

// Audit Logs (SUPER_ADMIN ONLY)
router.get('/audit-logs', authorize('SUPER_ADMIN'), AdminController.getAuditLogs);

module.exports = router;
