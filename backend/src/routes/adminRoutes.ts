import express from 'express';
import { getTelemetry } from '../controllers/adminController';
import { protect } from '../middleware/auth';

const router = express.Router();

// @desc    Admin Only - Telemetry Stream
router.get('/telemetry', protect, getTelemetry);

export default router;
