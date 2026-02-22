import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
    id: string; // Public ID / Slug
    host: mongoose.Types.ObjectId;
    title: string;
    description: string;
    isLive: boolean;
    status: 'offline' | 'scheduled' | 'live' | 'ended';
    viewerCount: number;
    dsc: {
        streamKey: string;
        rtmpUrl: string;
        playbackUrl: string;
    }; // Stream Config
    panelists: mongoose.Types.ObjectId[];
    maxPanelists: number;
    tags: string[];
    settings: {
        chatEnabled: boolean;
        moderationLevel: 'low' | 'medium' | 'high';
        isPrivate: boolean;
        password?: string; // Encrypted if set
    };
    scheduledAt: Date;
    startedAt: Date;
    endedAt: Date;
}

const RoomSchema: Schema = new Schema({
    id: {
        type: String, // e.g., 'swannie-room-123'
        required: true,
        unique: true,
        index: true
    },
    host: {
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
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
RoomSchema.pre<IRoom>('save', function (next) {
    if (this.panelists.length > this.maxPanelists) {
        const err = new Error(`Panelists cannot exceed ${this.maxPanelists}.`);
        return next(err);
    }
    next();
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
