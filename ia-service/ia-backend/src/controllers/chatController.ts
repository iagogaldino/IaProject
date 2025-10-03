import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { chatService } from '../services/chatService';
import { agentService } from '../services/agentService';
import { logger } from '../services/logger';
import { ApiResponse, ChatRequest, ChatMessage } from '../types';
import { config } from '../config/config';

export class ChatController {
  async chatWithAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const chatRequest: ChatRequest = req.body;
      
      logger.info('Chat request received', { agentId: id });
      
      const response = await chatService.processAgentChat(id, chatRequest);
      
      const apiResponse: ApiResponse = {
        success: true,
        data: response
      };

      res.json(apiResponse);
    } catch (error: any) {
      logger.error('Error in agent chat:', error);
      
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

  async processAIRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('AI process request received');
      
      const response = await chatService.processAIRequest(req.body);
      
      res.json(response);
    } catch (error: any) {
      logger.error('Error processing AI request:', error);
      next(error);
    }
  }

  async forwardToExternalAI(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const externalUrl = 'http://localhost:3001/api/ai/process';
      
      logger.info('Forwarding request to external AI service', { url: externalUrl });
      
      const response = await axios.post(externalUrl, req.body, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.security.apiKey
        },
        timeout: config.externalServices.timeout
      });
      
      res.json(response.data);
    } catch (error: any) {
      logger.error('Error forwarding to external AI service:', error);
      
      if (error.response) {
        // External service returned an error
        res.status(error.response.status).json(error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        res.status(503).json({
          success: false,
          error: {
            message: 'External AI service is unavailable',
            code: 'SERVICE_UNAVAILABLE'
          }
        });
      } else {
        next(error);
      }
    }
  }

  async smartAgentConsultation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { query } = req.body;
      
      logger.info('Smart agent consultation request', { agentId: id, query });
      
      // Buscar agente especializado baseado na consulta
      const specialistAgent = await agentService.findSpecialistAgent(query);
      
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

      // Processar consulta com o agente especializado
      const chatRequest: ChatRequest = {
        messages: [
          {
            role: 'user' as const,
            content: query
          }
        ]
      };

      const response = await chatService.processAgentChat(specialistAgent.id, chatRequest);
      
      const apiResponse: ApiResponse = {
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
    } catch (error: any) {
      logger.error('Error in smart agent consultation:', error);
      next(error);
    }
  }
}

export const chatController = new ChatController();
