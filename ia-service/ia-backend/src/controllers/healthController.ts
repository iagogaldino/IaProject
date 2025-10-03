import { Request, Response, NextFunction } from 'express';
import { openaiService } from '../services/openaiService';
import { database } from '../config/database';
import { config } from '../config/config';
import { logger } from '../services/logger';
import { HealthStatus } from '../types';

export class HealthController {
  private startTime = Date.now();
  private requestCount = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private totalProcessingTime = 0;
  private agentUsage: Record<string, number> = {};

  async getHealthStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const uptime = Date.now() - (this.startTime || Date.now());
      
      // Check OpenAI connection
      const openaiStatus = await openaiService.testConnection();
      
      // Check database connection
      let databaseStatus = false;
      try {
        databaseStatus = await database.isConnected();
      } catch (error) {
        logger.error('Database health check failed:', error);
      }

      // Check API key
      const apiKeyStatus = !!config.security.apiKey;
      
      // Check JWT secret
      const jwtSecretStatus = !!config.security.jwtSecret;

      const healthStatus: HealthStatus = {
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
    } catch (error: any) {
      logger.error('Health check error:', error);
      next(error);
    }
  }

  async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error: any) {
      logger.error('Metrics error:', error);
      next(error);
    }
  }

  async getConfigStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configStatus = {
        server: {
          port: config.server.port,
          nodeEnv: config.server.nodeEnv,
          apiVersion: config.server.apiVersion
        },
        database: {
          host: config.database.host,
          port: config.database.port,
          name: config.database.name,
          user: config.database.user || 'not-set',
          ssl: config.database.ssl
        },
        openai: {
          model: config.openai.model,
          maxTokens: config.openai.maxTokens,
          temperature: config.openai.temperature,
          hasApiKey: !!config.openai.apiKey
        },
        security: {
          hasApiKey: !!config.security.apiKey,
          hasJwtSecret: !!config.security.jwtSecret
        },
        rateLimit: {
          windowMs: config.rateLimit.windowMs,
          maxRequests: config.rateLimit.maxRequests
        },
        cors: {
          enabled: config.cors.enabled,
          origins: config.cors.origins
        },
        logging: {
          level: config.logging.level,
          file: config.logging.file
        }
      };

      res.json({
        success: true,
        data: configStatus
      });
    } catch (error: any) {
      logger.error('Config status error:', error);
      next(error);
    }
  }

  // Methods to track metrics
  incrementRequestCount(): void {
    this.requestCount++;
  }

  incrementSuccessfulRequests(): void {
    this.successfulRequests++;
  }

  incrementFailedRequests(): void {
    this.failedRequests++;
  }

  addProcessingTime(time: number): void {
    this.totalProcessingTime += time;
  }

  recordAgentUsage(agentName: string): void {
    this.agentUsage[agentName] = (this.agentUsage[agentName] || 0) + 1;
  }
}

export const healthController = new HealthController();
