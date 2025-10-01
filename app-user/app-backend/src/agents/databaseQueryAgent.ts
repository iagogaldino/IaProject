import { OpenAIService } from "../services/openAIService";
import { query } from "../services/postgresService";
import { Config } from "../config/config";

/**
 * Agente especializado em consultas ao banco de dados
 * Responsável por gerar queries SQL e formatar respostas com dados do banco
 */
export class DatabaseQueryAgent {
    private openAIService: OpenAIService;
    private sqlGenerationAgent: OpenAIService;
    private formattingAgent: OpenAIService;

    constructor() {
        this.openAIService = new OpenAIService();
        this.sqlGenerationAgent = new OpenAIService();
        this.formattingAgent = new OpenAIService();
    }

    /**
     * Processa uma consulta que requer dados do banco
     * @param userPrompt - Solicitação do usuário
     * @param conversationHistory - Histórico da conversa
     * @returns Resposta formatada com dados do banco
     */
    async processQuery(userPrompt: string, conversationHistory: any[] = []): Promise<{
        formattedResponse: string;
        databaseData: any;
        sqlQuery?: string;
        rawData?: any;
    }> {
        try {
            console.log('DatabaseQueryAgent: Processing query:', userPrompt);

            // 1. Gerar query SQL baseada na solicitação
            const sqlQuery = await this.generateSQLQuery(userPrompt, conversationHistory);
            console.log('Generated SQL query:', sqlQuery);

            // 2. Executar query no banco de dados
            const databaseResult = await this.executeDatabaseQuery(sqlQuery);
            console.log('Database query executed, rows returned:', databaseResult.rows?.length || 0);

            // 3. Formatar resposta com os dados obtidos
            const formattedResponse = await this.formatResponseWithData(
                userPrompt, 
                databaseResult, 
                conversationHistory
            );

            return {
                formattedResponse,
                databaseData: databaseResult.rows,
                sqlQuery,
                rawData: databaseResult
            };

        } catch (error: any) {
            console.error('Error in DatabaseQueryAgent:', error);
            
            // Em caso de erro, tentar resposta com dados gerais
            return await this.handleQueryError(userPrompt, error, conversationHistory);
        }
    }

