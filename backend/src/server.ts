import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';
import affiliateRoutes from './routes/affiliateRoutes';
import payoutRoutes from './routes/payoutRoutes';
import adminRoutes from './routes/adminRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import { setupSocket } from './socket';

dotenv.config();

connectDB();

const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

// Setup Socket.io
setupSocket(httpServer);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
