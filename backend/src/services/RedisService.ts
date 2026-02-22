import { redis } from '../config/db';

const KEY_PREFIX = 'swannie3:';

/**
 * Service to handle Redis operations with specific patterns for scalable room management.
 */
export class RedisService {

    // -- Key Generators --
    static getRoomKey(roomId: string) { return `${KEY_PREFIX}room:${roomId}`; }
    static getRoomGuestsKey(roomId: string) { return `${KEY_PREFIX}room:${roomId}:guests`; }
    static getRoomViewersKey(roomId: string) { return `${KEY_PREFIX}room:${roomId}:viewers`; }
    static getSessionKey(sessionId: string) { return `${KEY_PREFIX}session:${sessionId}`; }

    // -- Room Management --

    /**
     * Set room metadata atomically
     */
    static async setRoomMeta(roomId: string, data: Record<string, any>) {
        const key = this.getRoomKey(roomId);
        await redis.hset(key, data);
        await redis.expire(key, 86400); // 24 hours TTL
    }

    /**
     * Add a guest to the room (Set)
     */
    static async addGuest(roomId: string, userId: string) {
        const key = this.getRoomGuestsKey(roomId);
        await redis.sadd(key, userId);
    }

    /**
     * Remove a guest from the room
     */
    static async removeGuest(roomId: string, userId: string) {
        const key = this.getRoomGuestsKey(roomId);
        await redis.srem(key, userId);
    }

    /**
     * Get all guests in a room
     */
    static async getGuests(roomId: string): Promise<string[]> {
        const key = this.getRoomGuestsKey(roomId);
        return redis.smembers(key);
    }

    // -- Viewer Counts (Atomic) --

    /**
     * Increment viewer count
     */
    static async incrementViewer(roomId: string) {
        const key = this.getRoomViewersKey(roomId);
        return redis.incr(key);
    }

    /**
     * Decrement viewer count
     */
    static async decrementViewer(roomId: string) {
        const key = this.getRoomViewersKey(roomId);
        const val = await redis.decr(key);
        if (val < 0) {
            await redis.set(key, 0); // Reset to 0 if negative
            return 0;
        }
        return val;
    }

    /**
     * Get current viewer count
     */
    static async getViewerCount(roomId: string): Promise<number> {
        const key = this.getRoomViewersKey(roomId);
        const val = await redis.get(key);
        return parseInt(val || '0', 10);
    }

    // -- Pub/Sub --

    /**
     * Publish an event to a room channel
     */
    static async publishRoomEvent(roomId: string, event: string, payload: any) {
        const channel = `room-events:${roomId}`;
        const message = JSON.stringify({ event, payload, timestamp: Date.now() });
        await redis.publish(channel, message);
    }

    // -- Lua Scripts (Atomic Operations) --

    /**
     * Execute atomic transfer of viewers (e.g. raid/host) or complex state changes
     */
    // TODO: Implement specific Lua scripts for "Mine Cash" / "Pets" logic as needed.
}
