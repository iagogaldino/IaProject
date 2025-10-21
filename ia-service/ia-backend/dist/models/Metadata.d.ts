import mongoose, { Document } from 'mongoose';
export interface IMetadata extends Document {
    id: string;
    fileId: string;
    agentId: string;
    theme: string;
    improvedContent?: string;
    tags: string[];
    analysis: {
        summary: string;
        keyTopics: string[];
        sentiment: string;
        confidence: number;
        language: string;
    };
    aiAnalysis: {
        processedAt: Date;
        agentId: string;
        version: string;
    };
    embedding?: {
        vector: number[];
        model: string;
        generatedAt: Date;
        version: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Metadata: mongoose.Model<IMetadata, {}, {}, {}, mongoose.Document<unknown, {}, IMetadata, {}, {}> & IMetadata & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Metadata.d.ts.map