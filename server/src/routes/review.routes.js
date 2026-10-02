const express = require('express');
const ReviewController = require('../controllers/review.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router({ mergeParams: true });

router.get('/', ReviewController.getReviews);
router.post(
  '/',
  authenticate,
  authorize('CUSTOMER'),
  upload.array('images', 3),
  ReviewController.addReview
);

module.exports = router;
