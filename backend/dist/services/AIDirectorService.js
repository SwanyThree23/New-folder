"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIDirectorService = void 0;
const RedisService_1 = require("./RedisService");
const AIService_1 = require("./AIService");
/**
 * AI Director Service
 * Automates stream orchestration based on real-time metrics and chat sentiment.
 */
class AIDirectorService {
    /**
     * Analyze Room State and recommend actions.
     * In production, this would feed chat aggregates and meta to an LLM.
     */
    static async analyze(roomId) {
        const viewers = await RedisService_1.RedisService.getViewerCount(roomId);
        const actions = [];
        // 1. High Viewer Count Logic
        if (viewers > 100) {
            actions.push({
                type: 'CHAT_ANNOUNCEMENT',
                payload: { text: "Wow, over 100 viewers! Type !hype in the chat!" },
                confidence: 0.95
            });
        }
        // 2. Real-time Sentiment Analysis via AIService
        // In a real app, you'd pull recent messages from Redis/Mongo
        const sessionMessages = ['hype!', 'wow', 'great stream']; // Mocked buffer
        const sentiment = await AIService_1.AIService.analyzeSentiment(sessionMessages);
        if (sentiment > 0.8) {
            actions.push({
                type: 'SCENE_SWITCH',
                payload: { sceneId: 'hype-layout' },
                confidence: 0.85
            });
        }
        return actions;
    }
    /**
     * Execute an AI action
     */
    static async execute(roomId, action, io) {
        console.log(`[AI Director] Executing ${action.type} for room ${roomId}`);
        switch (action.type) {
            case 'CHAT_ANNOUNCEMENT':
                io.to(roomId).emit('new-message', {
                    user: { username: 'AI Director', avatar: '/ai-bot.png' },
                    message: action.payload.text,
                    timestamp: new Date()
                });
                break;
            case 'SCENE_SWITCH':
                io.to(roomId).emit('director-action', action);
                break;
            default:
                break;
        }
    }
}
exports.AIDirectorService = AIDirectorService;
