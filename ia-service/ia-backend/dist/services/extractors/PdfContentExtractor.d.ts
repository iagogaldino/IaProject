import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
export declare class PdfContentExtractor extends BaseContentExtractor {
    extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;
    private isValidPdfBuffer;
    private cleanExtractedText;
    private detectLanguage;
}
//# sourceMappingURL=PdfContentExtractor.d.ts.map