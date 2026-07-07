import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import { generateAdminToken } from '../utils/generateAdminToken.js';

// @desc    Auth admin & get token
// @route   POST /api/admin/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.scope('withPassword').findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateAdminToken(admin.id),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get admin profile (Verify token)
// @route   GET /api/admin/auth/me
// @access  Private (Admin)
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id);
    
    if (admin) {
      res.json({
        success: true,
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          username: admin.username,
          phone_number: admin.phone_number,
          avatar: admin.avatar,
          email_notifications: admin.email_notifications,
          website_notifications: admin.website_notifications,
          browser_notifications: admin.browser_notifications
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Admin not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update admin password
// @route   PUT /api/admin/auth/password
// @access  Private (Admin)
export const updateAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
  }

  try {
    const admin = await Admin.scope('withPassword').findByPk(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    admin.password = newPassword;
    await admin.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private (Admin)
export const updateAdminProfile = async (req, res) => {
  const { fullName, email, username, phoneNumber, avatar } = req.body;

  try {
    const admin = await Admin.findByPk(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
      admin.email = email;
    }

    if (username && username !== admin.username) {
      const usernameExists = await Admin.findOne({ where: { username } });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      admin.username = username;
    }

    if (fullName) admin.name = fullName;
    if (phoneNumber !== undefined) admin.phone_number = phoneNumber;
    if (avatar !== undefined) admin.avatar = avatar;

    await admin.save();
    
    res.json({ success: true, message: 'Profile updated successfully', data: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update admin notification preferences
// @route   PUT /api/admin/auth/notifications
// @access  Private (Admin)
export const updateAdminNotifications = async (req, res) => {
  const { email, website, browser } = req.body;

  try {
    const admin = await Admin.findByPk(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (email !== undefined) admin.email_notifications = email;
    if (website !== undefined) admin.website_notifications = website;
    if (browser !== undefined) admin.browser_notifications = browser;

    await admin.save();
    
    res.json({ success: true, message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
