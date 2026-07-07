import { Notification } from '../models/index.js';

export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { admin_id: req.admin.id },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAdminNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, admin_id: req.admin.id }
    });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.is_read = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAllAdminNotificationsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { admin_id: req.admin.id, is_read: false } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const clearAllAdminNotifications = async (req, res) => {
  try {
    await Notification.destroy({
      where: { admin_id: req.admin.id }
    });
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
