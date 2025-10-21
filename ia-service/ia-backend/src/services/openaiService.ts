import OpenAI from 'openai';
import { config } from '../config/config';
import { logger } from './logger';

class OpenAIService {
  private client: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    this.model = config.openai.model;
    this.maxTokens = config.openai.maxTokens;
    this.temperature = config.openai.temperature;
  }

  async processMessage(messages: Array<{ role: string; content: string }>, agentContext?: string): Promise<string> {
    try {
      const systemPrompt = agentContext || 'You are a helpful AI assistant. Provide clear and concise responses.';

      const chatMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];


      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: chatMessages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content received from OpenAI');
      }

      logger.info('OpenAI request processed successfully', {
        model: this.model,
        tokensUsed: response.usage?.total_tokens,
        messagesCount: messages.length
      });

      return content;
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      logger.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.models.list();
      return response.data
        .filter(model => model.id.includes('gpt'))
        .map(model => model.id)
        .sort();
    } catch (error) {
      logger.error('Failed to fetch OpenAI models:', error);
      return [];
    }
  }

  async uploadFileDirectly(fileBuffer: Buffer, fileName: string, purpose: 'assistants' | 'batch' | 'fine-tune' | 'vision' = 'assistants'): Promise<string> {
    try {
      // Create a File object from buffer
      const file = new File([fileBuffer], fileName, {
        type: this.getMimeType(fileName)
      });

      // Upload file directly to OpenAI
      const response = await this.client.files.create({
        file: file,
        purpose: purpose
      });

      logger.info('=== ARQUIVO ENVIADO PARA OPENAI ===', {
        fileId: response.id,
        fileName: fileName,
        purpose: purpose,
        size: fileBuffer.length,
        mimeType: this.getMimeType(fileName),
        uploadTimestamp: new Date().toISOString()
      });

      logger.info('File uploaded directly to OpenAI', {
        fileId: response.id,
        fileName: fileName,
        purpose: purpose,
        size: fileBuffer.length
      });

      return response.id;
    } catch (error) {
      logger.error('Error uploading file to OpenAI:', error);
      throw new Error(`OpenAI file upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeFileDirectly(fileId: string, prompt: string, language: string = 'pt'): Promise<string> {
    try {
      // For now, let's use a simpler approach that works with the current API
      // We'll read the file content and send it to the chat completion
      const systemPrompt = language === 'pt'
        ? 'Você é um analista de documentos especializado. Analise o conteúdo fornecido e forneça insights detalhados.'
        : 'You are a specialized document analyst. Analyze the provided content and provide detailed insights.';

      // Get file content from OpenAI
      const fileContent = await this.client.files.content(fileId);
      const fileText = await fileContent.text();

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `${prompt}\n\nConteúdo do arquivo:\n${fileText}`
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content received from OpenAI');
      }

      // Log detalhado da resposta da IA
      logger.info('=== RESPOSTA DA IA PARA ARQUIVO ===', {
        fileId,
        model: this.model,
        tokensUsed: response.usage?.total_tokens,
        prompt: prompt,
        responseLength: content.length,
        responsePreview: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        fullResponse: content
      });

      logger.info('File analyzed directly with OpenAI', {
        fileId,
        model: this.model,
        tokensUsed: response.usage?.total_tokens
      });

      return content;
    } catch (error) {
      logger.error('Error analyzing file directly:', error);
      throw new Error(`OpenAI file analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteUploadedFile(fileId: string): Promise<boolean> {
    try {
      await this.client.files.delete(fileId);
      logger.info('File deleted from OpenAI', { fileId });
      return true;
    } catch (error) {
      logger.error('Error deleting file from OpenAI:', error);
      return false;
    }
  }

  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv',
      'json': 'application/json'
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}

export const openaiService = new OpenAIService();
