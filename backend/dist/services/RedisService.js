"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const db_1 = require("../config/db");
const KEY_PREFIX = 'swannie3:';
/**
 * Service to handle Redis operations with specific patterns for scalable room management.
 */
class RedisService {
    // -- Key Generators --
    static getRoomKey(roomId) { return `${KEY_PREFIX}room:${roomId}`; }
    static getRoomGuestsKey(roomId) { return `${KEY_PREFIX}room:${roomId}:guests`; }
    static getRoomViewersKey(roomId) { return `${KEY_PREFIX}room:${roomId}:viewers`; }
    static getSessionKey(sessionId) { return `${KEY_PREFIX}session:${sessionId}`; }
    // -- Room Management --
    /**
     * Set room metadata atomically
     */
    static async setRoomMeta(roomId, data) {
        const key = this.getRoomKey(roomId);
        await db_1.redis.hset(key, data);
        await db_1.redis.expire(key, 86400); // 24 hours TTL
    }
    /**
     * Add a guest to the room (Set)
     */
    static async addGuest(roomId, userId) {
        const key = this.getRoomGuestsKey(roomId);
        await db_1.redis.sadd(key, userId);
    }
    /**
     * Remove a guest from the room
     */
    static async removeGuest(roomId, userId) {
        const key = this.getRoomGuestsKey(roomId);
        await db_1.redis.srem(key, userId);
    }
    /**
     * Get all guests in a room
     */
    static async getGuests(roomId) {
        const key = this.getRoomGuestsKey(roomId);
        return db_1.redis.smembers(key);
    }
    // -- Viewer Counts (Atomic) --
    /**
     * Increment viewer count
     */
    static async incrementViewer(roomId) {
        const key = this.getRoomViewersKey(roomId);
        return db_1.redis.incr(key);
    }
    /**
     * Decrement viewer count
     */
    static async decrementViewer(roomId) {
        const key = this.getRoomViewersKey(roomId);
        const val = await db_1.redis.decr(key);
        if (val < 0) {
            await db_1.redis.set(key, 0); // Reset to 0 if negative
            return 0;
        }
        return val;
    }
    /**
     * Get current viewer count
     */
    static async getViewerCount(roomId) {
        const key = this.getRoomViewersKey(roomId);
        const val = await db_1.redis.get(key);
        return parseInt(val || '0', 10);
    }
    // -- Pub/Sub --
    /**
     * Publish an event to a room channel
     */
    static async publishRoomEvent(roomId, event, payload) {
        const channel = `room-events:${roomId}`;
        const message = JSON.stringify({ event, payload, timestamp: Date.now() });
        await db_1.redis.publish(channel, message);
    }
}
exports.RedisService = RedisService;
