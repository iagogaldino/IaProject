import { ChatMessage, ChatRequest, ChatResponse } from '../types';
import { agentService } from './agentService';
import { databaseService } from './databaseService';
import { fileService } from './fileService';
import { logger } from './logger';
import { metadataService } from './metadataService';
import { openaiService } from './openaiService';

// Interface para rastreamento de cooperação
interface CooperationTrace {
  sessionId: string;
  initiatedBy: string; // 'user' ou agentId
  query: string;
  chain: {
    agentId: string;
    agentName: string;
    action: 'received' | 'processing' | 'delegated' | 'responded';
    timestamp: Date;
    details?: string;
  }[];
  finalResponse?: string;
  totalDuration?: number;
}

export class ChatService {
  // Cache de agentes para performance
  private agentCache = new Map<string, { agents: any[]; timestamp: number }>();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private callStack: string[] = []; // Prevenir loops infinitos

  // 🔍 Sistema de Trace de Cooperação
  private cooperationTrace: CooperationTrace | null = null;
  private traceSessionId: string = '';

  // Formato de resposta (padrão = 'clean' para usuário final)
  private responseFormat: 'clean' | 'detailed' = 'clean';

  async processAgentChat(agentId: string, chatRequest: ChatRequest): Promise<ChatResponse> {
    const isRootCall = this.callStack.length === 0;
    const startTime = Date.now();

    try {
      // Definir formato de resposta (padrão = 'clean')
      this.responseFormat = chatRequest.responseFormat || 'clean';

      // 🔍 Iniciar trace se for a primeira chamada
      if (isRootCall) {
        this.initializeTrace(agentId, chatRequest.messages[chatRequest.messages.length - 1].content);
      }

      logger.info('Processing agent chat', { agentId, messageCount: chatRequest.messages.length, responseFormat: this.responseFormat });

      // Get agent details
      const agent = await agentService.getAgentById(agentId);
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      if (agent.status !== 'active') {
        throw new Error(`Agent ${agentId} is not active`);
      }

      // 🔍 Registrar no trace
      this.addToTrace(agent.id, agent.name, 'received', 'Agent received query');

      const lastMessage = chatRequest.messages[chatRequest.messages.length - 1];
      let response: string;

      // 🔍 DETECTAR PROMESSAS NÃO CUMPRIDAS NO HISTÓRICO
      const hasUnfulfilledPromise = this.detectUnfulfilledPromise(chatRequest.messages, agent);
      if (hasUnfulfilledPromise) {
        logger.warn('⚠️ Detected unfulfilled promise in conversation history - forcing database query', {
          agentId: agent.id,
          agentName: agent.name,
          lastUserMessage: lastMessage.content
        });

        // Forçar consulta ao database mesmo se a mensagem não parecer uma query
        if (agent.databaseAccess?.enabled) {
          logger.info('Forcing database query due to unfulfilled promise', { agentId: agent.id });
          this.addToTrace(agent.id, agent.name, 'processing', 'Fulfilling previous promise - querying database');

          const databaseResult = await this.queryDatabase(agent, lastMessage.content);

          if (this.isRawDatabaseResult(databaseResult)) {
            const formattedResponse = await this.delegateToResponseImprover(agent, lastMessage.content, databaseResult);
            response = formattedResponse || databaseResult;
            this.addToTrace(agent.id, agent.name, 'responded', 'Promise fulfilled with database results');
          } else {
            response = databaseResult;
            this.addToTrace(agent.id, agent.name, 'responded', 'Promise fulfilled');
          }

          return {
            agentId: agentId,
            response: {
              role: 'assistant',
              content: response
            }
          };
        }
      }

      // Prioridade 1: Recursos locais do agente (arquivos e database)
      if (this.shouldProcessFiles(lastMessage.content, agent)) {
        logger.info('Agent processing files locally', { agentId: agent.id, agentName: agent.name });
        this.addToTrace(agent.id, agent.name, 'processing', 'Processing files locally');
        response = await this.processFiles(agent, lastMessage.content);
        this.addToTrace(agent.id, agent.name, 'responded', 'Response from file processing');
      } else if (this.shouldQueryDatabase(lastMessage.content, agent)) {
        logger.info('Agent querying database', { agentId: agent.id, agentName: agent.name });
        this.addToTrace(agent.id, agent.name, 'processing', 'Querying database');

        // 🔄 NOVO FLUXO: Database Agent retorna dados brutos e delega formatação
        const databaseResult = await this.queryDatabase(agent, lastMessage.content);

        // Verificar se é um resultado bruto que precisa de formatação
        if (this.isRawDatabaseResult(databaseResult)) {
          logger.info('Database returned raw data, delegating to Response Improver', { agentId: agent.id });
          this.addToTrace(agent.id, agent.name, 'processing', 'Delegating formatting to Response Improver');

          // Tentar delegar para agente de formatação
          const formattedResponse = await this.delegateToResponseImprover(agent, lastMessage.content, databaseResult);

          if (formattedResponse) {
            response = formattedResponse;
            this.addToTrace(agent.id, agent.name, 'responded', 'Response formatted by Response Improver');
          } else {
            // Se não conseguir delegar, usar resposta do database mesmo
            response = databaseResult;
            this.addToTrace(agent.id, agent.name, 'responded', 'Response from database query (no formatter)');
          }
        } else {
          // Resultado já formatado (modo detailed ou legacy)
          response = databaseResult;
          this.addToTrace(agent.id, agent.name, 'responded', 'Response from database query');
        }
      } else {
        // Prioridade 2: Responder diretamente com conhecimento próprio
        logger.info('Agent responding with own knowledge', { agentId: agent.id, agentName: agent.name });
        this.addToTrace(agent.id, agent.name, 'processing', 'Responding with own knowledge');
        const systemPrompt = this.createSystemPrompt(agent);
        response = await openaiService.processMessage(
          chatRequest.messages,
          systemPrompt
        );
        this.addToTrace(agent.id, agent.name, 'responded', 'Direct response provided');
      }

      // 🔍 Finalizar trace se for a chamada raiz
      if (isRootCall) {
        const duration = Date.now() - startTime;
        this.finalizeTrace(response, duration);
        this.logCooperationTrace();
      }

      const chatResponse: ChatResponse = {
        agentId: agentId,
        response: {
          role: 'assistant',
          content: response
        }
      };

      logger.info('Agent chat processed successfully', {
        agentId,
        responseLength: response.length
      });

      return chatResponse;
    } catch (error: any) {
      logger.error('Error processing agent chat:', error);
      throw error;
    }
  }

