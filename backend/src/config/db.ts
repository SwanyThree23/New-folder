import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/swannie3';
const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

// MongoDB Connection
export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Redis Connection
export const redis = new Redis(REDIS_URI, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on('connect', () => console.log('Redis Connected Successfully'));
redis.on('error', (err) => console.error('Redis Client Error:', err));
