import { Response } from 'express';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import mongoose from 'mongoose';

/**
 * Handle creator payout requests
 */
export const requestPayout = async (req: any, res: Response) => {
    const { amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount < 50) {
        return res.status(400).json({ message: 'Minimum payout amount is $50.00' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) throw new Error('User not found');

        if (user.walletBalance < amount) {
            throw new Error('Insufficient balance for payout.');
        }

        // Deduct from wallet
        user.walletBalance -= amount;
        await user.save({ session });

        // Create Withdrawal Transaction
        await Transaction.create([{
            fromUser: userId,
            toUser: userId, // Self-transaction for withdrawal track
            amount: amount,
            type: 'withdrawal',
            status: 'pending',
            details: {
                method: 'Direct Deposit',
                requestedAt: new Date()
            },
            split: {
                creatorAmount: amount,
                platformFee: 0 // No platform fee on withdrawal of earned funds
            }
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Payout request initiated. Expect funds in 3-5 business days.',
            newBalance: user.walletBalance
        });

    } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: err.message });
    }
};

/**
 * Get user transaction history
 */
export const getTransactionHistory = async (req: any, res: Response) => {
    const userId = req.user._id;
    const transactions = await Transaction.find({
        $or: [{ fromUser: userId }, { toUser: userId }]
    }).sort({ createdAt: -1 }).limit(50);

    res.json(transactions);
};
