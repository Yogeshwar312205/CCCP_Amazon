const NotificationService = require('../services/notification.service');

const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await NotificationService.getNotifications(req.user.id, { page, limit });
    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await NotificationService.markRead(id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await NotificationService.markAllRead(req.user.id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
};
