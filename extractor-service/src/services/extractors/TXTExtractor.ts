import fs from 'fs';
import { BaseExtractor } from './BaseExtractor';
import { ExtractedContent } from '../../types';

export class TXTExtractor implements BaseExtractor {
  async extract(filePath: string, originalName: string): Promise<ExtractedContent> {
    try {
      const stats = fs.statSync(filePath);
      const size = stats.size;

      const extractionResult = await this.performExtraction(filePath);
      
      // Limpar arquivo temporário após extração
      fs.unlinkSync(filePath);

      return {
        filename: originalName,
        fileType: 'txt',
        content: extractionResult.content,
        metadata: {
          size,
          encoding: extractionResult.metadata.encoding,
          lines: extractionResult.metadata.lines,
          characters: extractionResult.metadata.characters,
          words: extractionResult.metadata.words
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
      // Tentar diferentes encodings
      const encodings = ['utf8', 'latin1', 'ascii'];
      let content = '';
      let usedEncoding = 'utf8';

      for (const encoding of encodings) {
        try {
          content = fs.readFileSync(filePath, encoding as BufferEncoding);
          usedEncoding = encoding;
          break;
        } catch (error) {
          continue;
        }
      }

      if (!content) {
        throw new Error('Não foi possível ler o arquivo com nenhum encoding suportado');
      }

      const lines = content.split('\n');
      const characters = content.length;
      const words = content.split(/\s+/).filter(word => word.length > 0).length;

      return {
        content: {
          text: content,
          encoding: usedEncoding,
          lines: lines.length,
          characters,
          words,
          extractionMethod: 'text_reader',
          extractionNote: `Texto extraído com sucesso usando encoding ${usedEncoding}`
        },
        metadata: {
          encoding: usedEncoding,
          lines: lines.length,
          characters,
          words
        }
      };
    } catch (error) {
      throw new Error(`Erro ao extrair conteúdo do TXT: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}
