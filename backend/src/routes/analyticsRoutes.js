import { Router } from 'express';
import { getDashboardAnalytics, askAiAssistant } from '../controllers/analyticsController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard', authenticate, requireRole(['admin']), getDashboardAnalytics);
router.post('/assistant', authenticate, requireRole(['admin']), askAiAssistant);

export default router;

