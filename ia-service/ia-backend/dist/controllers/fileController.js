"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileController = exports.FileController = void 0;
const multer_1 = __importDefault(require("multer"));
const fileService_1 = require("../services/fileService");
const agentService_1 = require("../services/agentService");
const contentAnalysisService_1 = require("../services/contentAnalysisService");
const metadataService_1 = require("../services/metadataService");
const ContentExtractorFactory_1 = require("../services/extractors/ContentExtractorFactory");
const logger_1 = require("../services/logger");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
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
        }
        else {
            cb(new Error('Tipo de arquivo não permitido. Apenas arquivos de texto, PDF, Word, CSV e Excel são aceitos.'));
        }
    }
});
class FileController {
    constructor() {
        this.uploadMiddleware = upload.single('file');
    }
    async uploadFile(req, res, next) {
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
            const agent = await agentService_1.agentService.getAgentById(agentId);
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
            const uploadRequest = {
                agentId,
                file,
                metadata: {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size
                }
            };
            const uploadedFile = await fileService_1.fileService.uploadFile(uploadRequest);
            const response = {
                success: true,
                data: uploadedFile
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.logger.error('Error uploading file:', error);
            next(error);
        }
    }
    async processFile(req, res, next) {
        try {
            const { agentId, fileId } = req.params;
            const { operation, options } = req.body;
            logger_1.logger.info('Processing file request', { agentId, fileId, operation });
            const agent = await agentService_1.agentService.getAgentById(agentId);
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
            const processRequest = {
                agentId,
                fileId,
                operation: operation || 'read',
                options
            };
            const result = await fileService_1.fileService.processFile(processRequest);
            const response = {
                success: result.success,
                data: result.data,
                error: result.error ? {
                    message: result.error,
                    code: 'FILE_PROCESSING_ERROR'
                } : undefined
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error processing file:', error);
            next(error);
        }
    }
    async getFileInfo(req, res, next) {
        try {
            const { fileId } = req.params;
            const fileInfo = await fileService_1.fileService.getFileInfo(fileId);
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
            const response = {
                success: true,
                data: fileInfo
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error getting file info:', error);
            next(error);
        }
    }
    async listAgentFiles(req, res, next) {
        try {
            const { agentId } = req.params;
            const agent = await agentService_1.agentService.getAgentById(agentId);
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
            const files = await fileService_1.fileService.listAgentFiles(agentId);
            const response = {
                success: true,
                data: files,
                meta: {
                    total: files.length
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error listing agent files:', error);
            next(error);
        }
    }
    async listAllFiles(req, res, next) {
        try {
            const files = await fileService_1.fileService.listAllFiles();
            const response = {
                success: true,
                data: files,
                meta: {
                    total: files.length
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error listing all files:', error);
            next(error);
        }
    }
    async deleteFile(req, res, next) {
        try {
            const { agentId, fileId } = req.params;
            const agent = await agentService_1.agentService.getAgentById(agentId);
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
            const deleted = await fileService_1.fileService.deleteFile(fileId, agentId);
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
            const response = {
                success: true,
                data: {
                    message: 'Arquivo deletado com sucesso'
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error deleting file:', error);
            next(error);
        }
    }
    async analyzeContentWithAI(req, res, next) {
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
            const agent = await agentService_1.agentService.getAgentById(agentId);
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
            const fileInfo = await fileService_1.fileService.getFileInfo(fileId);
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
            const analysisRequest = {
                fileId,
                agentId,
                content,
                options: options || {}
            };
            const analysisResult = await contentAnalysisService_1.contentAnalysisService.analyzeContent(analysisRequest);
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
            const metadataData = {
                fileId,
                agentId,
                theme: analysisResult.data.theme,
                improvedContent: analysisResult.data.improvedContent,
                tags: analysisResult.data.tags,
                analysis: analysisResult.data.analysis
            };
            const savedMetadata = await metadataService_1.metadataService.createMetadata(metadataData);
            if (!savedMetadata) {
                logger_1.logger.warn('Failed to save metadata to database', { fileId });
            }
            else {
                logger_1.logger.info('Metadata saved successfully to metadata collection', {
                    metadataId: savedMetadata.id,
                    fileId,
                    agentId,
                    theme: savedMetadata.theme
                });
            }
            const response = {
                success: true,
                data: {
                    ...analysisResult.data,
                    fileId,
                    agentId
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error analyzing content with AI:', error);
            next(error);
        }
    }
    async getExternalApiHealth(req, res, next) {
        try {
            const healthStatus = await ContentExtractorFactory_1.ContentExtractorFactory.getExternalApiHealth();
            const response = {
                success: healthStatus.status === 'healthy',
                data: healthStatus
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error checking external API health:', error);
            next(error);
        }
    }
    async testExternalApiConnection(req, res, next) {
        try {
            const isConnected = await ContentExtractorFactory_1.ContentExtractorFactory.testExternalApiConnection();
            const response = {
                success: isConnected,
                data: {
                    connected: isConnected,
                    message: isConnected ? 'API externa está funcionando' : 'API externa não está disponível'
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error testing external API connection:', error);
            next(error);
        }
    }
}
exports.FileController = FileController;
exports.fileController = new FileController();
//# sourceMappingURL=fileController.js.map