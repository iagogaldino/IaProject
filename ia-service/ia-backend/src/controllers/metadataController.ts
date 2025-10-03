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
}

export const metadataController = new MetadataController();
