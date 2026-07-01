import express from 'express';
import { getAdminKycVerifications, getAdminKycVerificationById, updateAdminKycVerificationStatus, updateAdminKycDocumentStatus, getAdminKycDocument } from '../controllers/adminKycController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.use(isAdmin);

router.route('/')
  .get(getAdminKycVerifications);

router.route('/document')
  .get(getAdminKycDocument);

router.route('/:id')
  .get(getAdminKycVerificationById);

router.route('/:id/status')
  .put(updateAdminKycVerificationStatus);

router.route('/:id/document-status')
  .put(updateAdminKycDocumentStatus);

export default router;
