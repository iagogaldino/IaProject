"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalExtractorService = exports.ExternalExtractorService = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const logger_1 = require("./logger");
const BaseContentExtractor_1 = require("./extractors/BaseContentExtractor");
class ExternalExtractorService extends BaseContentExtractor_1.BaseContentExtractor {
    constructor() {
        super();
        this.apiUrl = process.env.EXTERNAL_EXTRACTOR_API_URL || (() => { throw new Error('EXTERNAL_EXTRACTOR_API_URL is not set'); })();
        this.timeout = parseInt(process.env.EXTERNAL_EXTRACTOR_TIMEOUT || '30000');
    }
    async extractContent(fileBuffer, fileName) {
        try {
            logger_1.logger.info('Starting external content extraction', {
                fileName,
                bufferSize: fileBuffer.length,
                apiUrl: this.apiUrl
            });
            if (!fileBuffer || fileBuffer.length === 0) {
                return this.createErrorResult('Buffer de arquivo vazio ou inválido');
            }
            const fileType = this.getFileTypeFromName(fileName);
            if (!fileType) {
                return this.createErrorResult('Tipo de arquivo não suportado');
            }
            const formData = new form_data_1.default();
            formData.append('file', fileBuffer, {
                filename: fileName,
                contentType: this.getMimeType(fileType)
            });
            formData.append('fileType', fileType);
            formData.append('processWithAI', 'true');
            const response = await axios_1.default.post(this.apiUrl, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: this.timeout,
                maxContentLength: 50 * 1024 * 1024,
                maxBodyLength: 50 * 1024 * 1024,
            });
            logger_1.logger.info('External API response received', {
                fileName,
                status: response.status,
                success: response.data.success
            });
            if (!response.data.success) {
                const errorMessage = response.data.error || 'Erro desconhecido na API externa';
                logger_1.logger.error('External API returned error', {
                    fileName,
                    error: errorMessage
                });
                return this.createErrorResult(`Erro na API externa: ${errorMessage}`);
            }
            if (!response.data.data) {
                return this.createErrorResult('API externa não retornou dados');
            }
            const { content, metadata } = response.data.data;
            if (!content || content.trim().length === 0) {
                return this.createErrorResult('Nenhum conteúdo extraído do arquivo');
            }
            const result = this.createSuccessResult(content, {
                wordCount: metadata.wordCount || 0,
                characterCount: metadata.characterCount || 0,
                pageCount: metadata.pageCount,
                language: metadata.language || 'pt',
                fileType: metadata.fileType,
                extractedAt: new Date(metadata.extractedAt),
                aiProcessed: metadata.aiProcessed || false,
                externalApiUsed: true
            });
            this.logExtraction(fileName, result);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error in external content extraction:', error);
            if (error.code === 'ECONNREFUSED') {
                return this.createErrorResult('API externa não está disponível. Verifique se o serviço está rodando.');
            }
            if (error.code === 'ETIMEDOUT') {
                return this.createErrorResult('Timeout na API externa. O arquivo pode ser muito grande ou complexo.');
            }
            if (error.response) {
                const status = error.response.status;
                const errorMessage = error.response.data?.error || error.response.data?.message || 'Erro desconhecido';
                if (status === 413) {
                    return this.createErrorResult('Arquivo muito grande para a API externa');
                }
                if (status === 415) {
                    return this.createErrorResult('Tipo de arquivo não suportado pela API externa');
                }
                return this.createErrorResult(`Erro HTTP ${status}: ${errorMessage}`);
            }
            return this.createErrorResult(`Erro na comunicação com API externa: ${error.message || 'Erro desconhecido'}`);
        }
    }
    getFileTypeFromName(fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const supportedTypes = [
            'pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'xls', 'json'
        ];
        return supportedTypes.includes(extension || '') ? extension || null : null;
    }
    getMimeType(fileType) {
        const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls': 'application/vnd.ms-excel',
            'json': 'application/json'
        };
        return mimeTypes[fileType] || 'application/octet-stream';
    }
    async testConnection() {
        try {
            logger_1.logger.info('Testing connection to external extractor API', { apiUrl: this.apiUrl });
            const testBuffer = Buffer.from('Test file content', 'utf-8');
            const formData = new form_data_1.default();
            formData.append('file', testBuffer, {
                filename: 'test.txt',
                contentType: 'text/plain'
            });
            formData.append('fileType', 'txt');
            formData.append('processWithAI', 'false');
            const response = await axios_1.default.post(this.apiUrl, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: 10000,
            });
            const isConnected = response.status === 200;
            logger_1.logger.info('External API connection test result', {
                connected: isConnected,
                status: response.status
            });
            return isConnected;
        }
        catch (error) {
            logger_1.logger.error('External API connection test failed:', error);
            return false;
        }
    }
    async getHealthStatus() {
        try {
            const isConnected = await this.testConnection();
            return {
                status: isConnected ? 'healthy' : 'unhealthy',
                message: isConnected ? 'API externa está funcionando' : 'API externa não está disponível',
                apiUrl: this.apiUrl
            };
        }
        catch (error) {
            logger_1.logger.error('Error checking external API health:', error);
            return {
                status: 'error',
                message: `Erro ao verificar API externa: ${error.message}`,
                apiUrl: this.apiUrl
            };
        }
    }
}
exports.ExternalExtractorService = ExternalExtractorService;
exports.externalExtractorService = new ExternalExtractorService();
//# sourceMappingURL=externalExtractorService.js.map