"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TransactionSchema = new mongoose_1.Schema({
    fromUser: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    type: { type: String, enum: ['donation', 'subscription', 'purchase', 'withdrawal'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending', index: true },
    split: {
        creatorAmount: { type: Number, required: true },
        platformFee: { type: Number, required: true }
    },
    details: { type: mongoose_1.Schema.Types.Mixed },
    stripeId: { type: String, unique: true, sparse: true }
}, {
    timestamps: true
});
// Calculate 90/10 split before saving if not provided
TransactionSchema.pre('validate', function (next) {
    if (this.amount && (!this.split || !this.split.creatorAmount)) {
        const fee = this.amount * 0.10; // 10% Platform Fee
        const creator = this.amount - fee;
        this.split = {
            creatorAmount: Number(creator.toFixed(2)),
            platformFee: Number(fee.toFixed(2))
        };
    }
    next();
});
exports.Transaction = mongoose_1.default.model('Transaction', TransactionSchema);
