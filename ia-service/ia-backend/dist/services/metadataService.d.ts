import { Metadata, CreateMetadataRequest } from '../types';
import { SimilaritySearchResult } from './embeddingService';
export declare class MetadataService {
    createMetadata(metadataData: CreateMetadataRequest): Promise<Metadata>;
    getMetadataByFileId(fileId: string): Promise<Metadata | null>;
    getMetadataByAgentId(agentId: string): Promise<Metadata[]>;
    updateMetadata(metadataId: string, updateData: Partial<CreateMetadataRequest>): Promise<Metadata | null>;
    deleteMetadata(metadataId: string): Promise<boolean>;
    deleteMetadataByFileId(fileId: string): Promise<boolean>;
    searchMetadata(query: {
        theme?: string;
        tags?: string[];
        sentiment?: string;
        agentId?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<Metadata[]>;
    getMetadataStats(): Promise<{
        totalMetadata: number;
        byTheme: Record<string, number>;
        bySentiment: Record<string, number>;
        byAgent: Record<string, number>;
        recentActivity: number;
    }>;
    searchSimilarMetadata(queryText: string, options?: {
        limit?: number;
        threshold?: number;
        agentId?: string;
        includeEmbedding?: boolean;
        numCandidates?: number;
    }): Promise<SimilaritySearchResult[]>;
    generateMissingEmbeddings(batchSize?: number): Promise<{
        processed: number;
        errors: number;
        updated: number;
    }>;
    updateMetadataEmbedding(metadataId: string): Promise<boolean>;
    searchBySemanticTheme(themeQuery: string, options?: {
        limit?: number;
        threshold?: number;
        agentId?: string;
        numCandidates?: number;
    }): Promise<SimilaritySearchResult[]>;
}
export declare const metadataService: MetadataService;
//# sourceMappingURL=metadataService.d.ts.map