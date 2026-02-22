"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionHistory = exports.requestPayout = void 0;
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Handle creator payout requests
 */
const requestPayout = async (req, res) => {
    const { amount } = req.body;
    const userId = req.user._id;
    if (!amount || amount < 50) {
        return res.status(400).json({ message: 'Minimum payout amount is $50.00' });
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = await User_1.User.findById(userId).session(session);
        if (!user)
            throw new Error('User not found');
        if (user.walletBalance < amount) {
            throw new Error('Insufficient balance for payout.');
        }
        // Deduct from wallet
        user.walletBalance -= amount;
        await user.save({ session });
        // Create Withdrawal Transaction
        await Transaction_1.Transaction.create([{
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
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: err.message });
    }
};
exports.requestPayout = requestPayout;
/**
 * Get user transaction history
 */
const getTransactionHistory = async (req, res) => {
    const userId = req.user._id;
    const transactions = await Transaction_1.Transaction.find({
        $or: [{ fromUser: userId }, { toUser: userId }]
    }).sort({ createdAt: -1 }).limit(50);
    res.json(transactions);
};
exports.getTransactionHistory = getTransactionHistory;
