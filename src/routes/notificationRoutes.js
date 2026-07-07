import express from 'express';
import { 
  getMyNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAsUnread, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from '../controllers/notificationController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// optionalAuth populates req.user if customer token exists
// We will need a custom middleware or just handle it in controller since Admin and Customer hit same routes,
// but actually, they might have different tokens.
// Let's use a unified auth middleware for notifications, OR we just let the route be accessed if either token is valid.
// In GreenLeaf, usually `/api/admin/...` is for admin and `/api/user/...` is for customer.
// It's better to export the unified controller and mount it twice, or use a middleware that checks both.

// Actually, I'll export a middleware here to check either User or Admin token.
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const requireAuthBoth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      if (decoded.role === 'admin' || decoded.role === 'superadmin') {
        req.admin = await Admin.findByPk(decoded.id);
        if (!req.admin) throw new Error('Admin not found');
      } else {
        req.user = await User.findByPk(decoded.id);
        if (!req.user) throw new Error('User not found');
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }
  return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

router.use(requireAuthBoth);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.delete('/clear-all', clearAllNotifications);
router.put('/:id/read', markAsRead);
router.put('/:id/unread', markAsUnread);
router.delete('/:id', deleteNotification);

export default router;
