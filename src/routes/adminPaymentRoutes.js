import express from 'express';
import { getAdminPayments, verifyPayment } from '../controllers/paymentController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.use(isAdmin);

router.route('/')
  .get(getAdminPayments);

router.route('/:id/verify')
  .put(verifyPayment);

export default router;
