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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const EncryptionService_1 = require("../services/EncryptionService");
const UserSchema = new mongoose_1.Schema({
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
UserSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.passwordHash = await bcryptjs_1.default.hash(this.passwordHash, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Pre-save hook for API Key encryption if present
UserSchema.pre('save', function (next) {
    if (this.isModified('apiKeys')) {
        this.apiKeys.forEach((apiKey) => {
            // Check if already encrypted (heuristic based on length/colons)
            if (!apiKey.key.includes(':')) {
                apiKey.key = EncryptionService_1.EncryptionService.encrypt(apiKey.key);
            }
        });
    }
    next();
});
// Method to verify password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.passwordHash);
};
exports.User = mongoose_1.default.model('User', UserSchema);
