"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const marketplaceRoutes_1 = __importDefault(require("./routes/marketplaceRoutes"));
const affiliateRoutes_1 = __importDefault(require("./routes/affiliateRoutes"));
const payoutRoutes_1 = __importDefault(require("./routes/payoutRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const socket_1 = require("./socket");
dotenv_1.default.config();
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('API is running...');
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/rooms', roomRoutes_1.default);
app.use('/api/marketplace', marketplaceRoutes_1.default);
app.use('/api/affiliate', affiliateRoutes_1.default);
app.use('/api/payouts', payoutRoutes_1.default);
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
// Setup Socket.io
(0, socket_1.setupSocket)(httpServer);
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
