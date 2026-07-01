import express from 'express';
import { submitEnquiry, getMyEnquiries } from '../controllers/enquiryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Optional authentication. If token is provided, protect middleware can set req.user, but we don't want to block public users.
// Actually, for a fully public route, we don't strictly need `protect`. We can just pass it directly.
// If we want to capture user_id if logged in, we need a custom "optional auth" middleware.
// For now, let's just make it completely public.

router.post('/', submitEnquiry);
router.get('/me', protect, getMyEnquiries);
export default router;
