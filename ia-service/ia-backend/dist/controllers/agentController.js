"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentController = exports.AgentController = void 0;
const agentService_1 = require("../services/agentService");
const databaseService_1 = require("../services/databaseService");
const logger_1 = require("../services/logger");
class AgentController {
    async createAgent(req, res, next) {
        try {
            const agentData = req.body;
            logger_1.logger.info('Creating new agent', { name: agentData.name });
            const agent = await agentService_1.agentService.createAgent(agentData);
            const response = {
                success: true,
                data: agent
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.logger.error('Error creating agent:', error);
            next(error);
        }
    }
    async getAllAgents(req, res, next) {
        try {
            logger_1.logger.info('Fetching all agents');
            const agents = await agentService_1.agentService.getAllAgents();
            const response = {
                success: true,
                data: agents,
                meta: {
                    total: agents.length
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error fetching agents:', error);
            next(error);
        }
    }
    async getAgentById(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info('Fetching agent by ID', { agentId: id });
            const agent = await agentService_1.agentService.getAgentById(id);
            if (!agent) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'Agent not found',
                        code: 'AGENT_NOT_FOUND'
                    }
                });
                return;
            }
            const response = {
                success: true,
                data: agent
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error fetching agent:', error);
            next(error);
        }
    }
    async updateAgent(req, res, next) {
        try {
            const { id } = req.params;
            const agentData = req.body;
            logger_1.logger.info('Updating agent', { agentId: id, updates: agentData });
            const agent = await agentService_1.agentService.updateAgent(id, agentData);
            if (!agent) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'Agent not found',
                        code: 'AGENT_NOT_FOUND'
                    }
                });
                return;
            }
            const response = {
                success: true,
                data: agent
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error updating agent:', error);
            next(error);
        }
    }
    async updateAgentStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            logger_1.logger.info('Updating agent status', { agentId: id, status });
            const agent = await agentService_1.agentService.updateAgentStatus(id, status);
            if (!agent) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'Agent not found',
                        code: 'AGENT_NOT_FOUND'
                    }
                });
                return;
            }
            const response = {
                success: true,
                data: agent
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error updating agent status:', error);
            next(error);
        }
    }
    async deleteAgent(req, res, next) {
        try {
            const { id } = req.params;
            logger_1.logger.info('Deleting agent', { agentId: id });
            const deleted = await agentService_1.agentService.deleteAgent(id);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'Agent not found',
                        code: 'AGENT_NOT_FOUND'
                    }
                });
                return;
            }
            const response = {
                success: true,
                data: { message: 'Agent deleted successfully' }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error deleting agent:', error);
            next(error);
        }
    }
    async getActiveAgents(req, res, next) {
        try {
            logger_1.logger.info('Fetching active agents');
            const agents = await agentService_1.agentService.getActiveAgents();
            const response = {
                success: true,
                data: agents,
                meta: {
                    total: agents.length
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error fetching active agents:', error);
            next(error);
        }
    }
    async getAvailableCollections(req, res, next) {
        try {
            logger_1.logger.info('Fetching available collections');
            const collections = await databaseService_1.databaseService.listAvailableCollections();
            const response = {
                success: true,
                data: collections,
                meta: {
                    total: collections.length
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error fetching available collections:', error);
            next(error);
        }
    }
}
exports.AgentController = AgentController;
exports.agentController = new AgentController();
//# sourceMappingURL=agentController.js.map