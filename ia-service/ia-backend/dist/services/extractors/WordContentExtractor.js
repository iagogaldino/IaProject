"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordContentExtractor = void 0;
const mammoth = require('mammoth');
const BaseContentExtractor_1 = require("./BaseContentExtractor");
const logger_1 = require("../logger");
class WordContentExtractor extends BaseContentExtractor_1.BaseContentExtractor {
    async extractContent(fileBuffer, fileName) {
        try {
            logger_1.logger.info('Starting Word content extraction', { fileName, bufferSize: fileBuffer.length });
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            if (!result.value || result.value.trim().length === 0) {
                return this.createErrorResult('Documento Word não contém texto extraível');
            }
            let content = result.value.trim();
            content = this.cleanExtractedText(content);
            if (content.length === 0) {
                return this.createErrorResult('Nenhum texto válido encontrado no documento Word');
            }
            content = this.truncateContent(content);
            const extractionResult = this.createSuccessResult(content, {
                language: this.detectLanguage(content)
            });
            if (result.messages && result.messages.length > 0) {
                logger_1.logger.warn('Word extraction warnings', {
                    fileName,
                    warnings: result.messages.map((msg) => msg.message)
                });
            }
            this.logExtraction(fileName, extractionResult);
            return extractionResult;
        }
        catch (error) {
            logger_1.logger.error('Error extracting Word content:', error);
            return this.createErrorResult(`Erro ao extrair conteúdo do Word: ${error.message || 'Erro desconhecido'}`);
        }
    }
    cleanExtractedText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\f/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[^\w\s\u00C0-\u017F.,!?;:()\-'"]/g, ' ')
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
exports.WordContentExtractor = WordContentExtractor;
//# sourceMappingURL=WordContentExtractor.js.map