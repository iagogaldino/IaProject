import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
import { logger } from '../logger';

export class TextContentExtractor extends BaseContentExtractor {
  async extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult> {
    try {
      logger.info('Starting text content extraction', { fileName, bufferSize: fileBuffer.length });

      // Try different encodings
      let content = '';
      const encodings = ['utf8', 'latin1', 'ascii', 'utf16le'];

      for (const encoding of encodings) {
        try {
          content = fileBuffer.toString(encoding as BufferEncoding);
          if (content && content.trim().length > 0) {
            logger.info('Text extracted successfully', { fileName, encoding });
            break;
          }
        } catch (error) {
          logger.warn('Failed to extract with encoding', { fileName, encoding, error });
        }
      }

      if (!content || content.trim().length === 0) {
        return this.createErrorResult('Arquivo de texto não contém conteúdo válido ou está em formato não suportado');
      }

      // Clean up the content
      content = this.cleanExtractedText(content);
      content = this.truncateContent(content);

      const result = this.createSuccessResult(content, {
        language: this.detectLanguage(content)
      });

      this.logExtraction(fileName, result);
      return result;

    } catch (error: any) {
      logger.error('Error extracting text content:', error);
      return this.createErrorResult(`Erro ao extrair conteúdo do texto: ${error.message || 'Erro desconhecido'}`);
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
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
