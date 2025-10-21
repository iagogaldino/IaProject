import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from '../services/logger';

export class AIController {
    private aiBackendUrl: string;
    private apiKey: string;
    private agentId: string;

    constructor() {
        this.aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:3001';
        this.apiKey = process.env.AI_API_KEY || 'ai-backend-2024-abc123xyz789';
        this.agentId = process.env.AI_AGENT_ID || '68dd37501d9bfcc29e34574b';
        
        logger.info('AIController initialized', {
            aiBackendUrl: this.aiBackendUrl,
            agentId: this.agentId,
            apiKey: this.apiKey.substring(0, 10) + '...'
        });
    }

    async ask(req: Request, res: Response): Promise<void> {
        const { prompt, userId, sessionId, conversationHistory = [] } = req.body;

        // Log da requisição recebida para debug
        logger.info('Request received', {
            body: req.body,
            headers: req.headers,
            method: req.method,
            url: req.url
        });

        if (!prompt) {
            logger.warn('Missing prompt in request', { body: req.body });
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }

        // Validar se conversationHistory é um array
        if (conversationHistory && !Array.isArray(conversationHistory)) {
            logger.warn('Invalid conversationHistory format', { conversationHistory });
            res.status(400).json({ error: 'conversationHistory must be an array' });
            return;
        }

        try {
            logger.info('Processing AI request', {
                prompt: prompt.substring(0, 100) + '...',
                userId,
                sessionId,
                aiBackendUrl: this.aiBackendUrl,
                agentId: this.agentId,
                originalConversationHistory: conversationHistory
            });

            // Converter conversationHistory do formato do frontend para o formato da API externa
            // Por enquanto, enviar apenas mensagens do usuário para evitar problemas de validação
            const convertedHistory = conversationHistory
                .filter((msg: any) => {
                    // Validar estrutura da mensagem
                    if (!msg || typeof msg !== 'object') {
                        logger.warn('Invalid message format', { msg });
                        return false;
                    }
                    if (!msg.sender || !msg.text) {
                        logger.warn('Missing required fields in message', { msg });
                        return false;
                    }
                    // Por enquanto, enviar apenas mensagens do usuário
                    return msg.sender === 'user';
                })
                .map((msg: any) => ({
                    role: 'user',
                    content: msg.text
                }));

            // Preparar mensagens para a nova API
            const messages = [
                ...convertedHistory,
                {
                    role: 'user',
                    content: prompt
                }
            ];

            const requestData = { messages };
            const requestUrl = `${this.aiBackendUrl}/api/agents/${this.agentId}/chat`;

            logger.info('Sending request to AI Backend', {
                url: requestUrl,
                requestData: JSON.stringify(requestData, null, 2),
                apiKey: this.apiKey.substring(0, 10) + '...',
                convertedHistory: convertedHistory
            });

            // Fazer requisição para a nova API
            const response = await axios.post(
                requestUrl,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': this.apiKey
                    },
                    timeout: 30000 // 30 seconds timeout
                }
            );

            logger.info('AI response received', {
                status: response.status,
                userId,
                sessionId,
                responseData: response.data
            });

            // Extrair o conteúdo da resposta da API externa
            let aiResponse = '';
            if (response.data && response.data.data && response.data.data.response) {
                aiResponse = response.data.data.response.content;
            } else if (response.data && response.data.response) {
                aiResponse = response.data.response.content;
            } else if (typeof response.data === 'string') {
                aiResponse = response.data;
            } else {
                // Fallback: tentar extrair de qualquer estrutura
                aiResponse = JSON.stringify(response.data);
            }

            logger.info('Extracted AI response', {
                aiResponse: aiResponse.substring(0, 100) + '...',
                userId,
                sessionId
            });

            // Retornar resposta formatada
            res.status(200).json({
                data: aiResponse,
                userPrompt: prompt,
                userId,
                sessionId,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Error processing AI request', error, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                prompt: prompt.substring(0, 100) + '...',
                userId,
                sessionId
            });

            const errorResponse = {
                error: 'AI service error',
                details: error.message,
                timestamp: new Date().toISOString()
            };

