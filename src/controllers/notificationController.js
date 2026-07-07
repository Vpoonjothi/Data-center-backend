import { Op } from 'sequelize';
import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
  try {
    const isCustomer = !!req.user;
    const userId = isCustomer ? req.user.id : req.admin.id;
    const userType = isCustomer ? 'customer' : 'admin';

    const { page = 1, limit = 20, category, priority, status, search, from_date, to_date } = req.query;
    
    let whereClause = {
      [isCustomer ? 'user_id' : 'admin_id']: userId,
      user_type: userType
    };

    if (category) whereClause.category = category;
    if (priority) whereClause.priority = priority;
    if (status === 'unread') whereClause.is_read = false;
    if (status === 'read') whereClause.is_read = true;
    
    if (from_date && to_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(from_date), new Date(to_date)]
      };
    } else if (from_date) {
      whereClause.created_at = { [Op.gte]: new Date(from_date) };
    } else if (to_date) {
      whereClause.created_at = { [Op.lte]: new Date(to_date) };
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Notification.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const unreadCount = await Notification.count({
      where: {
        [isCustomer ? 'user_id' : 'admin_id']: userId,
        user_type: userType,
        is_read: false
      }
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const isCustomer = !!req.user;
    const userId = isCustomer ? req.user.id : req.admin.id;
    const userType = isCustomer ? 'customer' : 'admin';

    const unreadCount = await Notification.count({
      where: {
        [isCustomer ? 'user_id' : 'admin_id']: userId,
        user_type: userType,
        is_read: false
      }
    });

    res.json({ success: true, count: unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const isCustomer = !!req.user;
    const userId = isCustomer ? req.user.id : req.admin.id;

    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        [isCustomer ? 'user_id' : 'admin_id']: userId
      }
    });

    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsUnread = async (req, res) => {
  try {
    const isCustomer = !!req.user;
    const userId = isCustomer ? req.user.id : req.admin.id;

    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        [isCustomer ? 'user_id' : 'admin_id']: userId
      }
    });

    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.is_read = false;
    notification.read_at = null;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as unread' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const isCustomer = !!req.user;
    const userId = isCustomer ? req.user.id : req.admin.id;
    const userType = isCustomer ? 'customer' : 'admin';

    await Notification.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          [isCustomer ? 'user_id' : 'admin_id']: userId,
          user_type: userType,
          is_read: false
        }
      }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const isCustomer = !!req.user;
    const userId = isCustomer ? req.user.id : req.admin.id;

    const deleted = await Notification.destroy({
      where: {
        id: req.params.id,
        [isCustomer ? 'user_id' : 'admin_id']: userId
      }
    });

    if (!deleted) return res.status(404).json({ success: false, message: 'Notification not found' });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    const isCustomer = !!req.user;
    const userId = isCustomer ? req.user.id : req.admin.id;
    const userType = isCustomer ? 'customer' : 'admin';

    await Notification.destroy({
      where: {
        [isCustomer ? 'user_id' : 'admin_id']: userId,
        user_type: userType
      }
    });

    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
