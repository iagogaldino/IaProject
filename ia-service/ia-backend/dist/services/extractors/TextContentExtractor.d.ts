import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
export declare class TextContentExtractor extends BaseContentExtractor {
    extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;
    private cleanExtractedText;
    private detectLanguage;
}
//# sourceMappingURL=TextContentExtractor.d.ts.map