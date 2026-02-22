import { ActionEvent } from '../models/Event';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/swannie3';

/**
 * AI Audit Simulation
 * Demonstrates the orchestration and logging of AI behaviors.
 */
const runAuditSim = async () => {
    console.log('--- Starting AI Audit Simulation ---');

    try {
        await mongoose.connect(MONGO_URI);

        const MOCK_ACTIONS = [
            { type: 'SCENE_SWITCH', msg: 'Automatic scene switch to "Hype Mode" due to high chat velocity.' },
            { type: 'MODERATION', msg: 'Blocked user_442 for violating "Hate Speech" policy.' },
            { type: 'NETWORK', msg: 'Dynamic bitrate adjustment to 4500kbps to maintain stability.' },
        ];

        for (const action of MOCK_ACTIONS) {
            const event = await ActionEvent.create({
                type: action.type,
                msg: action.msg,
                meta: {
                    orchestrator: 'SwannieAI-v1',
                    confidence: 0.98,
                    latency: '45ms'
                }
            });
            console.log(`[Logged] ${event.type}: ${event.msg}`);
        }

        console.log('--- Audit Logs Created Successfully ---');
        process.exit(0);

    } catch (err) {
        console.error('Audit Sim Failed:', err);
        process.exit(1);
    }
};

runAuditSim();
