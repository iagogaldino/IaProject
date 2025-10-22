import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1'
  },
  
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '27017', 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
    url: process.env.MONGODB_URI || process.env.DATABASE_URL
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
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
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
