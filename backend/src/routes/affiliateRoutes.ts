import express from 'express';
import { protect } from '../middleware/auth';
import { AffiliateService } from '../services/AffiliateService';

const router = express.Router();

// @desc    Get current user's affiliate details
// @route   GET /api/affiliate/me
// @access  Private
router.get('/me', protect, async (req: any, res) => {
    try {
        const affiliate = await AffiliateService.getOrCreateAffiliate(req.user._id);
        res.json(affiliate);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Track a referral (applied during signup)
// @route   POST /api/affiliate/track
// @access  Public
router.post('/track', async (req, res) => {
    const { code, userId } = req.body;
    try {
        const success = await AffiliateService.trackReferral(code, userId);
        res.json({ success });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
