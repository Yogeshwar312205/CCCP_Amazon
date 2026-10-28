const { Notification } = require('../models');

class NotificationService {
  /**
   * Get all notifications for a user (newest first)
   */
  static async getNotifications(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      notifications,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId) {
    const count = await Notification.count({
      where: { userId, isRead: false },
    });
    return count;
  }

  /**
   * Mark a single notification as read (with ownership check)
   */
  static async markRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  }

  /**
   * Mark all notifications for a user as read
   */
  static async markAllRead(userId) {
    const [updatedCount] = await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
    return { updated: updatedCount };
  }
}

module.exports = NotificationService;
