import { Router } from 'express';
import {
  register,
  registerStudent,
  registerWarden,
  registerTechnician,
  login,
  getProfile,
  updateProfile,
  getRooms,
  getPendingStaff,
  approveStaff,
} from '../controllers/authController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public Auth Endpoints
router.post('/login', login);
router.post('/register', register);
router.post('/register/student', registerStudent);
router.post('/register/warden', registerWarden);
router.post('/register/technician', registerTechnician);
router.get('/rooms', getRooms);

// Authenticated User Endpoints
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Administrator Staff Review Endpoints
router.get('/pending-staff', authenticate, requireRole('admin'), getPendingStaff);
router.put('/staff/:id/approve', authenticate, requireRole('admin'), approveStaff);

export default router;
