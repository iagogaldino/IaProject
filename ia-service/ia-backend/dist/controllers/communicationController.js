"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationController = exports.CommunicationController = void 0;
const communicationService_1 = require("../services/communicationService");
const logger_1 = require("../services/logger");
class CommunicationController {
    async sendMessage(req, res, next) {
        try {
            const { id } = req.params;
            const messageData = {
                ...req.body,
                fromAgentId: id
            };
            logger_1.logger.info('Sending message between agents', {
                fromAgentId: messageData.fromAgentId,
                toAgentId: messageData.toAgentId
            });
            const message = await communicationService_1.communicationService.createMessage(messageData);
            const response = {
                success: true,
                data: message
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.logger.error('Error sending message:', error);
            if (error.message.includes('cannot communicate')) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: error.message,
                        code: 'COMMUNICATION_NOT_ALLOWED'
                    }
                });
                return;
            }
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
            next(error);
        }
    }
    async getMessages(req, res, next) {
        try {
            const { id } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            logger_1.logger.info('Fetching messages for agent', { agentId: id });
            const messages = await communicationService_1.communicationService.getMessagesByAgent(id, limit, offset);
            const response = {
                success: true,
                data: messages,
                meta: {
                    total: messages.length,
                    limit,
                    page: Math.floor(offset / limit) + 1
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error fetching messages:', error);
            next(error);
        }
    }
    async getMessagesBetweenAgents(req, res, next) {
        try {
            const { id } = req.params;
            const { otherAgentId } = req.query;
            const limit = parseInt(req.query.limit) || 50;
            if (!otherAgentId) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'otherAgentId query parameter is required',
                        code: 'MISSING_PARAMETER'
                    }
                });
                return;
            }
            logger_1.logger.info('Fetching messages between agents', {
                agentId1: id,
                agentId2: otherAgentId
            });
            const messages = await communicationService_1.communicationService.getMessagesBetweenAgents(id, otherAgentId, limit);
            const response = {
                success: true,
                data: messages,
                meta: {
                    total: messages.length,
                    limit
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error fetching messages between agents:', error);
            next(error);
        }
    }
    async getUnreadMessages(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info('Fetching unread messages for agent', { agentId: id });
            const messages = await communicationService_1.communicationService.getUnreadMessages(id);
            const response = {
                success: true,
                data: messages,
                meta: {
                    total: messages.length
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error fetching unread messages:', error);
            next(error);
        }
    }
    async getMessageCount(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info('Getting message count for agent', { agentId: id });
            const count = await communicationService_1.communicationService.getMessageCount(id);
            const response = {
                success: true,
                data: { count }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error getting message count:', error);
            next(error);
        }
    }
    async deleteMessage(req, res, next) {
        try {
            const { messageId } = req.params;
            logger_1.logger.info('Deleting message', { messageId });
            const deleted = await communicationService_1.communicationService.deleteMessage(messageId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'Message not found',
                        code: 'MESSAGE_NOT_FOUND'
                    }
                });
                return;
            }
            const response = {
                success: true,
                data: { message: 'Message deleted successfully' }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error deleting message:', error);
            next(error);
        }
    }
    async getCommunicationStats(req, res, next) {
        try {
            logger_1.logger.info('Fetching communication statistics');
            const stats = await communicationService_1.communicationService.getCommunicationStats();
            const response = {
                success: true,
                data: stats
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error fetching communication stats:', error);
            next(error);
        }
    }
}
exports.CommunicationController = CommunicationController;
exports.communicationController = new CommunicationController();
//# sourceMappingURL=communicationController.js.map