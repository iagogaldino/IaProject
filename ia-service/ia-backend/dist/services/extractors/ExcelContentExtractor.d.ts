import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
export declare class ExcelContentExtractor extends BaseContentExtractor {
    extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;
    private cleanExtractedText;
    private detectLanguage;
}
//# sourceMappingURL=ExcelContentExtractor.d.ts.map