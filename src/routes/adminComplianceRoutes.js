import express from 'express';
import { getComplianceLogs, getAuditLogs } from '../controllers/adminComplianceController.js';
import { isRegularAdmin } from '../middleware/isRegularAdmin.js';

const router = express.Router();

router.route('/logs').get(isRegularAdmin, getComplianceLogs);
router.route('/audit-logs').get(isRegularAdmin, getAuditLogs);

export default router;
