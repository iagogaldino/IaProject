"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseContentExtractor = void 0;
const logger_1 = require("../logger");
class BaseContentExtractor {
    constructor() {
        this.maxContentLength = 1000000;
    }
    logExtraction(fileName, result) {
        logger_1.logger.info('Content extraction completed', {
            fileName,
            success: result.success,
            contentLength: result.content.length,
            wordCount: result.metadata.wordCount,
            characterCount: result.metadata.characterCount,
            error: result.error
        });
    }
    createSuccessResult(content, additionalMetadata = {}) {
        return {
            content,
            metadata: {
                wordCount: content.split(/\s+/).length,
                characterCount: content.length,
                extractedAt: new Date(),
                ...additionalMetadata
            },
            success: true
        };
    }
    createErrorResult(error) {
        return {
            content: '',
            metadata: {
                wordCount: 0,
                characterCount: 0,
                extractedAt: new Date()
            },
            success: false,
            error
        };
    }
    truncateContent(content) {
        if (content.length > this.maxContentLength) {
            logger_1.logger.warn('Content truncated due to length limit', {
                originalLength: content.length,
                maxLength: this.maxContentLength
            });
            return content.substring(0, this.maxContentLength) + '\n\n[Conteúdo truncado devido ao limite de tamanho]';
        }
        return content;
    }
}
exports.BaseContentExtractor = BaseContentExtractor;
//# sourceMappingURL=BaseContentExtractor.js.map