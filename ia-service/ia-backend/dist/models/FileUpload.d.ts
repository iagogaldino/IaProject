import mongoose, { Document } from 'mongoose';
export interface IFileUpload extends Document {
    id: string;
    agentId: string;
    originalName: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    processedAt?: Date;
    content?: string;
    screenshotPaths?: string[];
    metadata?: Record<string, any>;
    enrichedMetadata?: {
        theme?: string;
        improvedContent?: string;
        tags?: string[];
        analysis?: {
            summary?: string;
            keyTopics?: string[];
            sentiment?: string;
            confidence?: number;
            language?: string;
        };
        aiAnalysis?: {
            processedAt: Date;
            agentId: string;
            version: string;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const FileUpload: mongoose.Model<IFileUpload, {}, {}, {}, mongoose.Document<unknown, {}, IFileUpload, {}, {}> & IFileUpload & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=FileUpload.d.ts.map