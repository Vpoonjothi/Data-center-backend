import express from 'express';
import { 
  getMyNotifications, 
  markAsRead, 
  markAsUnread,
  markAllAsRead, 
  deleteNotification,
  clearAllNotifications,
  getUnreadCount
} from '../controllers/notificationController.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

const router = express.Router();

router.use(isRegularAdmin);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.put('/:id/unread', markAsUnread);
router.delete('/clear-all', clearAllNotifications);
router.delete('/:id', deleteNotification);

export default router;
