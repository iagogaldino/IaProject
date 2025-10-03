"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentService = exports.AgentService = void 0;
const Agent_1 = require("../models/Agent");
const logger_1 = require("./logger");
class AgentService {
    async createAgent(agentData) {
        try {
            const agent = new Agent_1.Agent({
                name: agentData.name,
                description: agentData.description,
                status: agentData.status || 'inactive',
                canCommunicateWith: agentData.canCommunicateWith || [],
                databaseAccess: agentData.databaseAccess ? {
                    enabled: agentData.databaseAccess.enabled,
                    allowedCollections: agentData.databaseAccess.allowedCollections || [],
                    allowedOperations: agentData.databaseAccess.allowedOperations || ['read'],
                    queryLimits: {
                        maxResults: agentData.databaseAccess.queryLimits?.maxResults || 100,
                        timeout: agentData.databaseAccess.queryLimits?.timeout || 30000
                    }
                } : {
                    enabled: false,
                    allowedCollections: [],
                    allowedOperations: ['read'],
                    queryLimits: {
                        maxResults: 100,
                        timeout: 30000
                    }
                },
                fileAccess: agentData.fileAccess ? {
                    enabled: agentData.fileAccess.enabled,
                    allowedFileTypes: agentData.fileAccess.allowedFileTypes || ['txt', 'pdf', 'doc', 'docx'],
                    maxFileSize: agentData.fileAccess.maxFileSize || 10485760,
                    allowedOperations: agentData.fileAccess.allowedOperations || ['read'],
                    storagePath: agentData.fileAccess.storagePath || 'uploads'
                } : {
                    enabled: false,
                    allowedFileTypes: ['txt', 'pdf', 'doc', 'docx'],
                    maxFileSize: 10485760,
                    allowedOperations: ['read'],
                    storagePath: 'uploads'
                }
            });
            const savedAgent = await agent.save();
            return this.mapMongooseAgentToAgent(savedAgent);
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error(`Agent with name '${agentData.name}' already exists`);
            }
            logger_1.logger.error('Error creating agent:', error);
            throw error;
        }
    }
    async getAllAgents() {
        try {
            const agents = await Agent_1.Agent.find()
                .sort({ createdAt: -1 })
                .exec();
            return agents.map((agent) => this.mapMongooseAgentToAgent(agent));
        }
        catch (error) {
            logger_1.logger.error('Error fetching agents:', error);
            throw error;
        }
    }
    async getAgentById(id) {
        try {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return null;
            }
            const agent = await Agent_1.Agent.findById(id).exec();
            return agent ? this.mapMongooseAgentToAgent(agent) : null;
        }
        catch (error) {
            logger_1.logger.error('Error fetching agent by ID:', error);
            throw error;
        }
    }
    async updateAgent(id, agentData) {
        try {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return null;
            }
            const updateData = {};
            if (agentData.name !== undefined) {
                updateData.name = agentData.name;
            }
            if (agentData.description !== undefined) {
                updateData.description = agentData.description;
            }
            if (agentData.status !== undefined) {
                updateData.status = agentData.status;
            }
            if (agentData.canCommunicateWith !== undefined) {
                updateData.canCommunicateWith = agentData.canCommunicateWith;
            }
            if (agentData.databaseAccess !== undefined) {
                updateData.databaseAccess = agentData.databaseAccess;
            }
            if (agentData.fileAccess !== undefined) {
                updateData.fileAccess = agentData.fileAccess;
            }
            if (Object.keys(updateData).length === 0) {
                throw new Error('No fields to update');
            }
            const agent = await Agent_1.Agent.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
            return agent ? this.mapMongooseAgentToAgent(agent) : null;
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error(`Agent with name '${agentData.name}' already exists`);
            }
            logger_1.logger.error('Error updating agent:', error);
            throw error;
        }
    }
    async updateAgentStatus(id, status) {
        try {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return null;
            }
            const agent = await Agent_1.Agent.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).exec();
            return agent ? this.mapMongooseAgentToAgent(agent) : null;
        }
        catch (error) {
            logger_1.logger.error('Error updating agent status:', error);
            throw error;
        }
    }
    async deleteAgent(id) {
        try {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return false;
            }
            const result = await Agent_1.Agent.findByIdAndDelete(id).exec();
            return result !== null;
        }
        catch (error) {
            logger_1.logger.error('Error deleting agent:', error);
            throw error;
        }
    }
    async getActiveAgents() {
        try {
            const agents = await Agent_1.Agent.find({ status: 'active' })
                .sort({ createdAt: -1 })
                .exec();
            return agents.map((agent) => this.mapMongooseAgentToAgent(agent));
        }
        catch (error) {
            logger_1.logger.error('Error fetching active agents:', error);
            throw error;
        }
    }
    async getAgentsThatCanCommunicateWith(agentId) {
        try {
            if (!agentId.match(/^[0-9a-fA-F]{24}$/)) {
                return [];
            }
            const agents = await Agent_1.Agent.find({
                $or: [
                    { canCommunicateWith: agentId },
                    { _id: agentId }
                ]
            })
                .sort({ name: 1 })
                .exec();
            return agents.map((agent) => this.mapMongooseAgentToAgent(agent));
        }
        catch (error) {
            logger_1.logger.error('Error fetching agents that can communicate:', error);
            throw error;
        }
    }
    async getAgentByName(name) {
        try {
            const agent = await Agent_1.Agent.findOne({ name }).exec();
            return agent ? this.mapMongooseAgentToAgent(agent) : null;
        }
        catch (error) {
            logger_1.logger.error('Error fetching agent by name:', error);
            throw error;
        }
    }
    async findSpecialistAgent(query) {
        try {
            const agents = await Agent_1.Agent.find({
                status: 'active',
                description: { $regex: query, $options: 'i' }
            }).exec();
            if (agents.length === 0) {
                return null;
            }
            return this.mapMongooseAgentToAgent(agents[0]);
        }
        catch (error) {
            logger_1.logger.error('Error finding specialist agent:', error);
            throw error;
        }
    }
    async getAllActiveAgents() {
        try {
            const agents = await Agent_1.Agent.find({ status: 'active' })
                .sort({ name: 1 })
                .exec();
            return agents.map((agent) => this.mapMongooseAgentToAgent(agent));
        }
        catch (error) {
            logger_1.logger.error('Error fetching all active agents:', error);
            throw error;
        }
    }
    mapMongooseAgentToAgent(mongooseAgent) {
        return {
            id: mongooseAgent._id.toString(),
            name: mongooseAgent.name,
            description: mongooseAgent.description,
            status: mongooseAgent.status,
            canCommunicateWith: mongooseAgent.canCommunicateWith,
            databaseAccess: mongooseAgent.databaseAccess,
            fileAccess: mongooseAgent.fileAccess,
            createdAt: mongooseAgent.createdAt,
            updatedAt: mongooseAgent.updatedAt
        };
    }
}
exports.AgentService = AgentService;
exports.agentService = new AgentService();
//# sourceMappingURL=agentService.js.map