import { Router } from 'express';
import {
  getTechnicians,
  updateTechnicianStatus,
  getTechnicianStats,
} from '../controllers/technicianController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, requireRole(['admin']), getTechnicians);
router.patch('/:id/availability', authenticate, requireRole(['admin', 'technician']), updateTechnicianStatus);
router.get('/stats', authenticate, requireRole(['technician', 'admin']), getTechnicianStats);
router.get('/:id/stats', authenticate, requireRole(['admin']), getTechnicianStats);

export default router;

