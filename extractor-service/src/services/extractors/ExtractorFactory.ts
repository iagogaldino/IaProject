import { BaseExtractor } from './BaseExtractor';
import { PDFExtractor } from './PDFExtractor';
import { PDFImageExtractor } from './PDFImageExtractor';
import { ExcelExtractor } from './ExcelExtractor';
import { TXTExtractor } from './TXTExtractor';
import { SupportedFileType } from '../../types';

export class ExtractorFactory {
  private extractors: Map<SupportedFileType, BaseExtractor>;

  constructor(uploadsDir: string) {
    this.extractors = new Map();
    this.initializeExtractors(uploadsDir);
  }

  private initializeExtractors(uploadsDir: string): void {
    this.extractors.set('pdf', new PDFExtractor(uploadsDir));
    this.extractors.set('pdf-images', new PDFImageExtractor(uploadsDir));
    this.extractors.set('excel', new ExcelExtractor());
    this.extractors.set('txt', new TXTExtractor());
  }

  getExtractor(fileType: SupportedFileType): BaseExtractor {
    const extractor = this.extractors.get(fileType);
    
    if (!extractor) {
      throw new Error(`Extrator não encontrado para o tipo: ${fileType}`);
    }
    
    return extractor;
  }

  getSupportedTypes(): SupportedFileType[] {
    return Array.from(this.extractors.keys());
  }

  isTypeSupported(fileType: string): boolean {
    return this.extractors.has(fileType.toLowerCase() as SupportedFileType);
  }
}