  async processAIRequest(request: any): Promise<any> {
    try {
      logger.info('Processing AI request', {
        hasPrompt: !!request.prompt,
        hasConversationHistory: !!request.conversationHistory,
        userId: request.userId
      });

      // Convert request format to chat format
      const messages: ChatMessage[] = [];

      // Add conversation history if provided
      if (request.conversationHistory && Array.isArray(request.conversationHistory)) {
        request.conversationHistory.forEach((msg: any) => {
          if (msg.sender && msg.text) {
            messages.push({
              role: msg.sender === 'user' ? 'user' : 'agent',
              content: msg.text
            });
          }
        });
      }

      // Add current prompt
      if (request.prompt) {
        messages.push({
          role: 'user',
          content: request.prompt
        });
      }

      // Default system prompt for general AI requests
      const systemPrompt = 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.';

      // Process with OpenAI
      const response = await openaiService.processMessage(messages, systemPrompt);

      // Format response according to expected format
      const aiResponse = {
        success: true,
        data: response,
        metadata: {
          processingTime: Date.now(),
          model: 'gpt-3.5-turbo',
          confidence: 0.9
        }
      };

      logger.info('AI request processed successfully', {
        responseLength: response.length,
        userId: request.userId
      });

      return aiResponse;
    } catch (error: any) {
      logger.error('Error processing AI request:', error);
      throw error;
    }
  }

  private createSystemPrompt(agent: any): string {
    let prompt = `You are an AI agent named "${agent.name}". `;

    if (agent.description) {
      prompt += `Description: ${agent.description}. `;
    }

    prompt += `You should respond in a helpful and professional manner, staying true to your role and purpose. `;

    if (agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
      prompt += `You can communicate with other specialist agents when needed for information outside your expertise. `;
    }

    // ⚠️ REGRAS CRÍTICAS SOBRE EXECUÇÃO IMEDIATA
    prompt += `\n\n🚨 CRITICAL RULES - IMMEDIATE EXECUTION:\n`;
    prompt += `1. NEVER say "aguarde", "vou verificar", "vou buscar", "let me check", or promise to search later\n`;
    prompt += `2. If you need data from database or files, ACCESS IT IMMEDIATELY in this response\n`;
    prompt += `3. Each conversation turn is INDEPENDENT - you cannot promise actions for "later"\n`;
    prompt += `4. If user asks "já tem a resposta?" or similar, it means you MUST search NOW (don't just respond with text)\n`;
    prompt += `5. ALWAYS provide complete answers in the SAME response, not in future messages\n\n`;
    prompt += `❌ NEVER say: "aguarde um momento", "vou verificar", "let me search"\n`;
    prompt += `✅ ALWAYS do: Search immediately and provide results in current response\n\n`;

    // Adicionar informações sobre capacidades de arquivo se o agente tiver acesso
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

    // Adicionar informações sobre acesso a database
    if (agent.databaseAccess?.enabled) {
      prompt += `\n\n📊 DATABASE ACCESS:\n`;
      prompt += `You have access to query databases and search through stored information. `;
      prompt += `You can perform semantic searches and retrieve relevant data to answer user queries.\n\n`;
    }

    prompt += `Always provide clear, accurate, and relevant responses based on your capabilities and expertise.\n\n🚨 CRITICAL: NEVER say "vou acessar", "aguarde", "vou verificar", "vou buscar" or similar phrases. ALWAYS provide the complete answer immediately in the same response. If you need to search for data, do it NOW and return the results immediately.`;

    return prompt;
  }

  /**
   * 🤖 COOPERAÇÃO INTELIGENTE ENTRE AGENTES
   * Tenta encontrar e consultar um agente especialista se apropriado
   */
  private async tryAgentCooperation(currentAgent: any, query: string): Promise<string | null> {
    try {
      // 1. Verificar se há loop de chamadas (prevenir recursão infinita)
      if (this.callStack.includes(currentAgent.id)) {
        logger.warn('Detected potential infinite loop in agent cooperation', {
          agentId: currentAgent.id,
          callStack: this.callStack
        });
        return null;
      }

      // 2. Buscar agentes que podem ser consultados
      const allowedAgents = await this.getAgentsAllowedToCommunicate(currentAgent);

      if (allowedAgents.length === 0) {
        logger.info('No agents available for cooperation', {
          agentId: currentAgent.id,
          agentName: currentAgent.name
        });
        return null;
      }

      // 3. Usar IA para decidir se deve consultar um especialista e qual
      const selectedAgent = await this.selectBestAgentWithAI(query, currentAgent, allowedAgents);

      if (!selectedAgent) {
        logger.info('AI decided not to consult any specialist', {
          agentId: currentAgent.id,
          agentName: currentAgent.name,
          query: query.substring(0, 100)
        });
        return null;
      }

      // 4. Consultar o agente especialista
      logger.info('🤝 Agent cooperation initiated', {
        fromAgent: currentAgent.name,
        toAgent: selectedAgent.name,
        query: query.substring(0, 100)
      });

      const response = await this.consultSpecialistAgent(
        currentAgent,
        selectedAgent,
        query
      );

      return response;

    } catch (error: any) {
      logger.error('Error in agent cooperation:', error);
      return null;
    }
  }

