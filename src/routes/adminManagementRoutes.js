import express from 'express';
import { getAdmins, createAdmin, deleteAdmin, updateAdmin } from '../controllers/adminManagementController.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { isSuperAdmin } from '../middleware/isSuperAdmin.js';

const router = express.Router();

// Apply middleware to all routes in this file
router.use(isAdmin);
router.use(isSuperAdmin);

router.route('/')
  .get(getAdmins)
  .post(createAdmin);

router.route('/:id')
  .put(updateAdmin)
  .delete(deleteAdmin);

export default router;
