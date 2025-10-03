const mammoth = require('mammoth');
import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
import { logger } from '../logger';

export class WordContentExtractor extends BaseContentExtractor {
  async extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult> {
    try {
      logger.info('Starting Word content extraction', { fileName, bufferSize: fileBuffer.length });

      const result = await mammoth.extractRawText({ buffer: fileBuffer });

      if (!result.value || result.value.trim().length === 0) {
        return this.createErrorResult('Documento Word não contém texto extraível');
      }

      let content = result.value.trim();
      
      // Clean up the extracted text
      content = this.cleanExtractedText(content);

      if (content.length === 0) {
        return this.createErrorResult('Nenhum texto válido encontrado no documento Word');
      }

      // Truncate if too long
      content = this.truncateContent(content);

      const extractionResult = this.createSuccessResult(content, {
        language: this.detectLanguage(content)
      });

      // Log any warnings from mammoth
      if (result.messages && result.messages.length > 0) {
        logger.warn('Word extraction warnings', {
          fileName,
          warnings: result.messages.map((msg: any) => msg.message)
        });
      }

      this.logExtraction(fileName, extractionResult);
      return extractionResult;

    } catch (error: any) {
      logger.error('Error extracting Word content:', error);
      return this.createErrorResult(`Erro ao extrair conteúdo do Word: ${error.message || 'Erro desconhecido'}`);
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page breaks and section breaks
      .replace(/\f/g, '\n')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Remove common Word artifacts
      .replace(/[^\w\s\u00C0-\u017F.,!?;:()\-'"]/g, ' ')
      // Clean up multiple spaces
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private detectLanguage(text: string): string {
    // Simple language detection
    const portugueseWords = ['de', 'da', 'do', 'para', 'com', 'em', 'na', 'no', 'que', 'uma', 'um', 'é', 'são'];
    const englishWords = ['the', 'and', 'for', 'with', 'in', 'on', 'at', 'to', 'of', 'a', 'an', 'is', 'are'];
    
    const words = text.toLowerCase().split(/\s+/);
    const portugueseCount = words.filter(word => portugueseWords.includes(word)).length;
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    
    return portugueseCount > englishCount ? 'pt' : 'en';
  }
}
