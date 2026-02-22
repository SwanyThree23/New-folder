import { Room } from '../models/Room';
import { User } from '../models/User';

export class PanelistService {

    /**
     * Add a panelist to a room
     */
    static async addPanelist(roomId: string, userId: string): Promise<{ success: boolean; message: string }> {
        const room = await Room.findOne({ id: roomId });
        if (!room) return { success: false, message: 'Room not found.' };

        if (!room.isLive && room.status !== 'scheduled') {
            return { success: false, message: 'Can only add panelists to scheduled or live rooms.' };
        }

        if (room.panelists.length >= room.maxPanelists) {
            return { success: false, message: 'Room panel is full (max 20).' };
        }

        if (room.panelists.some(p => p.toString() === userId)) {
            return { success: false, message: 'User is already a panelist.' };
        }

        room.panelists.push(userId as any);
        await room.save();

        return { success: true, message: 'Panelist added successfully.' };
    }

    /**
     * Remove a panelist
     */
    static async removePanelist(roomId: string, userId: string): Promise<{ success: boolean }> {
        const room = await Room.findOne({ id: roomId });
        if (!room) return { success: false };

        room.panelists = room.panelists.filter(p => p.toString() !== userId);
        await room.save();

        return { success: true };
    }
}
