import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { logger } from '../services/logger';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
  isAuthenticated?: boolean;
}

export const authenticateApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const authHeader = req.headers.authorization;

  // Check for API key in header
  if (apiKey && apiKey === config.security.apiKey) {
    req.apiKey = apiKey;
    req.isAuthenticated = true;
    return next();
  }

  // Check for Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === config.security.apiKey) {
      req.apiKey = token;
      req.isAuthenticated = true;
      return next();
    }
  }

  logger.warn('Unauthorized access attempt', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method
  });

  res.status(401).json({
    success: false,
    error: {
      message: 'Unauthorized: Valid API key required',
      code: 'UNAUTHORIZED'
    }
  });
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const authHeader = req.headers.authorization;

  // Check for API key in header
  if (apiKey && apiKey === config.security.apiKey) {
    req.apiKey = apiKey;
    req.isAuthenticated = true;
  }
  // Check for Bearer token
  else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === config.security.apiKey) {
      req.apiKey = token;
      req.isAuthenticated = true;
    }
  }

  next();
};
