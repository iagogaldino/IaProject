import { Metadata as MetadataModel, IMetadata } from '../models/Metadata';
import { Agent as AgentModel } from '../models/Agent';
import { logger } from './logger';
import { Metadata, CreateMetadataRequest } from '../types';
import { embeddingService, SimilaritySearchResult } from './embeddingService';

export class MetadataService {
  async createMetadata(metadataData: CreateMetadataRequest): Promise<Metadata> {
    try {
      // Gerar embedding para os metadados
      const embeddingResult = await embeddingService.generateMetadataEmbedding({
        theme: metadataData.theme,
        tags: metadataData.tags,
        analysis: metadataData.analysis
      });

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
        },
        embedding: {
          vector: embeddingResult.embedding,
          model: embeddingResult.model,
          generatedAt: new Date(),
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
        embedding: savedMetadata.embedding,
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
        embedding: metadata.embedding,
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
        embedding: metadata.embedding,
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

  /**
   * Busca metadados similares usando embedding otimizado
   */
  async searchSimilarMetadata(
    queryText: string,
    options: {
      limit?: number;
      threshold?: number;
      agentId?: string;
      includeEmbedding?: boolean;
      numCandidates?: number;
    } = {}
  ): Promise<SimilaritySearchResult[]> {
    try {
      const { 
        limit = 10, 
        threshold = 0.25, 
        agentId, 
        includeEmbedding = false,
        numCandidates = 5000
      } = options;

      // Buscar metadados com embedding usando numCandidates otimizado
      const filter: any = { 
        'embedding.vector': { $exists: true, $ne: [] },
        'embedding.model': 'text-embedding-3-small' // Garantir consistência do modelo
      };
      
      if (agentId) {
        // Buscar o agente para verificar se é o Agente Database
        const agent = await AgentModel.findById(agentId).exec();
        if (agent && agent.name === 'Agente Database') {
          // O Agente Database deve ter acesso a TODOS os documentos
          logger.info('Database agent detected - accessing all documents with enhanced search');
        } else if (agent && agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
          // Incluir documentos do agente atual e dos agentes que podem se comunicar
          filter.agentId = { $in: [agentId, ...agent.canCommunicateWith] };
        } else {
          // Se não pode se comunicar com outros agentes, buscar apenas seus próprios documentos
          filter.agentId = agentId;
        }
      }

      // Usar numCandidates para otimizar a busca
      const selectFields = includeEmbedding ? '' : '-embedding.vector';
      const metadataList = await MetadataModel.find(filter)
        .select(selectFields)
        .sort({ createdAt: -1 }) // Priorizar documentos mais recentes
        .limit(numCandidates);

      if (metadataList.length === 0) {
        logger.warn('No metadata with embeddings found for similarity search', { 
          filter, 
          numCandidates 
        });
        return [];
      }

      // Preparar dados para busca de similaridade otimizada
      const metadataWithEmbeddings = metadataList.map(metadata => ({
        metadata: {
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
        },
        embedding: metadata.embedding?.vector || []
      }));

      // Realizar busca de similaridade otimizada
      const results = await embeddingService.findSimilarMetadata(
        queryText,
        metadataWithEmbeddings,
        limit,
        threshold
      );

      logger.info('Enhanced similar metadata search completed', {
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
    } catch (error: any) {
      logger.error('Error searching similar metadata:', error);
      return [];
    }
  }

  /**
   * Gera embeddings para metadados existentes que não possuem embedding
   */
  async generateMissingEmbeddings(batchSize: number = 50): Promise<{
    processed: number;
    errors: number;
    updated: number;
  }> {
    try {
      const stats = { processed: 0, errors: 0, updated: 0 };

      // Buscar metadados sem embedding
      const metadataWithoutEmbedding = await MetadataModel.find({
        $or: [
          { 'embedding.vector': { $exists: false } },
          { 'embedding.vector': { $size: 0 } }
        ]
      }).limit(batchSize);

      logger.info('Starting embedding generation for existing metadata', {
        totalToProcess: metadataWithoutEmbedding.length
      });

      for (const metadata of metadataWithoutEmbedding) {
        try {
          stats.processed++;

          // Gerar embedding
          const embeddingResult = await embeddingService.generateMetadataEmbedding({
            theme: metadata.theme,
            tags: metadata.tags,
            analysis: metadata.analysis
          });

          // Atualizar metadado com embedding
          await MetadataModel.findByIdAndUpdate(
            (metadata as any)._id,
            {
              embedding: {
                vector: embeddingResult.embedding,
                model: embeddingResult.model,
                generatedAt: new Date(),
                version: '1.0'
              }
            }
          );

          stats.updated++;

          logger.info('Embedding generated for metadata', {
            metadataId: (metadata as any)._id.toString(),
            theme: metadata.theme
          });

          // Pequena pausa para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error: any) {
          stats.errors++;
          logger.error('Error generating embedding for metadata', {
            metadataId: (metadata as any)._id.toString(),
            error: error.message
          });
        }
      }

      logger.info('Embedding generation batch completed', stats);
      return stats;

    } catch (error: any) {
      logger.error('Error in generateMissingEmbeddings:', error);
      throw error;
    }
  }

  /**
   * Atualiza embedding de um metadado específico
   */
  async updateMetadataEmbedding(metadataId: string): Promise<boolean> {
    try {
      const metadata = await MetadataModel.findById(metadataId);
      
      if (!metadata) {
        logger.warn('Metadata not found for embedding update', { metadataId });
        return false;
      }

      // Gerar novo embedding
      const embeddingResult = await embeddingService.generateMetadataEmbedding({
        theme: metadata.theme,
        tags: metadata.tags,
        analysis: metadata.analysis
      });

      // Atualizar metadado
      await MetadataModel.findByIdAndUpdate(
        metadataId,
        {
          embedding: {
            vector: embeddingResult.embedding,
            model: embeddingResult.model,
            generatedAt: new Date(),
            version: '1.0'
          }
        }
      );

      logger.info('Embedding updated for metadata', {
        metadataId,
        theme: metadata.theme
      });

      return true;
    } catch (error: any) {
      logger.error('Error updating metadata embedding:', error);
      return false;
    }
  }

  /**
   * Busca metadados por tema usando similaridade semântica otimizada
   */
  async searchBySemanticTheme(
    themeQuery: string,
    options: {
      limit?: number;
      threshold?: number;
      agentId?: string;
      numCandidates?: number;
    } = {}
  ): Promise<SimilaritySearchResult[]> {
    try {
      const { 
        limit = 10, 
        threshold = 0.3, 
        agentId,
        numCandidates = 3000
      } = options;

      // Buscar metadados com embedding otimizado
      const filter: any = { 
        'embedding.vector': { $exists: true, $ne: [] },
        'embedding.model': 'text-embedding-3-small'
      };
      
      if (agentId) {
        const agent = await AgentModel.findById(agentId).exec();
        if (agent && agent.name === 'Agente Database') {
          logger.info('Database agent - accessing all documents for theme search');
        } else if (agent && agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
          filter.agentId = { $in: [agentId, ...agent.canCommunicateWith] };
        } else {
          filter.agentId = agentId;
        }
      }

      const metadataList = await MetadataModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(numCandidates);

      if (metadataList.length === 0) {
        logger.warn('No metadata found for theme search', { themeQuery, filter });
        return [];
      }

      // Preparar dados focando no tema e contexto
      const metadataWithEmbeddings = metadataList.map(metadata => ({
        metadata: {
          id: (metadata as any)._id.toString(),
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

      // Realizar busca de similaridade otimizada focada no tema
      const results = await embeddingService.findSimilarMetadata(
        themeQuery,
        metadataWithEmbeddings,
        limit,
        threshold
      );

      logger.info('Enhanced semantic theme search completed', {
        themeQuery,
        totalMetadata: metadataList.length,
        candidatesProcessed: numCandidates,
        resultsFound: results.length,
        threshold,
        topSimilarity: results[0]?.similarity || 0
      });

      return results;
    } catch (error: any) {
      logger.error('Error in semantic theme search:', error);
      return [];
    }
  }
}

export const metadataService = new MetadataService();
