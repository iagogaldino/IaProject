"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelContentExtractor = void 0;
const XLSX = __importStar(require("xlsx"));
const BaseContentExtractor_1 = require("./BaseContentExtractor");
const logger_1 = require("../logger");
class ExcelContentExtractor extends BaseContentExtractor_1.BaseContentExtractor {
    async extractContent(fileBuffer, fileName) {
        try {
            logger_1.logger.info('Starting Excel content extraction', { fileName, bufferSize: fileBuffer.length });
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                return this.createErrorResult('Arquivo Excel não contém planilhas');
            }
            let content = '';
            const sheetCount = workbook.SheetNames.length;
            for (let i = 0; i < workbook.SheetNames.length; i++) {
                const sheetName = workbook.SheetNames[i];
                const worksheet = workbook.Sheets[sheetName];
                content += `\n=== PLANILHA ${i + 1}: ${sheetName} ===\n`;
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: ''
                });
                if (Array.isArray(jsonData) && jsonData.length > 0) {
                    jsonData.forEach((row, rowIndex) => {
                        if (Array.isArray(row) && row.length > 0) {
                            const rowContent = row
                                .filter(cell => cell !== undefined && cell !== null && cell !== '')
                                .map(cell => String(cell).trim())
                                .join(' | ');
                            if (rowContent.trim()) {
                                content += `Linha ${rowIndex + 1}: ${rowContent}\n`;
                            }
                        }
                    });
                }
                content += '\n';
            }
            if (content.trim().length === 0) {
                return this.createErrorResult('Planilha Excel não contém dados válidos');
            }
            content = this.cleanExtractedText(content);
            content = this.truncateContent(content);
            const result = this.createSuccessResult(content, {
                sheetCount,
                language: this.detectLanguage(content)
            });
            this.logExtraction(fileName, result);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error extracting Excel content:', error);
            return this.createErrorResult(`Erro ao extrair conteúdo do Excel: ${error.message || 'Erro desconhecido'}`);
        }
    }
    cleanExtractedText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\|\s*\|/g, '|')
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
exports.ExcelContentExtractor = ExcelContentExtractor;
//# sourceMappingURL=ExcelContentExtractor.js.map