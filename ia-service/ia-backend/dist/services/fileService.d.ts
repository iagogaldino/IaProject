import { FileUpload, FileUploadRequest, FileProcessRequest, FileProcessResponse } from '../types';
export declare class FileService {
    private readonly uploadDir;
    private readonly maxFileSize;
    constructor();
    private ensureUploadDirectory;
    uploadFile(uploadRequest: FileUploadRequest): Promise<FileUpload>;
    processFile(processRequest: FileProcessRequest): Promise<FileProcessResponse>;
    private readAndExplainContent;
    private analyzeContentWithAI;
    private summarizeContentWithAI;
    private extractKeyInformationWithAI;
    deleteFile(fileId: string, agentId: string): Promise<boolean>;
    getFileInfo(fileId: string): Promise<FileUpload | null>;
    listAgentFiles(agentId: string): Promise<FileUpload[]>;
    listAllFiles(): Promise<FileUpload[]>;
    saveEnrichedMetadata(fileId: string, enrichedData: any): Promise<boolean>;
    private getPromptForOperation;
}
export declare const fileService: FileService;
//# sourceMappingURL=fileService.d.ts.map