import mongoose, { Schema } from 'mongoose';

const EventSchema = new Schema({
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now, expires: '30d' } // Auto-delete after 30 days
});

// Index for quick lookups by type and time
EventSchema.index({ type: 1, timestamp: -1 });

export const Event = mongoose.model('Event', EventSchema);
