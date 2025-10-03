import { ImageExtractor } from './extractors/ImageExtractor';
import { ExtractedContent } from '../types';

export class ImageProcessingService {
  private imageExtractor: ImageExtractor;

  constructor() {
    this.imageExtractor = new ImageExtractor();
  }

  async processBase64Image(base64Data: string, filename?: string): Promise<ExtractedContent> {
    try {
      console.log('=== PROCESSAMENTO DE IMAGEM INICIADO ===');
      console.log(`Tamanho dos dados base64: ${base64Data.length} caracteres`);
      
      // Validar dados de entrada
      if (!base64Data || base64Data.trim().length === 0) {
        throw new Error('Dados base64 não fornecidos');
      }

      // Remover prefixo data:image se presente
      const cleanBase64 = this.cleanBase64Data(base64Data);
      
      // Processar imagem com OCR
      const result = await this.imageExtractor.extractFromBase64(cleanBase64, filename || 'image');
      
      console.log('=== PROCESSAMENTO DE IMAGEM CONCLUÍDO ===');
      console.log(`Texto extraído: ${result.content.length} caracteres`);
      console.log(`Confiança OCR: ${result.metadata?.confidence}%`);
      
      return result;

    } catch (error) {
      console.error('=== ERRO NO PROCESSAMENTO DE IMAGEM ===');
      console.error(error);
      throw error;
    }
  }

  private cleanBase64Data(base64Data: string): string {
    // Remover prefixo data:image/...;base64, se presente
    const dataUrlMatch = base64Data.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (dataUrlMatch) {
      return dataUrlMatch[1];
    }
    
    return base64Data.trim();
  }

  async terminate() {
    await this.imageExtractor.terminate();
  }
}
