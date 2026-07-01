import express from 'express';
import { getMyServices, getAllServices } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.route('/my-services')
  .get(protect, getMyServices);

router.route('/all')
  .get(isAdmin, getAllServices);

export default router;
