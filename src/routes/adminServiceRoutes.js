import express from 'express';
import { getAllServices } from '../controllers/serviceController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.use(isAdmin);

router.route('/')
  .get(getAllServices);

export default router;
