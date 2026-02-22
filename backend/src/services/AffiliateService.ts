import { Affiliate } from '../models/Marketplace';
import { User } from '../models/User';
import mongoose from 'mongoose';

/**
 * Affiliate & Referral Service
 * Handles the logic for broad distribution and partnership tracking.
 */
export class AffiliateService {

    /**
     * Generate or retrieve affiliate code for a user
     */
    static async getOrCreateAffiliate(userId: string): Promise<any> {
        let affiliate = await Affiliate.findOne({ user: userId });

        if (!affiliate) {
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            // Generate a simple code: SWANNIE + partial username + 4 random chars
            const code = `SWANNIE-${user.username.toUpperCase().slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

            affiliate = await Affiliate.create({
                user: userId,
                code: code
            });
        }

        return affiliate;
    }

    /**
     * Apply a referral code during sign-up
     */
    static async trackReferral(code: string, referredUserId: string): Promise<boolean> {
        const affiliate = await Affiliate.findOne({ code });
        if (!affiliate) return false;

        // Prevent self-referral
        if (affiliate.user.toString() === referredUserId) return false;

        // Check if user is already referred
        const alreadyReferred = affiliate.referrals.some(ref => ref.referredUser?.toString() === referredUserId);
        if (alreadyReferred) return true;

        affiliate.referrals.push({
            referredUser: referredUserId as any,
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
    static async processCommission(referredUserId: string, saleAmount: number): Promise<void> {
        // Find if this user was referred by someone
        const affiliate = await Affiliate.findOne({ "referrals.referredUser": referredUserId });

        if (affiliate) {
            const commission = saleAmount * affiliate.commissionRate;
            affiliate.earnings += commission;
            await affiliate.save();

            // Also update the affiliate's user wallet balance
            await User.findByIdAndUpdate(affiliate.user, {
                $inc: { walletBalance: commission }
            });

            console.log(`[Affiliate] Commission of ${commission} paid to ${affiliate.user} for referral ${referredUserId}`);
        }
    }
}
