import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  razorpayWebhookHandler,
  getMyPayments,
  getPaymentDetails
} from '../controllers/paymentController.js';

const router = express.Router();

// Webhook endpoint does not need authentication (but is verified via signature)
router.post('/webhook', express.raw({type: 'application/json'}), razorpayWebhookHandler);

// Create order and verify endpoints
// Note: These map to the existing controllers which expect `quoteId` in req.params.
// We wrap them to pull quoteId from req.body to match a generic POST payload without URL params.
router.post('/create-order', protect, (req, res, next) => {
  req.params.quoteId = req.body.quoteId;
  return createRazorpayOrder(req, res, next);
});

router.post('/verify', protect, (req, res, next) => {
  req.params.quoteId = req.body.quoteId;
  return verifyRazorpayPayment(req, res, next);
});

router.post('/fail', protect, handlePaymentFailure);

// Get payment history (alias for getMyPayments)
router.get('/history', protect, getMyPayments);

// Get payment details by ID
router.get('/:id', protect, (req, res, next) => {
  req.params.quoteId = req.params.id; // Controller relies on quoteId, so we alias it here
  return getPaymentDetails(req, res, next);
});

export default router;
