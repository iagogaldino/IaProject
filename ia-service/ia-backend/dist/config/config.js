"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    server: {
        port: parseInt(process.env.PORT || '3001', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        apiVersion: process.env.API_VERSION || 'v1'
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '27017', 10),
        name: process.env.DB_NAME || 'ai_backend',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        ssl: process.env.DB_SSL === 'true',
        url: process.env.MONGODB_URI || process.env.DATABASE_URL || `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}/${process.env.DB_NAME || 'ai_backend'}`
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
    },
    security: {
        jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key-here',
        apiKey: process.env.API_KEY || 'your-api-key-for-external-access'
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
    },
    cors: {
        enabled: process.env.CORS_ENABLED === 'true',
        origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200', 'http://localhost:3000']
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/combined.log'
    },
    externalServices: {
        mainBackendUrl: process.env.MAIN_BACKEND_URL || 'http://localhost:3000',
        timeout: parseInt(process.env.EXTERNAL_SERVICES_TIMEOUT || '30000', 10),
        retries: parseInt(process.env.EXTERNAL_SERVICES_RETRIES || '3', 10)
    },
    monitoring: {
        enableMetrics: process.env.ENABLE_METRICS === 'true',
        metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10)
    }
};
//# sourceMappingURL=config.js.map