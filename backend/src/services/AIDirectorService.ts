import { RedisService } from './RedisService';
import { AIService } from './AIService';
import { ModerationService } from './ModerationService';

export interface AIDirectorAction {
    type: 'SCENE_SWITCH' | 'CHAT_ANNOUNCEMENT' | 'MODERATION_ALERT' | 'POLL_SUGGESTION';
    payload: any;
    confidence: number;
}

/**
 * AI Director Service
 * Automates stream orchestration based on real-time metrics and chat sentiment.
 */
export class AIDirectorService {

    /**
     * Analyze Room State and recommend actions.
     * In production, this would feed chat aggregates and meta to an LLM.
     */
    static async analyze(roomId: string): Promise<AIDirectorAction[]> {
        const viewers = await RedisService.getViewerCount(roomId);
        const actions: AIDirectorAction[] = [];

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
        const sentiment = await AIService.analyzeSentiment(sessionMessages);

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
    static async execute(roomId: string, action: AIDirectorAction, io: any) {
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
