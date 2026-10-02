const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} = require('../controllers/notification.controller');

router.use(authenticate);

// GET /api/v1/notifications
router.get('/', getNotifications);

// GET /api/v1/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', markAllRead);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', markRead);

module.exports = router;
