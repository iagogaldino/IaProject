"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const agentService_1 = require("./agentService");
const databaseService_1 = require("./databaseService");
const fileService_1 = require("./fileService");
const logger_1 = require("./logger");
const metadataService_1 = require("./metadataService");
const openaiService_1 = require("./openaiService");
class ChatService {
    constructor() {
        this.agentCache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
        this.callStack = [];
        this.cooperationTrace = null;
        this.traceSessionId = '';
    }
    async processAgentChat(agentId, chatRequest) {
        const isRootCall = this.callStack.length === 0;
        const startTime = Date.now();
        try {
            if (isRootCall) {
                this.initializeTrace(agentId, chatRequest.messages[chatRequest.messages.length - 1].content);
            }
            logger_1.logger.info('Processing agent chat', { agentId, messageCount: chatRequest.messages.length });
            const agent = await agentService_1.agentService.getAgentById(agentId);
            if (!agent) {
                throw new Error(`Agent with ID ${agentId} not found`);
            }
            if (agent.status !== 'active') {
                throw new Error(`Agent ${agentId} is not active`);
            }
            this.addToTrace(agent.id, agent.name, 'received', 'Agent received query');
            const lastMessage = chatRequest.messages[chatRequest.messages.length - 1];
            let response;
            if (this.shouldProcessFiles(lastMessage.content, agent)) {
                logger_1.logger.info('Agent processing files locally', { agentId: agent.id, agentName: agent.name });
                this.addToTrace(agent.id, agent.name, 'processing', 'Processing files locally');
                response = await this.processFiles(agent, lastMessage.content);
                this.addToTrace(agent.id, agent.name, 'responded', 'Response from file processing');
            }
            else if (this.shouldQueryDatabase(lastMessage.content, agent)) {
                logger_1.logger.info('Agent querying database locally', { agentId: agent.id, agentName: agent.name });
                this.addToTrace(agent.id, agent.name, 'processing', 'Querying database locally');
                response = await this.queryDatabase(agent, lastMessage.content);
                this.addToTrace(agent.id, agent.name, 'responded', 'Response from database query');
            }
            else {
                this.addToTrace(agent.id, agent.name, 'processing', 'Evaluating need for specialist cooperation');
                const cooperationResult = await this.tryAgentCooperation(agent, lastMessage.content);
                if (cooperationResult) {
                    response = cooperationResult;
                    this.addToTrace(agent.id, agent.name, 'responded', 'Response from cooperation');
                }
                else {
                    logger_1.logger.info('Agent responding with own knowledge', { agentId: agent.id, agentName: agent.name });
                    this.addToTrace(agent.id, agent.name, 'processing', 'Responding with own knowledge');
                    const systemPrompt = this.createSystemPrompt(agent);
                    response = await openaiService_1.openaiService.processMessage(chatRequest.messages, systemPrompt);
                    this.addToTrace(agent.id, agent.name, 'responded', 'Direct response provided');
                }
            }
            if (isRootCall) {
                const duration = Date.now() - startTime;
                this.finalizeTrace(response, duration);
                this.logCooperationTrace();
            }
            const chatResponse = {
                agentId: agentId,
                response: {
                    role: 'assistant',
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
            prompt += `You can communicate with other specialist agents when needed for information outside your expertise. `;
        }
        if (agent.fileAccess?.enabled) {
            prompt += `\n\n📁 FILE PROCESSING CAPABILITIES (Powered by OpenAI):\n`;
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
        if (agent.databaseAccess?.enabled) {
            prompt += `\n\n📊 DATABASE ACCESS:\n`;
            prompt += `You have access to query databases and search through stored information. `;
            prompt += `You can perform semantic searches and retrieve relevant data to answer user queries.\n\n`;
        }
        prompt += `Always provide clear, accurate, and relevant responses based on your capabilities and expertise.`;
        return prompt;
    }
    async tryAgentCooperation(currentAgent, query) {
        try {
            if (this.callStack.includes(currentAgent.id)) {
                logger_1.logger.warn('Detected potential infinite loop in agent cooperation', {
                    agentId: currentAgent.id,
                    callStack: this.callStack
                });
                return null;
            }
            const allowedAgents = await this.getAgentsAllowedToCommunicate(currentAgent);
            if (allowedAgents.length === 0) {
                logger_1.logger.info('No agents available for cooperation', {
                    agentId: currentAgent.id,
                    agentName: currentAgent.name
                });
                return null;
            }
            const selectedAgent = await this.selectBestAgentWithAI(query, currentAgent, allowedAgents);
            if (!selectedAgent) {
                logger_1.logger.info('AI decided not to consult any specialist', {
                    agentId: currentAgent.id,
                    agentName: currentAgent.name,
                    query: query.substring(0, 100)
                });
                return null;
            }
            logger_1.logger.info('🤝 Agent cooperation initiated', {
                fromAgent: currentAgent.name,
                toAgent: selectedAgent.name,
                query: query.substring(0, 100)
            });
            const response = await this.consultSpecialistAgent(currentAgent, selectedAgent, query);
            return response;
        }
        catch (error) {
            logger_1.logger.error('Error in agent cooperation:', error);
            return null;
        }
    }
    async getAgentsAllowedToCommunicate(currentAgent) {
        try {
            const cacheKey = `allowed_${currentAgent.id}`;
            const cached = this.agentCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.agents;
            }
            const allAgents = await agentService_1.agentService.getActiveAgents();
            const allowedAgents = allAgents.filter(otherAgent => {
                if (otherAgent.id === currentAgent.id) {
                    return false;
                }
                if (!currentAgent.canCommunicateWith || currentAgent.canCommunicateWith.length === 0) {
                    return true;
                }
                return currentAgent.canCommunicateWith.includes(otherAgent.id);
            });
            this.agentCache.set(cacheKey, {
                agents: allowedAgents,
                timestamp: Date.now()
            });
            logger_1.logger.info('Found agents allowed for communication', {
                currentAgent: currentAgent.name,
                allowedCount: allowedAgents.length,
                allowedAgents: allowedAgents.map(a => ({ id: a.id, name: a.name }))
            });
            return allowedAgents;
        }
        catch (error) {
            logger_1.logger.error('Error getting allowed agents:', error);
            return [];
        }
    }
    async selectBestAgentWithAI(query, currentAgent, availableAgents) {
        try {
            if (availableAgents.length === 0) {
                return null;
            }
            let prompt = `You are an intelligent agent routing system for a multi-agent AI architecture.\n\n`;
            prompt += `**Current Agent:** ${currentAgent.name}\n`;
            prompt += `**Description:** ${currentAgent.description}\n`;
            if (currentAgent.databaseAccess?.enabled) {
                prompt += `**Has Database Access:** Yes\n`;
            }
            if (currentAgent.fileAccess?.enabled) {
                prompt += `**Has File Access:** Yes\n`;
            }
            prompt += `\n**User Query:** "${query}"\n\n`;
            prompt += `**Available Specialist Agents for Cooperation:**\n\n`;
            availableAgents.forEach((agent, idx) => {
                prompt += `${idx + 1}. **${agent.name}**\n`;
                prompt += `   Description: ${agent.description}\n`;
                if (agent.databaseAccess?.enabled) {
                    prompt += `   ✓ Has database access (collections: ${agent.databaseAccess.allowedCollections.join(', ')})\n`;
                }
                if (agent.fileAccess?.enabled) {
                    prompt += `   ✓ Has file processing capabilities\n`;
                }
                prompt += `\n`;
            });
            prompt += `\n**Your Task:**\n`;
            prompt += `Analyze if the current agent "${currentAgent.name}" should consult a specialist agent.\n`;
            prompt += `Consider:\n`;
            prompt += `1. Does the query require expertise beyond the current agent's capabilities?\n`;
            prompt += `2. Is there a specialist agent better suited for this specific query?\n`;
            prompt += `3. Would consulting a specialist provide more accurate/complete information?\n\n`;
            prompt += `**Response Format:**\n`;
            prompt += `Respond with ONLY the number (1, 2, 3...) of the best specialist agent to consult.\n`;
            prompt += `Respond with "0" if the current agent should handle the query itself (no specialist needed).\n`;
            prompt += `Be conservative: only suggest a specialist if there's a clear benefit.\n\n`;
            prompt += `Your response (single number only):`;
            const aiResponse = await openaiService_1.openaiService.processMessage([{ role: 'user', content: prompt }], 'You are a routing decision system. Respond ONLY with a single number (0 for no routing, or 1, 2, 3... for specialist agent).');
            const selectedIndex = parseInt(aiResponse.trim()) - 1;
            if (selectedIndex >= 0 && selectedIndex < availableAgents.length) {
                const selected = availableAgents[selectedIndex];
                logger_1.logger.info('AI selected specialist agent', {
                    currentAgent: currentAgent.name,
                    selectedAgent: selected.name,
                    confidence: 'high'
                });
                return selected;
            }
            logger_1.logger.info('AI decided current agent should handle query', {
                currentAgent: currentAgent.name,
                aiResponse: aiResponse.trim()
            });
            return null;
        }
        catch (error) {
            logger_1.logger.error('Error selecting best agent with AI:', error);
            return null;
        }
    }
    async consultSpecialistAgent(currentAgent, specialistAgent, query) {
        try {
            this.callStack.push(currentAgent.id);
            this.addToTrace(currentAgent.id, currentAgent.name, 'delegated', `Delegating to ${specialistAgent.name}`);
            const chatRequest = {
                messages: [
                    {
                        role: 'user',
                        content: query
                    }
                ]
            };
            const response = await this.processAgentChat(specialistAgent.id, chatRequest);
            this.callStack = this.callStack.filter(id => id !== currentAgent.id);
            const formattedResponse = `${response.response.content}\n\n✨ *(Informação fornecida através de cooperação: ${currentAgent.name} → ${specialistAgent.name})*`;
            logger_1.logger.info('Agent cooperation completed successfully', {
                fromAgent: currentAgent.name,
                toAgent: specialistAgent.name,
                responseLength: response.response.content.length
            });
            return formattedResponse;
        }
        catch (error) {
            logger_1.logger.error('Error consulting specialist agent:', error);
            this.callStack = this.callStack.filter(id => id !== currentAgent.id);
            throw error;
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
            'metadados', 'metadata', 'texto', 'conteúdo',
            'total de gastos', 'total gasto', 'gastos em', 'investimento total',
            'pavimentação', 'pavimentacao', 'obra', 'obras', 'construção',
            'vendas', 'receita', 'produtividade', 'trabalho remoto'
        ];
        const hasBasicKeywords = databaseKeywords.some(keyword => lowerMessage.includes(keyword));
        const isFinancialQuery = (lowerMessage.includes('gasto') && lowerMessage.includes('total')) ||
            (lowerMessage.includes('investimento') && lowerMessage.includes('total')) ||
            (lowerMessage.includes('pavimentação') || lowerMessage.includes('pavimentacao')) ||
            (lowerMessage.includes('obra') && lowerMessage.includes('gasto')) ||
            (lowerMessage.includes('petrolina') && (lowerMessage.includes('gasto') || lowerMessage.includes('investimento'))) ||
            (lowerMessage.includes('venda') && lowerMessage.includes('total'));
        return hasBasicKeywords || isFinancialQuery;
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
    async queryMetadataWithEmbeddings(agent, query) {
        try {
            logger_1.logger.info('Using embedding search for metadata query', { agentId: agent.id, query: query.substring(0, 100) });
            const lowerQuery = query.toLowerCase();
            const isContentOnlyRequest = lowerQuery.includes('apenas o conteúdo') ||
                lowerQuery.includes('só o conteúdo') ||
                lowerQuery.includes('apenas o improvedcontent') ||
                lowerQuery.includes('só o improvedcontent') ||
                lowerQuery.includes('me traga apenas') ||
                lowerQuery.includes('retorne apenas') ||
                lowerQuery.includes('conteúdo puro') ||
                lowerQuery.includes('texto puro');
            let searchResults = [];
            let searchType = '';
            if (lowerQuery.includes('tema') || lowerQuery.includes('sobre') || lowerQuery.includes('relacionado a')) {
                let theme = query;
                if (lowerQuery.includes('sobre ')) {
                    theme = query.substring(query.toLowerCase().indexOf('sobre ') + 6);
                }
                else if (lowerQuery.includes('tema ')) {
                    theme = query.substring(query.toLowerCase().indexOf('tema ') + 5);
                }
                const results = await metadataService_1.metadataService.searchBySemanticTheme(theme, {
                    limit: 5,
                    threshold: 0.25,
                    agentId: agent.id,
                    numCandidates: 3000
                });
                searchResults = results;
                searchType = 'semantic theme search';
            }
            else {
                let threshold = 0.25;
                if (lowerQuery.includes('pavimentação') || lowerQuery.includes('pavimentacao') ||
                    (lowerQuery.includes('gasto') && lowerQuery.includes('total')) ||
                    lowerQuery.includes('qual o total') || lowerQuery.includes('petrolina')) {
                    threshold = 0.05;
                }
                const results = await metadataService_1.metadataService.searchSimilarMetadata(query, {
                    limit: 5,
                    threshold: threshold,
                    agentId: agent.id,
                    includeEmbedding: false,
                    numCandidates: 5000
                });
                searchResults = results;
                searchType = 'semantic similarity search';
            }
            if (searchResults.length === 0) {
                return `🔍 **Busca Semântica (${searchType})**:\n\nNão encontrei documentos similares à sua consulta.\n\n**Sua consulta:** "${query}"\n\n**Dicas:**\n- Tente usar termos mais específicos\n- Use sinônimos ou palavras relacionadas\n- Verifique se existem metadados no sistema\n\n*(Busca realizada pelo Agente Database com tecnologia de embeddings)*`;
            }
            if (isContentOnlyRequest) {
                logger_1.logger.info('Content-only mode requested', { agentId: agent.id, resultsCount: searchResults.length });
                let contentResponse = `📄 **Conteúdo dos Documentos Encontrados:**\n\n`;
                searchResults.forEach((result, index) => {
                    const metadata = result.metadata;
                    const similarity = (result.similarity * 100).toFixed(1);
                    contentResponse += `**${index + 1}. ${metadata.theme}** (${similarity}% similar)\n`;
                    contentResponse += `📝 **Conteúdo:**\n${metadata.improvedContent}\n\n`;
                    contentResponse += `---\n\n`;
                });
                contentResponse += `*Conteúdo extraído pelo Agente Database para processamento por outros agentes.*`;
                return contentResponse;
            }
            let response = `🔍 **Busca Semântica (${searchType}):**\n\n`;
            response += `**Sua consulta:** "${query}"\n\n`;
            response += `**Encontrados ${searchResults.length} documento(s) similar(es):**\n\n`;
            searchResults.forEach((result, index) => {
                const metadata = result.metadata;
                const similarity = (result.similarity * 100).toFixed(1);
                response += `**${index + 1}. ${metadata.theme}** (${similarity}% similar)\n`;
                response += `   📄 **Tema:** ${metadata.theme}\n`;
                response += `   🏷️ **Tags:** ${metadata.tags.join(', ')}\n`;
                response += `   📝 **Resumo:** ${metadata.analysis.summary.substring(0, 150)}${metadata.analysis.summary.length > 150 ? '...' : ''}\n`;
                response += `   📊 **Sentimento:** ${metadata.analysis.sentiment} (${(metadata.analysis.confidence * 100).toFixed(0)}% confiança)\n`;
                response += `   📅 **Criado:** ${new Date(metadata.createdAt).toLocaleDateString('pt-BR')}\n`;
                response += `   🔗 **ID:** ${metadata.id}\n\n`;
            });
            response += `**💡 Tecnologia:** Busca semântica usando embeddings (IA OpenAI)\n`;
            response += `**🤖 Agente:** ${agent.name} (Database Agent)\n`;
            response += `**📈 Método:** ${searchType}\n\n`;
            response += `*Para ver mais detalhes de um documento específico, use o ID fornecido.*\n\n`;
            response += `*💡 Dica: Para obter apenas o conteúdo dos documentos, use "me traga apenas o conteúdo" ou "retorne apenas o improvedContent".*`;
            logger_1.logger.info('Embedding search completed successfully', {
                agentId: agent.id,
                queryLength: query.length,
                resultsCount: searchResults.length,
                searchType,
                contentOnlyMode: isContentOnlyRequest
            });
            return response;
        }
        catch (error) {
            logger_1.logger.error('Error in embedding metadata search:', error);
            return `❌ **Erro na busca semântica:**\n\nDesculpe, ocorreu um erro ao realizar a busca semântica com embeddings.\n\n**Erro:** ${error.message}\n\n**Sua consulta:** "${query}"\n\nTente novamente ou use uma consulta mais simples.\n\n*(Erro no Agente Database)*`;
        }
    }
    async queryDatabase(agent, query) {
        try {
            const lowerQuery = query.toLowerCase();
            const isMetadataQuery = lowerQuery.includes('metadados') ||
                lowerQuery.includes('metadata') ||
                lowerQuery.includes('texto') ||
                lowerQuery.includes('conteúdo') ||
                lowerQuery.includes('documento') ||
                lowerQuery.includes('análise') ||
                lowerQuery.includes('similar') ||
                lowerQuery.includes('busca semântica') ||
                lowerQuery.includes('encontre documentos sobre') ||
                lowerQuery.includes('procure por') ||
                (lowerQuery.includes('gasto') && lowerQuery.includes('total')) ||
                (lowerQuery.includes('investimento') && lowerQuery.includes('total')) ||
                (lowerQuery.includes('pavimentação') || lowerQuery.includes('pavimentacao')) ||
                (lowerQuery.includes('obra') && lowerQuery.includes('gasto')) ||
                (lowerQuery.includes('construção') && lowerQuery.includes('custo')) ||
                (lowerQuery.includes('petrolina') && (lowerQuery.includes('gasto') || lowerQuery.includes('investimento') || lowerQuery.includes('obra'))) ||
                (lowerQuery.includes('venda') && (lowerQuery.includes('total') || lowerQuery.includes('receita'))) ||
                (lowerQuery.includes('produtividade') || lowerQuery.includes('trabalho remoto'));
            if (isMetadataQuery) {
                return await this.queryMetadataWithEmbeddings(agent, query);
            }
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
                const relevantData = this.filterRelevantRecords(rawData, userQuery);
                logger_1.logger.info('🎯 Filtragem de relevância aplicada', {
                    agentId: agent.id,
                    totalRecords: rawData.length,
                    relevantRecords: relevantData.length,
                    userQuery: userQuery.substring(0, 100)
                });
                const filteredData = relevantData.map((doc) => {
                    const filteredDoc = {};
                    if (doc._id)
                        filteredDoc._id = doc._id;
                    if (doc.theme)
                        filteredDoc.theme = doc.theme;
                    if (doc.createdAt)
                        filteredDoc.createdAt = doc.createdAt;
                    if (doc.improvedContent) {
                        filteredDoc.improvedContent = doc.improvedContent.length > 500
                            ? doc.improvedContent.substring(0, 500) + '...[TRUNCATED]'
                            : doc.improvedContent;
                    }
                    if (doc.tags && Array.isArray(doc.tags) && doc.tags.length <= 10) {
                        filteredDoc.tags = doc.tags;
                    }
                    else if (doc.tags && Array.isArray(doc.tags)) {
                        filteredDoc.tags = doc.tags.slice(0, 5);
                    }
                    if (doc.analysis && typeof doc.analysis === 'object') {
                        const analysisKeys = Object.keys(doc.analysis);
                        if (analysisKeys.length > 0) {
                            filteredDoc.analysis = {
                                summary: `Análise disponível com ${analysisKeys.length} campos: ${analysisKeys.join(', ')}`
                            };
                        }
                    }
                    return filteredDoc;
                });
                const originalSize = JSON.stringify(rawData).length;
                const filteredSize = JSON.stringify(filteredData).length;
                const reductionPercent = Math.round(((originalSize - filteredSize) / originalSize) * 100);
                logger_1.logger.info('📊 Dados filtrados para evitar exceder limite de tokens', {
                    agentId: agent.id,
                    originalSize,
                    filteredSize,
                    reductionPercent,
                    recordsCount: count
                });
                const formatPrompt = `Você recebeu os seguintes dados do banco de dados da coleção "${collectionName}":
        
Dados filtrados: ${JSON.stringify(filteredData, null, 2)}
Quantidade de registros: ${count}

Por favor, formate estes dados de forma limpa e legível para o usuário, seguindo estas regras:
- NUNCA mostre JSON bruto
- Use linguagem natural para descrever os dados
- Organize as informações de forma clara
- Remova campos técnicos desnecessários como "_id"
- Use listas ou formatação adequada
- Termine com "(Informação obtida do Agente Database)"

Formate os dados agora:`;
                const promptLength = formatPrompt.length;
                const estimatedTokens = Math.ceil(promptLength / 4);
                logger_1.logger.info('📤 Prompt preparado para OpenAI', {
                    agentId: agent.id,
                    agentName: agent.name,
                    promptLength,
                    estimatedTokens,
                    dataRecordsCount: count
                });
                if (estimatedTokens > 10000) {
                    logger_1.logger.warn('⚠️ Prompt muito grande detectado - pode exceder limite de tokens', {
                        agentId: agent.id,
                        estimatedTokens,
                        maxTokensGPT35: 16385,
                        promptPreview: formatPrompt.substring(0, 500) + '...[TRUNCATED]...' + formatPrompt.substring(formatPrompt.length - 200)
                    });
                }
                logger_1.logger.debug('📋 Prompt completo para OpenAI:', {
                    agentId: agent.id,
                    fullPrompt: formatPrompt
                });
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
    filterRelevantRecords(records, userQuery) {
        if (!records || records.length === 0)
            return [];
        const lowerQuery = userQuery.toLowerCase();
        const queryKeywords = this.extractKeywords(lowerQuery);
        return records.filter(record => {
            const relevanceScore = this.calculateRelevanceScore(record, queryKeywords, lowerQuery);
            logger_1.logger.debug('🔍 Análise de relevância', {
                theme: record.theme,
                relevanceScore,
                query: userQuery.substring(0, 50)
            });
            return relevanceScore > 0.3;
        });
    }
    extractKeywords(query) {
        const infrastructureKeywords = [
            'infraestrutura', 'urbana', 'pavimentação', 'asfalto', 'ruas', 'vias',
            'obras', 'públicas', 'construção', 'investimento', 'gastos', 'custos',
            'prefeitura', 'municipal', 'desenvolvimento', 'urbano', 'qualidade',
            'vida', 'beneficiadas', 'projetos', 'executados'
        ];
        const healthKeywords = [
            'fisioterapia', 'saúde', 'reabilitação', 'estágio', 'pacientes',
            'atendimento', 'motor', 'inclusão', 'social', 'competências',
            'profissionais', 'cerpris', 'deficiências', 'neurológicas', 'cognitivas'
        ];
        const financeKeywords = [
            'gastos', 'investimentos', 'custos', 'valores', 'orçamento',
            'financiamento', 'recursos', 'despesas', 'receitas'
        ];
        const foundKeywords = [];
        infrastructureKeywords.forEach(keyword => {
            if (query.includes(keyword)) {
                foundKeywords.push(keyword);
            }
        });
        healthKeywords.forEach(keyword => {
            if (query.includes(keyword)) {
                foundKeywords.push(keyword);
            }
        });
        financeKeywords.forEach(keyword => {
            if (query.includes(keyword)) {
                foundKeywords.push(keyword);
            }
        });
        return foundKeywords;
    }
    calculateRelevanceScore(record, keywords, query) {
        let score = 0;
        if (record.theme) {
            const themeLower = record.theme.toLowerCase();
            keywords.forEach(keyword => {
                if (themeLower.includes(keyword)) {
                    score += 0.4;
                }
            });
        }
        if (record.improvedContent) {
            const contentLower = record.improvedContent.toLowerCase();
            keywords.forEach(keyword => {
                if (contentLower.includes(keyword)) {
                    score += 0.3;
                }
            });
        }
        if (record.tags && Array.isArray(record.tags)) {
            record.tags.forEach((tag) => {
                const tagLower = tag.toLowerCase();
                keywords.forEach(keyword => {
                    if (tagLower.includes(keyword)) {
                        score += 0.2;
                    }
                });
            });
        }
        if (query.includes('gast') || query.includes('invest') || query.includes('cust')) {
            if (record.theme && record.theme.toLowerCase().includes('infraestrutura')) {
                score += 0.5;
            }
        }
        return Math.min(score, 1.0);
    }
    initializeTrace(initiatorAgentId, query) {
        this.traceSessionId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.cooperationTrace = {
            sessionId: this.traceSessionId,
            initiatedBy: 'user',
            query: query,
            chain: []
        };
        logger_1.logger.info('🔍 COOPERATION TRACE STARTED', {
            sessionId: this.traceSessionId,
            initiatorAgent: initiatorAgentId,
            query: query.substring(0, 100)
        });
    }
    addToTrace(agentId, agentName, action, details) {
        if (!this.cooperationTrace)
            return;
        this.cooperationTrace.chain.push({
            agentId,
            agentName,
            action,
            timestamp: new Date(),
            details
        });
    }
    finalizeTrace(finalResponse, duration) {
        if (!this.cooperationTrace)
            return;
        this.cooperationTrace.finalResponse = finalResponse.substring(0, 200) + '...';
        this.cooperationTrace.totalDuration = duration;
    }
    logCooperationTrace() {
        if (!this.cooperationTrace)
            return;
        const trace = this.cooperationTrace;
        const chainVisualization = this.buildTraceVisualization(trace.chain);
        logger_1.logger.info('🔍 ═══════════════════════════════════════════════════════════', {});
        logger_1.logger.info('🔍 COOPERATION TRACE COMPLETE', {
            sessionId: trace.sessionId,
            totalDuration: `${trace.totalDuration}ms`,
            totalSteps: trace.chain.length
        });
        logger_1.logger.info('🔍 ───────────────────────────────────────────────────────────', {});
        logger_1.logger.info(`🔍 Query: "${trace.query}"`, {});
        logger_1.logger.info('🔍 ───────────────────────────────────────────────────────────', {});
        logger_1.logger.info('🔍 COOPERATION CHAIN:', {});
        logger_1.logger.info(`🔍 ${chainVisualization}`, {});
        logger_1.logger.info('🔍 ───────────────────────────────────────────────────────────', {});
        trace.chain.forEach((step, index) => {
            const emoji = this.getActionEmoji(step.action);
            const timestamp = step.timestamp.toISOString().substr(11, 12);
            logger_1.logger.info(`🔍 [${index + 1}] ${timestamp} ${emoji} ${step.agentName} - ${step.action}`, {
                agentId: step.agentId,
                action: step.action,
                details: step.details
            });
        });
        logger_1.logger.info('🔍 ═══════════════════════════════════════════════════════════', {});
        this.cooperationTrace = null;
        this.traceSessionId = '';
    }
    buildTraceVisualization(chain) {
        const agents = new Map();
        const flow = [];
        chain.forEach((step) => {
            agents.set(step.agentId, step.agentName);
            if (step.action === 'received' || step.action === 'delegated') {
                if (flow.length === 0) {
                    flow.push(`👤 User`);
                }
                flow.push(`${step.agentName}`);
            }
        });
        const uniqueFlow = [...new Set(flow)];
        let visualization = uniqueFlow.join(' → ');
        if (chain[chain.length - 1]?.action === 'responded') {
            visualization += ' → 👤 User';
        }
        return visualization;
    }
    getActionEmoji(action) {
        const emojis = {
            'received': '📥',
            'processing': '⚙️',
            'delegated': '🔀',
            'responded': '📤'
        };
        return emojis[action] || '•';
    }
    getCurrentTrace() {
        return this.cooperationTrace;
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
//# sourceMappingURL=chatService.js.map