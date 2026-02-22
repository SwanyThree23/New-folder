"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const RedisService_1 = require("./services/RedisService");
const ModerationService_1 = require("./services/ModerationService");
const AIDirectorService_1 = require("./services/AIDirectorService");
const setupSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
        console.log(`New Socket Client: ${socket.id}`);
        // Join Room
        socket.on('join-room', async ({ roomId, userId }) => {
            socket.join(roomId);
            await RedisService_1.RedisService.addGuest(roomId, userId);
            const viewers = await RedisService_1.RedisService.incrementViewer(roomId);
            io.to(roomId).emit('room-update', { viewers });
            console.log(`User ${userId} joined room ${roomId}. Viewers: ${viewers}`);
            // AI Director Analysis
            try {
                const actions = await AIDirectorService_1.AIDirectorService.analyze(roomId);
                for (const action of actions) {
                    await AIDirectorService_1.AIDirectorService.execute(roomId, action, io);
                }
            }
            catch (err) {
                console.error('AI Director Error:', err);
            }
        });
        // Leave Room
        socket.on('leave-room', async ({ roomId, userId }) => {
            socket.leave(roomId);
            await RedisService_1.RedisService.removeGuest(roomId, userId);
            const viewers = await RedisService_1.RedisService.decrementViewer(roomId);
            io.to(roomId).emit('room-update', { viewers });
        });
        // Chat Message
        socket.on('send-message', async ({ roomId, message, user }) => {
            // 1. Moderate Content
            const userId = (typeof user === 'string' ? user : user?.id) || `anon-${socket.id}`; // Robust user ID
            try {
                const modResult = await ModerationService_1.ModerationService.screenContent(message, userId);
                if (!modResult.authorized) {
                    // Block message and notify user (private emit)
                    socket.emit('moderation-alert', {
                        reason: modResult.reason || 'Restricted Content',
                        message: 'Your message was blocked by AI Moderation.'
                    });
                    // Log violation
                    await ModerationService_1.ModerationService.logEvent(userId, message, 'block', modResult.reason || 'Restricted Content');
                    return;
                }
            }
            catch (err) {
                console.error('Moderation Error:', err);
                // Fail open or closed depending on policy - here, we'll allow but log error.
            }
            // 2. Broadcast to room
            io.to(roomId).emit('new-message', {
                user, // Ideally pass clean user obj
                message, // In a real app, sanitize/persist this first
                timestamp: new Date()
            });
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
            // In a real app, handle unclean disconnects/cleanup via Redis sessions
        });
    });
    return io;
};
exports.setupSocket = setupSocket;
