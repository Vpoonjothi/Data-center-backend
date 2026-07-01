import express from 'express';
import { 
  getVerifications, 
  getVerificationById, 
  getVerificationDocument, 
  updateVerificationStatus 
} from '../controllers/adminVerificationController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.use(isAdmin);

router.get('/', getVerifications);
router.get('/:id', getVerificationById);
router.get('/document/:filename', getVerificationDocument);
router.put('/:id/status', updateVerificationStatus);

export default router;
