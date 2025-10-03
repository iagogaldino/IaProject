import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import * as XLSX from 'xlsx';
import { logger } from './logger';
import { openaiService } from './openaiService';
import { ContentExtractorFactory } from './extractors/ContentExtractorFactory';
import { FileUpload as FileUploadModel, IFileUpload } from '../models/FileUpload';
import { FileUpload, FileUploadRequest, FileProcessRequest, FileProcessResponse } from '../types';

export class FileService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      logger.info('Created upload directory', { path: this.uploadDir });
    }
  }

  async uploadFile(uploadRequest: FileUploadRequest): Promise<FileUpload> {
    try {
      const { agentId, file, metadata } = uploadRequest;
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${randomUUID()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, uniqueFileName);

      // Save file to disk
      await fs.writeFile(filePath, file.buffer);

      // Create file record in database
      const fileUploadRecord = new FileUploadModel({
        agentId,
        originalName: file.originalname,
        fileName: uniqueFileName,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
        metadata: metadata || {}
      });

      const savedFile = await fileUploadRecord.save();

      // Map to response format
      const fileUpload: FileUpload = {
        id: (savedFile as any)._id.toString(),
        agentId: savedFile.agentId,
        originalName: savedFile.originalName,
        fileName: savedFile.fileName,
        filePath: savedFile.filePath,
        fileSize: savedFile.fileSize,
        mimeType: savedFile.mimeType,
        uploadedAt: savedFile.uploadedAt,
        metadata: savedFile.metadata
      };

      logger.info('File uploaded and saved to database successfully', {
        fileId: fileUpload.id,
        agentId,
        originalName: file.originalname,
        fileSize: file.size
      });

      return fileUpload;
    } catch (error: any) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async processFile(processRequest: FileProcessRequest): Promise<FileProcessResponse> {
    try {
      const { agentId, fileId, operation, options } = processRequest;
      
      // Try to find the actual file in uploads directory
      let filePath: string;
      let content: string = '';
      let fileType: string;
      let openaiFileId: string | null = null;

      try {
        // Validate fileId
        if (!fileId || fileId === 'undefined') {
          throw new Error('File ID is required');
        }
        
        logger.info('Looking for file in database', { fileId });
        
        // First, try to find the file in the database
        const fileRecord = await FileUploadModel.findById(fileId);
        
        if (fileRecord) {
          filePath = fileRecord.filePath;
          const fileBuffer = await fs.readFile(filePath);
          fileType = path.extname(fileRecord.fileName).substring(1);
          
          // Use our specialized content extractors
          logger.info('=== INICIANDO EXTRAÇÃO DE CONTEÚDO ===', {
            fileType,
            fileName: fileRecord.fileName,
            operation,
            fileSize: fileBuffer.length,
            originalName: fileRecord.originalName
          });

          const extractionResult = await ContentExtractorFactory.extractContent(fileBuffer, fileRecord.originalName);
          
          if (!extractionResult.success) {
            throw new Error(extractionResult.error || 'Falha na extração de conteúdo');
          }

          content = extractionResult.content;
          
          // Store additional metadata if available
          if (extractionResult.metadata.aiProcessed) {
            fileRecord.metadata = {
              ...fileRecord.metadata,
              aiProcessed: extractionResult.metadata.aiProcessed,
              externalApiUsed: true
            };
            await fileRecord.save();
          }
          
          logger.info('=== CONTEÚDO EXTRAÍDO COM SUCESSO ===', {
            fileId,
            fileType,
            contentLength: content.length,
            wordCount: extractionResult.metadata.wordCount,
            characterCount: extractionResult.metadata.characterCount,
            language: extractionResult.metadata.language
          });

          // Now process the extracted content with OpenAI
          let processedContent = content;
          let summary: string | undefined;

          switch (operation) {
            case 'read':
              processedContent = await this.readAndExplainContent(content, options?.language);
              break;
              
            case 'analyze':
              processedContent = await this.analyzeContentWithAI(content, options?.language);
              break;
              
            case 'summarize':
              summary = await this.summarizeContentWithAI(content, options?.maxLength, options?.language);
              processedContent = content; // Keep original content
              break;
              
            case 'extract':
              processedContent = await this.extractKeyInformationWithAI(content, options?.language);
              break;
          }
          
          content = processedContent;
          
          // Update processedAt timestamp
          fileRecord.processedAt = new Date();
          await fileRecord.save();
        } else {
          throw new Error('File not found in database');
        }
      } catch (error: any) {
        logger.error('Error processing file:', error);
        throw new Error(`Arquivo não encontrado ou erro ao processar: ${error.message || 'Erro desconhecido'}`);
      }

      const response: FileProcessResponse = {
        success: true,
        data: {
          content: content,
          summary: undefined, // Will be set if summarize operation was used
          metadata: {
            wordCount: content.split(/\s+/).length,
            characterCount: content.length,
            language: options?.language || 'pt',
            fileType
          }
        }
      };

      // Save processed content to database
      try {
        await FileUploadModel.findByIdAndUpdate(fileId, {
          content: content,
          processedAt: new Date()
        });
        logger.info('Processed content saved to database', { fileId });
      } catch (dbError) {
        logger.warn('Failed to save processed content to database', { fileId, error: dbError });
      }

      logger.info('File processed successfully with OpenAI', {
        fileId,
        agentId,
        operation,
        wordCount: response.data.metadata.wordCount
      });

      return response;
    } catch (error: any) {
      logger.error('Error processing file:', error);
      return {
        success: false,
        data: {
          content: '',
          metadata: {
            wordCount: 0,
            characterCount: 0,
            fileType: 'unknown'
          }
        },
        error: error.message
      };
    }
  }

  private async readAndExplainContent(content: string, language?: string): Promise<string> {
    try {
      const lang = language || 'pt';
      const systemPrompt = lang === 'pt' 
        ? 'Você é um assistente especializado em leitura e explicação de documentos. Leia o conteúdo e forneça uma explicação clara e detalhada em português.'
        : 'You are a specialized assistant for reading and explaining documents. Read the content and provide a clear and detailed explanation in English.';

      const readPrompt = lang === 'pt'
        ? `Leia e explique o seguinte conteúdo de forma clara e detalhada:

${content}

Forneça:
1. Uma explicação geral do conteúdo
2. Os pontos principais
3. Informações importantes destacadas
4. Contexto e relevância do material`
        : `Read and explain the following content clearly and in detail:

${content}

Provide:
1. A general explanation of the content
2. Main points
3. Important information highlighted
4. Context and relevance of the material`;

      const explanation = await openaiService.processMessage([
        { role: 'user', content: readPrompt }
      ], systemPrompt);

      return explanation;
    } catch (error: any) {
      logger.error('Error reading and explaining content:', error);
      return 'Erro ao ler e explicar o conteúdo do arquivo.';
    }
  }

  private async analyzeContentWithAI(content: string, language?: string): Promise<string> {
    try {
      const lang = language || 'pt';
      const systemPrompt = lang === 'pt'
        ? 'Você é um analista de documentos especializado. Forneça análises detalhadas, estruturadas e insights profundos sobre o conteúdo.'
        : 'You are a specialized document analyst. Provide detailed, structured analysis and deep insights about the content.';

      const analysisPrompt = lang === 'pt'
        ? `Analise profundamente o seguinte conteúdo e forneça insights detalhados:

${content}

Forneça uma análise estruturada incluindo:
1. **Resumo Executivo**: Visão geral do conteúdo
2. **Tópicos Principais**: Temas centrais identificados
3. **Análise de Sentimento/Tom**: Tom geral do texto
4. **Pontos-Chave**: Informações mais importantes
5. **Insights e Observações**: Análises profundas
6. **Recomendações**: Sugestões baseadas no conteúdo
7. **Contexto e Relevância**: Importância e aplicabilidade`
        : `Analyze the following content deeply and provide detailed insights:

${content}

Provide a structured analysis including:
1. **Executive Summary**: Overall view of the content
2. **Main Topics**: Central themes identified
3. **Sentiment/Tone Analysis**: General tone of the text
4. **Key Points**: Most important information
5. **Insights and Observations**: Deep analysis
6. **Recommendations**: Suggestions based on content
7. **Context and Relevance**: Importance and applicability`;

      const analysis = await openaiService.processMessage([
        { role: 'user', content: analysisPrompt }
      ], systemPrompt);

      return analysis;
    } catch (error: any) {
      logger.error('Error analyzing content with AI:', error);
      return 'Erro ao analisar o conteúdo do arquivo com IA.';
    }
  }

  private async summarizeContentWithAI(content: string, maxLength?: number, language?: string): Promise<string> {
    try {
      const lang = language || 'pt';
      const maxWords = maxLength || 150;
      const systemPrompt = lang === 'pt'
        ? 'Você é um especialista em resumos. Crie resumos concisos, informativos e bem estruturados em português.'
        : 'You are a summarization expert. Create concise, informative and well-structured summaries in English.';

      const summaryPrompt = lang === 'pt'
        ? `Resuma o seguinte conteúdo em no máximo ${maxWords} palavras, mantendo os pontos principais:

${content}

Forneça um resumo estruturado incluindo:
- **Resumo Geral**: Visão geral do conteúdo
- **Pontos Principais**: Informações mais importantes
- **Conclusões**: Principais conclusões ou insights
- **Relevância**: Por que este conteúdo é importante`
        : `Summarize the following content in a maximum of ${maxWords} words, keeping the main points:

${content}

Provide a structured summary including:
- **General Summary**: Overall view of the content
- **Main Points**: Most important information
- **Conclusions**: Main conclusions or insights
- **Relevance**: Why this content is important`;

      const summary = await openaiService.processMessage([
        { role: 'user', content: summaryPrompt }
      ], systemPrompt);

      return summary;
    } catch (error: any) {
      logger.error('Error summarizing content with AI:', error);
      return 'Erro ao resumir o conteúdo do arquivo com IA.';
    }
  }

  private async extractKeyInformationWithAI(content: string, language?: string): Promise<string> {
    try {
      const lang = language || 'pt';
      const systemPrompt = lang === 'pt'
        ? 'Você é um especialista em extração de informações. Extraia apenas os pontos mais relevantes e importantes do conteúdo.'
        : 'You are an information extraction specialist. Extract only the most relevant and important points from the content.';

      const extractionPrompt = lang === 'pt'
        ? `Extraia as informações mais importantes do seguinte conteúdo:

${content}

Forneça uma extração estruturada incluindo:
1. **Informações Essenciais**: Dados fundamentais
2. **Números e Estatísticas**: Dados quantitativos importantes
3. **Nomes e Entidades**: Pessoas, organizações, lugares mencionados
4. **Datas e Eventos**: Cronologia importante
5. **Conceitos-Chave**: Termos e conceitos principais
6. **Ações e Recomendações**: Próximos passos ou ações sugeridas`
        : `Extract the most important information from the following content:

${content}

Provide a structured extraction including:
1. **Essential Information**: Fundamental data
2. **Numbers and Statistics**: Important quantitative data
3. **Names and Entities**: People, organizations, places mentioned
4. **Dates and Events**: Important chronology
5. **Key Concepts**: Main terms and concepts
6. **Actions and Recommendations**: Next steps or suggested actions`;

      const extraction = await openaiService.processMessage([
        { role: 'user', content: extractionPrompt }
      ], systemPrompt);

      return extraction;
    } catch (error: any) {
      logger.error('Error extracting information with AI:', error);
      return 'Erro ao extrair informações do arquivo com IA.';
    }
  }

  async deleteFile(fileId: string, agentId: string): Promise<boolean> {
    try {
      // Find the file record in database
      const fileRecord = await FileUploadModel.findById(fileId);
      
      if (!fileRecord) {
        logger.warn('File not found in database', { fileId, agentId });
        return false;
      }

      // No need to cleanup screenshots as we're using external API

      // Delete the physical file
      try {
        await fs.unlink(fileRecord.filePath);
        logger.info('Physical file deleted successfully', { fileId, filePath: fileRecord.filePath });
      } catch (fileError) {
        logger.warn('Physical file not found for deletion', { fileId, filePath: fileRecord.filePath });
      }

      // Delete the database record
      await FileUploadModel.findByIdAndDelete(fileId);
      
      logger.info('File record deleted from database successfully', { fileId, agentId });
      return true;
    } catch (error: any) {
      logger.error('Error deleting file:', error);
      return false;
    }
  }

  // Screenshot cleanup no longer needed as we use external API

  async getFileInfo(fileId: string): Promise<FileUpload | null> {
    try {
      const fileRecord = await FileUploadModel.findById(fileId);
      
      if (!fileRecord) {
        return null;
      }

      return {
        id: (fileRecord as any)._id.toString(),
        agentId: fileRecord.agentId,
        originalName: fileRecord.originalName,
        fileName: fileRecord.fileName,
        filePath: fileRecord.filePath,
        fileSize: fileRecord.fileSize,
        mimeType: fileRecord.mimeType,
        uploadedAt: fileRecord.uploadedAt,
        processedAt: fileRecord.processedAt,
        content: fileRecord.content,
        metadata: fileRecord.metadata,
        enrichedMetadata: fileRecord.enrichedMetadata
      };
    } catch (error: any) {
      logger.error('Error getting file info:', error);
      return null;
    }
  }

  async listAgentFiles(agentId: string): Promise<FileUpload[]> {
    try {
      const fileRecords = await FileUploadModel.find({ agentId })
        .sort({ uploadedAt: -1 })
        .exec();

      return fileRecords.map(fileRecord => ({
        id: (fileRecord as any)._id.toString(),
        agentId: fileRecord.agentId,
        originalName: fileRecord.originalName,
        fileName: fileRecord.fileName,
        filePath: fileRecord.filePath,
        fileSize: fileRecord.fileSize,
        mimeType: fileRecord.mimeType,
        uploadedAt: fileRecord.uploadedAt,
        processedAt: fileRecord.processedAt,
        content: fileRecord.content,
        metadata: fileRecord.metadata,
        enrichedMetadata: fileRecord.enrichedMetadata
      }));
    } catch (error: any) {
      logger.error('Error listing agent files:', error);
      return [];
    }
  }

  async listAllFiles(): Promise<FileUpload[]> {
    try {
      const fileRecords = await FileUploadModel.find({})
        .sort({ uploadedAt: -1 })
        .exec();

      return fileRecords.map(fileRecord => ({
        id: (fileRecord as any)._id.toString(),
        agentId: fileRecord.agentId,
        originalName: fileRecord.originalName,
        fileName: fileRecord.fileName,
        filePath: fileRecord.filePath,
        fileSize: fileRecord.fileSize,
        mimeType: fileRecord.mimeType,
        uploadedAt: fileRecord.uploadedAt,
        processedAt: fileRecord.processedAt,
        content: fileRecord.content,
        metadata: fileRecord.metadata,
        enrichedMetadata: fileRecord.enrichedMetadata
      }));
    } catch (error: any) {
      logger.error('Error listing all files:', error);
      return [];
    }
  }

  async saveEnrichedMetadata(fileId: string, enrichedData: any): Promise<boolean> {
    try {
      const updateResult = await FileUploadModel.findByIdAndUpdate(
        fileId,
        {
          enrichedMetadata: enrichedData,
          processedAt: new Date()
        },
        { new: true }
      );

      if (!updateResult) {
        logger.warn('File not found for metadata update', { fileId });
        return false;
      }

      logger.info('Enriched metadata saved successfully', {
        fileId,
        theme: enrichedData.theme,
        tagsCount: enrichedData.tags?.length || 0
      });

      return true;
    } catch (error: any) {
      logger.error('Error saving enriched metadata:', error);
      return false;
    }
  }


  private getPromptForOperation(operation: string, options?: any): string {
    const language = options?.language || 'pt';
    
    switch (operation) {
      case 'read':
        return language === 'pt'
          ? 'Leia e explique o conteúdo deste arquivo de forma clara e detalhada. Forneça uma explicação geral, os pontos principais, informações importantes e o contexto do material.'
          : 'Read and explain the content of this file clearly and in detail. Provide a general explanation, main points, important information, and the context of the material.';
          
      case 'analyze':
        return language === 'pt'
          ? 'Analise profundamente este arquivo e forneça insights detalhados. Inclua resumo executivo, tópicos principais, análise de sentimento, pontos-chave, insights e recomendações.'
          : 'Analyze this file deeply and provide detailed insights. Include executive summary, main topics, sentiment analysis, key points, insights and recommendations.';
          
      case 'summarize':
        const maxWords = options?.maxLength || 150;
        return language === 'pt'
          ? `Resuma o conteúdo deste arquivo em no máximo ${maxWords} palavras, mantendo os pontos principais. Forneça um resumo estruturado com visão geral, pontos principais, conclusões e relevância.`
          : `Summarize the content of this file in a maximum of ${maxWords} words, keeping the main points. Provide a structured summary with overview, main points, conclusions and relevance.`;
          
      case 'extract':
        return language === 'pt'
          ? 'Extraia as informações mais importantes deste arquivo. Inclua informações essenciais, números e estatísticas, nomes e entidades, datas e eventos, conceitos-chave e ações recomendadas.'
          : 'Extract the most important information from this file. Include essential information, numbers and statistics, names and entities, dates and events, key concepts and recommended actions.';
          
      default:
        return language === 'pt'
          ? 'Analise o conteúdo deste arquivo e forneça insights relevantes.'
          : 'Analyze the content of this file and provide relevant insights.';
    }
  }
}

export const fileService = new FileService();
