import { OpenAIService } from "../services/openAIService";
import { Config } from "../config/config";
import { DatabaseQueryAgent } from "./databaseQueryAgent";

/**
 * Agente principal responsável pela comunicação com o usuário
 * Decide quando chamar outros agentes especializados baseado na solicitação
 */
export class UserCommunicationAgent {
    private openAIService: OpenAIService;
    private databaseQueryAgent: DatabaseQueryAgent;

    constructor() {
        this.openAIService = new OpenAIService();
        this.databaseQueryAgent = new DatabaseQueryAgent();
    }

    /**
     * Processa a solicitação do usuário e decide qual agente usar
     * @param userPrompt - Solicitação do usuário
     * @param conversationHistory - Histórico da conversa
     * @returns Resposta processada
     */
    async processUserRequest(userPrompt: string, conversationHistory: any[] = []): Promise<{
        response: string;
        agentUsed: string;
        requiresDatabase: boolean;
        databaseData?: any;
    }> {
        try {
            // 1. Analisar se a solicitação requer consulta ao banco de dados
            const analysisResult = await this.analyzeUserIntent(userPrompt, conversationHistory);
            
            console.log('User intent analysis:', analysisResult);

            // 2. Se requer consulta ao banco, usar DatabaseQueryAgent
            if (analysisResult.requiresDatabase) {
                console.log('Using DatabaseQueryAgent for database-related query');
                const dbResult = await this.databaseQueryAgent.processQuery(userPrompt, conversationHistory);
                
                return {
                    response: dbResult.formattedResponse,
                    agentUsed: 'DatabaseQueryAgent',
                    requiresDatabase: true,
                    databaseData: dbResult.databaseData
                };
            }

            // 3. Se não requer banco, usar resposta direta
            console.log('Using direct response for general query');
            const directResponse = await this.generateDirectResponse(userPrompt, conversationHistory);
            
            return {
                response: directResponse,
                agentUsed: 'DirectResponse',
                requiresDatabase: false
            };

        } catch (error: any) {
            console.error('Error in UserCommunicationAgent:', error);
            throw new Error(`Erro no processamento da solicitação: ${error.message}`);
        }
    }

    /**
     * Analisa a intenção do usuário para determinar se precisa de consulta ao banco
     */
    private async analyzeUserIntent(userPrompt: string, conversationHistory: any[]): Promise<{
        requiresDatabase: boolean;
        intent: string;
        confidence: number;
    }> {
        const analysisPrompt = `
        Analise a seguinte solicitação do usuário e determine se ela requer consulta ao banco de dados.

        CONTEXTO: Você é um assistente municipal que tem acesso a dados sobre ações municipais e relatórios.

        SOLICITAÇÃO DO USUÁRIO: "${userPrompt}"

        HISTÓRICO DA CONVERSA:
        ${this.formatConversationHistory(conversationHistory)}

        Responda APENAS com um JSON no seguinte formato:
        {
            "requiresDatabase": true/false,
            "intent": "descrição da intenção",
            "confidence": 0.0-1.0,
            "reasoning": "explicação do raciocínio"
        }

        CRITÉRIOS PARA REQUERER BANCO DE DADOS:
        - Perguntas sobre dados específicos, estatísticas, relatórios
        - Solicitações de informações sobre ações municipais
        - Consultas sobre números, valores, datas específicas
        - Perguntas que precisam de dados da tabela relatorio_texto

        CRITÉRIOS PARA RESPOSTA DIRETA:
        - Saudações, cumprimentos
        - Perguntas gerais sobre o funcionamento do sistema
        - Explicações conceituais
        - Perguntas que não requerem dados específicos
        `;

        try {
            const analysisResponse = await this.openAIService.ask(analysisPrompt);
            
            // Tentar extrair JSON da resposta
            const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                return {
                    requiresDatabase: analysis.requiresDatabase || false,
                    intent: analysis.intent || 'unknown',
                    confidence: analysis.confidence || 0.5
                };
            }

            // Fallback: análise simples baseada em palavras-chave
            return this.simpleIntentAnalysis(userPrompt);

        } catch (error) {
            console.error('Error in intent analysis, using fallback:', error);
            return this.simpleIntentAnalysis(userPrompt);
        }
    }

    /**
     * Análise simples baseada em palavras-chave (fallback)
     */
    private simpleIntentAnalysis(userPrompt: string): {
        requiresDatabase: boolean;
        intent: string;
        confidence: number;
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

        const promptLower = userPrompt.toLowerCase();
        
        const hasDatabaseKeywords = databaseKeywords.some(keyword => 
            promptLower.includes(keyword)
        );
        
        const hasDirectKeywords = directResponseKeywords.some(keyword => 
            promptLower.includes(keyword)
        );

        if (hasDatabaseKeywords && !hasDirectKeywords) {
            return {
                requiresDatabase: true,
                intent: 'database_query',
                confidence: 0.8
            };
        }

        return {
            requiresDatabase: false,
            intent: 'general_conversation',
            confidence: 0.7
        };
    }

    /**
     * Gera resposta direta para solicitações que não requerem banco de dados
     */
    private async generateDirectResponse(userPrompt: string, conversationHistory: any[]): Promise<string> {
        const directResponsePrompt = `
        Você é um assistente municipal amigável e prestativo.

        HISTÓRICO DA CONVERSA:
        ${this.formatConversationHistory(conversationHistory)}

        SOLICITAÇÃO DO USUÁRIO: "${userPrompt}"

        INSTRUÇÕES:
        - Responda de forma amigável e profissional
        - Se for uma saudação, responda cordialmente
        - Se for uma pergunta sobre o sistema, explique como funciona
        - Se for uma pergunta conceitual, responda baseado no seu conhecimento
        - Use HTML para formatação quando apropriado
        - Se não souber a resposta, seja honesto e sugira como posso ajudar

        Formate sua resposta usando HTML para melhor legibilidade.
        `;

        return await this.openAIService.ask(directResponsePrompt);
    }

    /**
     * Formata o histórico da conversa para uso nos prompts
     */
    private formatConversationHistory(conversationHistory: any[]): string {
        if (!conversationHistory || conversationHistory.length === 0) {
            return 'Nenhum histórico de conversa disponível.';
        }

        return conversationHistory.map((msg, index) => {
            const role = msg.sender === 'user' ? 'Usuário' : 'Assistente';
            return `${role}: ${msg.text}`;
        }).join('\n');
    }
}
