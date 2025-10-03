import fs from 'fs';
import * as XLSX from 'xlsx';
import { BaseExtractor } from './BaseExtractor';
import { ExtractedContent } from '../../types';

export class ExcelExtractor implements BaseExtractor {
  async extract(filePath: string, originalName: string): Promise<ExtractedContent> {
    try {
      const stats = fs.statSync(filePath);
      const size = stats.size;

      const extractionResult = await this.performExtraction(filePath);
      
      // Limpar arquivo temporário após extração
      fs.unlinkSync(filePath);

      return {
        filename: originalName,
        fileType: 'excel',
        content: extractionResult.content,
        metadata: {
          size,
          sheets: extractionResult.metadata.sheets
        },
        extractedAt: new Date().toISOString()
      };

    } catch (error) {
      // Limpar arquivo temporário em caso de erro
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  private async performExtraction(filePath: string): Promise<{ content: any; metadata: any }> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheets: any = {};

      // Extrair dados de todas as planilhas
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        sheets[sheetName] = jsonData;
      });

      return {
        content: {
          sheets,
          sheetNames: workbook.SheetNames,
          metadata: workbook.Props,
          extractionMethod: 'xlsx_parser',
          extractionNote: 'Dados extraídos com sucesso de todas as planilhas'
        },
        metadata: {
          sheets: workbook.SheetNames,
          totalSheets: workbook.SheetNames.length
        }
      };
    } catch (error) {
      throw new Error(`Erro ao extrair conteúdo do Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}