            if (error.response) {
                // Erro da API externa
                const statusCode = error.response.status;
                const responseData = error.response.data;
                
                logger.error('AI Backend error response', error, {
                    statusCode: statusCode,
                    data: responseData,
                    headers: error.response.headers
                });

                res.status(statusCode).json({
                    ...errorResponse,
                    details: responseData?.message || responseData?.error || error.message,
                    aiBackendError: responseData,
                    statusCode
                });
            } else if (error.code === 'ECONNREFUSED') {
                // Serviço indisponível
                res.status(503).json({
                    error: 'AI service unavailable',
                    message: 'The AI service is currently unavailable. Please try again later.',
                    timestamp: new Date().toISOString()
                });
            } else {
                // Outros erros
                res.status(500).json(errorResponse);
            }
        }
    }

    async testConnection(req: Request, res: Response): Promise<void> {
        try {
            logger.info('Testing AI Backend connection', {
                aiBackendUrl: this.aiBackendUrl,
                agentId: this.agentId
            });

            // Teste simples com uma mensagem básica
            const testMessages = [
                {
                    role: 'user',
                    content: 'Hello, this is a test message.'
                }
            ];

            const response = await axios.post(
                `${this.aiBackendUrl}/api/agents/${this.agentId}/chat`,
                { messages: testMessages },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': this.apiKey
                    },
                    timeout: 10000 // 10 seconds timeout
                }
            );

            logger.info('AI Backend connection test successful', {
                status: response.status,
                data: response.data
            });

            res.status(200).json({
                success: true,
                message: 'AI Backend connection successful',
                status: response.status,
                data: response.data,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('AI Backend connection test failed', error, {
                aiBackendUrl: this.aiBackendUrl,
                agentId: this.agentId
            });

            res.status(500).json({
                success: false,
                error: 'AI Backend connection failed',
                details: error.message,
                status: error.response?.status,
                responseData: error.response?.data,
                timestamp: new Date().toISOString()
            });
        }
    }

    async validateRequest(req: Request, res: Response): Promise<void> {
        try {
            const { prompt, conversationHistory = [] } = req.body;

            logger.info('Validating request structure', {
                body: req.body,
                prompt: prompt,
                conversationHistoryLength: conversationHistory.length
            });

            // Validar prompt
            if (!prompt) {
                res.status(400).json({ 
                    error: 'Prompt is required',
                    received: req.body 
                });
                return;
            }

            // Validar conversationHistory
            if (!Array.isArray(conversationHistory)) {
                res.status(400).json({ 
                    error: 'conversationHistory must be an array',
                    received: conversationHistory 
                });
                return;
            }

            // Validar cada mensagem
            const invalidMessages = [];
            for (let i = 0; i < conversationHistory.length; i++) {
                const msg = conversationHistory[i];
                if (!msg || typeof msg !== 'object') {
                    invalidMessages.push(`Message ${i}: Not an object`);
                } else if (!msg.sender) {
                    invalidMessages.push(`Message ${i}: Missing sender field`);
                } else if (!msg.text) {
                    invalidMessages.push(`Message ${i}: Missing text field`);
                } else if (!['user', 'assistant'].includes(msg.sender)) {
                    invalidMessages.push(`Message ${i}: Invalid sender '${msg.sender}'`);
                }
            }

            if (invalidMessages.length > 0) {
                res.status(400).json({ 
                    error: 'Invalid message format',
                    invalidMessages,
                    received: conversationHistory 
                });
                return;
            }

            // Simular conversão (apenas mensagens do usuário por enquanto)
            const convertedHistory = conversationHistory
                .filter((msg: any) => msg.sender === 'user')
                .map((msg: any) => ({
                    role: 'user',
                    content: msg.text
                }));

            res.status(200).json({
                success: true,
                message: 'Request structure is valid',
                validation: {
                    prompt: prompt,
                    originalHistoryLength: conversationHistory.length,
                    convertedHistoryLength: convertedHistory.length,
                    convertedHistory: convertedHistory
                }
            });

        } catch (error: any) {
            logger.error('Error validating request', error, {
                body: req.body
            });

            res.status(500).json({
                error: 'Validation error',
                details: error.message
            });
        }
    }
}
