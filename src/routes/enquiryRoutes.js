import express from 'express';
import { submitEnquiry, getMyEnquiries } from '../controllers/enquiryController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, submitEnquiry);
router.get('/me', protect, getMyEnquiries);
export default router;
