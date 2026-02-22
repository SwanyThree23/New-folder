"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateService = void 0;
const Marketplace_1 = require("../models/Marketplace");
const User_1 = require("../models/User");
/**
 * Affiliate & Referral Service
 * Handles the logic for broad distribution and partnership tracking.
 */
class AffiliateService {
    /**
     * Generate or retrieve affiliate code for a user
     */
    static async getOrCreateAffiliate(userId) {
        let affiliate = await Marketplace_1.Affiliate.findOne({ user: userId });
        if (!affiliate) {
            const user = await User_1.User.findById(userId);
            if (!user)
                throw new Error('User not found');
            // Generate a simple code: SWANNIE + partial username + 4 random chars
            const code = `SWANNIE-${user.username.toUpperCase().slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            affiliate = await Marketplace_1.Affiliate.create({
                user: userId,
                code: code
            });
        }
        return affiliate;
    }
    /**
     * Apply a referral code during sign-up
     */
    static async trackReferral(code, referredUserId) {
        const affiliate = await Marketplace_1.Affiliate.findOne({ code });
        if (!affiliate)
            return false;
        // Prevent self-referral
        if (affiliate.user.toString() === referredUserId)
            return false;
        // Check if user is already referred
        const alreadyReferred = affiliate.referrals.some(ref => ref.referredUser?.toString() === referredUserId);
        if (alreadyReferred)
            return true;
        affiliate.referrals.push({
            referredUser: referredUserId,
            date: new Date(),
            status: 'active'
        });
        await affiliate.save();
        return true;
    }
    /**
     * Process commission for an affiliate
     * Should be called when a referred user completes a sale or purchase
     */
    static async processCommission(referredUserId, saleAmount) {
        // Find if this user was referred by someone
        const affiliate = await Marketplace_1.Affiliate.findOne({ "referrals.referredUser": referredUserId });
        if (affiliate) {
            const commission = saleAmount * affiliate.commissionRate;
            affiliate.earnings += commission;
            await affiliate.save();
            // Also update the affiliate's user wallet balance
            await User_1.User.findByIdAndUpdate(affiliate.user, {
                $inc: { walletBalance: commission }
            });
            console.log(`[Affiliate] Commission of ${commission} paid to ${affiliate.user} for referral ${referredUserId}`);
        }
    }
}
exports.AffiliateService = AffiliateService;
