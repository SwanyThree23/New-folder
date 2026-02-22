"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestreamService = void 0;
const Room_1 = require("../models/Room");
/**
 * Multi-Platform Streaming Service
 * Manages RTMP push targets for broad distribution.
 */
class RestreamService {
    /**
     * Get active push commands for Nginx
     * Format: push [url]/[key];
     */
    static async getPushCommands(roomId) {
        const room = await Room_1.Room.findOne({ id: roomId });
        if (!room)
            return [];
        // In a real app, targets would be stored in the User or Room model
        // For now, we simulate based on settings
        const mockTargets = [
        // { platform: 'twitch', url: 'rtmp://live.twitch.tv/app', key: 'live_user_xyz', enabled: true }
        ];
        return mockTargets
            .filter(t => t.enabled)
            .map(t => `push ${t.url}/${t.key};`);
    }
}
exports.RestreamService = RestreamService;
