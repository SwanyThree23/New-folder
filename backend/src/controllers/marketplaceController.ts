import { Request, Response } from 'express';
import { Product } from '../models/Marketplace';

// @desc    Get all products
// @route   GET /api/marketplace/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
    const products = await Product.find({ isActive: true }).populate('creator', 'username avatar');
    res.json(products);
};

// @desc    Create a product
// @route   POST /api/marketplace/products
// @access  Private (Creator/Admin)
export const createProduct = async (req: any, res: Response) => {
    const { title, description, price, media, type, stock } = req.body;

    const product = await Product.create({
        creator: req.user._id,
        title,
        description,
        price,
        media,
        type,
        stock
    });

    res.status(201).json(product);
};

import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { AffiliateService } from '../services/AffiliateService';
import mongoose from 'mongoose';

// @desc    Purchase a product
// @route   POST /api/marketplace/products/:id/purchase
// @access  Private
export const purchaseProduct = async (req: any, res: Response) => {
    const { id: productId } = req.params;
    const buyerId = req.user._id;

    // Use a session for atomicity (Requires MongoDB Replica Set)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Fetch Product
        const product = await Product.findById(productId).session(session);
        if (!product) {
            throw new Error('Product not found.');
        }

        if (!product.isActive || (product.stock !== undefined && product.stock <= 0)) {
            throw new Error('Product is unavailable or out of stock.');
        }

        // 2. Fetch Buyer
        const buyer = await User.findById(buyerId).session(session);
        if (!buyer) {
            throw new Error('Buyer account not found.');
        }

        if (buyer.walletBalance < product.price) {
            throw new Error('Insufficient wallet balance.');
        }

        // 3. Update Balances
        // Deduct from buyer
        buyer.walletBalance -= product.price;

        // Add to creator (90%) - model logic handles the split in Transactions, 
        // but here we update the creator's wallet directly.
        const creator = await User.findById(product.creator).session(session);
        if (!creator) {
            throw new Error('Creator account not found.');
        }

        const netAmount = product.price * 0.9;
        creator.walletBalance += netAmount;

        // 4. Create Transaction Record
        await Transaction.create([{
            type: 'purchase',
            amount: product.price,
            currency: 'USD',
            status: 'completed',
            fromUser: buyerId,
            toUser: product.creator,
            details: {
                productId: product._id,
                productTitle: product.title
            }
        }], { session });

        // 5. Update Stock
        if (product.stock !== undefined) {
            product.stock -= 1;
        }

        // Save all changes
        await buyer.save({ session });
        await creator.save({ session });
        await product.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Process Affiliate Commission (Async, non-blocking for the buyer)
        AffiliateService.processCommission(product.creator.toString(), product.price).catch(err => {
            console.error('[Affiliate Error]', err);
        });

        res.json({
            success: true,
            message: 'Purchase completed successfully.',
            newBalance: buyer.walletBalance
        });

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, message: error.message });
    }
};
