"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const AIService_1 = require("./AIService");
// Mock list of bad words for basic fallback
const BAD_WORDS = ['hate', 'violence', 'scam', 'spam'];
class ModerationService {
    /**
     * Screen text content for policy violations.
     */
    static async screenContent(text, userId) {
        // 1. Basic Local Filter (Sanity Check)
        const lowerText = text.toLowerCase();
        for (const word of BAD_WORDS) {
            if (lowerText.includes(word)) {
                return { authorized: false, reason: 'Restricted keyword detected.', flagged: true };
            }
        }
        // 2. AI Sentiment Analysis (Toxicity Check)
        const sentiment = await AIService_1.AIService.analyzeSentiment([text]);
        if (sentiment < 0.1) {
            return { authorized: false, reason: 'AI detected low-safety sentiment.', flagged: true };
        }
        return { authorized: true };
    }
    /**
     * Log moderation event to database (Audit)
     */
    static async logEvent(userId, content, action, reason) {
        // In a real app, save to 'Event' (Audit Log) model
        // await Event.create({ type: 'MODERATION', payload: { content, action, reason }, userId });
        console.log(`[Audit] Moderation Action: ${action} on User ${userId} for "${content}". Reason: ${reason}`);
    }
}
exports.ModerationService = ModerationService;
