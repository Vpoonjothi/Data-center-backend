import express from 'express';
import { getAdminDashboardStats } from '../controllers/adminDashboardController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.use(isAdmin);

router.route('/')
  .get(getAdminDashboardStats);

export default router;
