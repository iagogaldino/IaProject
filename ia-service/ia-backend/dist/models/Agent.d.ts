import mongoose, { Document } from 'mongoose';
export interface IAgent extends Document {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    canCommunicateWith: string[];
    databaseAccess?: {
        enabled: boolean;
        allowedCollections: string[];
        allowedOperations: ('read' | 'write' | 'update' | 'delete')[];
        queryLimits?: {
            maxResults: number;
            timeout: number;
        };
    };
    fileAccess?: {
        enabled: boolean;
        allowedFileTypes: string[];
        maxFileSize: number;
        allowedOperations: ('read' | 'upload' | 'delete')[];
        storagePath?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Agent: mongoose.Model<IAgent, {}, {}, {}, mongoose.Document<unknown, {}, IAgent, {}, {}> & IAgent & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Agent.d.ts.map