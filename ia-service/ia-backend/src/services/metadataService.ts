import { Metadata as MetadataModel, IMetadata } from '../models/Metadata';
import { logger } from './logger';
import { Metadata, CreateMetadataRequest } from '../types';

export class MetadataService {
  async createMetadata(metadataData: CreateMetadataRequest): Promise<Metadata> {
    try {
      const metadata = new MetadataModel({
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

      logger.info('Metadata created successfully', {
        metadataId: (savedMetadata as any)._id.toString(),
        fileId: metadataData.fileId,
        agentId: metadataData.agentId,
        theme: metadataData.theme,
        tagsCount: metadataData.tags.length
      });

      return {
        id: (savedMetadata as any)._id.toString(),
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
    } catch (error: any) {
      logger.error('Error creating metadata:', error);
      throw error;
    }
  }

  async getMetadataByFileId(fileId: string): Promise<Metadata | null> {
    try {
      const metadata = await MetadataModel.findOne({ fileId }).sort({ createdAt: -1 });
      
      if (!metadata) {
        return null;
      }

      return {
        id: (metadata as any)._id.toString(),
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
    } catch (error: any) {
      logger.error('Error getting metadata by file ID:', error);
      return null;
    }
  }

  async getMetadataByAgentId(agentId: string): Promise<Metadata[]> {
    try {
      const metadataList = await MetadataModel.find({ agentId }).sort({ createdAt: -1 });

      return metadataList.map(metadata => ({
        id: (metadata as any)._id.toString(),
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
    } catch (error: any) {
      logger.error('Error getting metadata by agent ID:', error);
      return [];
    }
  }

  async updateMetadata(metadataId: string, updateData: Partial<CreateMetadataRequest>): Promise<Metadata | null> {
    try {
      const updatedMetadata = await MetadataModel.findByIdAndUpdate(
        metadataId,
        {
          ...updateData,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!updatedMetadata) {
        return null;
      }

      logger.info('Metadata updated successfully', {
        metadataId,
        fileId: updatedMetadata.fileId
      });

      return {
        id: (updatedMetadata as any)._id.toString(),
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
    } catch (error: any) {
      logger.error('Error updating metadata:', error);
      return null;
    }
  }

  async deleteMetadata(metadataId: string): Promise<boolean> {
    try {
      const result = await MetadataModel.findByIdAndDelete(metadataId);
      
      if (!result) {
        logger.warn('Metadata not found for deletion', { metadataId });
        return false;
      }

      logger.info('Metadata deleted successfully', { metadataId });
      return true;
    } catch (error: any) {
      logger.error('Error deleting metadata:', error);
      return false;
    }
  }

  async deleteMetadataByFileId(fileId: string): Promise<boolean> {
    try {
      const result = await MetadataModel.deleteMany({ fileId });
      
      logger.info('Metadata deleted by file ID', {
        fileId,
        deletedCount: result.deletedCount
      });

      return result.deletedCount > 0;
    } catch (error: any) {
      logger.error('Error deleting metadata by file ID:', error);
      return false;
    }
  }

  async searchMetadata(query: {
    theme?: string;
    tags?: string[];
    sentiment?: string;
    agentId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Metadata[]> {
    try {
      const searchFilter: any = {};

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

      const metadataList = await MetadataModel.find(searchFilter).sort({ createdAt: -1 });

      return metadataList.map(metadata => ({
        id: (metadata as any)._id.toString(),
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
    } catch (error: any) {
      logger.error('Error searching metadata:', error);
      return [];
    }
  }

  async getMetadataStats(): Promise<{
    totalMetadata: number;
    byTheme: Record<string, number>;
    bySentiment: Record<string, number>;
    byAgent: Record<string, number>;
    recentActivity: number;
  }> {
    try {
      const totalMetadata = await MetadataModel.countDocuments();
      
      const byTheme = await MetadataModel.aggregate([
        { $group: { _id: '$theme', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const bySentiment = await MetadataModel.aggregate([
        { $group: { _id: '$analysis.sentiment', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const byAgent = await MetadataModel.aggregate([
        { $group: { _id: '$agentId', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentActivity = await MetadataModel.countDocuments({
        createdAt: { $gte: oneWeekAgo }
      });

      return {
        totalMetadata,
        byTheme: byTheme.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        bySentiment: bySentiment.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byAgent: byAgent.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        recentActivity
      };
    } catch (error: any) {
      logger.error('Error getting metadata stats:', error);
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

export const metadataService = new MetadataService();
