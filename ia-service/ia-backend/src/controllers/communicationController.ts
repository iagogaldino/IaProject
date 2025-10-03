import { Request, Response, NextFunction } from 'express';
import { communicationService } from '../services/communicationService';
import { logger } from '../services/logger';
import { ApiResponse, CreateMessageRequest } from '../types';

export class CommunicationController {
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const messageData: CreateMessageRequest = {
        ...req.body,
        fromAgentId: id
      };
      
      logger.info('Sending message between agents', { 
        fromAgentId: messageData.fromAgentId,
        toAgentId: messageData.toAgentId 
      });
      
      const message = await communicationService.createMessage(messageData);
      
      const response: ApiResponse = {
        success: true,
        data: message
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Error sending message:', error);
      
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

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      logger.info('Fetching messages for agent', { agentId: id });
      
      const messages = await communicationService.getMessagesByAgent(id, limit, offset);
      
      const response: ApiResponse = {
        success: true,
        data: messages,
        meta: {
          total: messages.length,
          limit,
          page: Math.floor(offset / limit) + 1
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching messages:', error);
      next(error);
    }
  }

  async getMessagesBetweenAgents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { otherAgentId } = req.query;
      const limit = parseInt(req.query.limit as string) || 50;
      
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
      
      logger.info('Fetching messages between agents', { 
        agentId1: id, 
        agentId2: otherAgentId 
      });
      
      const messages = await communicationService.getMessagesBetweenAgents(
        id, 
        otherAgentId as string, 
        limit
      );
      
      const response: ApiResponse = {
        success: true,
        data: messages,
        meta: {
          total: messages.length,
          limit
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching messages between agents:', error);
      next(error);
    }
  }

  async getUnreadMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Fetching unread messages for agent', { agentId: id });
      
      const messages = await communicationService.getUnreadMessages(id);
      
      const response: ApiResponse = {
        success: true,
        data: messages,
        meta: {
          total: messages.length
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching unread messages:', error);
      next(error);
    }
  }

  async getMessageCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Getting message count for agent', { agentId: id });
      
      const count = await communicationService.getMessageCount(id);
      
      const response: ApiResponse = {
        success: true,
        data: { count }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error getting message count:', error);
      next(error);
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId } = req.params;
      
      logger.info('Deleting message', { messageId });
      
      const deleted = await communicationService.deleteMessage(messageId);
      
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

      const response: ApiResponse = {
        success: true,
        data: { message: 'Message deleted successfully' }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error deleting message:', error);
      next(error);
    }
  }

  async getCommunicationStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching communication statistics');
      
      const stats = await communicationService.getCommunicationStats();
      
      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching communication stats:', error);
      next(error);
    }
  }
}

export const communicationController = new CommunicationController();
