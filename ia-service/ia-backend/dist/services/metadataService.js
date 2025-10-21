"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataService = exports.MetadataService = void 0;
const Metadata_1 = require("../models/Metadata");
const Agent_1 = require("../models/Agent");
const logger_1 = require("./logger");
const embeddingService_1 = require("./embeddingService");
class MetadataService {
    async createMetadata(metadataData) {
        try {
            const embeddingResult = await embeddingService_1.embeddingService.generateMetadataEmbedding({
                theme: metadataData.theme,
                tags: metadataData.tags,
                analysis: metadataData.analysis
            });
            const metadata = new Metadata_1.Metadata({
                fileId: metadataData.fileId,
                agentId: metadataData.agentId,
                theme: metadataData.theme,
                improvedContent: metadataData.improvedContent,
                tags: metadataData.tags,
                analysis: metadataData.analysis,
                aiAnalysis: {
                    processedAt: new Date(),
                    agentId: metadataData.agentId,
                    version: '1.0'
                },
                embedding: {
                    vector: embeddingResult.embedding,
                    model: embeddingResult.model,
                    generatedAt: new Date(),
                    version: '1.0'
                }
            });
            const savedMetadata = await metadata.save();
            logger_1.logger.info('Metadata created successfully', {
                metadataId: savedMetadata._id.toString(),
                fileId: metadataData.fileId,
                agentId: metadataData.agentId,
                theme: metadataData.theme,
                tagsCount: metadataData.tags.length
            });
            return {
                id: savedMetadata._id.toString(),
                fileId: savedMetadata.fileId,
                agentId: savedMetadata.agentId,
                theme: savedMetadata.theme,
                improvedContent: savedMetadata.improvedContent,
                tags: savedMetadata.tags,
                analysis: savedMetadata.analysis,
                aiAnalysis: savedMetadata.aiAnalysis,
                embedding: savedMetadata.embedding,
                createdAt: savedMetadata.createdAt,
                updatedAt: savedMetadata.updatedAt
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating metadata:', error);
            throw error;
        }
    }
    async getMetadataByFileId(fileId) {
        try {
            const metadata = await Metadata_1.Metadata.findOne({ fileId }).sort({ createdAt: -1 });
            if (!metadata) {
                return null;
            }
            return {
                id: metadata._id.toString(),
                fileId: metadata.fileId,
                agentId: metadata.agentId,
                theme: metadata.theme,
                improvedContent: metadata.improvedContent,
                tags: metadata.tags,
                analysis: metadata.analysis,
                aiAnalysis: metadata.aiAnalysis,
                embedding: metadata.embedding,
                createdAt: metadata.createdAt,
                updatedAt: metadata.updatedAt
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting metadata by file ID:', error);
            return null;
        }
    }
    async getMetadataByAgentId(agentId) {
        try {
            const metadataList = await Metadata_1.Metadata.find({ agentId }).sort({ createdAt: -1 });
            return metadataList.map(metadata => ({
                id: metadata._id.toString(),
                fileId: metadata.fileId,
                agentId: metadata.agentId,
                theme: metadata.theme,
                improvedContent: metadata.improvedContent,
                tags: metadata.tags,
                analysis: metadata.analysis,
                aiAnalysis: metadata.aiAnalysis,
                embedding: metadata.embedding,
                createdAt: metadata.createdAt,
                updatedAt: metadata.updatedAt
            }));
        }
        catch (error) {
            logger_1.logger.error('Error getting metadata by agent ID:', error);
            return [];
        }
    }
    async updateMetadata(metadataId, updateData) {
        try {
            const updatedMetadata = await Metadata_1.Metadata.findByIdAndUpdate(metadataId, {
                ...updateData,
                updatedAt: new Date()
            }, { new: true });
            if (!updatedMetadata) {
                return null;
            }
            logger_1.logger.info('Metadata updated successfully', {
                metadataId,
                fileId: updatedMetadata.fileId
            });
            return {
                id: updatedMetadata._id.toString(),
                fileId: updatedMetadata.fileId,
                agentId: updatedMetadata.agentId,
                theme: updatedMetadata.theme,
                improvedContent: updatedMetadata.improvedContent,
                tags: updatedMetadata.tags,
                analysis: updatedMetadata.analysis,
                aiAnalysis: updatedMetadata.aiAnalysis,
                createdAt: updatedMetadata.createdAt,
                updatedAt: updatedMetadata.updatedAt
            };
        }
        catch (error) {
            logger_1.logger.error('Error updating metadata:', error);
            return null;
        }
    }
    async deleteMetadata(metadataId) {
        try {
            const result = await Metadata_1.Metadata.findByIdAndDelete(metadataId);
            if (!result) {
                logger_1.logger.warn('Metadata not found for deletion', { metadataId });
                return false;
            }
            logger_1.logger.info('Metadata deleted successfully', { metadataId });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error deleting metadata:', error);
            return false;
        }
    }
    async deleteMetadataByFileId(fileId) {
        try {
            const result = await Metadata_1.Metadata.deleteMany({ fileId });
            logger_1.logger.info('Metadata deleted by file ID', {
                fileId,
                deletedCount: result.deletedCount
            });
            return result.deletedCount > 0;
        }
        catch (error) {
            logger_1.logger.error('Error deleting metadata by file ID:', error);
            return false;
        }
    }
    async searchMetadata(query) {
        try {
            const searchFilter = {};
            if (query.theme) {
                searchFilter.theme = { $regex: query.theme, $options: 'i' };
            }
            if (query.tags && query.tags.length > 0) {
                searchFilter.tags = { $in: query.tags };
            }
            if (query.sentiment) {
                searchFilter['analysis.sentiment'] = query.sentiment;
            }
            if (query.agentId) {
                searchFilter.agentId = query.agentId;
            }
            if (query.dateFrom || query.dateTo) {
                searchFilter.createdAt = {};
                if (query.dateFrom) {
                    searchFilter.createdAt.$gte = query.dateFrom;
                }
                if (query.dateTo) {
                    searchFilter.createdAt.$lte = query.dateTo;
                }
            }
            const metadataList = await Metadata_1.Metadata.find(searchFilter).sort({ createdAt: -1 });
            return metadataList.map(metadata => ({
                id: metadata._id.toString(),
                fileId: metadata.fileId,
                agentId: metadata.agentId,
                theme: metadata.theme,
                improvedContent: metadata.improvedContent,
                tags: metadata.tags,
                analysis: metadata.analysis,
                aiAnalysis: metadata.aiAnalysis,
                createdAt: metadata.createdAt,
                updatedAt: metadata.updatedAt
            }));
        }
        catch (error) {
            logger_1.logger.error('Error searching metadata:', error);
            return [];
        }
    }
    async getMetadataStats() {
        try {
            const totalMetadata = await Metadata_1.Metadata.countDocuments();
            const byTheme = await Metadata_1.Metadata.aggregate([
                { $group: { _id: '$theme', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            const bySentiment = await Metadata_1.Metadata.aggregate([
                { $group: { _id: '$analysis.sentiment', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            const byAgent = await Metadata_1.Metadata.aggregate([
                { $group: { _id: '$agentId', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const recentActivity = await Metadata_1.Metadata.countDocuments({
                createdAt: { $gte: oneWeekAgo }
            });
            return {
                totalMetadata,
                byTheme: byTheme.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
                bySentiment: bySentiment.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
                byAgent: byAgent.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
                recentActivity
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting metadata stats:', error);
            return {
                totalMetadata: 0,
                byTheme: {},
                bySentiment: {},
                byAgent: {},
                recentActivity: 0
            };
        }
    }
    async searchSimilarMetadata(queryText, options = {}) {
        try {
            const { limit = 10, threshold = 0.25, agentId, includeEmbedding = false, numCandidates = 5000 } = options;
            const filter = {
                'embedding.vector': { $exists: true, $ne: [] },
                'embedding.model': 'text-embedding-3-small'
            };
            if (agentId) {
                const agent = await Agent_1.Agent.findById(agentId).exec();
                if (agent && agent.name === 'Agente Database') {
                    logger_1.logger.info('Database agent detected - accessing all documents with enhanced search');
                }
                else if (agent && agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
                    filter.agentId = { $in: [agentId, ...agent.canCommunicateWith] };
                }
                else {
                    filter.agentId = agentId;
                }
            }
            const selectFields = includeEmbedding ? '' : '-embedding.vector';
            const metadataList = await Metadata_1.Metadata.find(filter)
                .select(selectFields)
                .sort({ createdAt: -1 })
                .limit(numCandidates);
            if (metadataList.length === 0) {
                logger_1.logger.warn('No metadata with embeddings found for similarity search', {
                    filter,
                    numCandidates
                });
                return [];
            }
            const metadataWithEmbeddings = metadataList.map(metadata => ({
                metadata: {
                    id: metadata._id.toString(),
                    fileId: metadata.fileId,
                    agentId: metadata.agentId,
                    theme: metadata.theme,
                    improvedContent: metadata.improvedContent,
                    tags: metadata.tags,
                    analysis: metadata.analysis,
                    aiAnalysis: metadata.aiAnalysis,
                    createdAt: metadata.createdAt,
                    updatedAt: metadata.updatedAt
                },
                embedding: metadata.embedding?.vector || []
            }));
            const results = await embeddingService_1.embeddingService.findSimilarMetadata(queryText, metadataWithEmbeddings, limit, threshold);
            logger_1.logger.info('Enhanced similar metadata search completed', {
                queryText: queryText.substring(0, 100) + (queryText.length > 100 ? '...' : ''),
                totalMetadata: metadataList.length,
                candidatesProcessed: numCandidates,
                resultsFound: results.length,
                threshold,
                agentId,
                topSimilarity: results[0]?.similarity || 0,
                avgSimilarity: results.length > 0 ?
                    results.reduce((sum, r) => sum + r.similarity, 0) / results.length : 0
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error('Error searching similar metadata:', error);
            return [];
        }
    }
    async generateMissingEmbeddings(batchSize = 50) {
        try {
            const stats = { processed: 0, errors: 0, updated: 0 };
            const metadataWithoutEmbedding = await Metadata_1.Metadata.find({
                $or: [
                    { 'embedding.vector': { $exists: false } },
                    { 'embedding.vector': { $size: 0 } }
                ]
            }).limit(batchSize);
            logger_1.logger.info('Starting embedding generation for existing metadata', {
                totalToProcess: metadataWithoutEmbedding.length
            });
            for (const metadata of metadataWithoutEmbedding) {
                try {
                    stats.processed++;
                    const embeddingResult = await embeddingService_1.embeddingService.generateMetadataEmbedding({
                        theme: metadata.theme,
                        tags: metadata.tags,
                        analysis: metadata.analysis
                    });
                    await Metadata_1.Metadata.findByIdAndUpdate(metadata._id, {
                        embedding: {
                            vector: embeddingResult.embedding,
                            model: embeddingResult.model,
                            generatedAt: new Date(),
                            version: '1.0'
                        }
                    });
                    stats.updated++;
                    logger_1.logger.info('Embedding generated for metadata', {
                        metadataId: metadata._id.toString(),
                        theme: metadata.theme
                    });
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                catch (error) {
                    stats.errors++;
                    logger_1.logger.error('Error generating embedding for metadata', {
                        metadataId: metadata._id.toString(),
                        error: error.message
                    });
                }
            }
            logger_1.logger.info('Embedding generation batch completed', stats);
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Error in generateMissingEmbeddings:', error);
            throw error;
        }
    }
    async updateMetadataEmbedding(metadataId) {
        try {
            const metadata = await Metadata_1.Metadata.findById(metadataId);
            if (!metadata) {
                logger_1.logger.warn('Metadata not found for embedding update', { metadataId });
                return false;
            }
            const embeddingResult = await embeddingService_1.embeddingService.generateMetadataEmbedding({
                theme: metadata.theme,
                tags: metadata.tags,
                analysis: metadata.analysis
            });
            await Metadata_1.Metadata.findByIdAndUpdate(metadataId, {
                embedding: {
                    vector: embeddingResult.embedding,
                    model: embeddingResult.model,
                    generatedAt: new Date(),
                    version: '1.0'
                }
            });
            logger_1.logger.info('Embedding updated for metadata', {
                metadataId,
                theme: metadata.theme
            });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error updating metadata embedding:', error);
            return false;
        }
    }
    async searchBySemanticTheme(themeQuery, options = {}) {
        try {
            const { limit = 10, threshold = 0.3, agentId, numCandidates = 3000 } = options;
            const filter = {
                'embedding.vector': { $exists: true, $ne: [] },
                'embedding.model': 'text-embedding-3-small'
            };
            if (agentId) {
                const agent = await Agent_1.Agent.findById(agentId).exec();
                if (agent && agent.name === 'Agente Database') {
                    logger_1.logger.info('Database agent - accessing all documents for theme search');
                }
                else if (agent && agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
                    filter.agentId = { $in: [agentId, ...agent.canCommunicateWith] };
                }
                else {
                    filter.agentId = agentId;
                }
            }
            const metadataList = await Metadata_1.Metadata.find(filter)
                .sort({ createdAt: -1 })
                .limit(numCandidates);
            if (metadataList.length === 0) {
                logger_1.logger.warn('No metadata found for theme search', { themeQuery, filter });
                return [];
            }
            const metadataWithEmbeddings = metadataList.map(metadata => ({
                metadata: {
                    id: metadata._id.toString(),
                    fileId: metadata.fileId,
                    agentId: metadata.agentId,
                    theme: metadata.theme,
                    improvedContent: metadata.improvedContent,
                    tags: metadata.tags,
                    analysis: metadata.analysis,
                    createdAt: metadata.createdAt,
                    updatedAt: metadata.updatedAt
                },
                embedding: metadata.embedding?.vector || []
            }));
            const results = await embeddingService_1.embeddingService.findSimilarMetadata(themeQuery, metadataWithEmbeddings, limit, threshold);
            logger_1.logger.info('Enhanced semantic theme search completed', {
                themeQuery,
                totalMetadata: metadataList.length,
                candidatesProcessed: numCandidates,
                resultsFound: results.length,
                threshold,
                topSimilarity: results[0]?.similarity || 0
            });
            return results;
        }
        catch (error) {
            logger_1.logger.error('Error in semantic theme search:', error);
            return [];
        }
    }
}
exports.MetadataService = MetadataService;
exports.metadataService = new MetadataService();
//# sourceMappingURL=metadataService.js.map