"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const AffiliateService_1 = require("../services/AffiliateService");
const router = express_1.default.Router();
// @desc    Get current user's affiliate details
// @route   GET /api/affiliate/me
// @access  Private
router.get('/me', auth_1.protect, async (req, res) => {
    try {
        const affiliate = await AffiliateService_1.AffiliateService.getOrCreateAffiliate(req.user._id);
        res.json(affiliate);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// @desc    Track a referral (applied during signup)
// @route   POST /api/affiliate/track
// @access  Public
router.post('/track', async (req, res) => {
    const { code, userId } = req.body;
    try {
        const success = await AffiliateService_1.AffiliateService.trackReferral(code, userId);
        res.json({ success });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.default = router;
