import express from 'express';
import { getAdminPayments, verifyPayment } from '../controllers/paymentController.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

const router = express.Router();

router.use(isRegularAdmin);

router.route('/')
  .get(getAdminPayments);

router.route('/:id/verify')
  .put(verifyPayment);

export default router;
