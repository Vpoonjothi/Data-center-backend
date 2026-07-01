import express from 'express';
import { getKycStatus, startAadhaarVerification, startPanVerification, submitKyc, getKycDocument, replaceDocument, getMyKyc } from '../controllers/kycController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadKYCDocs } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/my-kyc', protect, getMyKyc);
router.get('/status/:quoteId', protect, getKycStatus);
router.post('/aadhaar/start', protect, startAadhaarVerification);
router.post('/pan/start', protect, startPanVerification);

// Enhanced KYC endpoints
router.post('/submit', protect, uploadKYCDocs.fields([
  { name: 'aadhaar_front', maxCount: 1 },
  { name: 'aadhaar_back', maxCount: 1 },
  { name: 'gst_cert', maxCount: 1 },
  { name: 'pan_card', maxCount: 1 },
  { name: 'company_reg', maxCount: 1 },
  { name: 'address_proof', maxCount: 1 },
]), submitKyc);

router.post('/replace-document', protect, uploadKYCDocs.single('document'), replaceDocument);

router.get('/document', protect, getKycDocument);

export default router;
