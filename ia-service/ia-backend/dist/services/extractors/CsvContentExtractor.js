"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvContentExtractor = void 0;
const csvParser = require('csv-parser');
const stream_1 = require("stream");
const BaseContentExtractor_1 = require("./BaseContentExtractor");
const logger_1 = require("../logger");
class CsvContentExtractor extends BaseContentExtractor_1.BaseContentExtractor {
    async extractContent(fileBuffer, fileName) {
        try {
            logger_1.logger.info('Starting CSV content extraction', { fileName, bufferSize: fileBuffer.length });
            const csvData = [];
            const stream = stream_1.Readable.from(fileBuffer);
            await new Promise((resolve, reject) => {
                stream
                    .pipe(csvParser())
                    .on('data', (row) => {
                    csvData.push(row);
                })
                    .on('end', resolve)
                    .on('error', reject);
            });
            if (csvData.length === 0) {
                return this.createErrorResult('Arquivo CSV não contém dados válidos');
            }
            let content = '=== DADOS CSV ===\n';
            const headers = Object.keys(csvData[0]);
            content += `Colunas: ${headers.join(', ')}\n\n`;
            csvData.forEach((row, index) => {
                content += `Linha ${index + 1}:\n`;
                headers.forEach(header => {
                    const value = row[header] || '';
                    if (value.toString().trim()) {
                        content += `  ${header}: ${value}\n`;
                    }
                });
                content += '\n';
            });
            content = this.cleanExtractedText(content);
            content = this.truncateContent(content);
            const result = this.createSuccessResult(content, {
                language: this.detectLanguage(content)
            });
            this.logExtraction(fileName, result);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error extracting CSV content:', error);
            return this.createErrorResult(`Erro ao extrair conteúdo do CSV: ${error.message || 'Erro desconhecido'}`);
        }
    }
    cleanExtractedText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/^\s*$/gm, '')
            .trim();
    }
    detectLanguage(text) {
        const portugueseWords = ['de', 'da', 'do', 'para', 'com', 'em', 'na', 'no', 'que', 'uma', 'um'];
        const englishWords = ['the', 'and', 'for', 'with', 'in', 'on', 'at', 'to', 'of', 'a', 'an'];
        const words = text.toLowerCase().split(/\s+/);
        const portugueseCount = words.filter(word => portugueseWords.includes(word)).length;
        const englishCount = words.filter(word => englishWords.includes(word)).length;
        return portugueseCount > englishCount ? 'pt' : 'en';
    }
}
exports.CsvContentExtractor = CsvContentExtractor;
//# sourceMappingURL=CsvContentExtractor.js.map