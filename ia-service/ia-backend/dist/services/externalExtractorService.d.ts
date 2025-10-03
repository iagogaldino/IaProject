import { BaseContentExtractor, ExtractionResult } from './extractors/BaseContentExtractor';
export interface ExternalExtractionResponse {
    success: boolean;
    data?: {
        content: string;
        metadata: {
            wordCount: number;
            characterCount: number;
            pageCount?: number;
            language?: string;
            fileType: string;
            extractedAt: string;
            aiProcessed?: boolean;
        };
        error?: string;
    };
    error?: string;
}
export declare class ExternalExtractorService extends BaseContentExtractor {
    private readonly apiUrl;
    private readonly timeout;
    constructor();
    extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;
    private getFileTypeFromName;
    private getMimeType;
    testConnection(): Promise<boolean>;
    getHealthStatus(): Promise<{
        status: string;
        message: string;
        apiUrl: string;
    }>;
}
export declare const externalExtractorService: ExternalExtractorService;
//# sourceMappingURL=externalExtractorService.d.ts.map