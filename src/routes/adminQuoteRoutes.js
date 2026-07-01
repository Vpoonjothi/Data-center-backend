import express from 'express';
import { getQuotes, getQuoteById, updateQuoteStatus } from '../controllers/adminQuoteController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.use(isAdmin);

router.route('/')
  .get(getQuotes);

router.route('/:id')
  .get(getQuoteById);

router.route('/:id/status')
  .put(updateQuoteStatus);

export default router;