    /**
     * Gera query SQL baseada na solicitação do usuário
     */
    private async generateSQLQuery(userPrompt: string, conversationHistory: any[]): Promise<string> {
        const sqlGenerationPrompt = `
        Com base na solicitação do usuário, gere uma query SQL para buscar as informações necessárias na tabela 'relatorio_texto'.

        ESTRUTURA DA TABELA:
        - id: integer (chave primária)
        - texto: character varying (conteúdo do relatório)

        SOLICITAÇÃO DO USUÁRIO: "${userPrompt}"

        HISTÓRICO DA CONVERSA:
        ${this.formatConversationHistory(conversationHistory)}

        REGRAS IMPORTANTES:
        1. Gere APENAS a query SQL, sem explicações ou formatação markdown
        2. Use PostgreSQL syntax
        3. Se a solicitação for muito genérica, use: SELECT * FROM relatorio_texto LIMIT 10
        4. Se precisar buscar por texto específico, use ILIKE para busca case-insensitive
        5. Sempre limite os resultados para evitar sobrecarga (LIMIT 50)
        6. Se não conseguir gerar uma query específica, use: SELECT * FROM relatorio_texto LIMIT 20

        EXEMPLOS:
        - "Quantos relatórios temos?" → SELECT COUNT(*) FROM relatorio_texto
        - "Buscar relatórios sobre saúde" → SELECT * FROM relatorio_texto WHERE texto ILIKE '%saúde%' LIMIT 20
        - "Mostrar todos os relatórios" → SELECT * FROM relatorio_texto LIMIT 50

        Query SQL:
        `;

        const sqlResponse = await this.sqlGenerationAgent.ask(sqlGenerationPrompt);
        
        // Limpar a resposta para extrair apenas a query SQL
        const cleanQuery = sqlResponse
            .replace(/```sql/gi, '')
            .replace(/```/gi, '')
            .replace(/`/g, '')
            .trim()
            .split('\n')[0]; // Pegar apenas a primeira linha

        console.log('Cleaned SQL query:', cleanQuery);
        return cleanQuery;
    }

    /**
     * Executa a query SQL no banco de dados
     */
    private async executeDatabaseQuery(sqlQuery: string): Promise<any> {
        try {
            console.log('Executing SQL query:', sqlQuery);
            const result = await query(sqlQuery);
            console.log('Query executed successfully, rows:', result.rows?.length || 0);
            return result;
        } catch (error: any) {
            console.error('Database query error:', error);
            
            // Se a query falhar, tentar uma query mais simples
            console.log('Falling back to simple query');
            const fallbackResult = await query("SELECT * FROM relatorio_texto LIMIT 10");
            return fallbackResult;
        }
    }

    /**
     * Formata a resposta com os dados obtidos do banco
     */
    private async formatResponseWithData(
        userPrompt: string, 
        databaseResult: any, 
        conversationHistory: any[]
    ): Promise<string> {
        const formattingPrompt = `
        Você é um assistente municipal especializado em fornecer informações sobre ações e relatórios municipais.

        DADOS OBTIDOS DO BANCO:
        ${JSON.stringify(databaseResult.rows, null, 2)}

        SOLICITAÇÃO DO USUÁRIO: "${userPrompt}"

        HISTÓRICO DA CONVERSA:
        ${this.formatConversationHistory(conversationHistory)}

        INSTRUÇÕES DE FORMATAÇÃO:
        - Sempre formate suas respostas usando HTML para melhor legibilidade
        - Use tags HTML apropriadas: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <br>
        - Organize informações em listas quando apropriado
        - Destaque pontos importantes com <strong> ou <em>
        - Use quebras de linha <br> para separar seções
        - Se houver dados numéricos, organize em tabelas usando <table>, <tr>, <td>
        - Mantenha um tom profissional mas acessível
        - Se não houver informações suficientes, seja honesto sobre isso
        - Use o contexto da conversa para dar respostas mais relevantes

        EXEMPLO DE FORMATAÇÃO:
        <h2>Resumo dos Dados</h2>
        <p>Com base na sua solicitação, aqui estão as informações encontradas:</p>
        
        <h3>Principais Resultados</h3>
        <ul>
          <li><strong>Total de registros:</strong> ${databaseResult.rows?.length || 0}</li>
        </ul>

        <h3>Dados Detalhados</h3>
        <table>
          <tr><td><strong>ID</strong></td><td><strong>Conteúdo</strong></td></tr>
          ${databaseResult.rows?.map((row: any) => 
            `<tr><td>${row.id}</td><td>${row.texto?.substring(0, 100)}...</td></tr>`
          ).join('') || '<tr><td colspan="2">Nenhum dado encontrado</td></tr>'}
        </table>

        <p><em>Esta informação foi gerada com base nos dados municipais disponíveis.</em></p>

        Responda de forma completa e útil, usando os dados fornecidos.
        `;

        return await this.formattingAgent.ask(formattingPrompt);
    }

    /**
     * Trata erros na consulta ao banco de dados
     */
    private async handleQueryError(
        userPrompt: string, 
        error: any, 
        conversationHistory: any[]
    ): Promise<{
        formattedResponse: string;
        databaseData: any;
    }> {
        console.log('Handling query error, providing fallback response');

        // Tentar obter dados gerais como fallback
        try {
            const fallbackResult = await query("SELECT * FROM relatorio_texto LIMIT 5");
            
            const errorResponse = `
            <h2>Informação Disponível</h2>
            <p>Houve um problema ao processar sua solicitação específica, mas aqui estão algumas informações gerais disponíveis:</p>
            
            <h3>Dados Gerais</h3>
            <p>Total de registros disponíveis: ${fallbackResult.rows?.length || 0}</p>
            
            <p><em>Nota: Não foi possível processar sua solicitação específica devido a: ${error.message}</em></p>
            `;

            return {
                formattedResponse: errorResponse,
                databaseData: fallbackResult.rows || []
            };

        } catch (fallbackError) {
            const errorResponse = `
            <h2>Erro no Sistema</h2>
            <p>Desculpe, não foi possível acessar os dados no momento. Tente novamente em alguns instantes.</p>
            <p><em>Erro: ${error.message}</em></p>
            `;

            return {
                formattedResponse: errorResponse,
                databaseData: []
            };
        }
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
