import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignTechnician,
  updatePriority,
  reopenComplaint,
  runAiAnalysis,
  triggerEscalation,
} from '../controllers/complaintController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Student lodgings
router.post('/', authenticate, requireRole(['student']), createComplaint);

// List complaints (filtered per role)
router.get('/', authenticate, getComplaints);

// Live AI pre-analysis
router.post('/ai-analyze', authenticate, runAiAnalysis);

// Overdue ticket escalation trigger
router.post('/check-escalations', authenticate, requireRole(['admin']), triggerEscalation);

// Get single complaint details
router.get('/:id', authenticate, getComplaintById);

// Update status (Technician or Admin)
router.patch('/:id/status', authenticate, requireRole(['technician', 'admin']), updateComplaintStatus);

// Assign technician (Admin only)
router.patch('/:id/assign', authenticate, requireRole(['admin']), assignTechnician);

// Update priority (Admin only)
router.patch('/:id/priority', authenticate, requireRole(['admin']), updatePriority);

// Reopen complaint (Student only)
router.post('/:id/reopen', authenticate, requireRole(['student']), reopenComplaint);

export default router;

