import express from 'express';
import { getQuotes, getQuoteById, updateQuoteStatus } from '../controllers/adminQuoteController.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

const router = express.Router();

router.use(isRegularAdmin);

router.route('/')
  .get(getQuotes);

router.route('/:id')
  .get(getQuoteById);

router.route('/:id/status')
  .put(updateQuoteStatus);

export default router;
