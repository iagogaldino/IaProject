import { BaseContentExtractor, ExtractionResult } from './BaseContentExtractor';
export declare class PdfScreenshotExtractor extends BaseContentExtractor {
    private readonly uploadDir;
    constructor();
    extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;
    private isValidPdfBuffer;
    private createImageContentDescription;
    cleanupScreenshots(screenshotPaths: string[]): Promise<void>;
}
//# sourceMappingURL=PdfScreenshotExtractor.d.ts.map