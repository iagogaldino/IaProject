"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const agentService_1 = require("./agentService");
const openaiService_1 = require("./openaiService");
const databaseService_1 = require("./databaseService");
const fileService_1 = require("./fileService");
const logger_1 = require("./logger");
class ChatService {
    async processAgentChat(agentId, chatRequest) {
        try {
            logger_1.logger.info('Processing agent chat', { agentId, messageCount: chatRequest.messages.length });
            const agent = await agentService_1.agentService.getAgentById(agentId);
            if (!agent) {
                throw new Error(`Agent with ID ${agentId} not found`);
            }
            if (agent.status !== 'active') {
                throw new Error(`Agent ${agentId} is not active`);
            }
            const lastMessage = chatRequest.messages[chatRequest.messages.length - 1];
            const shouldConsultSpecialists = this.shouldConsultSpecialists(lastMessage.content);
            const shouldQueryDatabase = this.shouldQueryDatabase(lastMessage.content, agent);
            const shouldProcessFiles = this.shouldProcessFiles(lastMessage.content, agent);
            let response;
            if (shouldQueryDatabase) {
                response = await this.queryDatabase(agent, lastMessage.content);
            }
            else if (shouldProcessFiles) {
                response = await this.processFiles(agent, lastMessage.content);
            }
            else if (shouldConsultSpecialists) {
                response = await this.consultSpecialistAgents(agent, lastMessage.content);
            }
            else {
                const systemPrompt = this.createSystemPrompt(agent);
                response = await openaiService_1.openaiService.processMessage(chatRequest.messages, systemPrompt);
            }
            const chatResponse = {
                agentId: agentId,
                response: {
                    role: 'agent',
                    content: response
                }
            };
            logger_1.logger.info('Agent chat processed successfully', {
                agentId,
                responseLength: response.length
            });
            return chatResponse;
        }
        catch (error) {
            logger_1.logger.error('Error processing agent chat:', error);
            throw error;
        }
    }
    async processAIRequest(request) {
        try {
            logger_1.logger.info('Processing AI request', {
                hasPrompt: !!request.prompt,
                hasConversationHistory: !!request.conversationHistory,
                userId: request.userId
            });
            const messages = [];
            if (request.conversationHistory && Array.isArray(request.conversationHistory)) {
                request.conversationHistory.forEach((msg) => {
                    if (msg.sender && msg.text) {
                        messages.push({
                            role: msg.sender === 'user' ? 'user' : 'agent',
                            content: msg.text
                        });
                    }
                });
            }
            if (request.prompt) {
                messages.push({
                    role: 'user',
                    content: request.prompt
                });
            }
            const systemPrompt = 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.';
            const response = await openaiService_1.openaiService.processMessage(messages, systemPrompt);
            const aiResponse = {
                success: true,
                data: response,
                metadata: {
                    processingTime: Date.now(),
                    model: 'gpt-3.5-turbo',
                    confidence: 0.9
                }
            };
            logger_1.logger.info('AI request processed successfully', {
                responseLength: response.length,
                userId: request.userId
            });
            return aiResponse;
        }
        catch (error) {
            logger_1.logger.error('Error processing AI request:', error);
            throw error;
        }
    }
    createSystemPrompt(agent) {
        let prompt = `You are an AI agent named "${agent.name}". `;
        if (agent.description) {
            prompt += `Description: ${agent.description}. `;
        }
        prompt += `You should respond in a helpful and professional manner, staying true to your role and purpose. `;
        if (agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
            prompt += `You can communicate with other agents when needed. `;
        }
        prompt += `\n\nAvailable specialist agents and their information:\n`;
        prompt += `- Assistant obras (ID: 68dd38f0221b326224e81974): Specializes in construction and works information. Total cost of work: 500 reais.\n`;
        prompt += `- Assistente vendas (ID: 68dd38f0221b326224e81975): Specializes in sales information. Total de vendas hoje foi de 600 reais.\n\n`;
        if (agent.fileAccess?.enabled) {
            prompt += `📁 FILE PROCESSING CAPABILITIES (Powered by OpenAI):\n`;
            prompt += `You have advanced AI-powered file processing capabilities. `;
            prompt += `Supported file types: ${agent.fileAccess.allowedFileTypes.join(', ')}. `;
            prompt += `Maximum file size: ${Math.round(agent.fileAccess.maxFileSize / 1024 / 1024)}MB.\n\n`;
            prompt += `🤖 AI-Powered Operations:\n`;
            prompt += `- **Read & Explain**: "leia o arquivo [nome]" - AI reads and explains content in detail\n`;
            prompt += `- **Deep Analysis**: "analise o arquivo [nome]" - AI provides comprehensive analysis with insights\n`;
            prompt += `- **Smart Summarization**: "resuma o arquivo [nome]" - AI creates structured summaries\n`;
            prompt += `- **Information Extraction**: "extraia informações do arquivo [nome]" - AI extracts key data and entities\n`;
            prompt += `- **List Files**: "listar arquivos" - Shows available files for processing\n\n`;
            prompt += `The AI will provide structured, detailed responses with:\n`;
            prompt += `- Executive summaries and key insights\n`;
            prompt += `- Sentiment and tone analysis\n`;
            prompt += `- Important entities and statistics\n`;
            prompt += `- Recommendations and context\n`;
            prompt += `- Metadata and word counts\n\n`;
        }
        prompt += `IMPORTANT: When users ask about specific topics, you have direct access to this information and should provide it immediately. `;
        prompt += `For example: if asked about "total de vendas" or "vendas", respond with "O total de vendas hoje foi de 600 reais". `;
        prompt += `If asked about "obra" or "gasto na obra", respond with "O total gasto na obra foi 500 reais". `;
        prompt += `Always provide clear, accurate, and relevant responses based on this information.`;
        return prompt;
    }
    shouldConsultSpecialists(message) {
        const lowerMessage = message.toLowerCase();
        const salesKeywords = ['vendas', 'venda', 'total de vendas', 'vendas hoje'];
        const constructionKeywords = ['obra', 'obras', 'gasto', 'gastos', 'total gasto'];
        const databaseKeywords = ['consulte', 'consulta', 'busque', 'buscar', 'dados', 'informações', 'metadados', 'texto'];
        return salesKeywords.some(keyword => lowerMessage.includes(keyword)) ||
            constructionKeywords.some(keyword => lowerMessage.includes(keyword)) ||
            databaseKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    async consultSpecialistAgents(agent, query) {
        try {
            const lowerQuery = query.toLowerCase();
            if (lowerQuery.includes('consulte') || lowerQuery.includes('consulta') ||
                lowerQuery.includes('busque') || lowerQuery.includes('buscar') ||
                lowerQuery.includes('dados') || lowerQuery.includes('informações') ||
                lowerQuery.includes('metadados') || lowerQuery.includes('texto')) {
                const databaseAgent = await agentService_1.agentService.getAgentById('68dd625e8be0682166a76f97');
                if (databaseAgent && databaseAgent.databaseAccess?.enabled) {
                    const chatRequest = {
                        messages: [
                            {
                                role: 'user',
                                content: query
                            }
                        ]
                    };
                    const response = await this.processAgentChat(databaseAgent.id, chatRequest);
                    return `${response.response.content} (Informação obtida do ${databaseAgent.name})`;
                }
            }
            if (lowerQuery.includes('vendas') || lowerQuery.includes('venda')) {
                const salesAgent = await agentService_1.agentService.getAgentById('68dd38f0221b326224e81975');
                if (salesAgent) {
                    return `O total de vendas hoje foi de 600 reais. (Informação obtida do ${salesAgent.name})`;
                }
            }
            if (lowerQuery.includes('obra') || lowerQuery.includes('gasto')) {
                const constructionAgent = await agentService_1.agentService.getAgentById('68dd38f0221b326224e81974');
                if (constructionAgent) {
                    return `O total gasto na obra foi 500 reais. (Informação obtida do ${constructionAgent.name})`;
                }
            }
            return `Vou consultar os agentes especializados para obter essa informação.`;
        }
        catch (error) {
            logger_1.logger.error('Error consulting specialist agents:', error);
            return `Desculpe, não consegui consultar os agentes especializados no momento.`;
        }
    }
    shouldQueryDatabase(message, agent) {
        if (!agent.databaseAccess?.enabled) {
            return false;
        }
        const lowerMessage = message.toLowerCase();
        const databaseKeywords = [
            'consulte', 'consulta', 'busque', 'buscar', 'encontre', 'encontrar',
            'dados', 'informações', 'registros', 'tabela', 'coleção',
            'quantos', 'quantas', 'listar', 'mostrar', 'exibir',
            'metadados', 'metadata', 'texto', 'conteúdo'
        ];
        return databaseKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    shouldProcessFiles(message, agent) {
        if (!agent.fileAccess?.enabled) {
            return false;
        }
        const lowerMessage = message.toLowerCase();
        const fileKeywords = [
            'arquivo', 'file', 'documento', 'document', 'pdf', 'word', 'doc',
            'leia', 'read', 'analise', 'analyze', 'resuma', 'summarize',
            'extraia', 'extract', 'processe', 'process', 'conteúdo do arquivo'
        ];
        return fileKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    async processFiles(agent, query) {
        try {
            const lowerQuery = query.toLowerCase();
            const files = await fileService_1.fileService.listAgentFiles(agent.id);
            if (files.length === 0) {
                return `Você não possui arquivos disponíveis para processamento. Use o endpoint de upload para enviar arquivos primeiro.`;
            }
            if (lowerQuery.includes('listar') || lowerQuery.includes('arquivos disponíveis')) {
                const fileList = files.map(file => `- ${file.originalName} (${file.fileSize} bytes)`).join('\n');
                return `Arquivos disponíveis:\n${fileList}\n\nUse "processe o arquivo [nome]" para processar um arquivo específico.`;
            }
            let targetFile = files[0];
            for (const file of files) {
                if (lowerQuery.includes(file.originalName.toLowerCase())) {
                    targetFile = file;
                    break;
                }
            }
            let operation = 'read';
            if (lowerQuery.includes('analise') || lowerQuery.includes('analyze')) {
                operation = 'analyze';
            }
            else if (lowerQuery.includes('resuma') || lowerQuery.includes('summarize')) {
                operation = 'summarize';
            }
            else if (lowerQuery.includes('extraia') || lowerQuery.includes('extract')) {
                operation = 'extract';
            }
            const processRequest = {
                agentId: agent.id,
                fileId: targetFile.id,
                operation: operation,
                options: {
                    language: 'pt',
                    maxLength: 200
                }
            };
            const result = await fileService_1.fileService.processFile(processRequest);
            if (result.success) {
                let response = `📁 **Processando arquivo "${targetFile.originalName}"** (${operation}):\n\n`;
                response += result.data.content;
                if (result.data.summary) {
                    response += `\n\n📋 **Resumo:**\n${result.data.summary}`;
                }
                response += `\n\n📊 **Metadados:** ${result.data.metadata.wordCount} palavras, ${result.data.metadata.characterCount} caracteres`;
                response += `\n\n🤖 *(Análise realizada pela IA OpenAI através do ${agent.name})*`;
                return response;
            }
            else {
                return `❌ Erro ao processar arquivo: ${result.error}`;
            }
        }
        catch (error) {
            logger_1.logger.error('Error processing files:', error);
            return `Desculpe, não consegui processar os arquivos no momento.`;
        }
    }
    async queryDatabase(agent, query) {
        try {
            const lowerQuery = query.toLowerCase();
            let collectionName = '';
            let searchQuery = {};
            let operation = 'find';
            if (lowerQuery.includes('usuário') || lowerQuery.includes('user')) {
                collectionName = 'users';
            }
            else if (lowerQuery.includes('produto') || lowerQuery.includes('product')) {
                collectionName = 'products';
            }
            else if (lowerQuery.includes('pedido') || lowerQuery.includes('order')) {
                collectionName = 'orders';
            }
            else if (lowerQuery.includes('metadados') || lowerQuery.includes('metadata') || lowerQuery.includes('texto')) {
                collectionName = 'metadados';
            }
            else if (lowerQuery.includes('agente') || lowerQuery.includes('agent')) {
                collectionName = 'agents';
            }
            else {
                collectionName = agent.databaseAccess.allowedCollections[0];
            }
            if (lowerQuery.includes('ativo') || lowerQuery.includes('active')) {
                searchQuery = { status: 'active' };
            }
            if (lowerQuery.includes('quantos') || lowerQuery.includes('quantas')) {
                operation = 'count';
            }
            else if (lowerQuery.includes('primeiro') || lowerQuery.includes('último')) {
                operation = 'findOne';
            }
            const dbQuery = {
                collection: collectionName,
                operation: operation,
                query: searchQuery,
                limit: agent.databaseAccess.queryLimits?.maxResults || 10
            };
            const result = await databaseService_1.databaseService.executeQuery(agent.id, dbQuery, agent.databaseAccess);
            if (result.success) {
                const rawData = result.data;
                const count = result.count;
                const formatPrompt = `Você recebeu os seguintes dados do banco de dados da coleção "${collectionName}":
        
Dados brutos: ${JSON.stringify(rawData, null, 2)}
Quantidade de registros: ${count}

Por favor, formate estes dados de forma limpa e legível para o usuário, seguindo estas regras:
- NUNCA mostre JSON bruto
- Use linguagem natural para descrever os dados
- Organize as informações de forma clara
- Remova campos técnicos desnecessários como "_id"
- Use listas ou formatação adequada
- Termine com "(Informação obtida do Agente Database)"

Formate os dados agora:`;
                const chatRequest = {
                    messages: [
                        {
                            role: 'user',
                            content: formatPrompt
                        }
                    ]
                };
                const formattedResponse = await openaiService_1.openaiService.processMessage(chatRequest.messages, this.createSystemPrompt(agent));
                return formattedResponse;
            }
            else {
                return `Erro ao consultar o banco de dados: ${result.error}`;
            }
        }
        catch (error) {
            logger_1.logger.error('Error querying database:', error);
            return `Desculpe, não consegui consultar o banco de dados no momento.`;
        }
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
//# sourceMappingURL=chatService.js.map