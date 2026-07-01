import express from 'express';
import {
  signup,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  getTimeline,
  getNotifications
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

export default router;
