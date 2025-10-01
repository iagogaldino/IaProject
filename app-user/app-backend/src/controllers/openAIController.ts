import { Request, Response } from 'express';
import { aiApiService } from '../services/aiApiService';
import { Config } from '../config/config';
import { logger } from '../services/logger';

export class OpenAIController {
    constructor() {}

    async ask(req: Request, res: Response): Promise<void> {
        const prompt = req.body.prompt;
        const userId = req.body.userId;
        const sessionId = req.body.sessionId;
        const conversationHistory = req.body.conversationHistory || [];

        if (!req.body || !req.body.prompt) {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }

        try {
            logger.info('Processing request with AI Backend', {
                prompt: prompt.substring(0, 100) + '...',
                userId,
                sessionId
            });

            // Verificar se o AI Backend está disponível
            const isHealthy = await aiApiService.checkHealth();
            if (!isHealthy) {
                logger.warn('AI Backend is not healthy, using fallback');
                res.status(503).json({
                    error: 'AI service temporarily unavailable',
                    message: 'The AI service is currently unavailable. Please try again later.',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Usar o AI Backend para processar a solicitação
            const result = await aiApiService.processRequest({
                prompt,
                conversationHistory, // Reativado para processar histórico de conversa
                userId,
                sessionId,
                metadata: {
                    timestamp: new Date().toISOString(),
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }
            });

            logger.info('AI Backend response received', {
                agentUsed: result.agentUsed,
                requiresDatabase: result.requiresDatabase,
                processingTime: result.processingTime,
                confidence: result.confidence
            });

            // Preparar resposta com metadados
            const responseData: any = {
                data: result.response,
                userPrompt: prompt,
                agentUsed: result.agentUsed,
                requiresDatabase: result.requiresDatabase,
                processingTime: result.processingTime,
                confidence: result.confidence,
                // conversationHistory: conversationHistory // Temporariamente removido
            };

            // Adicionar dados do banco se disponíveis
            if (result.databaseData) {
                responseData.databaseData = result.databaseData;
            }

            // Adicionar query SQL se disponível
            if (result.sqlQuery) {
                responseData.sqlQuery = result.sqlQuery;
            }

            res.status(200).json(responseData);

        } catch (error: any) {
            logger.error('Error in ask method', error, {
                prompt: prompt.substring(0, 100) + '...',
                userId,
                sessionId
            });
            
            const errorResponse = {
                error: 'Internal server error',
                details: error.message,
                timestamp: new Date().toISOString()
            };

            if (error.message.includes('AI Backend')) {
                errorResponse['error'] = 'AI service error';
                errorResponse['details'] = 'Error communicating with AI service';
                res.status(502).json(errorResponse);
            } else {
                res.status(500).json(errorResponse);
            }
        }
    }
}