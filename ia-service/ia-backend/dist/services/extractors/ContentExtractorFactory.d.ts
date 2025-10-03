import { ExtractionResult } from './BaseContentExtractor';
export declare class ContentExtractorFactory {
    private static extractors;
    static extractContent(fileBuffer: Buffer, fileName: string): Promise<ExtractionResult>;
    static getSupportedFileTypes(): string[];
    static isFileTypeSupported(fileName: string): boolean;
    private static getFileExtension;
    private static getExtractor;
    static getExternalApiHealth(): Promise<{
        status: string;
        message: string;
        apiUrl: string;
    }>;
    static testExternalApiConnection(): Promise<boolean>;
}
//# sourceMappingURL=ContentExtractorFactory.d.ts.map