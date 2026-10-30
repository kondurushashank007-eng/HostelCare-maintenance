import { Router } from 'express';
import { submitFeedback, getFeedback } from '../controllers/feedbackController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/:complaintId', authenticate, requireRole(['student']), submitFeedback);
router.get('/', authenticate, requireRole(['admin']), getFeedback);

export default router;

