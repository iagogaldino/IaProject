import { UserCommunicationAgent } from "./userCommunicationAgent";
import { DatabaseQueryAgent } from "./databaseQueryAgent";
import { Config } from "../config/config";

/**
 * Sistema de roteamento de agentes
 * Coordena qual agente usar baseado na solicitação do usuário
 */
export class AgentRouter {
    private userCommunicationAgent: UserCommunicationAgent;
    private databaseQueryAgent: DatabaseQueryAgent;

    constructor() {
        this.userCommunicationAgent = new UserCommunicationAgent();
        this.databaseQueryAgent = new DatabaseQueryAgent();
    }

    /**
     * Roteia a solicitação para o agente apropriado
     * @param userPrompt - Solicitação do usuário
     * @param conversationHistory - Histórico da conversa
     * @returns Resposta processada com metadados
     */
    async routeRequest(userPrompt: string, conversationHistory: any[] = []): Promise<{
        response: string;
        agentUsed: string;
        requiresDatabase: boolean;
        databaseData?: any;
        sqlQuery?: string;
        processingTime: number;
        confidence: number;
    }> {
        const startTime = Date.now();
        
        try {
            console.log('AgentRouter: Routing request:', userPrompt.substring(0, 100) + '...');

            // Validar configuração da API
            if (!Config.isOpenAIKeyValid()) {
                throw new Error('OpenAI API key not configured properly');
            }

            // Usar o agente principal de comunicação para decidir o roteamento
            const result = await this.userCommunicationAgent.processUserRequest(
                userPrompt, 
                conversationHistory
            );

            const processingTime = Date.now() - startTime;

            // Adicionar metadados de processamento
            return {
                ...result,
                processingTime,
                confidence: result.requiresDatabase ? 0.9 : 0.8
            };

        } catch (error: any) {
            console.error('Error in AgentRouter:', error);
            
            const processingTime = Date.now() - startTime;
            
            // Resposta de erro com fallback
            return {
                response: this.generateErrorResponse(error),
                agentUsed: 'ErrorHandler',
                requiresDatabase: false,
                processingTime,
                confidence: 0.1
            };
        }
    }

    /**
     * Processa uma solicitação específica para consulta ao banco de dados
     * @param userPrompt - Solicitação do usuário
     * @param conversationHistory - Histórico da conversa
     * @returns Resposta com dados do banco
     */
    async processDatabaseQuery(userPrompt: string, conversationHistory: any[] = []): Promise<{
        response: string;
        databaseData: any;
        sqlQuery?: string;
        processingTime: number;
    }> {
        const startTime = Date.now();
        
        try {
            console.log('AgentRouter: Processing database query:', userPrompt.substring(0, 100) + '...');

            const result = await this.databaseQueryAgent.processQuery(userPrompt, conversationHistory);
            const processingTime = Date.now() - startTime;

            return {
                response: result.formattedResponse,
                databaseData: result.databaseData,
                sqlQuery: result.sqlQuery,
                processingTime
            };

        } catch (error: any) {
            console.error('Error in database query processing:', error);
            
            const processingTime = Date.now() - startTime;
            
            return {
                response: this.generateErrorResponse(error),
                databaseData: [],
                processingTime
            };
        }
    }

    /**
     * Processa uma solicitação geral (sem banco de dados)
     * @param userPrompt - Solicitação do usuário
     * @param conversationHistory - Histórico da conversa
     * @returns Resposta direta
     */
    async processGeneralQuery(userPrompt: string, conversationHistory: any[] = []): Promise<{
        response: string;
        processingTime: number;
    }> {
        const startTime = Date.now();
        
        try {
            console.log('AgentRouter: Processing general query:', userPrompt.substring(0, 100) + '...');

            // Usar o agente de comunicação para resposta direta
            const result = await this.userCommunicationAgent.processUserRequest(
                userPrompt, 
                conversationHistory
            );

            const processingTime = Date.now() - startTime;

            return {
                response: result.response,
                processingTime
            };

        } catch (error: any) {
            console.error('Error in general query processing:', error);
            
            const processingTime = Date.now() - startTime;
            
            return {
                response: this.generateErrorResponse(error),
                processingTime
            };
        }
    }

    /**
     * Analisa a intenção do usuário para determinar o tipo de processamento
     * @param userPrompt - Solicitação do usuário
     * @param conversationHistory - Histórico da conversa
     * @returns Análise da intenção
     */
    async analyzeUserIntent(userPrompt: string, conversationHistory: any[] = []): Promise<{
        intent: string;
        requiresDatabase: boolean;
        confidence: number;
        suggestedAgent: string;
    }> {
        try {
            // Usar análise do agente principal
            const analysis = await this.userCommunicationAgent['analyzeUserIntent'](
                userPrompt, 
                conversationHistory
            );

            return {
                intent: analysis.intent,
                requiresDatabase: analysis.requiresDatabase,
                confidence: analysis.confidence,
                suggestedAgent: analysis.requiresDatabase ? 'DatabaseQueryAgent' : 'DirectResponse'
            };

        } catch (error) {
            console.error('Error in intent analysis:', error);
            
            return {
                intent: 'unknown',
                requiresDatabase: false,
                confidence: 0.1,
                suggestedAgent: 'DirectResponse'
            };
        }
    }

    /**
     * Gera resposta de erro padronizada
     */
    private generateErrorResponse(error: any): string {
        return `
        <h2>Erro no Sistema</h2>
        <p>Desculpe, ocorreu um erro ao processar sua solicitação.</p>
        <p><strong>Detalhes do erro:</strong> ${error.message || 'Erro desconhecido'}</p>
        <p>Por favor, tente novamente em alguns instantes ou reformule sua pergunta.</p>
        <p><em>Se o problema persistir, entre em contato com o suporte técnico.</em></p>
        `;
    }

    /**
     * Obtém estatísticas de uso dos agentes
     */
    getAgentStats(): {
        totalRequests: number;
        databaseQueries: number;
        generalQueries: number;
        errorRate: number;
    } {
        // Implementar estatísticas se necessário
        return {
            totalRequests: 0,
            databaseQueries: 0,
            generalQueries: 0,
            errorRate: 0
        };
    }
}
