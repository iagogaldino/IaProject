"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfContentExtractor = void 0;
const pdfParse = require('pdf-parse');
const BaseContentExtractor_1 = require("./BaseContentExtractor");
const logger_1 = require("../logger");
class PdfContentExtractor extends BaseContentExtractor_1.BaseContentExtractor {
    async extractContent(fileBuffer, fileName) {
        try {
            logger_1.logger.info('Starting PDF content extraction', { fileName, bufferSize: fileBuffer.length });
            if (!this.isValidPdfBuffer(fileBuffer)) {
                return this.createErrorResult('Arquivo PDF inválido ou corrompido');
            }
            const pdfData = await pdfParse(fileBuffer, {
                max: 0,
                version: 'v1.10.100'
            });
            if (!pdfData || !pdfData.text) {
                return this.createErrorResult('Nenhum texto encontrado no arquivo PDF');
            }
            let content = pdfData.text.trim();
            content = this.cleanExtractedText(content);
            if (content.length === 0) {
                return this.createErrorResult('PDF não contém texto extraível (pode ser uma imagem escaneada)');
            }
            content = this.truncateContent(content);
            const result = this.createSuccessResult(content, {
                pageCount: pdfData.numpages,
                language: this.detectLanguage(content)
            });
            this.logExtraction(fileName, result);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error extracting PDF content:', error);
            if (error.message && error.message.includes('bad XRef entry')) {
                return this.createErrorResult('PDF corrompido ou malformado. Tente converter o arquivo para um formato mais compatível.');
            }
            if (error.message && error.message.includes('Invalid PDF')) {
                return this.createErrorResult('Arquivo PDF inválido. Verifique se o arquivo não está corrompido.');
            }
            if (error.message && error.message.includes('Password required')) {
                return this.createErrorResult('PDF protegido por senha. Não é possível extrair o conteúdo.');
            }
            return this.createErrorResult(`Erro ao extrair conteúdo do PDF: ${error.message || 'Erro desconhecido'}`);
        }
    }
    isValidPdfBuffer(buffer) {
        try {
            const pdfHeader = buffer.toString('ascii', 0, 4);
            if (pdfHeader !== '%PDF') {
                return false;
            }
            if (buffer.length < 1024) {
                return false;
            }
            const bufferString = buffer.toString('ascii', 0, Math.min(1024, buffer.length));
            if (!bufferString.includes('obj') && !bufferString.includes('endobj')) {
                return false;
            }
            return true;
        }
        catch (error) {
            logger_1.logger.warn('Error validating PDF buffer:', error);
            return false;
        }
    }
    cleanExtractedText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/^\d+\s*$/gm, '')
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
exports.PdfContentExtractor = PdfContentExtractor;
//# sourceMappingURL=PdfContentExtractor.js.map