"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingService = exports.EmbeddingService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config/config");
const logger_1 = require("./logger");
class EmbeddingService {
    constructor() {
        if (!config_1.config.openai.apiKey) {
            throw new Error('OpenAI API key is required for embedding service');
        }
        this.client = new openai_1.default({
            apiKey: config_1.config.openai.apiKey,
        });
        this.model = 'text-embedding-3-small';
    }
    async generateEmbedding(text) {
        try {
            const truncatedText = this.truncateText(text, 8192);
            const response = await this.client.embeddings.create({
                model: this.model,
                input: truncatedText,
                encoding_format: 'float',
            });
            const embedding = response.data[0].embedding;
            const usage = response.usage;
            logger_1.logger.info('Embedding generated successfully', {
                textLength: text.length,
                truncatedLength: truncatedText.length,
                embeddingDimensions: embedding.length,
                model: this.model,
                tokensUsed: usage.total_tokens
            });
            return {
                embedding,
                model: this.model,
                usage: {
                    prompt_tokens: usage.prompt_tokens,
                    total_tokens: usage.total_tokens
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating embedding:', error);
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }
    async generateBatchEmbeddings(texts) {
        try {
            const results = [];
            const batchSize = 100;
            for (let i = 0; i < texts.length; i += batchSize) {
                const batch = texts.slice(i, i + batchSize);
                const response = await this.client.embeddings.create({
                    model: this.model,
                    input: batch.map(text => this.truncateText(text, 8192)),
                    encoding_format: 'float',
                });
                for (let j = 0; j < response.data.length; j++) {
                    const embeddingData = response.data[j];
                    results.push({
                        embedding: embeddingData.embedding,
                        model: this.model,
                        usage: {
                            prompt_tokens: response.usage?.prompt_tokens || 0,
                            total_tokens: response.usage?.total_tokens || 0
                        }
                    });
                }
                if (i + batchSize < texts.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            logger_1.logger.info('Batch embeddings generated successfully', {
                totalTexts: texts.length,
                resultsCount: results.length,
                model: this.model
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error('Error generating batch embeddings:', error);
            throw new Error(`Batch embedding generation failed: ${error.message}`);
        }
    }
    calculateCosineSimilarity(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            logger_1.logger.warn('Vector length mismatch', {
                vectorALength: vectorA.length,
                vectorBLength: vectorB.length
            });
            return 0;
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }
        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);
        if (normA === 0 || normB === 0) {
            return 0;
        }
        return dotProduct / (normA * normB);
    }
    calculateEuclideanDistance(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            logger_1.logger.warn('Vector length mismatch for euclidean distance', {
                vectorALength: vectorA.length,
                vectorBLength: vectorB.length
            });
            return Number.MAX_VALUE;
        }
        let sum = 0;
        for (let i = 0; i < vectorA.length; i++) {
            const diff = vectorA[i] - vectorB[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
    async findSimilarMetadata(queryText, metadataList, limit = 10, threshold = 0.3) {
        try {
            const queryEmbedding = await this.generateContextualEmbedding(queryText);
            const candidateResults = [];
            for (let i = 0; i < metadataList.length; i++) {
                const item = metadataList[i];
                const similarity = this.calculateCosineSimilarity(queryEmbedding.embedding, item.embedding);
                const distance = this.calculateEuclideanDistance(queryEmbedding.embedding, item.embedding);
                candidateResults.push({
                    index: i,
                    similarity,
                    distance
                });
            }
            candidateResults.sort((a, b) => b.similarity - a.similarity);
            const filteredResults = candidateResults
                .filter(candidate => candidate.similarity >= threshold)
                .slice(0, limit);
            const results = filteredResults.map(candidate => ({
                metadata: metadataList[candidate.index].metadata,
                similarity: candidate.similarity,
                distance: candidate.distance
            }));
            logger_1.logger.info('Optimized similar metadata search completed', {
                queryText: queryText.substring(0, 100) + (queryText.length > 100 ? '...' : ''),
                totalMetadata: metadataList.length,
                candidatesProcessed: candidateResults.length,
                foundResults: filteredResults.length,
                returnedResults: results.length,
                threshold,
                topSimilarity: results[0]?.similarity || 0,
                avgSimilarity: results.length > 0 ?
                    results.reduce((sum, r) => sum + r.similarity, 0) / results.length : 0
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error('Error finding similar metadata:', error);
            throw new Error(`Similar metadata search failed: ${error.message}`);
        }
    }
    async generateContextualEmbedding(queryText) {
        try {
            const contextualQuery = this.enrichQuery(queryText);
            logger_1.logger.info('Generating contextual embedding', {
                originalQuery: queryText.substring(0, 100),
                contextualQuery: contextualQuery.substring(0, 200),
                queryLength: queryText.length,
                contextualLength: contextualQuery.length
            });
            return await this.generateEmbedding(contextualQuery);
        }
        catch (error) {
            logger_1.logger.error('Error generating contextual embedding:', error);
            throw error;
        }
    }
    enrichQuery(query) {
        const lowerQuery = query.toLowerCase();
        let enrichedQuery = query;
        if (lowerQuery.includes('gasto') || lowerQuery.includes('total gasto')) {
            enrichedQuery += ' gastos financeiros despesas custos valores monetários investimentos obras públicas';
        }
        if (lowerQuery.includes('petrolina')) {
            enrichedQuery += ' cidade localização região nordeste brasil prefeitura municipal';
        }
        if (lowerQuery.includes('pavimentação') || lowerQuery.includes('pavimentacao')) {
            enrichedQuery += ' pavimentação asfalto ruas vias públicas infraestrutura urbana obras públicas';
        }
        if (lowerQuery.includes('consulte') || lowerQuery.includes('busque') || lowerQuery.includes('metadados')) {
            enrichedQuery += ' consulta busca informações dados documentos conteúdo análise';
        }
        if (lowerQuery.includes('vendas') || lowerQuery.includes('venda')) {
            enrichedQuery += ' vendas comerciais receita faturamento produtos serviços';
        }
        if (lowerQuery.includes('obra') || lowerQuery.includes('obras')) {
            enrichedQuery += ' construção obras projetos engenharia infraestrutura pavimentação';
        }
        if (lowerQuery.includes('investimento')) {
            enrichedQuery += ' investimentos obras públicas infraestrutura pavimentação gastos';
        }
        if (lowerQuery.includes('hoje') || lowerQuery.includes('atual')) {
            enrichedQuery += ' atual momento presente data recente';
        }
        if (lowerQuery.includes('qual o total') || lowerQuery.includes('total de')) {
            enrichedQuery += ' valor total quantidade montante gasto investimento obra';
        }
        return enrichedQuery;
    }
    async generateMetadataEmbedding(metadata) {
        try {
            const contextualText = this.buildContextualMetadataText(metadata);
            return await this.generateEmbedding(contextualText);
        }
        catch (error) {
            logger_1.logger.error('Error generating metadata embedding:', error);
            throw error;
        }
    }
    buildContextualMetadataText(metadata) {
        const parts = [
            `Tema: ${metadata.theme}`,
            `Tags: ${metadata.tags.join(', ')}`,
            metadata.analysis?.summary ? `Resumo: ${metadata.analysis.summary}` : '',
            metadata.analysis?.keyTopics ? `Tópicos: ${metadata.analysis.keyTopics.join(', ')}` : ''
        ].filter(Boolean);
        return parts.join('. ');
    }
    truncateText(text, maxTokens) {
        const maxChars = maxTokens * 4;
        if (text.length <= maxChars) {
            return text;
        }
        return text.substring(0, maxChars - 3) + '...';
    }
    async testConnection() {
        try {
            const testEmbedding = await this.generateEmbedding('Test connection');
            return testEmbedding.embedding.length > 0;
        }
        catch (error) {
            logger_1.logger.error('Embedding service connection test failed:', error);
            return false;
        }
    }
}
exports.EmbeddingService = EmbeddingService;
exports.embeddingService = new EmbeddingService();
//# sourceMappingURL=embeddingService.js.map