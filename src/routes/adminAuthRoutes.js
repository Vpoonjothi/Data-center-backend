import express from 'express';
import { loginAdmin, getAdminProfile, updateAdminPassword } from '../controllers/adminAuthController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', isAdmin, getAdminProfile);
router.put('/password', isAdmin, updateAdminPassword);

export default router;
