import express from 'express';
import { submitPaymentProof, getPaymentDetails, getMyPayments } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/:quoteId/submit')
  .post(protect, upload.single('payment_screenshot'), submitPaymentProof);

router.route('/:quoteId/details')
  .get(protect, getPaymentDetails);

router.route('/my-payments')
  .get(protect, getMyPayments);

export default router;
