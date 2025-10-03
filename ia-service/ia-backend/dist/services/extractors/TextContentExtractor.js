"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextContentExtractor = void 0;
const BaseContentExtractor_1 = require("./BaseContentExtractor");
const logger_1 = require("../logger");
class TextContentExtractor extends BaseContentExtractor_1.BaseContentExtractor {
    async extractContent(fileBuffer, fileName) {
        try {
            logger_1.logger.info('Starting text content extraction', { fileName, bufferSize: fileBuffer.length });
            let content = '';
            const encodings = ['utf8', 'latin1', 'ascii', 'utf16le'];
            for (const encoding of encodings) {
                try {
                    content = fileBuffer.toString(encoding);
                    if (content && content.trim().length > 0) {
                        logger_1.logger.info('Text extracted successfully', { fileName, encoding });
                        break;
                    }
                }
                catch (error) {
                    logger_1.logger.warn('Failed to extract with encoding', { fileName, encoding, error });
                }
            }
            if (!content || content.trim().length === 0) {
                return this.createErrorResult('Arquivo de texto não contém conteúdo válido ou está em formato não suportado');
            }
            content = this.cleanExtractedText(content);
            content = this.truncateContent(content);
            const result = this.createSuccessResult(content, {
                language: this.detectLanguage(content)
            });
            this.logExtraction(fileName, result);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error extracting text content:', error);
            return this.createErrorResult(`Erro ao extrair conteúdo do texto: ${error.message || 'Erro desconhecido'}`);
        }
    }
    cleanExtractedText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }
    detectLanguage(text) {
        const portugueseWords = ['de', 'da', 'do', 'para', 'com', 'em', 'na', 'no', 'que', 'uma', 'um', 'é', 'são'];
        const englishWords = ['the', 'and', 'for', 'with', 'in', 'on', 'at', 'to', 'of', 'a', 'an', 'is', 'are'];
        const words = text.toLowerCase().split(/\s+/);
        const portugueseCount = words.filter(word => portugueseWords.includes(word)).length;
        const englishCount = words.filter(word => englishWords.includes(word)).length;
        return portugueseCount > englishCount ? 'pt' : 'en';
    }
}
exports.TextContentExtractor = TextContentExtractor;
//# sourceMappingURL=TextContentExtractor.js.map