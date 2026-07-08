import * as authService from '../services/authService.js';
import { CustomerTimeline, Notification } from '../models/index.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export const signup = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await authService.getUserProfile(req.user.id);
    res.status(200).json({ success: true, user: profile });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const result = await authService.updateUserProfile(req.user.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(200).json({ success: true, message: 'If your email is registered, you will receive a reset link shortly.' });
    }
    
    const token = jwt.sign({ id: user.id }, jwtConfig.secret, { expiresIn: '15m' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    
    const subject = 'Password Reset Request - GreenLeaf Data Center';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #1A801D; text-align: center;">Reset Your Password</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password for your GreenLeaf Data Center account.</p>
        <p>Click the button below to reset it. This link is valid for 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1A801D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thanks,<br>The GreenLeaf Team</p>
      </div>
    `;
    
    await sendEmail(user.email, subject, htmlContent);
    
    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.secret);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

export const getTimeline = async (req, res) => {
  try {
    const timeline = await CustomerTimeline.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
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

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.destroy({
      where: { user_id: req.user.id }
    });
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
