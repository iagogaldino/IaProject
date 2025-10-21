export interface EmbeddingResult {
    embedding: number[];
    model: string;
    usage: {
        prompt_tokens: number;
        total_tokens: number;
    };
}
export interface SimilaritySearchResult {
    metadata: any;
    similarity: number;
    distance: number;
}
export declare class EmbeddingService {
    private client;
    private model;
    constructor();
    generateEmbedding(text: string): Promise<EmbeddingResult>;
    generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
    calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number;
    calculateEuclideanDistance(vectorA: number[], vectorB: number[]): number;
    findSimilarMetadata(queryText: string, metadataList: Array<{
        metadata: any;
        embedding: number[];
    }>, limit?: number, threshold?: number): Promise<SimilaritySearchResult[]>;
    generateContextualEmbedding(queryText: string): Promise<EmbeddingResult>;
    private enrichQuery;
    generateMetadataEmbedding(metadata: {
        theme: string;
        tags: string[];
        analysis?: {
            summary?: string;
            keyTopics?: string[];
        };
    }): Promise<EmbeddingResult>;
    private buildContextualMetadataText;
    private truncateText;
    testConnection(): Promise<boolean>;
}
export declare const embeddingService: EmbeddingService;
//# sourceMappingURL=embeddingService.d.ts.map