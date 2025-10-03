"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../services/logger");
const connectDatabase = async () => {
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            console.log('✅ MongoDB already connected');
            return;
        }
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/db-ia';
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5,
        };
        await mongoose_1.default.connect(mongoUri, options);
        console.log('✅ Connected to MongoDB');
        mongoose_1.default.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });
    }
    catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
class Database {
    async initialize() {
        try {
            await (0, exports.connectDatabase)();
            logger_1.logger.info('MongoDB database initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('MongoDB initialization failed:', error);
            throw error;
        }
    }
    async close() {
        try {
            await mongoose_1.default.connection.close();
            logger_1.logger.info('MongoDB connection closed');
        }
        catch (error) {
            logger_1.logger.error('Error closing MongoDB connection:', error);
            throw error;
        }
    }
    async isConnected() {
        return mongoose_1.default.connection.readyState === 1;
    }
    async getConnectionInfo() {
        const connection = mongoose_1.default.connection;
        return {
            host: connection.host,
            port: connection.port,
            name: connection.name,
            readyState: connection.readyState,
            models: Object.keys(connection.models)
        };
    }
}
exports.database = new Database();
//# sourceMappingURL=database.js.map