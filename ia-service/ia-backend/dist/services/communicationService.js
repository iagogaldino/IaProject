"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationService = exports.CommunicationService = void 0;
const Message_1 = require("../models/Message");
const Agent_1 = require("../models/Agent");
const logger_1 = require("./logger");
class CommunicationService {
    async createMessage(messageData) {
        try {
            await this.verifyAgentsCanCommunicate(messageData.fromAgentId, messageData.toAgentId);
            const message = new Message_1.Message({
                fromAgentId: messageData.fromAgentId,
                toAgentId: messageData.toAgentId,
                content: messageData.content
            });
            const savedMessage = await message.save();
            return this.mapMongooseMessageToMessage(savedMessage);
        }
        catch (error) {
            logger_1.logger.error('Error creating message:', error);
            throw error;
        }
    }
    async getMessagesByAgent(agentId, limit = 50, offset = 0) {
        try {
            if (!agentId.match(/^[0-9a-fA-F]{24}$/)) {
                return [];
            }
            const messages = await Message_1.Message.find({
                $or: [
                    { fromAgentId: agentId },
                    { toAgentId: agentId }
                ]
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(offset)
                .exec();
            return messages.map((message) => this.mapMongooseMessageToMessage(message));
        }
        catch (error) {
            logger_1.logger.error('Error fetching messages by agent:', error);
            throw error;
        }
    }
    async getMessagesBetweenAgents(agentId1, agentId2, limit = 50) {
        try {
            if (!agentId1.match(/^[0-9a-fA-F]{24}$/) || !agentId2.match(/^[0-9a-fA-F]{24}$/)) {
                return [];
            }
            const messages = await Message_1.Message.find({
                $or: [
                    { fromAgentId: agentId1, toAgentId: agentId2 },
                    { fromAgentId: agentId2, toAgentId: agentId1 }
                ]
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .exec();
            return messages.map((message) => this.mapMongooseMessageToMessage(message));
        }
        catch (error) {
            logger_1.logger.error('Error fetching messages between agents:', error);
            throw error;
        }
    }
    async getUnreadMessages(agentId) {
        return this.getMessagesByAgent(agentId);
    }
    async getMessageCount(agentId) {
        try {
            if (!agentId.match(/^[0-9a-fA-F]{24}$/)) {
                return 0;
            }
            const count = await Message_1.Message.countDocuments({
                $or: [
                    { fromAgentId: agentId },
                    { toAgentId: agentId }
                ]
            }).exec();
            return count;
        }
        catch (error) {
            logger_1.logger.error('Error getting message count:', error);
            throw error;
        }
    }
    async deleteMessage(messageId) {
        try {
            if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
                return false;
            }
            const result = await Message_1.Message.findByIdAndDelete(messageId).exec();
            return result !== null;
        }
        catch (error) {
            logger_1.logger.error('Error deleting message:', error);
            throw error;
        }
    }
    async getCommunicationStats() {
        try {
            const totalMessages = await Message_1.Message.countDocuments().exec();
            const messagesByAgentPipeline = await Message_1.Message.aggregate([
                {
                    $lookup: {
                        from: 'agents',
                        localField: 'fromAgentId',
                        foreignField: '_id',
                        as: 'agent'
                    }
                },
                {
                    $unwind: '$agent'
                },
                {
                    $group: {
                        _id: '$agent.name',
                        messageCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { messageCount: -1 }
                }
            ]).exec();
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            const recentActivity = await Message_1.Message.countDocuments({
                createdAt: { $gte: oneDayAgo }
            }).exec();
            const messagesByAgent = {};
            messagesByAgentPipeline.forEach((item) => {
                messagesByAgent[item._id] = item.messageCount;
            });
            return {
                totalMessages,
                messagesByAgent,
                recentActivity
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting communication stats:', error);
            throw error;
        }
    }
    async verifyAgentsCanCommunicate(fromAgentId, toAgentId) {
        try {
            if (!fromAgentId.match(/^[0-9a-fA-F]{24}$/) || !toAgentId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('Invalid agent ID format');
            }
            const fromAgent = await Agent_1.Agent.findById(fromAgentId).exec();
            if (!fromAgent) {
                throw new Error(`Agent with ID ${fromAgentId} not found`);
            }
            const toAgent = await Agent_1.Agent.findById(toAgentId).exec();
            if (!toAgent) {
                throw new Error(`Target agent with ID ${toAgentId} not found`);
            }
            if (!fromAgent.canCommunicateWith.includes(toAgentId)) {
                throw new Error(`Agent ${fromAgentId} cannot communicate with agent ${toAgentId}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error verifying agent communication:', error);
            throw error;
        }
    }
    mapMongooseMessageToMessage(mongooseMessage) {
        return {
            id: mongooseMessage._id.toString(),
            fromAgentId: mongooseMessage.fromAgentId,
            toAgentId: mongooseMessage.toAgentId,
            content: mongooseMessage.content,
            createdAt: mongooseMessage.createdAt
        };
    }
}
exports.CommunicationService = CommunicationService;
exports.communicationService = new CommunicationService();
//# sourceMappingURL=communicationService.js.map