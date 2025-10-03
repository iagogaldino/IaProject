import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { fileService } from '../services/fileService';
import { agentService } from '../services/agentService';
import { contentAnalysisService } from '../services/contentAnalysisService';
import { metadataService } from '../services/metadataService';
import { ContentExtractorFactory } from '../services/extractors/ContentExtractorFactory';
import { logger } from '../services/logger';
import { ApiResponse, FileUploadRequest, FileProcessRequest, ContentAnalysisRequest } from '../types';

// Extend Request interface to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Allow common text, document and Excel formats
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas arquivos de texto, PDF, Word, CSV e Excel são aceitos.'));
    }
  }
});

export class FileController {
  // Middleware for file upload
  uploadMiddleware = upload.single('file');

  async uploadFile(req: MulterRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { agentId } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Nenhum arquivo foi enviado',
            code: 'NO_FILE_UPLOADED'
          }
        });
        return;
      }

      // Check if agent exists and has file access
      const agent = await agentService.getAgentById(agentId);
      if (!agent) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Agente não encontrado',
            code: 'AGENT_NOT_FOUND'
          }
        });
        return;
      }

      if (!agent.fileAccess?.enabled) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Agente não tem permissão para acessar arquivos',
            code: 'FILE_ACCESS_DENIED'
          }
        });
        return;
      }

      // Check file type is allowed
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      if (!agent.fileAccess.allowedFileTypes.includes(fileExtension || '')) {
        res.status(400).json({
          success: false,
          error: {
            message: `Tipo de arquivo não permitido. Tipos permitidos: ${agent.fileAccess.allowedFileTypes.join(', ')}`,
            code: 'FILE_TYPE_NOT_ALLOWED'
          }
        });
        return;
      }

      // Check file size
      if (file.size > agent.fileAccess.maxFileSize) {
        res.status(400).json({
          success: false,
          error: {
            message: `Arquivo muito grande. Tamanho máximo permitido: ${agent.fileAccess.maxFileSize} bytes`,
            code: 'FILE_TOO_LARGE'
          }
        });
        return;
      }

      const uploadRequest: FileUploadRequest = {
        agentId,
        file,
        metadata: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size
        }
      };

      const uploadedFile = await fileService.uploadFile(uploadRequest);

      const response: ApiResponse = {
        success: true,
        data: uploadedFile
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Error uploading file:', error);
      next(error);
    }
  }

  async processFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { agentId, fileId } = req.params;
      const { operation, options } = req.body;
      
      logger.info('Processing file request', { agentId, fileId, operation });

      // Check if agent exists and has file access
      const agent = await agentService.getAgentById(agentId);
      if (!agent) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Agente não encontrado',
            code: 'AGENT_NOT_FOUND'
          }
        });
        return;
      }

      if (!agent.fileAccess?.enabled) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Agente não tem permissão para acessar arquivos',
            code: 'FILE_ACCESS_DENIED'
          }
        });
        return;
      }

      const processRequest: FileProcessRequest = {
        agentId,
        fileId,
        operation: operation || 'read',
        options
      };

      const result = await fileService.processFile(processRequest);

      const response: ApiResponse = {
        success: result.success,
        data: result.data,
        error: result.error ? {
          message: result.error,
          code: 'FILE_PROCESSING_ERROR'
        } : undefined
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error processing file:', error);
      next(error);
    }
  }

  async getFileInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;

      const fileInfo = await fileService.getFileInfo(fileId);
      
      if (!fileInfo) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Arquivo não encontrado',
            code: 'FILE_NOT_FOUND'
          }
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: fileInfo
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error getting file info:', error);
      next(error);
    }
  }

  async listAgentFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { agentId } = req.params;

      // Check if agent exists
      const agent = await agentService.getAgentById(agentId);
      if (!agent) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Agente não encontrado',
            code: 'AGENT_NOT_FOUND'
          }
        });
        return;
      }

      const files = await fileService.listAgentFiles(agentId);

      const response: ApiResponse = {
        success: true,
        data: files,
        meta: {
          total: files.length
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error listing agent files:', error);
      next(error);
    }
  }

  async listAllFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = await fileService.listAllFiles();

      const response: ApiResponse = {
        success: true,
        data: files,
        meta: {
          total: files.length
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error listing all files:', error);
      next(error);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { agentId, fileId } = req.params;

      // Check if agent exists and has file access
      const agent = await agentService.getAgentById(agentId);
      if (!agent) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Agente não encontrado',
            code: 'AGENT_NOT_FOUND'
          }
        });
        return;
      }

      if (!agent.fileAccess?.enabled) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Agente não tem permissão para acessar arquivos',
            code: 'FILE_ACCESS_DENIED'
          }
        });
        return;
      }

      const deleted = await fileService.deleteFile(fileId, agentId);

      if (!deleted) {
        res.status(500).json({
          success: false,
          error: {
            message: 'Erro ao deletar arquivo',
            code: 'DELETE_ERROR'
          }
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Arquivo deletado com sucesso'
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error deleting file:', error);
      next(error);
    }
  }

  async analyzeContentWithAI(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { agentId, fileId } = req.params;
      const { content, options } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Conteúdo é obrigatório para análise',
            code: 'CONTENT_REQUIRED'
          }
        });
        return;
      }

      // Check if agent exists and has file access
      const agent = await agentService.getAgentById(agentId);
      if (!agent) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Agente não encontrado',
            code: 'AGENT_NOT_FOUND'
          }
        });
        return;
      }

      if (!agent.fileAccess?.enabled) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Agente não tem permissão para acessar arquivos',
            code: 'FILE_ACCESS_DENIED'
          }
        });
        return;
      }

      // Verify file exists
      const fileInfo = await fileService.getFileInfo(fileId);
      if (!fileInfo) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Arquivo não encontrado',
            code: 'FILE_NOT_FOUND'
          }
        });
        return;
      }

      // Perform AI analysis
      const analysisRequest: ContentAnalysisRequest = {
        fileId,
        agentId,
        content,
        options: options || {}
      };

      const analysisResult = await contentAnalysisService.analyzeContent(analysisRequest);

      if (!analysisResult.success) {
        res.status(500).json({
          success: false,
          error: {
            message: 'Erro na análise de conteúdo',
            code: 'ANALYSIS_ERROR',
            details: analysisResult.error
          }
        });
        return;
      }

      // Save metadata to dedicated metadata collection
      const metadataData = {
        fileId,
        agentId,
        theme: analysisResult.data.theme,
        improvedContent: analysisResult.data.improvedContent,
        tags: analysisResult.data.tags,
        analysis: analysisResult.data.analysis
      };

      const savedMetadata = await metadataService.createMetadata(metadataData);

      if (!savedMetadata) {
        logger.warn('Failed to save metadata to database', { fileId });
      } else {
        logger.info('Metadata saved successfully to metadata collection', {
          metadataId: savedMetadata.id,
          fileId,
          agentId,
          theme: savedMetadata.theme
        });
      }

      const response: ApiResponse = {
        success: true,
        data: {
          ...analysisResult.data,
          fileId,
          agentId
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error analyzing content with AI:', error);
      next(error);
    }
  }

  async getExternalApiHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthStatus = await ContentExtractorFactory.getExternalApiHealth();

      const response: ApiResponse = {
        success: healthStatus.status === 'healthy',
        data: healthStatus
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error checking external API health:', error);
      next(error);
    }
  }

  async testExternalApiConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isConnected = await ContentExtractorFactory.testExternalApiConnection();

      const response: ApiResponse = {
        success: isConnected,
        data: {
          connected: isConnected,
          message: isConnected ? 'API externa está funcionando' : 'API externa não está disponível'
        }
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error testing external API connection:', error);
      next(error);
    }
  }
}

export const fileController = new FileController();
