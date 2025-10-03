import { createWorker } from 'tesseract.js';
import { ExtractedContent } from '../../types';

export class ImageExtractor {
  private worker: any = null;

  constructor() {
    this.initializeWorker();
  }

  private async initializeWorker() {
    try {
      this.worker = await createWorker('por', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar worker do Tesseract:', error);
      throw new Error('Falha ao inicializar processador OCR');
    }
  }

  async extractFromBase64(base64Data: string, filename: string = 'image'): Promise<ExtractedContent> {
    try {
      // Validar se o base64 é válido
      if (!this.isValidBase64(base64Data)) {
        throw new Error('Dados base64 inválidos');
      }

      // Converter base64 para buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Verificar se o worker está inicializado
      if (!this.worker) {
        await this.initializeWorker();
      }

      console.log('Iniciando processamento OCR da imagem...');
      
      // Processar a imagem com OCR
      const { data: { text, confidence } } = await this.worker.recognize(imageBuffer);

      // Limpar e estruturar o texto extraído
      const cleanedText = this.cleanText(text);
      
      console.log(`OCR concluído. Confiança: ${confidence}%`);
      console.log(`Texto extraído: ${cleanedText.length} caracteres`);

      const result: ExtractedContent = {
        filename,
        fileType: 'image',
        content: cleanedText,
        metadata: {
          size: imageBuffer.length,
          confidence: Math.round(confidence),
          characters: cleanedText.length,
          words: cleanedText.split(/\s+/).filter(word => word.length > 0).length,
          lines: cleanedText.split('\n').filter(line => line.trim().length > 0).length
        },
        extractedAt: new Date().toISOString()
      };

      return result;

    } catch (error) {
      console.error('Erro no processamento OCR:', error);
      throw new Error(`Falha ao processar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private isValidBase64(str: string): boolean {
    try {
      // Verificar se é um base64 válido
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str)) {
        return false;
      }

      // Tentar decodificar
      const decoded = Buffer.from(str, 'base64');
      const encoded = decoded.toString('base64');
      
      return encoded === str;
    } catch {
      return false;
    }
  }

  private cleanText(text: string): string {
    if (!text || text.trim().length === 0) {
      return '';
    }

    // Remover caracteres de controle e normalizar espaços
    let cleaned = text
      .replace(/[\r\n\t]+/g, '\n') // Normalizar quebras de linha
      .replace(/[ \t]+/g, ' ') // Normalizar espaços
      .replace(/\n\s*\n/g, '\n') // Remover linhas vazias duplicadas
      .trim();

    // Se o texto estiver muito curto ou contiver apenas caracteres especiais, considerar vazio
    if (cleaned.length < 3 || /^[^\w\s]+$/.test(cleaned)) {
      return '';
    }

    return cleaned;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
