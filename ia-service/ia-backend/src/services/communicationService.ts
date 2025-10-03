import { Message as MessageModel, IMessage } from '../models/Message';
import { Agent as AgentModel } from '../models/Agent';
import { logger } from './logger';
import { Message, CreateMessageRequest } from '../types';

export class CommunicationService {
  async createMessage(messageData: CreateMessageRequest): Promise<Message> {
    try {
      // Verify both agents exist and can communicate
      await this.verifyAgentsCanCommunicate(messageData.fromAgentId, messageData.toAgentId);

      const message = new MessageModel({
        fromAgentId: messageData.fromAgentId,
        toAgentId: messageData.toAgentId,
        content: messageData.content
      });

      const savedMessage = await message.save();
      return this.mapMongooseMessageToMessage(savedMessage);
    } catch (error: any) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessagesByAgent(agentId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      // Check if id is a valid ObjectId
      if (!agentId.match(/^[0-9a-fA-F]{24}$/)) {
        return [];
      }

      const messages = await MessageModel.find({
        $or: [
          { fromAgentId: agentId },
          { toAgentId: agentId }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

      return messages.map((message: IMessage) => this.mapMongooseMessageToMessage(message));
    } catch (error: any) {
      logger.error('Error fetching messages by agent:', error);
      throw error;
    }
  }

  async getMessagesBetweenAgents(agentId1: string, agentId2: string, limit: number = 50): Promise<Message[]> {
    try {
      // Check if both ids are valid ObjectIds
      if (!agentId1.match(/^[0-9a-fA-F]{24}$/) || !agentId2.match(/^[0-9a-fA-F]{24}$/)) {
        return [];
      }

      const messages = await MessageModel.find({
        $or: [
          { fromAgentId: agentId1, toAgentId: agentId2 },
          { fromAgentId: agentId2, toAgentId: agentId1 }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

      return messages.map((message: IMessage) => this.mapMongooseMessageToMessage(message));
    } catch (error: any) {
      logger.error('Error fetching messages between agents:', error);
      throw error;
    }
  }

  async getUnreadMessages(agentId: string): Promise<Message[]> {
    // For now, we'll return all messages for the agent
    // In a real implementation, you might want to track read status
    return this.getMessagesByAgent(agentId);
  }

  async getMessageCount(agentId: string): Promise<number> {
    try {
      // Check if id is a valid ObjectId
      if (!agentId.match(/^[0-9a-fA-F]{24}$/)) {
        return 0;
      }

      const count = await MessageModel.countDocuments({
        $or: [
          { fromAgentId: agentId },
          { toAgentId: agentId }
        ]
      }).exec();

      return count;
    } catch (error: any) {
      logger.error('Error getting message count:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      // Check if id is a valid ObjectId
      if (!messageId.match(/^[0-9a-fA-F]{24}$/)) {
        return false;
      }

      const result = await MessageModel.findByIdAndDelete(messageId).exec();
      return result !== null;
    } catch (error: any) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  async getCommunicationStats(): Promise<{
    totalMessages: number;
    messagesByAgent: Record<string, number>;
    recentActivity: number;
  }> {
    try {
      // Total messages
      const totalMessages = await MessageModel.countDocuments().exec();

      // Messages by agent (sent)
      const messagesByAgentPipeline = await MessageModel.aggregate([
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

      // Recent activity (messages in last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const recentActivity = await MessageModel.countDocuments({
        createdAt: { $gte: oneDayAgo }
      }).exec();

      const messagesByAgent: Record<string, number> = {};
      messagesByAgentPipeline.forEach((item: any) => {
        messagesByAgent[item._id] = item.messageCount;
      });

      return {
        totalMessages,
        messagesByAgent,
        recentActivity
      };
    } catch (error: any) {
      logger.error('Error getting communication stats:', error);
      throw error;
    }
  }

  private async verifyAgentsCanCommunicate(fromAgentId: string, toAgentId: string): Promise<void> {
    try {
      // Check if both ids are valid ObjectIds
      if (!fromAgentId.match(/^[0-9a-fA-F]{24}$/) || !toAgentId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid agent ID format');
      }

      const fromAgent = await AgentModel.findById(fromAgentId).exec();
      if (!fromAgent) {
        throw new Error(`Agent with ID ${fromAgentId} not found`);
      }

      const toAgent = await AgentModel.findById(toAgentId).exec();
      if (!toAgent) {
        throw new Error(`Target agent with ID ${toAgentId} not found`);
      }

      if (!fromAgent.canCommunicateWith.includes(toAgentId)) {
        throw new Error(`Agent ${fromAgentId} cannot communicate with agent ${toAgentId}`);
      }
    } catch (error: any) {
      logger.error('Error verifying agent communication:', error);
      throw error;
    }
  }

  private mapMongooseMessageToMessage(mongooseMessage: IMessage): Message {
    return {
      id: (mongooseMessage as any)._id.toString(),
      fromAgentId: mongooseMessage.fromAgentId,
      toAgentId: mongooseMessage.toAgentId,
      content: mongooseMessage.content,
      createdAt: (mongooseMessage as any).createdAt
    };
  }
}

export const communicationService = new CommunicationService();
