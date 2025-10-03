import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const createAgentSchema: Joi.ObjectSchema<any>;
export declare const updateAgentSchema: Joi.ObjectSchema<any>;
export declare const agentIdSchema: Joi.ObjectSchema<any>;
export declare const createMessageSchema: Joi.ObjectSchema<any>;
export declare const chatRequestSchema: Joi.ObjectSchema<any>;
export declare const updateAgentStatusSchema: Joi.ObjectSchema<any>;
export declare const aiProcessSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map