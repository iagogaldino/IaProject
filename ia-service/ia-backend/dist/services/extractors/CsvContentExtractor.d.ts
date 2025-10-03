import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
export declare class CsvContentExtractor extends BaseContentExtractor {
    extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;
    private cleanExtractedText;
    private detectLanguage;
}
//# sourceMappingURL=CsvContentExtractor.d.ts.map