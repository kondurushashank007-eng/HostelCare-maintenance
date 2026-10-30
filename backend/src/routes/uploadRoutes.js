import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.post('/', authenticate, upload.array('images', 5), (req, res) => {
  const files = req.files || [];
  const urls = files.map((f) => `/uploads/${f.filename}`);
  return sendSuccess(res, 'Files uploaded successfully', { urls });
});

export default router;

