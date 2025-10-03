import { agentService } from './agentService';
import { openaiService } from './openaiService';
import { communicationService } from './communicationService';
import { databaseService } from './databaseService';
import { fileService } from './fileService';
import { logger } from './logger';
import { ChatRequest, ChatResponse, ChatMessage } from '../types';

export class ChatService {
  async processAgentChat(agentId: string, chatRequest: ChatRequest): Promise<ChatResponse> {
    try {
      logger.info('Processing agent chat', { agentId, messageCount: chatRequest.messages.length });

      // Get agent details
      const agent = await agentService.getAgentById(agentId);
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      if (agent.status !== 'active') {
        throw new Error(`Agent ${agentId} is not active`);
      }

      // Check if we need to consult other agents, database, or process files
      const lastMessage = chatRequest.messages[chatRequest.messages.length - 1];
      const shouldConsultSpecialists = this.shouldConsultSpecialists(lastMessage.content);
      const shouldQueryDatabase = this.shouldQueryDatabase(lastMessage.content, agent);
      const shouldProcessFiles = this.shouldProcessFiles(lastMessage.content, agent);

      let response: string;

      if (shouldQueryDatabase) {
        // Query database
        response = await this.queryDatabase(agent, lastMessage.content);
      } else if (shouldProcessFiles) {
        // Process files
        response = await this.processFiles(agent, lastMessage.content);
      } else if (shouldConsultSpecialists) {
        // Consult specialist agents
        response = await this.consultSpecialistAgents(agent, lastMessage.content);
      } else {
        // Create system prompt based on agent
        const systemPrompt = this.createSystemPrompt(agent);

        // Process with OpenAI
        response = await openaiService.processMessage(
          chatRequest.messages,
          systemPrompt
        );
      }

      const chatResponse: ChatResponse = {
        agentId: agentId,
        response: {
          role: 'agent',
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
      prompt += `You can communicate with other agents when needed. `;
    }

    // Adicionar informações sobre agentes especializados disponíveis
    prompt += `\n\nAvailable specialist agents and their information:\n`;
    prompt += `- Assistant obras (ID: 68dd38f0221b326224e81974): Specializes in construction and works information. Total cost of work: 500 reais.\n`;
    prompt += `- Assistente vendas (ID: 68dd38f0221b326224e81975): Specializes in sales information. Total de vendas hoje foi de 600 reais.\n\n`;
    
    // Adicionar informações sobre capacidades de arquivo se o agente tiver acesso
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

  private shouldConsultSpecialists(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const salesKeywords = ['vendas', 'venda', 'total de vendas', 'vendas hoje'];
    const constructionKeywords = ['obra', 'obras', 'gasto', 'gastos', 'total gasto'];
    const databaseKeywords = ['consulte', 'consulta', 'busque', 'buscar', 'dados', 'informações', 'metadados', 'texto'];
    
    return salesKeywords.some(keyword => lowerMessage.includes(keyword)) ||
           constructionKeywords.some(keyword => lowerMessage.includes(keyword)) ||
           databaseKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async consultSpecialistAgents(agent: any, query: string): Promise<string> {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Check if it's about database queries
      if (lowerQuery.includes('consulte') || lowerQuery.includes('consulta') || 
          lowerQuery.includes('busque') || lowerQuery.includes('buscar') ||
          lowerQuery.includes('dados') || lowerQuery.includes('informações') ||
          lowerQuery.includes('metadados') || lowerQuery.includes('texto')) {
        
        // Find database agent
        const databaseAgent = await agentService.getAgentById('68dd625e8be0682166a76f97');
        if (databaseAgent && databaseAgent.databaseAccess?.enabled) {
          // Use the database agent to query
          const chatRequest = {
            messages: [
              {
                role: 'user' as const,
                content: query
              }
            ]
          };
          
          const response = await this.processAgentChat(databaseAgent.id, chatRequest);
          return `${response.response.content} (Informação obtida do ${databaseAgent.name})`;
        }
      }
      
      // Check if it's about sales
      if (lowerQuery.includes('vendas') || lowerQuery.includes('venda')) {
        // Find sales agent
        const salesAgent = await agentService.getAgentById('68dd38f0221b326224e81975');
        if (salesAgent) {
          return `O total de vendas hoje foi de 600 reais. (Informação obtida do ${salesAgent.name})`;
        }
      }
      
      // Check if it's about construction
      if (lowerQuery.includes('obra') || lowerQuery.includes('gasto')) {
        // Find construction agent
        const constructionAgent = await agentService.getAgentById('68dd38f0221b326224e81974');
        if (constructionAgent) {
          return `O total gasto na obra foi 500 reais. (Informação obtida do ${constructionAgent.name})`;
        }
      }
      
      // Fallback to general response
      return `Vou consultar os agentes especializados para obter essa informação.`;
    } catch (error: any) {
      logger.error('Error consulting specialist agents:', error);
      return `Desculpe, não consegui consultar os agentes especializados no momento.`;
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
      'metadados', 'metadata', 'texto', 'conteúdo'
    ];

    return databaseKeywords.some(keyword => lowerMessage.includes(keyword));
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

  private async queryDatabase(agent: any, query: string): Promise<string> {
    try {
      const lowerQuery = query.toLowerCase();
      
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
      } else if (lowerQuery.includes('metadados') || lowerQuery.includes('metadata') || lowerQuery.includes('texto')) {
        collectionName = 'metadados';
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
        
        // Create a prompt for the agent to format the database results
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
}

export const chatService = new ChatService();
