import express from 'express';
import { submitPaymentProof, getPaymentDetails, getMyPayments, createRazorpayOrder, verifyRazorpayPayment, createServiceRenewalOrder, verifyServiceRenewalPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/:quoteId/submit')
  .post(protect, upload.single('payment_screenshot'), submitPaymentProof);

router.route('/:quoteId/details')
  .get(protect, getPaymentDetails);

router.route('/:quoteId/razorpay/create-order')
  .post(protect, createRazorpayOrder);

router.route('/:quoteId/razorpay/verify')
  .post(protect, verifyRazorpayPayment);

// Service Renewal Routes
router.route('/service/:serviceId/razorpay/create-order')
  .post(protect, createServiceRenewalOrder);

router.route('/service/:serviceId/razorpay/verify')
  .post(protect, verifyServiceRenewalPayment);

router.route('/my-payments')
  .get(protect, getMyPayments);

export default router;
