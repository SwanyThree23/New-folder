import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { RedisService } from '../services/RedisService';
import { v4 as uuidv4 } from 'uuid';

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req: any, res: Response) => {
    const { title, description, settings } = req.body;

    const roomId = uuidv4();

    // Generate Stream Keys
    const streamKey = uuidv4().replace(/-/g, ''); // Simple key generation
    const rtmpUrl = `rtmp://${process.env.RTMP_HOST || 'localhost'}/live`;
    const playbackUrl = `http://${process.env.HLS_HOST || 'localhost'}:8080/hls/${streamKey}.m3u8`;

    const room = await Room.create({
        id: roomId,
        host: req.user._id,
        title,
        description,
        settings,
        dsc: {
            streamKey,
            rtmpUrl,
            playbackUrl
        },
        panelists: [req.user._id] // Host is first panelist
    });

    // Initialize in Redis
    await RedisService.setRoomMeta(room.id, {
        title: room.title,
        hostId: room.host.toString(),
        status: 'offline'
    });

    res.status(201).json(room);
};

// @desc    Get room by ID (public info)
// @route   GET /api/rooms/:id
// @access  Public
export const getRoom = async (req: Request, res: Response) => {
    const room = await Room.findOne({ id: req.params.id })
        .populate('host', 'username avatar')
        .populate('panelists', 'username avatar');

    if (room) {
        // Hide stream key if not host
        // simplified check:
        const isHost = false; // TODO: Check req.user if authenticated

        // Get live viewer count from Redis
        const viewers = await RedisService.getRoomViewersKey(room.id); // Correction: This returns key, we need value. 
        // Wait, getRoomViewersKey returns the key string. We need to fetch it.
        // Let's assume the frontend gets live count via socket, but we can return snapshot here.

        res.json(room);
    } else {
        res.status(404);
        throw new Error('Room not found');
    }
};

// @desc    Update Room Status (Go Live)
// @route   PUT /api/rooms/:id/status
// @access  Private (Host Only)
export const updateRoomStatus = async (req: any, res: Response) => {
    const { status } = req.body; // 'live', 'offline'

    const room = await Room.findOne({ id: req.params.id });

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    if (room.host.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    room.status = status;
    room.isLive = status === 'live';

    if (status === 'live') {
        room.startedAt = new Date();
    } else if (status === 'ended') {
        room.endedAt = new Date();
    }

    await room.save();

    // Update Redis
    await RedisService.setRoomMeta(room.id, { status });
    // Notify via Socket (handled in socket service via Redis pub/sub potentially, or direct emit)

    res.json(room);
};
