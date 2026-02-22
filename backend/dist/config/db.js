"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ioredis_1 = require("ioredis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/swannie3';
const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';
// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('MongoDB Connected Successfully');
    }
    catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
// Redis Connection
exports.redis = new ioredis_1.Redis(REDIS_URI, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});
exports.redis.on('connect', () => console.log('Redis Connected Successfully'));
exports.redis.on('error', (err) => console.error('Redis Client Error:', err));
