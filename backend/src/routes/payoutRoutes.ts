import express from 'express';
import { requestPayout, getTransactionHistory } from '../controllers/payoutController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All payout routes require authentication

router.post('/request', requestPayout);
router.get('/history', getTransactionHistory);

export default router;
