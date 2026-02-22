import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Room } from '../src/models/Room';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/swannie3';

/**
 * 10k Record Simulation Test
 * Purpose: Verify that compound indexes handle bulk metadata efficiently.
 */
const runSimulation = async () => {
    console.log('--- Starting 10k Record Simulation ---');

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // 1. Cleanup
        console.log('Cleaning up existing data...');
        await User.deleteMany({ email: /simulated/ });
        await Room.deleteMany({ title: /Simulated/ });

        // 2. Prepare Data (Users)
        console.log('Generating 5,000 users...');
        const users = Array.from({ length: 5000 }).map((_, i) => ({
            username: `user_sim_${i}`,
            email: `simulated_${i}@swannie3.com`,
            passwordHash: 'hashed_password_placeholder',
            roles: [i % 10 === 0 ? 'creator' : 'user']
        }));

        const startTime = Date.now();
        const createdUsers = await User.insertMany(users);
        console.log(`Inserted 5k users in ${Date.now() - startTime}ms`);

        // 3. Prepare Data (Rooms)
        console.log('Generating 5,000 rooms...');
        const creatorIds = createdUsers.filter(u => u.roles.includes('creator')).map(u => u._id);

        const rooms = Array.from({ length: 5000 }).map((_, i) => ({
            id: `room_sim_${i}`,
            host: creatorIds[i % creatorIds.length],
            title: `Simulated Room ${i}`,
            isLive: i % 2 === 0,
            viewerCount: Math.floor(Math.random() * 10000),
            tags: ['gaming', 'social', 'tech'].slice(0, (i % 3) + 1)
        }));

        const roomStartTime = Date.now();
        await Room.insertMany(rooms);
        console.log(`Inserted 5k rooms in ${Date.now() - roomStartTime}ms`);

        // 4. Test Queries (Performance Check)
        console.log('Testing Compound Index: Top Live Rooms (isLive: 1, viewerCount: -1)');
        const queryStart = Date.now();
        const topRooms = await Room.find({ isLive: true })
            .sort({ viewerCount: -1 })
            .limit(10)
            .explain('executionStats');

        const executionStats = (topRooms as any).executionStats;
        console.log(`Query "Top Live" Execution Time: ${executionStats.executionTimeMillis}ms`);
        console.log(`Documents Examined: ${executionStats.totalDocsExamined}`);

        if (executionStats.totalDocsExamined <= 10) {
            console.log('SUCCESS: Compound Index used correctly (minimal docs examined).');
        } else {
            console.warn('WARNING: Query might be scanning more documents than necessary.');
        }

        console.log('--- Simulation Complete ---');
        process.exit(0);

    } catch (error) {
        console.error('Simulation Failed:', error);
        process.exit(1);
    }
};

runSimulation();
