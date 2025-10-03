const csvParser = require('csv-parser');
import { Readable } from 'stream';
import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
import { logger } from '../logger';

export class CsvContentExtractor extends BaseContentExtractor {
  async extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult> {
    try {
      logger.info('Starting CSV content extraction', { fileName, bufferSize: fileBuffer.length });

      const csvData: any[] = [];
      const stream = Readable.from(fileBuffer);

      await new Promise((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on('data', (row: any) => {
            csvData.push(row);
          })
          .on('end', resolve)
          .on('error', reject);
      });

      if (csvData.length === 0) {
        return this.createErrorResult('Arquivo CSV não contém dados válidos');
      }

      let content = '=== DADOS CSV ===\n';
      
      // Get headers from first row
      const headers = Object.keys(csvData[0]);
      content += `Colunas: ${headers.join(', ')}\n\n`;

      // Process each row
      csvData.forEach((row, index) => {
        content += `Linha ${index + 1}:\n`;
        headers.forEach(header => {
          const value = row[header] || '';
          if (value.toString().trim()) {
            content += `  ${header}: ${value}\n`;
          }
        });
        content += '\n';
      });

      // Clean up the content
      content = this.cleanExtractedText(content);
      content = this.truncateContent(content);

      const result = this.createSuccessResult(content, {
        language: this.detectLanguage(content)
      });

      this.logExtraction(fileName, result);
      return result;

    } catch (error: any) {
      logger.error('Error extracting CSV content:', error);
      return this.createErrorResult(`Erro ao extrair conteúdo do CSV: ${error.message || 'Erro desconhecido'}`);
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove empty lines
      .replace(/^\s*$/gm, '')
      .trim();
  }

  private detectLanguage(text: string): string {
    // Simple language detection
    const portugueseWords = ['de', 'da', 'do', 'para', 'com', 'em', 'na', 'no', 'que', 'uma', 'um'];
    const englishWords = ['the', 'and', 'for', 'with', 'in', 'on', 'at', 'to', 'of', 'a', 'an'];
    
    const words = text.toLowerCase().split(/\s+/);
    const portugueseCount = words.filter(word => portugueseWords.includes(word)).length;
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    
    return portugueseCount > englishCount ? 'pt' : 'en';
  }
}
