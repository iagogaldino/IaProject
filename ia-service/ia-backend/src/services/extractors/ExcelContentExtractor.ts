import * as XLSX from 'xlsx';
import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
import { logger } from '../logger';

export class ExcelContentExtractor extends BaseContentExtractor {
  async extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult> {
    try {
      logger.info('Starting Excel content extraction', { fileName, bufferSize: fileBuffer.length });

      // Read the workbook
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return this.createErrorResult('Arquivo Excel não contém planilhas');
      }

      let content = '';
      const sheetCount = workbook.SheetNames.length;

      // Process each worksheet
      for (let i = 0; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i];
        const worksheet = workbook.Sheets[sheetName];
        
        content += `\n=== PLANILHA ${i + 1}: ${sheetName} ===\n`;
        
        // Convert to JSON to get structured data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, // Use first row as header
          defval: '' // Default value for empty cells
        });

        if (Array.isArray(jsonData) && jsonData.length > 0) {
          // Process each row
          jsonData.forEach((row: any, rowIndex: number) => {
            if (Array.isArray(row) && row.length > 0) {
              // Filter out empty cells and join with separator
              const rowContent = row
                .filter(cell => cell !== undefined && cell !== null && cell !== '')
                .map(cell => String(cell).trim())
                .join(' | ');
              
              if (rowContent.trim()) {
                content += `Linha ${rowIndex + 1}: ${rowContent}\n`;
              }
            }
          });
        }

        content += '\n';
      }

      if (content.trim().length === 0) {
        return this.createErrorResult('Planilha Excel não contém dados válidos');
      }

      // Clean up the content
      content = this.cleanExtractedText(content);
      content = this.truncateContent(content);

      const result = this.createSuccessResult(content, {
        sheetCount,
        language: this.detectLanguage(content)
      });

      this.logExtraction(fileName, result);
      return result;

    } catch (error: any) {
      logger.error('Error extracting Excel content:', error);
      return this.createErrorResult(`Erro ao extrair conteúdo do Excel: ${error.message || 'Erro desconhecido'}`);
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Clean up separators
      .replace(/\|\s*\|/g, '|')
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
