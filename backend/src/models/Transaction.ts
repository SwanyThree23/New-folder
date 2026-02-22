import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    fromUser: mongoose.Types.ObjectId;
    toUser: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    type: 'donation' | 'subscription' | 'purchase' | 'withdrawal';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    split: {
        creatorAmount: number;
        platformFee: number; // 10%
    };
    details: any; // Flexible JSON for arbitrary metadata
    stripeId?: string;
}

const TransactionSchema: Schema = new Schema({
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    type: { type: String, enum: ['donation', 'subscription', 'purchase', 'withdrawal'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending', index: true },

    split: {
        creatorAmount: { type: Number, required: true },
        platformFee: { type: Number, required: true }
    },

    details: { type: Schema.Types.Mixed },
    stripeId: { type: String, unique: true, sparse: true }
}, {
    timestamps: true
});

// Calculate 90/10 split before saving if not provided
TransactionSchema.pre<ITransaction>('validate', function (next) {
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

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
