import Notification from '../models/Notification.js';

/**
 * GET /api/notifications?unreadOnly=true
 */
const getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { unreadOnly } = req.query;

    const filter = { recipientId: userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.status(200).json({ notification });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
const markAllRead = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await Notification.updateMany({ recipientId: userId }, { isRead: true });
    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

export { getNotifications, markAsRead, markAllRead };
