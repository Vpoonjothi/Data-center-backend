import express from 'express';
import { getComplianceLogs, getAuditLogs } from '../controllers/adminComplianceController.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.route('/logs').get(isAdmin, getComplianceLogs);
router.route('/audit-logs').get(isAdmin, getAuditLogs);

export default router;
