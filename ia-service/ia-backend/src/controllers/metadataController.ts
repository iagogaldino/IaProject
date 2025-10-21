import { Request, Response, NextFunction } from 'express';
import { metadataService } from '../services/metadataService';
import { logger } from '../services/logger';
import { ApiResponse } from '../types';

export class MetadataController {
  async getMetadataByFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;

      const metadata = await metadataService.getMetadataByFileId(fileId);

      if (!metadata) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Metadados não encontrados para este arquivo',
            code: 'METADATA_NOT_FOUND'
          }
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: metadata
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error getting metadata by file:', error);
      next(error);
    }
  }

  async getMetadataByAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { agentId } = req.params;

      const metadataList = await metadataService.getMetadataByAgentId(agentId);

      const response: ApiResponse = {
        success: true,
        data: metadataList,
        meta: {
          total: metadataList.length
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error getting metadata by agent:', error);
      next(error);
    }
  }

  async searchMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        theme,
        tags,
        sentiment,
        agentId,
        dateFrom,
        dateTo
      } = req.query;

      const searchQuery: any = {};

      if (theme) searchQuery.theme = theme as string;
      if (tags) searchQuery.tags = Array.isArray(tags) ? tags : [tags as string];
      if (sentiment) searchQuery.sentiment = sentiment as string;
      if (agentId) searchQuery.agentId = agentId as string;
      if (dateFrom) searchQuery.dateFrom = new Date(dateFrom as string);
      if (dateTo) searchQuery.dateTo = new Date(dateTo as string);

      const metadataList = await metadataService.searchMetadata(searchQuery);

      const response: ApiResponse = {
        success: true,
        data: metadataList,
        meta: {
          total: metadataList.length
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error searching metadata:', error);
      next(error);
    }
  }

  async getMetadataStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await metadataService.getMetadataStats();

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error getting metadata stats:', error);
      next(error);
    }
  }

  async updateMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { metadataId } = req.params;
      const updateData = req.body;

      const updatedMetadata = await metadataService.updateMetadata(metadataId, updateData);

      if (!updatedMetadata) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Metadados não encontrados',
            code: 'METADATA_NOT_FOUND'
          }
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: updatedMetadata
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error updating metadata:', error);
      next(error);
    }
  }

  async deleteMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { metadataId } = req.params;

      const deleted = await metadataService.deleteMetadata(metadataId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Metadados não encontrados',
            code: 'METADATA_NOT_FOUND'
          }
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Metadados deletados com sucesso'
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error deleting metadata:', error);
      next(error);
    }
  }

  async deleteMetadataByFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;

      const deleted = await metadataService.deleteMetadataByFileId(fileId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Nenhum metadado encontrado para este arquivo',
            code: 'METADATA_NOT_FOUND'
          }
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Metadados do arquivo deletados com sucesso'
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error deleting metadata by file:', error);
      next(error);
    }
  }

  /**
   * Busca metadados similares usando embedding
   */
  async searchSimilarMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, limit, threshold, agentId, includeEmbedding } = req.query;

      if (!query) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Parâmetro "query" é obrigatório',
            code: 'MISSING_QUERY_PARAMETER'
          }
        });
        return;
      }

      const options = {
        limit: limit ? parseInt(limit as string) : 10,
        threshold: threshold ? parseFloat(threshold as string) : 0.7,
        agentId: agentId as string,
        includeEmbedding: includeEmbedding === 'true'
      };

      const results = await metadataService.searchSimilarMetadata(query as string, options);

      const response: ApiResponse = {
        success: true,
        data: results,
        meta: {
          total: results.length,
          query: query as string,
          threshold: options.threshold,
          agentId: options.agentId
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error searching similar metadata:', error);
      next(error);
    }
  }

  /**
   * Busca metadados por tema usando similaridade semântica
   */
  async searchBySemanticTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { theme, limit, threshold, agentId } = req.query;

      if (!theme) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Parâmetro "theme" é obrigatório',
            code: 'MISSING_THEME_PARAMETER'
          }
        });
        return;
      }

      const options = {
        limit: limit ? parseInt(limit as string) : 10,
        threshold: threshold ? parseFloat(threshold as string) : 0.8,
        agentId: agentId as string
      };

      const results = await metadataService.searchBySemanticTheme(theme as string, options);

      const response: ApiResponse = {
        success: true,
        data: results,
        meta: {
          total: results.length,
          theme: theme as string,
          threshold: options.threshold,
          agentId: options.agentId
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error searching by semantic theme:', error);
      next(error);
    }
  }

  /**
   * Gera embeddings para metadados existentes
   */
  async generateMissingEmbeddings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchSize } = req.query;

      const size = batchSize ? parseInt(batchSize as string) : 50;

      const results = await metadataService.generateMissingEmbeddings(size);

      const response: ApiResponse = {
        success: true,
        data: results,
        meta: {
          message: 'Processamento de embeddings concluído'
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error generating missing embeddings:', error);
      next(error);
    }
  }

  /**
   * Atualiza embedding de um metadado específico
   */
  async updateMetadataEmbedding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { metadataId } = req.params;

      const updated = await metadataService.updateMetadataEmbedding(metadataId);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Metadado não encontrado',
            code: 'METADATA_NOT_FOUND'
          }
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Embedding do metadado atualizado com sucesso',
          metadataId
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error updating metadata embedding:', error);
      next(error);
    }
  }

  /**
   * Cria novo metadado
   */
  async createMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metadataData = req.body;

      const metadata = await metadataService.createMetadata(metadataData);

      const response: ApiResponse = {
        success: true,
        data: metadata
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error creating metadata:', error);
      next(error);
    }
  }
}

export const metadataController = new MetadataController();
