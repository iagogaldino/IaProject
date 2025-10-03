"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentExtractorFactory = void 0;
const externalExtractorService_1 = require("../externalExtractorService");
const logger_1 = require("../logger");
class ContentExtractorFactory {
    static async extractContent(fileBuffer, fileName) {
        try {
            const fileExtension = this.getFileExtension(fileName);
            const extractor = this.getExtractor(fileExtension);
            if (!extractor) {
                return {
                    content: '',
                    metadata: {
                        wordCount: 0,
                        characterCount: 0,
                        extractedAt: new Date()
                    },
                    success: false,
                    error: `Tipo de arquivo não suportado: ${fileExtension}`
                };
            }
            logger_1.logger.info('Starting content extraction', {
                fileName,
                fileExtension,
                bufferSize: fileBuffer.length
            });
            const result = await extractor.extractContent(fileBuffer, fileName);
            logger_1.logger.info('Content extraction completed', {
                fileName,
                success: result.success,
                contentLength: result.content.length,
                wordCount: result.metadata.wordCount,
                error: result.error
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error in content extraction factory:', error);
            return {
                content: '',
                metadata: {
                    wordCount: 0,
                    characterCount: 0,
                    extractedAt: new Date()
                },
                success: false,
                error: `Erro na extração de conteúdo: ${error.message || 'Erro desconhecido'}`
            };
        }
    }
    static getSupportedFileTypes() {
        return Array.from(this.extractors.keys());
    }
    static isFileTypeSupported(fileName) {
        const fileExtension = this.getFileExtension(fileName);
        return this.extractors.has(fileExtension);
    }
    static getFileExtension(fileName) {
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return '';
        }
        return fileName.substring(lastDotIndex + 1).toLowerCase();
    }
    static getExtractor(fileExtension) {
        return this.extractors.get(fileExtension) || null;
    }
    static async getExternalApiHealth() {
        return await externalExtractorService_1.externalExtractorService.getHealthStatus();
    }
    static async testExternalApiConnection() {
        return await externalExtractorService_1.externalExtractorService.testConnection();
    }
}
exports.ContentExtractorFactory = ContentExtractorFactory;
_a = ContentExtractorFactory;
ContentExtractorFactory.extractors = new Map();
(() => {
    _a.extractors.set('pdf', externalExtractorService_1.externalExtractorService);
    _a.extractors.set('xlsx', externalExtractorService_1.externalExtractorService);
    _a.extractors.set('xls', externalExtractorService_1.externalExtractorService);
    _a.extractors.set('csv', externalExtractorService_1.externalExtractorService);
    _a.extractors.set('doc', externalExtractorService_1.externalExtractorService);
    _a.extractors.set('docx', externalExtractorService_1.externalExtractorService);
    _a.extractors.set('txt', externalExtractorService_1.externalExtractorService);
    _a.extractors.set('json', externalExtractorService_1.externalExtractorService);
})();
//# sourceMappingURL=ContentExtractorFactory.js.map