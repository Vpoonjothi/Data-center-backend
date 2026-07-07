import express from 'express';
import { getGlobalSettings, updateGlobalSettings } from '../controllers/adminSettingsController.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

const router = express.Router();

router.use(isRegularAdmin);

router.route('/')
  .get(getGlobalSettings)
  .put(updateGlobalSettings);

export default router;
