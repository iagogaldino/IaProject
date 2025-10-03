"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("./config/config");
const logger_1 = require("./services/logger");
const database_1 = require("./config/database");
const agentRoutes_1 = __importDefault(require("./routes/agentRoutes"));
const communicationRoutes_1 = __importDefault(require("./routes/communicationRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const metadataRoutes_1 = __importDefault(require("./routes/metadataRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = config_1.config.server.port;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.logger.info(message.trim())
    }
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.maxRequests,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config_1.config.rateLimit.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/agents', agentRoutes_1.default);
app.use('/api/agents', communicationRoutes_1.default);
app.use('/api/agents', chatRoutes_1.default);
app.use('/api', fileRoutes_1.default);
app.use('/api', metadataRoutes_1.default);
app.use('/health', healthRoutes_1.default);
app.use('/', chatRoutes_1.default);
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: {
            message: err.message || 'Internal Server Error',
            ...(config_1.config.server.nodeEnv === 'development' && { stack: err.stack })
        }
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.originalUrl} not found`
        }
    });
});
async function startServer() {
    try {
        await database_1.database.initialize();
        logger_1.logger.info('Database connected successfully');
        app.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${PORT}`);
            logger_1.logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
            logger_1.logger.info(`🤖 AI endpoint available at http://localhost:${PORT}/api/ai/process`);
            logger_1.logger.info(`👥 Agents API available at http://localhost:${PORT}/api/agents`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await database_1.database.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    await database_1.database.close();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map