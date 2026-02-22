"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseProduct = exports.createProduct = exports.getProducts = void 0;
const Marketplace_1 = require("../models/Marketplace");
// @desc    Get all products
// @route   GET /api/marketplace/products
// @access  Public
const getProducts = async (req, res) => {
    const products = await Marketplace_1.Product.find({ isActive: true }).populate('creator', 'username avatar');
    res.json(products);
};
exports.getProducts = getProducts;
// @desc    Create a product
// @route   POST /api/marketplace/products
// @access  Private (Creator/Admin)
const createProduct = async (req, res) => {
    const { title, description, price, media, type, stock } = req.body;
    const product = await Marketplace_1.Product.create({
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
exports.createProduct = createProduct;
const Transaction_1 = require("../models/Transaction");
const User_1 = require("../models/User");
const AffiliateService_1 = require("../services/AffiliateService");
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Purchase a product
// @route   POST /api/marketplace/products/:id/purchase
// @access  Private
const purchaseProduct = async (req, res) => {
    const { id: productId } = req.params;
    const buyerId = req.user._id;
    // Use a session for atomicity (Requires MongoDB Replica Set)
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1. Fetch Product
        const product = await Marketplace_1.Product.findById(productId).session(session);
        if (!product) {
            throw new Error('Product not found.');
        }
        if (!product.isActive || (product.stock !== undefined && product.stock <= 0)) {
            throw new Error('Product is unavailable or out of stock.');
        }
        // 2. Fetch Buyer
        const buyer = await User_1.User.findById(buyerId).session(session);
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
        const creator = await User_1.User.findById(product.creator).session(session);
        if (!creator) {
            throw new Error('Creator account not found.');
        }
        const netAmount = product.price * 0.9;
        creator.walletBalance += netAmount;
        // 4. Create Transaction Record
        await Transaction_1.Transaction.create([{
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
        AffiliateService_1.AffiliateService.processCommission(product.creator.toString(), product.price).catch(err => {
            console.error('[Affiliate Error]', err);
        });
        res.json({
            success: true,
            message: 'Purchase completed successfully.',
            newBalance: buyer.walletBalance
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.purchaseProduct = purchaseProduct;
