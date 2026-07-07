import express from 'express';
import { getMyServices, getAllServices } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

const router = express.Router();

router.route('/my-services')
  .get(protect, getMyServices);

router.route('/all')
  .get(isRegularAdmin, getAllServices);

export default router;
