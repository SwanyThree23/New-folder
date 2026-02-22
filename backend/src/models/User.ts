import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { EncryptionService } from '../services/EncryptionService';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    walletBalance: number; // For transactions
    roles: string[];
    isVerified: boolean;
    avatar: string;
    apiKeys: {
        service: string;
        key: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    preferences: {
        theme: string;
        notifications: boolean;
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    passwordHash: {
        type: String,
        required: true
    },
    walletBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    roles: {
        type: [String],
        default: ['user'],
        enum: ['user', 'creator', 'moderator', 'admin']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String, // URL to stored avatar
        default: ''
    },
    apiKeys: [{
        _id: false,
        service: { type: String, required: true },
        key: { type: String, required: true } // Encrypted value
    }],
    preferences: {
        theme: { type: String, default: 'dark' },
        notifications: { type: Boolean, default: true }
    }
}, {
    timestamps: true,
    optimisticConcurrency: true // For atomic operations conflict handling
});

// Compound Index for frequent queries
UserSchema.index({ email: 1, roles: 1 });

// Pre-save hook for password hashing
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Pre-save hook for API Key encryption if present
UserSchema.pre<IUser>('save', function (next) {
    if (this.isModified('apiKeys')) {
        this.apiKeys.forEach((apiKey) => {
            // Check if already encrypted (heuristic based on length/colons)
            if (!apiKey.key.includes(':')) {
                apiKey.key = EncryptionService.encrypt(apiKey.key);
            }
        });
    }
    next();
});

// Method to verify password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
