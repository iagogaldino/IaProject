"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiProcessSchema = exports.updateAgentStatusSchema = exports.chatRequestSchema = exports.createMessageSchema = exports.agentIdSchema = exports.updateAgentSchema = exports.createAgentSchema = exports.validateParams = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });
        if (error) {
            const validationErrors = error.details.map(detail => ({
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
exports.validateRequest = validateRequest;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });
        if (error) {
            const validationErrors = error.details.map(detail => ({
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
exports.validateParams = validateParams;
exports.createAgentSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(255).required(),
    description: joi_1.default.string().min(1).max(1000).required(),
    status: joi_1.default.string().valid('active', 'inactive').default('inactive'),
    canCommunicateWith: joi_1.default.array().items(joi_1.default.string()).default([]),
    databaseAccess: joi_1.default.object({
        enabled: joi_1.default.boolean(),
        allowedCollections: joi_1.default.array().items(joi_1.default.string()),
        allowedOperations: joi_1.default.array().items(joi_1.default.string().valid('read', 'write', 'update', 'delete')),
        queryLimits: joi_1.default.object({
            maxResults: joi_1.default.number().min(1).max(10000),
            timeout: joi_1.default.number().min(1000).max(300000)
        })
    }),
    fileAccess: joi_1.default.object({
        enabled: joi_1.default.boolean(),
        allowedFileTypes: joi_1.default.array().items(joi_1.default.string()),
        maxFileSize: joi_1.default.number().min(1024).max(104857600),
        allowedOperations: joi_1.default.array().items(joi_1.default.string().valid('read', 'upload', 'delete')),
        storagePath: joi_1.default.string()
    })
});
exports.updateAgentSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(255),
    description: joi_1.default.string().min(1).max(1000),
    status: joi_1.default.string().valid('active', 'inactive'),
    canCommunicateWith: joi_1.default.array().items(joi_1.default.string()),
    databaseAccess: joi_1.default.object({
        enabled: joi_1.default.boolean(),
        allowedCollections: joi_1.default.array().items(joi_1.default.string()),
        allowedOperations: joi_1.default.array().items(joi_1.default.string().valid('read', 'write', 'update', 'delete')),
        queryLimits: joi_1.default.object({
            maxResults: joi_1.default.number().min(1).max(10000),
            timeout: joi_1.default.number().min(1000).max(300000)
        })
    }),
    fileAccess: joi_1.default.object({
        enabled: joi_1.default.boolean(),
        allowedFileTypes: joi_1.default.array().items(joi_1.default.string()),
        maxFileSize: joi_1.default.number().min(1024).max(104857600),
        allowedOperations: joi_1.default.array().items(joi_1.default.string().valid('read', 'upload', 'delete')),
        storagePath: joi_1.default.string()
    })
}).min(1);
exports.agentIdSchema = joi_1.default.object({
    id: joi_1.default.string().required()
});
exports.createMessageSchema = joi_1.default.object({
    fromAgentId: joi_1.default.string().required(),
    toAgentId: joi_1.default.string().required(),
    content: joi_1.default.string().min(1).max(5000).required()
});
exports.chatRequestSchema = joi_1.default.object({
    messages: joi_1.default.array().items(joi_1.default.object({
        role: joi_1.default.string().valid('user', 'agent').required(),
        content: joi_1.default.string().min(1).required()
    })).min(1).required()
});
exports.updateAgentStatusSchema = joi_1.default.object({
    status: joi_1.default.string().valid('active', 'inactive').required()
});
exports.aiProcessSchema = joi_1.default.object({
    prompt: joi_1.default.string().min(1).max(10000),
    conversationHistory: joi_1.default.array().items(joi_1.default.object({
        sender: joi_1.default.string().required(),
        text: joi_1.default.string().required(),
        timestamp: joi_1.default.string().required()
    })),
    userId: joi_1.default.string(),
    sessionId: joi_1.default.string(),
    metadata: joi_1.default.object()
}).min(1);
//# sourceMappingURL=validation.js.map