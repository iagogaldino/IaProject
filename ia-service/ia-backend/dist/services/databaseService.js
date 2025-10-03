"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = exports.DatabaseService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
class DatabaseService {
    constructor() {
        this.connection = mongoose_1.default;
    }
    async executeQuery(agentId, query, agentDatabaseAccess) {
        const startTime = Date.now();
        try {
            if (!agentDatabaseAccess?.enabled) {
                throw new Error('Agent does not have database access enabled');
            }
            if (!agentDatabaseAccess.allowedCollections.includes(query.collection)) {
                throw new Error(`Agent is not allowed to access collection: ${query.collection}`);
            }
            const allowedOps = agentDatabaseAccess.allowedOperations;
            if (query.operation === 'find' && !allowedOps.includes('read')) {
                throw new Error('Agent is not allowed to perform read operations');
            }
            const maxResults = agentDatabaseAccess.queryLimits?.maxResults || 100;
            const timeout = agentDatabaseAccess.queryLimits?.timeout || 30000;
            if (query.limit && query.limit > maxResults) {
                query.limit = maxResults;
            }
            const model = this.getModel(query.collection);
            let result;
            switch (query.operation) {
                case 'find':
                    result = await model.find(query.query || {}, query.projection)
                        .sort(query.sort || {})
                        .limit(query.limit || maxResults)
                        .skip(query.skip || 0)
                        .exec();
                    break;
                case 'findOne':
                    result = await model.findOne(query.query || {}, query.projection).exec();
                    break;
                case 'count':
                    result = await model.countDocuments(query.query || {}).exec();
                    break;
                case 'aggregate':
                    if (!query.pipeline) {
                        throw new Error('Pipeline is required for aggregate operations');
                    }
                    result = await model.aggregate(query.pipeline).exec();
                    break;
                default:
                    throw new Error(`Unsupported operation: ${query.operation}`);
            }
            const executionTime = Date.now() - startTime;
            logger_1.logger.info('Database query executed', {
                agentId,
                collection: query.collection,
                operation: query.operation,
                executionTime,
                resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0)
            });
            return {
                success: true,
                data: result,
                count: Array.isArray(result) ? result.length : (result ? 1 : 0),
                executionTime
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            logger_1.logger.error('Database query failed', {
                agentId,
                collection: query.collection,
                operation: query.operation,
                error: error.message,
                executionTime
            });
            return {
                success: false,
                error: error.message,
                executionTime
            };
        }
    }
    getModel(collectionName) {
        if (mongoose_1.default.models[collectionName]) {
            return mongoose_1.default.models[collectionName];
        }
        const schema = new mongoose_1.default.Schema({}, { strict: false });
        return mongoose_1.default.model(collectionName, schema);
    }
    async getCollectionInfo(collectionName) {
        try {
            const model = this.getModel(collectionName);
            const count = await model.countDocuments();
            const sample = await model.findOne();
            return {
                name: collectionName,
                count,
                hasData: count > 0,
                sampleDocument: sample
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting collection info', { collectionName, error: error.message });
            return {
                name: collectionName,
                count: 0,
                hasData: false,
                error: error.message
            };
        }
    }
    async listAvailableCollections() {
        try {
            const db = mongoose_1.default.connection.db;
            if (!db) {
                throw new Error('Database connection not available');
            }
            const collections = await db.listCollections().toArray();
            return collections.map(col => col.name);
        }
        catch (error) {
            logger_1.logger.error('Error listing collections', { error: error.message });
            return [];
        }
    }
}
exports.DatabaseService = DatabaseService;
exports.databaseService = new DatabaseService();
//# sourceMappingURL=databaseService.js.map