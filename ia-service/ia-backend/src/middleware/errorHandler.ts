import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { logger } from '../services/logger';
import { config } from '../config/config';

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    code = 'UNAUTHORIZED';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    code = 'FORBIDDEN';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    code = 'NOT_FOUND';
  } else if (err.name === 'ConflictError') {
    status = 409;
    code = 'CONFLICT';
  }

  const errorResponse: any = {
    success: false,
    error: {
      message,
      code,
      ...(config.server.nodeEnv === 'development' && {
        stack: err.stack,
        details: err.details
      })
    }
  };

  res.status(status).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
};
