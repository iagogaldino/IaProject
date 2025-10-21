import { Request, Response, NextFunction } from 'express';
import { agentService } from '../services/agentService';
import { databaseService } from '../services/databaseService';
import { logger } from '../services/logger';
import { ApiResponse, CreateAgentRequest, UpdateAgentRequest } from '../types';

export class AgentController {
  async createAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agentData: CreateAgentRequest = req.body;
      
      logger.info('Creating new agent', { name: agentData.name });
      
      const agent = await agentService.createAgent(agentData);
      
      const response: ApiResponse = {
        success: true,
        data: agent
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Error creating agent:', error);
      next(error);
    }
  }

  async getAllAgents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all agents');
      
      const agents = await agentService.getAllAgents();
      
      const response: ApiResponse = {
        success: true,
        data: agents,
        meta: {
          total: agents.length
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching agents:', error);
      next(error);
    }
  }

  async getAgentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Fetching agent by ID', { agentId: id });
      
      const agent = await agentService.getAgentById(id);
      
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

      const response: ApiResponse = {
        success: true,
        data: agent
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching agent:', error);
      next(error);
    }
  }

  async updateAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const agentData: UpdateAgentRequest = req.body;
      
      logger.info('Updating agent', { agentId: id, updates: agentData });
      
      const agent = await agentService.updateAgent(id, agentData);
      
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

      const response: ApiResponse = {
        success: true,
        data: agent
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error updating agent:', error);
      next(error);
    }
  }

  async updateAgentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      logger.info('Updating agent status', { agentId: id, status });
      
      const agent = await agentService.updateAgentStatus(id, status);
      
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

      const response: ApiResponse = {
        success: true,
        data: agent
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error updating agent status:', error);
      next(error);
    }
  }

  async deleteAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Deleting agent', { agentId: id });
      
      const deleted = await agentService.deleteAgent(id);
      
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

      const response: ApiResponse = {
        success: true,
        data: { message: 'Agent deleted successfully' }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error deleting agent:', error);
      next(error);
    }
  }

  async getActiveAgents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching active agents');
      
      const agents = await agentService.getActiveAgents();
      
      const response: ApiResponse = {
        success: true,
        data: agents,
        meta: {
          total: agents.length
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching active agents:', error);
      next(error);
    }
  }

  async getAvailableCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching available collections');
      
      const collections = await databaseService.listAvailableCollections();
      
      const response: ApiResponse = {
        success: true,
        data: collections,
        meta: {
          total: collections.length
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching available collections:', error);
      next(error);
    }
  }
}

export const agentController = new AgentController();
