"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateApiKey = void 0;
const config_1 = require("../config/config");
const logger_1 = require("../services/logger");
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const authHeader = req.headers.authorization;
    if (apiKey && apiKey === config_1.config.security.apiKey) {
        req.apiKey = apiKey;
        req.isAuthenticated = true;
        return next();
    }
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token === config_1.config.security.apiKey) {
            req.apiKey = token;
            req.isAuthenticated = true;
            return next();
        }
    }
    logger_1.logger.warn('Unauthorized access attempt', {
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
exports.authenticateApiKey = authenticateApiKey;
const optionalAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const authHeader = req.headers.authorization;
    if (apiKey && apiKey === config_1.config.security.apiKey) {
        req.apiKey = apiKey;
        req.isAuthenticated = true;
    }
    else if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token === config_1.config.security.apiKey) {
            req.apiKey = token;
            req.isAuthenticated = true;
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map