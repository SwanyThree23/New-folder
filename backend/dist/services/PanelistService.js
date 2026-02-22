"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelistService = void 0;
const Room_1 = require("../models/Room");
class PanelistService {
    /**
     * Add a panelist to a room
     */
    static async addPanelist(roomId, userId) {
        const room = await Room_1.Room.findOne({ id: roomId });
        if (!room)
            return { success: false, message: 'Room not found.' };
        if (!room.isLive && room.status !== 'scheduled') {
            return { success: false, message: 'Can only add panelists to scheduled or live rooms.' };
        }
        if (room.panelists.length >= room.maxPanelists) {
            return { success: false, message: 'Room panel is full (max 20).' };
        }
        if (room.panelists.some(p => p.toString() === userId)) {
            return { success: false, message: 'User is already a panelist.' };
        }
        room.panelists.push(userId);
        await room.save();
        return { success: true, message: 'Panelist added successfully.' };
    }
    /**
     * Remove a panelist
     */
    static async removePanelist(roomId, userId) {
        const room = await Room_1.Room.findOne({ id: roomId });
        if (!room)
            return { success: false };
        room.panelists = room.panelists.filter(p => p.toString() !== userId);
        await room.save();
        return { success: true };
    }
}
exports.PanelistService = PanelistService;
