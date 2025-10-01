import axios from 'axios';
import { Config } from '../config/config';
import { logger } from './logger';

/**
 * Serviço para comunicação com o AI Backend
 */
export class AIApiService {
  private static instance: AIApiService;
  private aiBackendUrl: string;
  private apiKey: string;

  private constructor() {
    this.aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:3001';
    this.apiKey = process.env.AI_API_KEY || 'ai-backend-2024-abc123xyz789';
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AIApiService {
    if (!AIApiService.instance) {
      AIApiService.instance = new AIApiService();
    }
    return AIApiService.instance;
  }

  /**
   * Processa solicitação usando o AI Backend
   */
  async processRequest(request: {
    prompt: string;
    conversationHistory?: any[];
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    response: string;
    agentUsed: string;
    requiresDatabase: boolean;
    processingTime: number;
    confidence: number;
    databaseData?: any;
    sqlQuery?: string;
    metadata?: Record<string, any>;
  }> {
    try {
      logger.info('Sending request to AI Backend', {
        prompt: request.prompt.substring(0, 100) + '...',
        userId: request.userId,
        sessionId: request.sessionId
      });

      const url = `${this.aiBackendUrl}/api/ai/process`;
      logger.info('Sending request to AI Backend', {
        url,
        request: JSON.stringify(request, null, 2)
      });
      const response = await axios.post(url, request, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (response.status === 200 && response.data.success) {
        logger.info('AI Backend response received', {
          agentUsed: response.data.metadata.agentUsed,
          processingTime: response.data.metadata.processingTime,
          confidence: response.data.metadata.confidence
        });

        return {
          response: response.data.data,
          agentUsed: response.data.metadata.agentUsed,
          requiresDatabase: response.data.metadata.requiresDatabase,
          processingTime: response.data.metadata.processingTime,
          confidence: response.data.metadata.confidence,
          databaseData: response.data.metadata.databaseData,
          sqlQuery: response.data.metadata.sqlQuery,
          metadata: response.data.metadata
        };
      } else {
        throw new Error(`AI Backend returned error: ${response.data.message || 'Unknown error'}`);
      }

    } catch (error: any) {
      logger.error('Error communicating with AI Backend', error, {
        aiBackendUrl: this.aiBackendUrl,
        prompt: request.prompt.substring(0, 100) + '...'
      });

      // Fallback: retornar resposta de erro
      return {
        response: this.generateFallbackResponse(error),
        agentUsed: 'Fallback',
        requiresDatabase: false,
        processingTime: 0,
        confidence: 0.1,
        metadata: {
          error: error.message,
          fallback: true
        }
      };
    }
  }

  /**
   * Analisa a intenção do usuário
   */
  async analyzeIntent(request: {
    prompt: string;
    conversationHistory?: any[];
    userId?: string;
    sessionId?: string;
  }): Promise<{
    intent: string;
    requiresDatabase: boolean;
    confidence: number;
    suggestedAgent: string;
    reasoning?: string;
  }> {
    try {
      logger.info('Analyzing intent with AI Backend', {
        prompt: request.prompt.substring(0, 100) + '...'
      });

      const response = await axios.post(`${this.aiBackendUrl}/api/ai/analyze-intent`, request, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        timeout: 15000 // 15 seconds timeout
      });

      if (response.status === 200 && response.data.success) {
        logger.info('Intent analysis completed', {
          intent: response.data.data.intent,
          requiresDatabase: response.data.data.requiresDatabase,
          confidence: response.data.data.confidence
        });

        return response.data.data;
      } else {
        throw new Error(`Intent analysis failed: ${response.data.message || 'Unknown error'}`);
      }

    } catch (error: any) {
      logger.error('Error analyzing intent with AI Backend', error);

      // Fallback: análise simples
      return this.simpleIntentAnalysis(request.prompt);
    }
  }

  /**
   * Processa consulta ao banco de dados
   */
  async processDatabaseQuery(request: {
    prompt: string;
    conversationHistory?: any[];
    userId?: string;
    sessionId?: string;
  }): Promise<{
    response: string;
    databaseData: any;
    sqlQuery?: string;
    processingTime: number;
  }> {
    try {
      logger.info('Processing database query with AI Backend', {
        prompt: request.prompt.substring(0, 100) + '...'
      });

      const response = await axios.post(`${this.aiBackendUrl}/api/ai/database-query`, request, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (response.status === 200 && response.data.success) {
        logger.info('Database query completed', {
          processingTime: response.data.metadata.processingTime,
          sqlQuery: response.data.metadata.sqlQuery
        });

        return {
          response: response.data.data,
          databaseData: response.data.metadata.databaseData,
          sqlQuery: response.data.metadata.sqlQuery,
          processingTime: response.data.metadata.processingTime
        };
      } else {
        throw new Error(`Database query failed: ${response.data.message || 'Unknown error'}`);
      }

    } catch (error: any) {
      logger.error('Error processing database query with AI Backend', error);

      // Fallback: resposta de erro
      return {
        response: this.generateFallbackResponse(error),
        databaseData: [],
        processingTime: 0
      };
    }
  }

  /**
   * Processa consulta geral
   */
  async processGeneralQuery(request: {
    prompt: string;
    conversationHistory?: any[];
    userId?: string;
    sessionId?: string;
  }): Promise<{
    response: string;
    processingTime: number;
  }> {
    try {
      logger.info('Processing general query with AI Backend', {
        prompt: request.prompt.substring(0, 100) + '...'
      });

      const response = await axios.post(`${this.aiBackendUrl}/api/ai/general-query`, request, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        timeout: 15000 // 15 seconds timeout
      });

      if (response.status === 200 && response.data.success) {
        logger.info('General query completed', {
          processingTime: response.data.metadata.processingTime
        });

        return {
          response: response.data.data,
          processingTime: response.data.metadata.processingTime
        };
      } else {
        throw new Error(`General query failed: ${response.data.message || 'Unknown error'}`);
      }

    } catch (error: any) {
      logger.error('Error processing general query with AI Backend', error);

      // Fallback: resposta de erro
      return {
        response: this.generateFallbackResponse(error),
        processingTime: 0
      };
    }
  }

  /**
   * Verifica se o AI Backend está disponível
   */
  async checkHealth(): Promise<boolean> {
    try {
      const url = `${this.aiBackendUrl}/health`;
      const response = await axios.get(url, {
        timeout: 5000 // 5 seconds timeout
      });

      return response.status === 200 && response.data.status === 'healthy';
    } catch (error: any) {
      logger.error('AI Backend health check failed', error);
      return false;
    }
  }

  /**
   * Análise simples baseada em palavras-chave (fallback)
   */
  private simpleIntentAnalysis(prompt: string): {
    intent: string;
    requiresDatabase: boolean;
    confidence: number;
    suggestedAgent: string;
  } {
    const databaseKeywords = [
      'dados', 'relatório', 'estatística', 'número', 'valor', 'quantidade',
      'ação municipal', 'projeto', 'investimento', 'gasto', 'receita',
      'população', 'habitante', 'morador', 'cidade', 'município',
      'ano', 'mês', 'período', 'data', 'quando', 'quanto'
    ];

    const directResponseKeywords = [
      'olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'como funciona',
      'ajuda', 'help', 'explicar', 'o que é', 'como usar'
    ];

    const promptLower = prompt.toLowerCase();
    
    const hasDatabaseKeywords = databaseKeywords.some(keyword => 
      promptLower.includes(keyword)
    );
    
    const hasDirectKeywords = directResponseKeywords.some(keyword => 
      promptLower.includes(keyword)
    );

    if (hasDatabaseKeywords && !hasDirectKeywords) {
      return {
        intent: 'database_query',
        requiresDatabase: true,
        confidence: 0.8,
        suggestedAgent: 'DatabaseQueryAgent'
      };
    }

    return {
      intent: 'general_conversation',
      requiresDatabase: false,
      confidence: 0.7,
      suggestedAgent: 'DirectResponse'
    };
  }

  /**
   * Gera resposta de fallback em caso de erro
   */
  private generateFallbackResponse(error: any): string {
    return `
    <h2>Serviço Temporariamente Indisponível</h2>
    <p>Desculpe, o serviço de IA está temporariamente indisponível.</p>
    <p><strong>Detalhes do erro:</strong> ${error.message || 'Erro desconhecido'}</p>
    <p>Por favor, tente novamente em alguns instantes.</p>
    <p><em>Se o problema persistir, entre em contato com o suporte técnico.</em></p>
    `;
  }
}

// Export singleton instance
export const aiApiService = AIApiService.getInstance();
