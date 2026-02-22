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
exports.Room = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RoomSchema = new mongoose_1.Schema({
    id: {
        type: String, // e.g., 'swannie-room-123'
        required: true,
        unique: true,
        index: true
    },
    host: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500
    },
    isLive: {
        type: Boolean,
        default: false,
        index: true
    },
    status: {
        type: String,
        enum: ['offline', 'scheduled', 'live', 'ended'],
        default: 'offline'
    },
    viewerCount: {
        type: Number,
        default: 0
    },
    dsc: {
        streamKey: { type: String, select: false }, // Hide by default
        rtmpUrl: { type: String },
        playbackUrl: { type: String }
    },
    panelists: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User' // Up to 20
        }],
    maxPanelists: {
        type: Number,
        default: 20,
        max: 20
    },
    tags: [String],
    settings: {
        chatEnabled: { type: Boolean, default: true },
        moderationLevel: { type: String, default: 'medium' },
        isPrivate: { type: Boolean, default: false },
        password: { type: String }
    },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Compound Indexes for Performance
RoomSchema.index({ isLive: 1, tags: 1 });
RoomSchema.index({ isLive: -1, viewerCount: -1 }); // DSC sort for "Top Live"
RoomSchema.index({ "dsc.streamKey": 1 }); // Quick lookup for RTMP auth
// Pre-save hook to ensure uniqueness or defaults
RoomSchema.pre('save', function (next) {
    if (this.panelists.length > this.maxPanelists) {
        const err = new Error(`Panelists cannot exceed ${this.maxPanelists}.`);
        return next(err);
    }
    next();
});
exports.Room = mongoose_1.default.model('Room', RoomSchema);
