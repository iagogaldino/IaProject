import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import { logger } from './logger';
import { BaseContentExtractor, ExtractionResult } from './extractors/BaseContentExtractor';

export interface ExternalExtractionResponse {
  success: boolean;
  data?: {
    content: string;
    metadata: {
      wordCount: number;
      characterCount: number;
      pageCount?: number;
      language?: string;
      fileType: string;
      extractedAt: string;
      aiProcessed?: boolean;
    };
    error?: string;
  };
  error?: string;
}

export class ExternalExtractorService extends BaseContentExtractor {
  private readonly apiUrl: string;
  private readonly timeout: number;

  constructor() {
    super();
    this.apiUrl = process.env.EXTERNAL_EXTRACTOR_API_URL || (() => { throw new Error('EXTERNAL_EXTRACTOR_API_URL is not set'); })();
    this.timeout = parseInt(process.env.EXTERNAL_EXTRACTOR_TIMEOUT || '30000');
  }

  async extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult> {
    try {
      logger.info('Starting external content extraction', { 
        fileName, 
        bufferSize: fileBuffer.length,
        apiUrl: this.apiUrl 
      });

      // Validate file buffer
      if (!fileBuffer || fileBuffer.length === 0) {
        return this.createErrorResult('Buffer de arquivo vazio ou inválido');
      }

      // Determine file type from extension
      const fileType = this.getFileTypeFromName(fileName);
      if (!fileType) {
        return this.createErrorResult('Tipo de arquivo não suportado');
      }

      // Create form data for the external API
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: this.getMimeType(fileType)
      });
      formData.append('fileType', fileType);
      formData.append('processWithAI', 'true');

      // Make request to external API
      const response: AxiosResponse<ExternalExtractionResponse> = await axios.post(
        this.apiUrl,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: this.timeout,
          maxContentLength: 50 * 1024 * 1024, // 50MB
          maxBodyLength: 50 * 1024 * 1024, // 50MB
        }
      );

      logger.info('External API response received', {
        fileName,
        status: response.status,
        success: response.data.success
      });

      // Handle API response
      if (!response.data.success) {
        const errorMessage = response.data.error || 'Erro desconhecido na API externa';
        logger.error('External API returned error', { 
          fileName, 
          error: errorMessage 
        });
        return this.createErrorResult(`Erro na API externa: ${errorMessage}`);
      }

      if (!response.data.data) {
        return this.createErrorResult('API externa não retornou dados');
      }

      const { content, metadata } = response.data.data;

      if (!content || content.trim().length === 0) {
        return this.createErrorResult('Nenhum conteúdo extraído do arquivo');
      }

      // Create success result
      const result = this.createSuccessResult(content, {
        wordCount: metadata.wordCount || 0,
        characterCount: metadata.characterCount || 0,
        pageCount: metadata.pageCount,
        language: metadata.language || 'pt',
        fileType: metadata.fileType,
        extractedAt: new Date(metadata.extractedAt),
        aiProcessed: metadata.aiProcessed || false,
        externalApiUsed: true
      });

      this.logExtraction(fileName, result);
      return result;

    } catch (error: any) {
      logger.error('Error in external content extraction:', error);
      
      // Handle specific error types
      if (error.code === 'ECONNREFUSED') {
        return this.createErrorResult('API externa não está disponível. Verifique se o serviço está rodando.');
      }
      
      if (error.code === 'ETIMEDOUT') {
        return this.createErrorResult('Timeout na API externa. O arquivo pode ser muito grande ou complexo.');
      }
      
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Erro desconhecido';
        
        if (status === 413) {
          return this.createErrorResult('Arquivo muito grande para a API externa');
        }
        
        if (status === 415) {
          return this.createErrorResult('Tipo de arquivo não suportado pela API externa');
        }
        
        return this.createErrorResult(`Erro HTTP ${status}: ${errorMessage}`);
      }
      
      return this.createErrorResult(`Erro na comunicação com API externa: ${error.message || 'Erro desconhecido'}`);
    }
  }

  private getFileTypeFromName(fileName: string): string | null {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const supportedTypes = [
      'pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'xls', 'json'
    ];
    
    return supportedTypes.includes(extension || '') ? extension || null : null;
  }

  private getMimeType(fileType: string): string {
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'json': 'application/json'
    };
    
    return mimeTypes[fileType] || 'application/octet-stream';
  }

  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing connection to external extractor API', { apiUrl: this.apiUrl });
      
      // Create a minimal test file
      const testBuffer = Buffer.from('Test file content', 'utf-8');
      const formData = new FormData();
      formData.append('file', testBuffer, {
        filename: 'test.txt',
        contentType: 'text/plain'
      });
      formData.append('fileType', 'txt');
      formData.append('processWithAI', 'false');

      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 10000, // 10 second timeout for test
      });

      const isConnected = response.status === 200;
      logger.info('External API connection test result', { 
        connected: isConnected, 
        status: response.status 
      });
      
      return isConnected;
    } catch (error: any) {
      logger.error('External API connection test failed:', error);
      return false;
    }
  }

  async getHealthStatus(): Promise<{ status: string; message: string; apiUrl: string }> {
    try {
      const isConnected = await this.testConnection();
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        message: isConnected ? 'API externa está funcionando' : 'API externa não está disponível',
        apiUrl: this.apiUrl
      };
    } catch (error: any) {
      logger.error('Error checking external API health:', error);
      return {
        status: 'error',
        message: `Erro ao verificar API externa: ${error.message}`,
        apiUrl: this.apiUrl
      };
    }
  }
}

export const externalExtractorService = new ExternalExtractorService();
