import express from 'express';
import {
  signup,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  getTimeline,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.get('/timeline', protect, getTimeline);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.delete('/notifications/clear-all', protect, clearAllNotifications);

export default router;
