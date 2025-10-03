import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
export declare class WordContentExtractor extends BaseContentExtractor {
    extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;
    private cleanExtractedText;
    private detectLanguage;
}
//# sourceMappingURL=WordContentExtractor.d.ts.map