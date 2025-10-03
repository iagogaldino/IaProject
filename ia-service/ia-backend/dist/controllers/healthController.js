"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = exports.HealthController = void 0;
const openaiService_1 = require("../services/openaiService");
const database_1 = require("../config/database");
const config_1 = require("../config/config");
const logger_1 = require("../services/logger");
class HealthController {
    constructor() {
        this.startTime = Date.now();
        this.requestCount = 0;
        this.successfulRequests = 0;
        this.failedRequests = 0;
        this.totalProcessingTime = 0;
        this.agentUsage = {};
    }
    async getHealthStatus(req, res, next) {
        try {
            const uptime = Date.now() - (this.startTime || Date.now());
            const openaiStatus = await openaiService_1.openaiService.testConnection();
            let databaseStatus = false;
            try {
                databaseStatus = await database_1.database.isConnected();
            }
            catch (error) {
                logger_1.logger.error('Database health check failed:', error);
            }
            const apiKeyStatus = !!config_1.config.security.apiKey;
            const jwtSecretStatus = !!config_1.config.security.jwtSecret;
            const healthStatus = {
                status: openaiStatus && databaseStatus && apiKeyStatus && jwtSecretStatus ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                uptime,
                version: '1.0.0',
                services: {
                    openai: openaiStatus,
                    apiKey: apiKeyStatus,
                    jwtSecret: jwtSecretStatus,
                    database: databaseStatus
                },
                metrics: {
                    totalRequests: this.requestCount,
                    successfulRequests: this.successfulRequests,
                    failedRequests: this.failedRequests,
                    averageProcessingTime: this.requestCount > 0 ? this.totalProcessingTime / this.requestCount : 0,
                    agentUsage: this.agentUsage,
                    errorRate: this.requestCount > 0 ? this.failedRequests / this.requestCount : 0
                }
            };
            const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
            res.status(statusCode).json(healthStatus);
        }
        catch (error) {
            logger_1.logger.error('Health check error:', error);
            next(error);
        }
    }
    async getMetrics(req, res, next) {
        try {
            const uptime = Date.now() - (this.startTime || Date.now());
            const metrics = {
                uptime,
                requests: {
                    total: this.requestCount,
                    successful: this.successfulRequests,
                    failed: this.failedRequests,
                    errorRate: this.requestCount > 0 ? this.failedRequests / this.requestCount : 0
                },
                performance: {
                    averageProcessingTime: this.requestCount > 0 ? this.totalProcessingTime / this.requestCount : 0,
                    totalProcessingTime: this.totalProcessingTime
                },
                agents: {
                    usage: this.agentUsage
                },
                timestamp: new Date().toISOString()
            };
            res.json({
                success: true,
                data: metrics
            });
        }
        catch (error) {
            logger_1.logger.error('Metrics error:', error);
            next(error);
        }
    }
    async getConfigStatus(req, res, next) {
        try {
            const configStatus = {
                server: {
                    port: config_1.config.server.port,
                    nodeEnv: config_1.config.server.nodeEnv,
                    apiVersion: config_1.config.server.apiVersion
                },
                database: {
                    host: config_1.config.database.host,
                    port: config_1.config.database.port,
                    name: config_1.config.database.name,
                    user: config_1.config.database.user || 'not-set',
                    ssl: config_1.config.database.ssl
                },
                openai: {
                    model: config_1.config.openai.model,
                    maxTokens: config_1.config.openai.maxTokens,
                    temperature: config_1.config.openai.temperature,
                    hasApiKey: !!config_1.config.openai.apiKey
                },
                security: {
                    hasApiKey: !!config_1.config.security.apiKey,
                    hasJwtSecret: !!config_1.config.security.jwtSecret
                },
                rateLimit: {
                    windowMs: config_1.config.rateLimit.windowMs,
                    maxRequests: config_1.config.rateLimit.maxRequests
                },
                cors: {
                    enabled: config_1.config.cors.enabled,
                    origins: config_1.config.cors.origins
                },
                logging: {
                    level: config_1.config.logging.level,
                    file: config_1.config.logging.file
                }
            };
            res.json({
                success: true,
                data: configStatus
            });
        }
        catch (error) {
            logger_1.logger.error('Config status error:', error);
            next(error);
        }
    }
    incrementRequestCount() {
        this.requestCount++;
    }
    incrementSuccessfulRequests() {
        this.successfulRequests++;
    }
    incrementFailedRequests() {
        this.failedRequests++;
    }
    addProcessingTime(time) {
        this.totalProcessingTime += time;
    }
    recordAgentUsage(agentName) {
        this.agentUsage[agentName] = (this.agentUsage[agentName] || 0) + 1;
    }
}
exports.HealthController = HealthController;
exports.healthController = new HealthController();
//# sourceMappingURL=healthController.js.map