"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataController = exports.MetadataController = void 0;
const metadataService_1 = require("../services/metadataService");
const logger_1 = require("../services/logger");
class MetadataController {
    async getMetadataByFile(req, res, next) {
        try {
            const { fileId } = req.params;
            const metadata = await metadataService_1.metadataService.getMetadataByFileId(fileId);
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
            const response = {
                success: true,
                data: metadata
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error getting metadata by file:', error);
            next(error);
        }
    }
    async getMetadataByAgent(req, res, next) {
        try {
            const { agentId } = req.params;
            const metadataList = await metadataService_1.metadataService.getMetadataByAgentId(agentId);
            const response = {
                success: true,
                data: metadataList,
                meta: {
                    total: metadataList.length
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error getting metadata by agent:', error);
            next(error);
        }
    }
    async searchMetadata(req, res, next) {
        try {
            const { theme, tags, sentiment, agentId, dateFrom, dateTo } = req.query;
            const searchQuery = {};
            if (theme)
                searchQuery.theme = theme;
            if (tags)
                searchQuery.tags = Array.isArray(tags) ? tags : [tags];
            if (sentiment)
                searchQuery.sentiment = sentiment;
            if (agentId)
                searchQuery.agentId = agentId;
            if (dateFrom)
                searchQuery.dateFrom = new Date(dateFrom);
            if (dateTo)
                searchQuery.dateTo = new Date(dateTo);
            const metadataList = await metadataService_1.metadataService.searchMetadata(searchQuery);
            const response = {
                success: true,
                data: metadataList,
                meta: {
                    total: metadataList.length
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error searching metadata:', error);
            next(error);
        }
    }
    async getMetadataStats(req, res, next) {
        try {
            const stats = await metadataService_1.metadataService.getMetadataStats();
            const response = {
                success: true,
                data: stats
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error getting metadata stats:', error);
            next(error);
        }
    }
    async updateMetadata(req, res, next) {
        try {
            const { metadataId } = req.params;
            const updateData = req.body;
            const updatedMetadata = await metadataService_1.metadataService.updateMetadata(metadataId, updateData);
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
            const response = {
                success: true,
                data: updatedMetadata
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error updating metadata:', error);
            next(error);
        }
    }
    async deleteMetadata(req, res, next) {
        try {
            const { metadataId } = req.params;
            const deleted = await metadataService_1.metadataService.deleteMetadata(metadataId);
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
            const response = {
                success: true,
                data: {
                    message: 'Metadados deletados com sucesso'
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error deleting metadata:', error);
            next(error);
        }
    }
    async deleteMetadataByFile(req, res, next) {
        try {
            const { fileId } = req.params;
            const deleted = await metadataService_1.metadataService.deleteMetadataByFileId(fileId);
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
            const response = {
                success: true,
                data: {
                    message: 'Metadados do arquivo deletados com sucesso'
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Error deleting metadata by file:', error);
            next(error);
        }
    }
}
exports.MetadataController = MetadataController;
exports.metadataController = new MetadataController();
//# sourceMappingURL=metadataController.js.map