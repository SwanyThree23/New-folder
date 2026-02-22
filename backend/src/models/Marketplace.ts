import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    stock: { type: Number, default: -1 }, // -1 = Unlimited
    isActive: { type: Boolean, default: true },
    media: [String], // URLs to product images
    type: { type: String, enum: ['digital', 'physical', 'service'], default: 'digital' }
}, { timestamps: true });

ProductSchema.index({ creator: 1, isActive: 1 });

export const Product = mongoose.model('Product', ProductSchema);

const AffiliateSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    code: { type: String, required: true, unique: true },
    referrals: [{
        referredUser: { type: Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
        status: { type: String, default: 'pending' }
    }],
    earnings: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 0.05 } // 5%
}, { timestamps: true });

AffiliateSchema.index({ code: 1 });

export const Affiliate = mongoose.model('Affiliate', AffiliateSchema);
