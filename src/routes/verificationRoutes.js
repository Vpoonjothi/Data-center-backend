import express from 'express';
import { uploadVerificationDocs, getVerificationStatus } from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.fields([
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 }
]), uploadVerificationDocs);

router.get('/status/:quoteId', protect, getVerificationStatus);

export default router;
