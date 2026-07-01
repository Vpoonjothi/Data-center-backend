import express from 'express';
import { createQuote, getMyQuotes, acceptQuote, rejectQuote } from '../controllers/quoteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createQuote);

router.route('/my-quotes')
  .get(protect, getMyQuotes);

router.route('/:id/accept')
  .put(protect, acceptQuote);

router.route('/:id/reject')
  .put(protect, rejectQuote);

export default router;