  /**
   * 🔍 Busca agentes que o agente atual pode consultar
   * Respeita a propriedade canCommunicateWith
   */
  private async getAgentsAllowedToCommunicate(currentAgent: any): Promise<any[]> {
    try {
      // Verificar cache
      const cacheKey = `allowed_${currentAgent.id}`;
      const cached = this.agentCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.agents;
      }

      // Buscar todos os agentes ativos
      const allAgents = await agentService.getActiveAgents();

      // Filtrar agentes permitidos
      const allowedAgents = allAgents.filter(otherAgent => {
        // Não pode consultar a si mesmo
        if (otherAgent.id === currentAgent.id) {
          return false;
        }

        // Se canCommunicateWith está vazio = pode comunicar com todos
        if (!currentAgent.canCommunicateWith || currentAgent.canCommunicateWith.length === 0) {
          return true;
        }

        // ✅ Respeita canCommunicateWith
        return currentAgent.canCommunicateWith.includes(otherAgent.id);
      });

      // Atualizar cache
      this.agentCache.set(cacheKey, {
        agents: allowedAgents,
        timestamp: Date.now()
      });

      logger.info('Found agents allowed for communication', {
        currentAgent: currentAgent.name,
        allowedCount: allowedAgents.length,
        allowedAgents: allowedAgents.map(a => ({ id: a.id, name: a.name }))
      });

      return allowedAgents;

    } catch (error: any) {
      logger.error('Error getting allowed agents:', error);
      return [];
    }
  }

  /**
   * 🧠 Usa IA para selecionar o melhor agente especialista
   * Retorna null se a consulta não requer um especialista
   */
  private async selectBestAgentWithAI(
    query: string,
    currentAgent: any,
    availableAgents: any[]
  ): Promise<any | null> {
    try {
      if (availableAgents.length === 0) {
        return null;
      }

      // Construir prompt para decisão da IA
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

      // Consultar IA
      const aiResponse = await openaiService.processMessage(
        [{ role: 'user', content: prompt }],
        'You are a routing decision system. Respond ONLY with a single number (0 for no routing, or 1, 2, 3... for specialist agent).'
      );

      // Parse resposta
      const selectedIndex = parseInt(aiResponse.trim()) - 1;

      if (selectedIndex >= 0 && selectedIndex < availableAgents.length) {
        const selected = availableAgents[selectedIndex];
        logger.info('AI selected specialist agent', {
          currentAgent: currentAgent.name,
          selectedAgent: selected.name,
          confidence: 'high'
        });
        return selected;
      }

      // Se retornou 0 ou inválido, não consultar nenhum especialista
      logger.info('AI decided current agent should handle query', {
        currentAgent: currentAgent.name,
        aiResponse: aiResponse.trim()
      });
      return null;

    } catch (error: any) {
      logger.error('Error selecting best agent with AI:', error);
      return null;
    }
  }

  /**
   * 📞 Consulta um agente especialista
   * Adiciona o agente ao call stack para prevenir loops
   */
  private async consultSpecialistAgent(
    currentAgent: any,
    specialistAgent: any,
    query: string
  ): Promise<string> {
    try {
      // Adicionar ao call stack
      this.callStack.push(currentAgent.id);

      // 🔍 Registrar delegação no trace
      this.addToTrace(
        currentAgent.id,
        currentAgent.name,
        'delegated',
        `Delegating to ${specialistAgent.name}`
      );

      // Criar requisição de chat para o especialista
      const chatRequest = {
        messages: [
          {
            role: 'user' as const,
            content: query
          }
        ]
      };

      // Consultar especialista (pode resultar em cascata de consultas)
      const response = await this.processAgentChat(specialistAgent.id, chatRequest);

      // Remover do call stack
      this.callStack = this.callStack.filter(id => id !== currentAgent.id);

      // Formatar resposta (com ou sem informação de cooperação baseado no formato)
      let formattedResponse = response.response.content;

      if (this.responseFormat === 'detailed') {
        // Apenas adicionar informação técnica no modo detalhado
        formattedResponse += `\n\n✨ *(Informação fornecida através de cooperação: ${currentAgent.name} → ${specialistAgent.name})*`;
      }

      logger.info('Agent cooperation completed successfully', {
        fromAgent: currentAgent.name,
        toAgent: specialistAgent.name,
        responseLength: response.response.content.length,
        responseFormat: this.responseFormat
      });

      return formattedResponse;

    } catch (error: any) {
      logger.error('Error consulting specialist agent:', error);

      // Remover do call stack em caso de erro
      this.callStack = this.callStack.filter(id => id !== currentAgent.id);

      throw error;
    }
  }


  private shouldQueryDatabase(message: string, agent: any): boolean {
    // Check if agent has database access enabled
    if (!agent.databaseAccess?.enabled) {
      return false;
    }

    const lowerMessage = message.toLowerCase();
    const databaseKeywords = [
      'consulte', 'consulta', 'busque', 'buscar', 'encontre', 'encontrar',
      'dados', 'informações', 'registros', 'tabela', 'coleção',
      'quantos', 'quantas', 'listar', 'mostrar', 'exibir',
      'metadados', 'metadata', 'texto', 'conteúdo',
      // Adicionar palavras-chave específicas para consultas financeiras
      'total de gastos', 'total gasto', 'gastos em', 'investimento total',
      'pavimentação', 'pavimentacao', 'obra', 'obras', 'construção',
      'vendas', 'receita', 'produtividade', 'trabalho remoto'
    ];

    // Verificar se contém palavras-chave básicas de consulta
    const hasBasicKeywords = databaseKeywords.some(keyword => lowerMessage.includes(keyword));

    // Verificar se é uma consulta sobre gastos/investimentos específicos
    const isFinancialQuery = (lowerMessage.includes('gasto') && lowerMessage.includes('total')) ||
      (lowerMessage.includes('investimento') && lowerMessage.includes('total')) ||
      (lowerMessage.includes('pavimentação') || lowerMessage.includes('pavimentacao')) ||
      (lowerMessage.includes('obra') && lowerMessage.includes('gasto')) ||
      (lowerMessage.includes('petrolina') && (lowerMessage.includes('gasto') || lowerMessage.includes('investimento'))) ||
      (lowerMessage.includes('venda') && lowerMessage.includes('total'));

    return hasBasicKeywords || isFinancialQuery;
  }

  private shouldProcessFiles(message: string, agent: any): boolean {
    // Check if agent has file access enabled
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

  private async processFiles(agent: any, query: string): Promise<string> {
    try {
      const lowerQuery = query.toLowerCase();

      // List available files for the agent
      const files = await fileService.listAgentFiles(agent.id);

      if (files.length === 0) {
        return `Você não possui arquivos disponíveis para processamento. Use o endpoint de upload para enviar arquivos primeiro.`;
      }

      // If user asks to list files
      if (lowerQuery.includes('listar') || lowerQuery.includes('arquivos disponíveis')) {
        const fileList = files.map(file => `- ${file.originalName} (${file.fileSize} bytes)`).join('\n');
        return `Arquivos disponíveis:\n${fileList}\n\nUse "processe o arquivo [nome]" para processar um arquivo específico.`;
      }

      // Try to identify which file to process
      let targetFile = files[0]; // Default to first file

      // Look for specific file name in query
      for (const file of files) {
        if (lowerQuery.includes(file.originalName.toLowerCase())) {
          targetFile = file;
          break;
        }
      }

      // Determine operation
      let operation = 'read';
      if (lowerQuery.includes('analise') || lowerQuery.includes('analyze')) {
        operation = 'analyze';
      } else if (lowerQuery.includes('resuma') || lowerQuery.includes('summarize')) {
        operation = 'summarize';
      } else if (lowerQuery.includes('extraia') || lowerQuery.includes('extract')) {
        operation = 'extract';
      }

      // Process the file
      const processRequest = {
        agentId: agent.id,
        fileId: targetFile.id,
        operation: operation as any,
        options: {
          language: 'pt',
          maxLength: 200
        }
      };

      const result = await fileService.processFile(processRequest);

      if (result.success) {
        // Formato LIMPO para usuário final
        if (this.responseFormat === 'clean') {
          let response = `**Arquivo: ${targetFile.originalName}**\n\n`;
          response += result.data.content;

          if (result.data.summary) {
            response += `\n\n**Resumo:**\n${result.data.summary}`;
          }

          return response;
        }

        // Formato DETALHADO com informações técnicas
        let response = `📁 **Processando arquivo "${targetFile.originalName}"** (${operation}):\n\n`;
        response += result.data.content;

        if (result.data.summary) {
          response += `\n\n📋 **Resumo:**\n${result.data.summary}`;
        }

        response += `\n\n📊 **Metadados:** ${result.data.metadata.wordCount} palavras, ${result.data.metadata.characterCount} caracteres`;
        response += `\n\n🤖 *(Análise realizada pela IA OpenAI através do ${agent.name})*`;

        return response;
      } else {
        return `❌ Erro ao processar arquivo: ${result.error}`;
      }

    } catch (error: any) {
      logger.error('Error processing files:', error);
      return `Desculpe, não consegui processar os arquivos no momento.`;
    }
  }

  /**
   * Consulta metadados usando busca semântica com embeddings
   */
  private async queryMetadataWithEmbeddings(agent: any, query: string): Promise<string> {
    try {
      logger.info('Using embedding search for metadata query', { agentId: agent.id, query: query.substring(0, 100) });

      // Verificar se é uma solicitação para retornar apenas conteúdo
      const lowerQuery = query.toLowerCase();
      const isContentOnlyRequest = lowerQuery.includes('apenas o conteúdo') ||
        lowerQuery.includes('só o conteúdo') ||
        lowerQuery.includes('apenas o improvedcontent') ||
        lowerQuery.includes('só o improvedcontent') ||
        lowerQuery.includes('me traga apenas') ||
        lowerQuery.includes('retorne apenas') ||
        lowerQuery.includes('conteúdo puro') ||
        lowerQuery.includes('texto puro');

      // Determine search type based on query
      let searchResults: any[] = [];
      let searchType = '';

      // Check if it's a theme-based search
      if (lowerQuery.includes('tema') || lowerQuery.includes('sobre') || lowerQuery.includes('relacionado a')) {
        // Extract theme from query
        let theme = query;
        if (lowerQuery.includes('sobre ')) {
          theme = query.substring(query.toLowerCase().indexOf('sobre ') + 6);
        } else if (lowerQuery.includes('tema ')) {
          theme = query.substring(query.toLowerCase().indexOf('tema ') + 5);
        }

        const results = await metadataService.searchBySemanticTheme(theme, {
          limit: 5,
          threshold: 0.25,
          agentId: agent.id,
          numCandidates: 3000
        });

        searchResults = results;
        searchType = 'semantic theme search';
      } else {
        // Use similarity search with dynamic threshold based on query
        let threshold = 0.25;

        // Reduzir threshold para consultas específicas sobre pavimentação/gastos
        if (lowerQuery.includes('pavimentação') || lowerQuery.includes('pavimentacao') ||
          (lowerQuery.includes('gasto') && lowerQuery.includes('total')) ||
          lowerQuery.includes('qual o total') || lowerQuery.includes('petrolina')) {
          threshold = 0.05; // Threshold extremamente baixo para consultas específicas
        }

        const results = await metadataService.searchSimilarMetadata(query, {
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
        if (this.responseFormat === 'clean') {
          return `Não encontrei documentos sobre "${query}".\n\nTente usar termos mais específicos ou sinônimos.`;
        }
        return `🔍 **Busca Semântica (${searchType})**:\n\nNão encontrei documentos similares à sua consulta.\n\n**Sua consulta:** "${query}"\n\n**Dicas:**\n- Tente usar termos mais específicos\n- Use sinônimos ou palavras relacionadas\n- Verifique se existem metadados no sistema\n\n*(Busca realizada pelo Agente Database com tecnologia de embeddings)*`;
      }

      // Se for solicitação de conteúdo apenas, retornar apenas o improvedContent
      if (isContentOnlyRequest) {
        logger.info('Content-only mode requested', { agentId: agent.id, resultsCount: searchResults.length });

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

      // Formato LIMPO para usuário final - USA IMPROVED CONTENT
      if (this.responseFormat === 'clean') {
        // 🔥 NOVO: Agora retorna o improvedContent completo para o Response Improver processar
        let response = `__RAW_DATA__\n\n`; // Marcador para ativar Response Improver
        response += `**Consulta:** "${query}"\n`;
        response += `**Documentos encontrados:** ${searchResults.length}\n\n`;
        response += `---\n\n`;

        searchResults.forEach((result, index) => {
          const metadata = result.metadata;
          const similarity = (result.similarity * 100).toFixed(1);

          response += `**DOCUMENTO ${index + 1}: ${metadata.theme}**\n`;
          response += `**Relevância:** ${similarity}%\n\n`;

          // ⭐ PRINCIPAL: Usar improvedContent completo ao invés de apenas resumo
          if (metadata.improvedContent) {
            response += `**Conteúdo:**\n${metadata.improvedContent}\n\n`;
          } else {
            // Fallback para resumo se improvedContent não existir
            response += `**Resumo:**\n${metadata.analysis.summary}\n\n`;
          }

          // Adicionar tags para contexto
          if (metadata.tags && metadata.tags.length > 0) {
            response += `**Tags:** ${metadata.tags.join(', ')}\n\n`;
          }

          response += `---\n\n`;
        });

        logger.info('Embedding search completed - returning improvedContent for Response Improver', {
          agentId: agent.id,
          queryLength: query.length,
          resultsCount: searchResults.length,
          searchType,
          hasImprovedContent: searchResults.every(r => r.metadata.improvedContent)
        });

        return response.trim();
      }

      // Formato DETALHADO com informações técnicas (para debug)
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

      logger.info('Embedding search completed successfully (detailed format)', {
        agentId: agent.id,
        queryLength: query.length,
        resultsCount: searchResults.length,
        searchType,
        contentOnlyMode: isContentOnlyRequest
      });

      return response;

    } catch (error: any) {
      logger.error('Error in embedding metadata search:', error);
      return `❌ **Erro na busca semântica:**\n\nDesculpe, ocorreu um erro ao realizar a busca semântica com embeddings.\n\n**Erro:** ${error.message}\n\n**Sua consulta:** "${query}"\n\nTente novamente ou use uma consulta mais simples.\n\n*(Erro no Agente Database)*`;
    }
  }

  private async queryDatabase(agent: any, query: string): Promise<string> {
    try {
      const lowerQuery = query.toLowerCase();

      // Check if this is a metadata query that should use embeddings
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
        // Detectar consultas sobre gastos, investimentos e obras
        (lowerQuery.includes('gasto') && lowerQuery.includes('total')) ||
        (lowerQuery.includes('investimento') && lowerQuery.includes('total')) ||
        (lowerQuery.includes('pavimentação') || lowerQuery.includes('pavimentacao')) ||
        (lowerQuery.includes('obra') && lowerQuery.includes('gasto')) ||
        (lowerQuery.includes('construção') && lowerQuery.includes('custo')) ||
        // Detectar consultas sobre Petrolina com contexto financeiro
        (lowerQuery.includes('petrolina') && (lowerQuery.includes('gasto') || lowerQuery.includes('investimento') || lowerQuery.includes('obra'))) ||
        // Detectar consultas sobre vendas e receita
        (lowerQuery.includes('venda') && (lowerQuery.includes('total') || lowerQuery.includes('receita'))) ||
        // Detectar consultas sobre produtividade e trabalho
        (lowerQuery.includes('produtividade') || lowerQuery.includes('trabalho remoto'));

      // Use embedding search for metadata queries
      if (isMetadataQuery) {
        return await this.queryMetadataWithEmbeddings(agent, query);
      }

      // Simple query parsing - in a real implementation, you'd use NLP
      let collectionName = '';
      let searchQuery = {};
      let operation = 'find';

      // Try to identify collection from query
      if (lowerQuery.includes('usuário') || lowerQuery.includes('user')) {
        collectionName = 'users';
      } else if (lowerQuery.includes('produto') || lowerQuery.includes('product')) {
        collectionName = 'products';
      } else if (lowerQuery.includes('pedido') || lowerQuery.includes('order')) {
        collectionName = 'orders';
      } else if (lowerQuery.includes('agente') || lowerQuery.includes('agent')) {
        collectionName = 'agents';
      } else {
        // Default to first allowed collection
        collectionName = agent.databaseAccess.allowedCollections[0];
      }

      // Build search query based on keywords
      if (lowerQuery.includes('ativo') || lowerQuery.includes('active')) {
        searchQuery = { status: 'active' };
      }

      // Determine operation
      if (lowerQuery.includes('quantos') || lowerQuery.includes('quantas')) {
        operation = 'count';
      } else if (lowerQuery.includes('primeiro') || lowerQuery.includes('último')) {
        operation = 'findOne';
      }

      const dbQuery = {
        collection: collectionName,
        operation: operation as any,
        query: searchQuery,
        limit: agent.databaseAccess.queryLimits?.maxResults || 10
      };

      const result = await databaseService.executeQuery(agent.id, dbQuery, agent.databaseAccess);

      if (result.success) {
        // Process the database result through the agent's AI to format it properly
        const rawData = result.data;
        const count = result.count;

        // Filtrar registros por relevância semântica antes de processar
        const relevantData = this.filterRelevantRecords(rawData, query);

        logger.info('🎯 Filtragem de relevância aplicada', {
          agentId: agent.id,
          totalRecords: rawData.length,
          relevantRecords: relevantData.length,
          userQuery: query.substring(0, 100)
        });

        // Filtrar apenas campos essenciais para evitar exceder limite de tokens
        const filteredData = relevantData.map((doc: any) => {
          const filteredDoc: any = {};

          // Campos sempre incluídos (pequenos e importantes)
          if (doc._id) filteredDoc._id = doc._id;
          if (doc.theme) filteredDoc.theme = doc.theme;
          if (doc.createdAt) filteredDoc.createdAt = doc.createdAt;

          // Campos condicionais (incluir apenas se não forem muito grandes)
          if (doc.improvedContent) {
            // Limitar improvedContent a 500 caracteres se for muito longo
            filteredDoc.improvedContent = doc.improvedContent.length > 500
              ? doc.improvedContent.substring(0, 500) + '...[TRUNCATED]'
              : doc.improvedContent;
          }

          // Incluir tags apenas se não forem muito extensas
          if (doc.tags && Array.isArray(doc.tags) && doc.tags.length <= 10) {
            filteredDoc.tags = doc.tags;
          } else if (doc.tags && Array.isArray(doc.tags)) {
            filteredDoc.tags = doc.tags.slice(0, 5); // Apenas primeiras 5 tags
          }

          // Campos de análise - incluir apenas resumos se existirem
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

        // Log do tamanho dos dados antes e depois da filtragem
        const originalSize = JSON.stringify(rawData).length;
        const filteredSize = JSON.stringify(filteredData).length;
        const reductionPercent = Math.round(((originalSize - filteredSize) / originalSize) * 100);

        logger.info('📊 Dados filtrados para evitar exceder limite de tokens', {
          agentId: agent.id,
          originalSize,
          filteredSize,
          reductionPercent,
          recordsCount: count
        });

        // Create a prompt for the agent to format the database results
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

        // Log do prompt antes de enviar
        const promptLength = formatPrompt.length;
        const estimatedTokens = Math.ceil(promptLength / 4); // Estimativa aproximada: 1 token ≈ 4 caracteres

        logger.info('📤 Prompt preparado para OpenAI', {
          agentId: agent.id,
          agentName: agent.name,
          promptLength,
          estimatedTokens,
          dataRecordsCount: count
        });

        // Log de aviso se o prompt for muito grande
        if (estimatedTokens > 10000) {
          logger.warn('⚠️ Prompt muito grande detectado - pode exceder limite de tokens', {
            agentId: agent.id,
            estimatedTokens,
            maxTokensGPT35: 16385,
            promptPreview: formatPrompt.substring(0, 500) + '...[TRUNCATED]...' + formatPrompt.substring(formatPrompt.length - 200)
          });
        }

        // Log completo do prompt em caso de debug
        logger.debug('📋 Prompt completo para OpenAI:', {
          agentId: agent.id,
          fullPrompt: formatPrompt
        });

        // Use the agent's AI to format the response
        const chatRequest = {
          messages: [
            {
              role: 'user' as const,
              content: formatPrompt
            }
          ]
        };

        const formattedResponse = await openaiService.processMessage(
          chatRequest.messages,
          this.createSystemPrompt(agent)
        );

        return formattedResponse;
      } else {
        return `Erro ao consultar o banco de dados: ${result.error}`;
      }

    } catch (error: any) {
      logger.error('Error querying database:', error);
      return `Desculpe, não consegui consultar o banco de dados no momento.`;
    }
  }

  /**
   * 🎯 FILTRAGEM DE RELEVÂNCIA SEMÂNTICA
   */

  /**
   * Filtra registros por relevância semântica baseada na query do usuário
   */
  private filterRelevantRecords(records: any[], userQuery: string): any[] {
    if (!records || records.length === 0) return [];

    const lowerQuery = userQuery.toLowerCase();

    // Palavras-chave para diferentes tipos de consultas
    const queryKeywords = this.extractKeywords(lowerQuery);

    return records.filter(record => {
      const relevanceScore = this.calculateRelevanceScore(record, queryKeywords, lowerQuery);

      // Log da relevância para debug
      logger.debug('🔍 Análise de relevância', {
        theme: record.theme,
        relevanceScore,
        query: userQuery.substring(0, 50)
      });

      return relevanceScore > 0.3; // Threshold de relevância
    });
  }

  /**
   * Extrai palavras-chave da query do usuário
   */
  private extractKeywords(query: string): string[] {
    // Palavras-chave relacionadas a infraestrutura urbana
    const infrastructureKeywords = [
      'infraestrutura', 'urbana', 'pavimentação', 'asfalto', 'ruas', 'vias',
      'obras', 'públicas', 'construção', 'investimento', 'gastos', 'custos',
      'prefeitura', 'municipal', 'desenvolvimento', 'urbano', 'qualidade',
      'vida', 'beneficiadas', 'projetos', 'executados'
    ];

    // Palavras-chave relacionadas a saúde/fisioterapia
    const healthKeywords = [
      'fisioterapia', 'saúde', 'reabilitação', 'estágio', 'pacientes',
      'atendimento', 'motor', 'inclusão', 'social', 'competências',
      'profissionais', 'cerpris', 'deficiências', 'neurológicas', 'cognitivas'
    ];

    // Palavras-chave relacionadas a finanças/gastos
    const financeKeywords = [
      'gastos', 'investimentos', 'custos', 'valores', 'orçamento',
      'financiamento', 'recursos', 'despesas', 'receitas'
    ];

    const foundKeywords: string[] = [];

    // Verificar palavras-chave de infraestrutura
    infrastructureKeywords.forEach(keyword => {
      if (query.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    // Verificar palavras-chave de saúde
    healthKeywords.forEach(keyword => {
      if (query.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    // Verificar palavras-chave financeiras
    financeKeywords.forEach(keyword => {
      if (query.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    return foundKeywords;
  }

  /**
   * Calcula score de relevância para um registro
   */
  private calculateRelevanceScore(record: any, keywords: string[], query: string): number {
    let score = 0;

    // Analisar tema
    if (record.theme) {
      const themeLower = record.theme.toLowerCase();
      keywords.forEach(keyword => {
        if (themeLower.includes(keyword)) {
          score += 0.4; // Peso alto para tema
        }
      });
    }

    // Analisar conteúdo melhorado
    if (record.improvedContent) {
      const contentLower = record.improvedContent.toLowerCase();
      keywords.forEach(keyword => {
        if (contentLower.includes(keyword)) {
          score += 0.3; // Peso médio para conteúdo
        }
      });
    }

    // Analisar tags
    if (record.tags && Array.isArray(record.tags)) {
      record.tags.forEach((tag: string) => {
        const tagLower = tag.toLowerCase();
        keywords.forEach(keyword => {
          if (tagLower.includes(keyword)) {
            score += 0.2; // Peso baixo para tags
          }
        });
      });
    }

    // Bonus para queries específicas sobre gastos/investimentos
    if (query.includes('gast') || query.includes('invest') || query.includes('cust')) {
      if (record.theme && record.theme.toLowerCase().includes('infraestrutura')) {
        score += 0.5; // Bonus alto para infraestrutura em queries financeiras
      }
    }

    return Math.min(score, 1.0); // Normalizar para 0-1
  }

  /**
   * 🔍 DETECÇÃO DE PROMESSAS NÃO CUMPRIDAS
   */

  /**
   * Detecta se o agente prometeu buscar/verificar algo mas não cumpriu
   */
  private detectUnfulfilledPromise(messages: ChatMessage[], agent: any): boolean {
    if (messages.length < 2) {
      return false;
    }

    // Palavras-chave que indicam promessa de buscar algo
    const promiseKeywords = [
      'aguarde um momento',
      'aguarde enquanto',
      'vou verificar',
      'vou buscar',
      'vou consultar',
      'deixe-me verificar',
      'deixe-me buscar',
      'let me check',
      'let me search',
      'i will check',
      'i will search'
    ];

    // Palavras-chave que indicam que o usuário está cobrando a resposta
    const followUpKeywords = [
      'já tem',
      'ja tem',
      'tem a resposta',
      'e ai',
      'e aí',
      'conseguiu',
      'encontrou',
      'achou',
      'did you find',
      'do you have'
    ];

    // Verificar as últimas 5 mensagens do histórico
    const recentMessages = messages.slice(-5);

    let hasPromise = false;
    let hasFulfillment = false;

    for (let i = 0; i < recentMessages.length; i++) {
      const msg = recentMessages[i];
      const content = msg.content.toLowerCase();

      // Detectar promessa do assistente
      if (msg.role === 'agent' as any || msg.role === 'assistant' as any) {
        const madePromise = promiseKeywords.some(keyword => content.includes(keyword));
        if (madePromise) {
          hasPromise = true;
          logger.info('📝 Detected promise in conversation history', {
            messageIndex: i,
            snippet: content.substring(0, 100)
          });
        }

        // Verificar se houve cumprimento (resposta substancial com dados)
        // Se a mensagem tem mais de 300 caracteres e não é só conversa
        if (content.length > 300 && !madePromise) {
          hasFulfillment = true;
        }
      }

      // Detectar usuário cobrando resposta
      if (msg.role === 'user') {
        const isFollowUp = followUpKeywords.some(keyword => content.includes(keyword));
        if (isFollowUp && i === recentMessages.length - 1) {
          // É a última mensagem E é um follow-up
          logger.info('👤 User is following up on previous promise', {
            userMessage: content
          });
          return hasPromise && !hasFulfillment; // Retornar true se tem promessa não cumprida
        }
      }
    }

    return false;
  }

  /**
   * 🔄 MÉTODOS DE COOPERAÇÃO COM RESPONSE IMPROVER
   */

  /**
   * Verifica se o resultado do database é bruto (precisa de formatação)
   */
  private isRawDatabaseResult(result: string): boolean {
    // Se contém marcador especial de dados brutos
    if (result.includes('__RAW_DATA__') || result.includes('__NEEDS_FORMATTING__')) {
      return true;
    }

    // Se não está em modo clean, não precisa de formatação adicional
    if (this.responseFormat === 'detailed') {
      return false;
    }

    // No modo clean, sempre tenta melhorar a resposta do database
    return this.responseFormat === 'clean';
  }

  /**
   * Delega a formatação de dados para o Response Improver Agent
   */
  private async delegateToResponseImprover(
    databaseAgent: any,
    userQuery: string,
    rawData: string
  ): Promise<string | null> {
    try {
      // Buscar agentes que o Database Agent pode consultar
      const allowedAgents = await this.getAgentsAllowedToCommunicate(databaseAgent);

      if (allowedAgents.length === 0) {
        logger.info('Database Agent has no agents to communicate with', { agentId: databaseAgent.id });
        return null;
      }

      // Procurar por Response Improver Agent
      const responseImprover = allowedAgents.find(agent => {
        const name = agent.name.toLowerCase();
        const desc = agent.description.toLowerCase();
        return name.includes('resposta') ||
          name.includes('response') ||
          name.includes('melhorar') ||
          name.includes('melhoria') ||
          name.includes('formatar') ||
          desc.includes('formatar') ||
          desc.includes('format');
      });

      if (!responseImprover) {
        logger.info('No Response Improver Agent found in allowed agents', {
          agentId: databaseAgent.id,
          allowedAgentsCount: allowedAgents.length
        });
        return null;
      }

      logger.info('🎨 Delegating to Response Improver Agent', {
        fromAgent: databaseAgent.name,
        toAgent: responseImprover.name,
        responseImproverId: responseImprover.id
      });

      // Criar mensagem para o Response Improver com contexto
      const improverPrompt = `**Consulta do usuário:** "${userQuery}"

**Dados encontrados:**
${rawData}

**Sua tarefa:**
Analise os dados acima e forneça uma resposta clara, bem formatada e amigável para o usuário final. Use linguagem natural e organize as informações de forma legível.`;

      // Consultar Response Improver Agent
      const improverRequest = {
        messages: [
          {
            role: 'user' as const,
            content: improverPrompt
          }
        ]
      };

      const improverResponse = await this.consultSpecialistAgent(
        databaseAgent,
        responseImprover,
        improverPrompt
      );

      logger.info('✅ Response Improver Agent completed formatting', {
        fromAgent: databaseAgent.name,
        toAgent: responseImprover.name,
        responseLength: improverResponse.length
      });

      return improverResponse;

    } catch (error: any) {
      logger.error('Error delegating to Response Improver:', error);
      return null;
    }
  }

  /**
   * 🔍 MÉTODOS DE TRACE DE COOPERAÇÃO
   */

  /**
   * Inicializa um novo trace de cooperação
   */
  private initializeTrace(initiatorAgentId: string, query: string): void {
    this.traceSessionId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.cooperationTrace = {
      sessionId: this.traceSessionId,
      initiatedBy: 'user',
      query: query,
      chain: []
    };

    logger.info('🔍 COOPERATION TRACE STARTED', {
      sessionId: this.traceSessionId,
      initiatorAgent: initiatorAgentId,
      query: query.substring(0, 100)
    });
  }

  /**
   * Adiciona uma entrada ao trace
   */
  private addToTrace(
    agentId: string,
    agentName: string,
    action: 'received' | 'processing' | 'delegated' | 'responded',
    details?: string
  ): void {
    if (!this.cooperationTrace) return;

    this.cooperationTrace.chain.push({
      agentId,
      agentName,
      action,
      timestamp: new Date(),
      details
    });
  }

  /**
   * Finaliza o trace com a resposta final
   */
  private finalizeTrace(finalResponse: string, duration: number): void {
    if (!this.cooperationTrace) return;

    this.cooperationTrace.finalResponse = finalResponse.substring(0, 200) + '...';
    this.cooperationTrace.totalDuration = duration;
  }

  /**
   * Loga o trace completo de cooperação de forma visual
   */
  private logCooperationTrace(): void {
    if (!this.cooperationTrace) return;

    const trace = this.cooperationTrace;

    // Construir representação visual da cadeia
    const chainVisualization = this.buildTraceVisualization(trace.chain);

    // Log completo estruturado
    logger.info('🔍 ═══════════════════════════════════════════════════════════', {});
    logger.info('🔍 COOPERATION TRACE COMPLETE', {
      sessionId: trace.sessionId,
      totalDuration: `${trace.totalDuration}ms`,
      totalSteps: trace.chain.length
    });
    logger.info('🔍 ───────────────────────────────────────────────────────────', {});
    logger.info(`🔍 Query: "${trace.query}"`, {});
    logger.info('🔍 ───────────────────────────────────────────────────────────', {});
    logger.info('🔍 COOPERATION CHAIN:', {});
    logger.info(`🔍 ${chainVisualization}`, {});
    logger.info('🔍 ───────────────────────────────────────────────────────────', {});

    // Log detalhado de cada passo
    trace.chain.forEach((step, index) => {
      const emoji = this.getActionEmoji(step.action);
      const timestamp = step.timestamp.toISOString().substr(11, 12);
      logger.info(`🔍 [${index + 1}] ${timestamp} ${emoji} ${step.agentName} - ${step.action}`, {
        agentId: step.agentId,
        action: step.action,
        details: step.details
      });
    });

    logger.info('🔍 ═══════════════════════════════════════════════════════════', {});

    // Resetar trace para próxima chamada
    this.cooperationTrace = null;
    this.traceSessionId = '';
  }

  /**
   * Constrói visualização ASCII da cadeia de cooperação
   */
  private buildTraceVisualization(chain: CooperationTrace['chain']): string {
    const agents = new Map<string, string>();
    const flow: string[] = [];

    chain.forEach((step) => {
      agents.set(step.agentId, step.agentName);

      if (step.action === 'received' || step.action === 'delegated') {
        if (flow.length === 0) {
          flow.push(`👤 User`);
        }
        flow.push(`${step.agentName}`);
      }
    });

    // Remover duplicatas mantendo ordem
    const uniqueFlow = [...new Set(flow)];

    // Construir visualização
    let visualization = uniqueFlow.join(' → ');

    // Adicionar indicação de resposta
    if (chain[chain.length - 1]?.action === 'responded') {
      visualization += ' → 👤 User';
    }

    return visualization;
  }

  /**
   * Retorna emoji apropriado para cada ação
   */
  private getActionEmoji(action: string): string {
    const emojis: Record<string, string> = {
      'received': '📥',
      'processing': '⚙️',
      'delegated': '🔀',
      'responded': '📤'
    };
    return emojis[action] || '•';
  }

  /**
   * Retorna o trace atual (útil para debugging)
   */
  public getCurrentTrace(): CooperationTrace | null {
    return this.cooperationTrace;
  }
}

export const chatService = new ChatService();
