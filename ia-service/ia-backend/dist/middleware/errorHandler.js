"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../services/logger");
const config_1 = require("../config/config");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_ERROR';
    if (err.name === 'ValidationError') {
        status = 400;
        code = 'VALIDATION_ERROR';
    }
    else if (err.name === 'UnauthorizedError') {
        status = 401;
        code = 'UNAUTHORIZED';
    }
    else if (err.name === 'ForbiddenError') {
        status = 403;
        code = 'FORBIDDEN';
    }
    else if (err.name === 'NotFoundError') {
        status = 404;
        code = 'NOT_FOUND';
    }
    else if (err.name === 'ConflictError') {
        status = 409;
        code = 'CONFLICT';
    }
    const errorResponse = {
        success: false,
        error: {
            message,
            code,
            ...(config_1.config.server.nodeEnv === 'development' && {
                stack: err.stack,
                details: err.details
            })
        }
    };
    res.status(status).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.originalUrl} not found`,
            code: 'ROUTE_NOT_FOUND'
        }
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map