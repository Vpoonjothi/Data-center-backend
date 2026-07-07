import express from 'express';
import { 
  getEnquiries, 
  getEnquiryById, 
  updateEnquiryStatus, 
  addEnquiryResponse,
  addEnquiryNote,
  deleteEnquiryNote,
  generateQuoteFromEnquiry
} from '../controllers/adminEnquiryController.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

const router = express.Router();

router.use(isRegularAdmin); // Protect all routes in this file

router.route('/')
  .get(getEnquiries);

router.route('/:id')
  .get(getEnquiryById);

router.route('/:id/status')
  .put(updateEnquiryStatus);

router.route('/:id/responses')
  .post(addEnquiryResponse);

router.route('/:id/notes')
  .post(addEnquiryNote);

router.route('/:id/notes/:noteId')
  .delete(deleteEnquiryNote);

router.route('/:id/quote')
  .post(generateQuoteFromEnquiry);

export default router;
