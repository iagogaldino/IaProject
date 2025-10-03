export interface ExtractionResult {
    content: string;
    metadata: {
        wordCount: number;
        characterCount: number;
        pageCount?: number;
        sheetCount?: number;
        language?: string;
        extractedAt: Date;
        screenshotPaths?: string[];
        screenshotCount?: number;
        aiProcessed?: boolean;
        externalApiUsed?: boolean;
        fileType?: string;
    };
    success: boolean;
    error?: string;
}
export declare abstract class BaseContentExtractor {
    protected readonly maxContentLength: number;
    abstract extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;
    protected logExtraction(fileName: string, result: ExtractionResult): void;
    protected createSuccessResult(content: string, additionalMetadata?: Partial<ExtractionResult['metadata']>): ExtractionResult;
    protected createErrorResult(error: string): ExtractionResult;
    protected truncateContent(content: string): string;
}
//# sourceMappingURL=BaseContentExtractor.d.ts.map