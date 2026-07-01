import * as authService from '../services/authService.js';
import { CustomerTimeline, Notification } from '../models/index.js';

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
  // Structure placeholder as requested
  const { email } = req.body;
  res.status(200).json({ success: true, message: 'Password reset link sent to email (placeholder)' });
};

export const resetPassword = async (req, res) => {
  // Structure placeholder as requested
  const { token, newPassword } = req.body;
  res.status(200).json({ success: true, message: 'Password has been reset successfully (placeholder)' });
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
