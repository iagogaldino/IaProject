"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataService = exports.MetadataService = void 0;
const Metadata_1 = require("../models/Metadata");
const logger_1 = require("./logger");
class MetadataService {
    async createMetadata(metadataData) {
        try {
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
}
exports.MetadataService = MetadataService;
exports.metadataService = new MetadataService();
//# sourceMappingURL=metadataService.js.map