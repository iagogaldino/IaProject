declare class OpenAIService {
    private client;
    private model;
    private maxTokens;
    private temperature;
    constructor();
    processMessage(messages: Array<{
        role: string;
        content: string;
    }>, agentContext?: string): Promise<string>;
    testConnection(): Promise<boolean>;
    getAvailableModels(): Promise<string[]>;
    uploadFileDirectly(fileBuffer: Buffer, fileName: string, purpose?: 'assistants' | 'batch' | 'fine-tune' | 'vision'): Promise<string>;
    analyzeFileDirectly(fileId: string, prompt: string, language?: string): Promise<string>;
    deleteUploadedFile(fileId: string): Promise<boolean>;
    private getMimeType;
}
export declare const openaiService: OpenAIService;
export {};
//# sourceMappingURL=openaiService.d.ts.map