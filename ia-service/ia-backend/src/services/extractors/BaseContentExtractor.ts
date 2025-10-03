import { logger } from '../logger';

export interface ExtractionResult {
  content: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    pageCount?: number;
    sheetCount?: number;
    language?: string;
    extractedAt: Date;
    screenshotPaths?: string[];
    screenshotCount?: number;
    aiProcessed?: boolean;
    externalApiUsed?: boolean;
    fileType?: string;
  };
  success: boolean;
  error?: string;
}

export abstract class BaseContentExtractor {
  protected readonly maxContentLength: number = 1000000; // 1MB limit

  abstract extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;

  protected logExtraction(fileName: string, result: ExtractionResult): void {
    logger.info('Content extraction completed', {
      fileName,
      success: result.success,
      contentLength: result.content.length,
      wordCount: result.metadata.wordCount,
      characterCount: result.metadata.characterCount,
      error: result.error
    });
  }

  protected createSuccessResult(content: string, additionalMetadata: Partial<ExtractionResult['metadata']> = {}): ExtractionResult {
    return {
      content,
      metadata: {
        wordCount: content.split(/\s+/).length,
        characterCount: content.length,
        extractedAt: new Date(),
        ...additionalMetadata
      },
      success: true
    };
  }

  protected createErrorResult(error: string): ExtractionResult {
    return {
      content: '',
      metadata: {
        wordCount: 0,
        characterCount: 0,
        extractedAt: new Date()
      },
      success: false,
      error
    };
  }

  protected truncateContent(content: string): string {
    if (content.length > this.maxContentLength) {
      logger.warn('Content truncated due to length limit', {
        originalLength: content.length,
        maxLength: this.maxContentLength
      });
      return content.substring(0, this.maxContentLength) + '\n\n[Conteúdo truncado devido ao limite de tamanho]';
    }
    return content;
  }
}
