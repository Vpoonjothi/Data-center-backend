import express from 'express';
import { 
  getVerifications, 
  getVerificationById, 
  getVerificationDocument, 
  updateVerificationStatus 
} from '../controllers/adminVerificationController.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

const router = express.Router();

router.use(isRegularAdmin);

router.get('/', getVerifications);
router.get('/:id', getVerificationById);
router.get('/document/:filename', getVerificationDocument);
router.put('/:id/status', updateVerificationStatus);

export default router;
