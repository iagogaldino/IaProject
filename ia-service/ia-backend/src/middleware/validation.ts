import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError, ValidationResult } from '../types';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
      return;
    }

    req.body = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid parameters',
          code: 'INVALID_PARAMS',
          details: validationErrors
        }
      });
      return;
    }

    req.params = value;
    next();
  };
};

// Validation schemas
export const createAgentSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().min(1).max(1000).required(),
  status: Joi.string().valid('active', 'inactive').default('inactive'),
  canCommunicateWith: Joi.array().items(Joi.string()).default([]),
  databaseAccess: Joi.object({
    enabled: Joi.boolean(),
    allowedCollections: Joi.array().items(Joi.string()),
    allowedOperations: Joi.array().items(Joi.string().valid('read', 'write', 'update', 'delete')),
    queryLimits: Joi.object({
      maxResults: Joi.number().min(1).max(10000),
      timeout: Joi.number().min(1000).max(300000)
    })
  }),
  fileAccess: Joi.object({
    enabled: Joi.boolean(),
    allowedFileTypes: Joi.array().items(Joi.string()),
    maxFileSize: Joi.number().min(1024).max(104857600), // 1KB to 100MB
    allowedOperations: Joi.array().items(Joi.string().valid('read', 'upload', 'delete')),
    storagePath: Joi.string()
  })
});

export const updateAgentSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  description: Joi.string().min(1).max(1000),
  status: Joi.string().valid('active', 'inactive'),
  canCommunicateWith: Joi.array().items(Joi.string()),
  databaseAccess: Joi.object({
    enabled: Joi.boolean(),
    allowedCollections: Joi.array().items(Joi.string()),
    allowedOperations: Joi.array().items(Joi.string().valid('read', 'write', 'update', 'delete')),
    queryLimits: Joi.object({
      maxResults: Joi.number().min(1).max(10000),
      timeout: Joi.number().min(1000).max(300000)
    })
  }),
  fileAccess: Joi.object({
    enabled: Joi.boolean(),
    allowedFileTypes: Joi.array().items(Joi.string()),
    maxFileSize: Joi.number().min(1024).max(104857600), // 1KB to 100MB
    allowedOperations: Joi.array().items(Joi.string().valid('read', 'upload', 'delete')),
    storagePath: Joi.string()
  })
}).min(1);

export const agentIdSchema = Joi.object({
  id: Joi.string().required()
});

export const createMessageSchema = Joi.object({
  fromAgentId: Joi.string().required(),
  toAgentId: Joi.string().required(),
  content: Joi.string().min(1).max(5000).required()
});

export const chatRequestSchema = Joi.object({
  messages: Joi.array().items(
    Joi.object({
      role: Joi.string().valid('user', 'agent').required(),
      content: Joi.string().min(1).required()
    })
  ).min(1).required()
});

export const updateAgentStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required()
});

export const aiProcessSchema = Joi.object({
  prompt: Joi.string().min(1).max(10000),
  conversationHistory: Joi.array().items(
    Joi.object({
      sender: Joi.string().required(),
      text: Joi.string().required(),
      timestamp: Joi.string().required()
    })
  ),
  userId: Joi.string(),
  sessionId: Joi.string(),
  metadata: Joi.object()
}).min(1);
