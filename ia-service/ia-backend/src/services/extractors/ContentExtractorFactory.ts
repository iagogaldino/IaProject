import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
import { ExcelContentExtractor } from './ExcelContentExtractor';
import { CsvContentExtractor } from './CsvContentExtractor';
import { WordContentExtractor } from './WordContentExtractor';
import { TextContentExtractor } from './TextContentExtractor';
import { externalExtractorService } from '../externalExtractorService';
import { logger } from '../logger';

export class ContentExtractorFactory {
  private static extractors: Map<string, BaseContentExtractor> = new Map();

  static {
    // Initialize extractors - All file types now use external API
    this.extractors.set('pdf', externalExtractorService);
    this.extractors.set('xlsx', externalExtractorService);
    this.extractors.set('xls', externalExtractorService);
    this.extractors.set('csv', externalExtractorService);
    this.extractors.set('doc', externalExtractorService);
    this.extractors.set('docx', externalExtractorService);
    this.extractors.set('txt', externalExtractorService);
    this.extractors.set('json', externalExtractorService);
  }

  static async extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult> {
    try {
      const fileExtension = this.getFileExtension(fileName);
      const extractor = this.getExtractor(fileExtension);

      if (!extractor) {
        return {
          content: '',
          metadata: {
            wordCount: 0,
            characterCount: 0,
            extractedAt: new Date()
          },
          success: false,
          error: `Tipo de arquivo não suportado: ${fileExtension}`
        };
      }

      logger.info('Starting content extraction', {
        fileName,
        fileExtension,
        bufferSize: fileBuffer.length
      });

      const result = await extractor.extractContent(fileBuffer, fileName);

      logger.info('Content extraction completed', {
        fileName,
        success: result.success,
        contentLength: result.content.length,
        wordCount: result.metadata.wordCount,
        error: result.error
      });

      return result;

    } catch (error: any) {
      logger.error('Error in content extraction factory:', error);
      return {
        content: '',
        metadata: {
          wordCount: 0,
          characterCount: 0,
          extractedAt: new Date()
        },
        success: false,
        error: `Erro na extração de conteúdo: ${error.message || 'Erro desconhecido'}`
      };
    }
  }

  static getSupportedFileTypes(): string[] {
    return Array.from(this.extractors.keys());
  }

  static isFileTypeSupported(fileName: string): boolean {
    const fileExtension = this.getFileExtension(fileName);
    return this.extractors.has(fileExtension);
  }

  private static getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    }
    return fileName.substring(lastDotIndex + 1).toLowerCase();
  }

  private static getExtractor(fileExtension: string): BaseContentExtractor | null {
    return this.extractors.get(fileExtension) || null;
  }

  static async getExternalApiHealth(): Promise<{ status: string; message: string; apiUrl: string }> {
    return await externalExtractorService.getHealthStatus();
  }

  static async testExternalApiConnection(): Promise<boolean> {
    return await externalExtractorService.testConnection();
  }
}
