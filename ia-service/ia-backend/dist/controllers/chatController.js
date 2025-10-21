"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = exports.ChatController = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const agentService_1 = require("../services/agentService");
const chatService_1 = require("../services/chatService");
const logger_1 = require("../services/logger");
class ChatController {
    async chatWithAgent(req, res, next) {
        try {
            const { id } = req.params;
            const chatRequest = req.body;
            logger_1.logger.info('Chat request received', { agentId: id });
            const response = await chatService_1.chatService.processAgentChat(id, chatRequest);
            const apiResponse = {
                success: true,
                data: response
            };
            res.json(apiResponse);
        }
        catch (error) {
            logger_1.logger.error('Error in agent chat:', error);
            if (error.message.includes('not found')) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: error.message,
                        code: 'AGENT_NOT_FOUND'
                    }
                });
                return;
            }
            if (error.message.includes('not active')) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: error.message,
                        code: 'AGENT_INACTIVE'
                    }
                });
                return;
            }
            next(error);
        }
    }
    async processAIRequest(req, res, next) {
        try {
            logger_1.logger.info('AI process request received');
            const response = await chatService_1.chatService.processAIRequest(req.body);
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error processing AI request:', error);
            next(error);
        }
    }
    async forwardToExternalAI(req, res, next) {
        try {
            const externalUrl = 'http://localhost:3001/api/ai/process';
            logger_1.logger.info('Forwarding request to external AI service', { url: externalUrl });
            const response = await axios_1.default.post(externalUrl, req.body, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': config_1.config.security.apiKey
                },
                timeout: config_1.config.externalServices.timeout
            });
            res.json(response.data);
        }
        catch (error) {
            logger_1.logger.error('Error forwarding to external AI service:', error);
            if (error.response) {
                res.status(error.response.status).json(error.response.data);
            }
            else if (error.code === 'ECONNREFUSED') {
                res.status(503).json({
                    success: false,
                    error: {
                        message: 'External AI service is unavailable',
                        code: 'SERVICE_UNAVAILABLE'
                    }
                });
            }
            else {
                next(error);
            }
        }
    }
    async smartAgentConsultation(req, res, next) {
        try {
            const { id } = req.params;
            const { query } = req.body;
            logger_1.logger.info('Smart agent consultation request', { agentId: id, query });
            const specialistAgent = await agentService_1.agentService.findSpecialistAgent(query);
            if (!specialistAgent) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'No specialist agent found for this query',
                        code: 'NO_SPECIALIST_FOUND'
                    }
                });
                return;
            }
            const chatRequest = {
                messages: [
                    {
                        role: 'user',
                        content: query
                    }
                ]
            };
            const response = await chatService_1.chatService.processAgentChat(specialistAgent.id, chatRequest);
            const apiResponse = {
                success: true,
                data: {
                    specialistAgent: {
                        id: specialistAgent.id,
                        name: specialistAgent.name,
                        description: specialistAgent.description
                    },
                    response: response.response
                }
            };
            res.json(apiResponse);
        }
        catch (error) {
            logger_1.logger.error('Error in smart agent consultation:', error);
            next(error);
        }
    }
}
exports.ChatController = ChatController;
exports.chatController = new ChatController();
//# sourceMappingURL=chatController.js.map