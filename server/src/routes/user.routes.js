const express = require('express');
const UserController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Addresses
router.get('/addresses', UserController.getAddresses);
router.post('/addresses', UserController.createAddress);
router.put('/addresses/:id', UserController.updateAddress);
router.delete('/addresses/:id', UserController.deleteAddress);

// Recently Viewed Products
router.get('/recently-viewed', UserController.getRecentlyViewed);
router.post('/recently-viewed', UserController.trackRecentlyViewed);

module.exports = router;
