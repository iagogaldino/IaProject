import fs from 'fs';
import path from 'path';
import { ExtractedContent, SupportedFileType } from '../types';
import { ExtractorFactory } from './extractors/ExtractorFactory';

export class ExtractionService {
  private uploadsDir = path.join(__dirname, '../../uploads');
  private extractorFactory: ExtractorFactory;

  constructor() {
    // Garantir que o diretório de uploads existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    
    // Inicializar factory de extractors
    this.extractorFactory = new ExtractorFactory(this.uploadsDir);
  }

  async extractContent(filePath: string, fileType: SupportedFileType, originalName: string): Promise<ExtractedContent> {
    try {
      // Obter o extrator apropriado
      const extractor = this.extractorFactory.getExtractor(fileType.toLowerCase() as SupportedFileType);
      
      // Executar extração usando o extrator específico
      const result = await extractor.extract(filePath, originalName);
      
      return result;

    } catch (error) {
      // Limpar arquivo temporário em caso de erro
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }


  validateFileType(fileType: string): boolean {
    return this.extractorFactory.isTypeSupported(fileType);
  }

  getSupportedTypes(): SupportedFileType[] {
    return this.extractorFactory.getSupportedTypes();
  }

  getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase().substring(1);
  }
}
