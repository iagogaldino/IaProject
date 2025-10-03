"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfScreenshotExtractor = void 0;
const BaseContentExtractor_1 = require("./BaseContentExtractor");
const logger_1 = require("../logger");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const sharp_1 = __importDefault(require("sharp"));
class PdfScreenshotExtractor extends BaseContentExtractor_1.BaseContentExtractor {
    constructor() {
        super();
        this.uploadDir = path_1.default.join(process.cwd(), 'uploads');
    }
    async extractContent(fileBuffer, fileName) {
        try {
            logger_1.logger.info('Starting PDF screenshot extraction', { fileName, bufferSize: fileBuffer.length });
            if (!this.isValidPdfBuffer(fileBuffer)) {
                return this.createErrorResult('Arquivo PDF inválido ou corrompido');
            }
            const tempPdfPath = path_1.default.join(this.uploadDir, `temp_${(0, crypto_1.randomUUID)()}.pdf`);
            await promises_1.default.writeFile(tempPdfPath, fileBuffer);
            try {
                const pdf2pic = require('pdf-poppler');
                const options = {
                    format: 'png',
                    out_dir: this.uploadDir,
                    out_prefix: `temp_page_${(0, crypto_1.randomUUID)()}`,
                    page: null,
                    resolution: 150
                };
                const results = await pdf2pic.convert(tempPdfPath, options);
                if (!results || results.length === 0) {
                    return this.createErrorResult('Não foi possível converter o PDF em imagens');
                }
                logger_1.logger.info(`PDF converted to ${results.length} images`, { fileName });
                const processedImages = [];
                const screenshotPaths = [];
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    const pageNumber = i + 1;
                    if (result.path) {
                        const screenshotFileName = `screenshot_${(0, crypto_1.randomUUID)()}_page_${pageNumber}.png`;
                        const screenshotPath = path_1.default.join(this.uploadDir, screenshotFileName);
                        const imageBuffer = await promises_1.default.readFile(result.path);
                        await (0, sharp_1.default)(imageBuffer)
                            .resize(1200, 1600, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                            .png({ quality: 90 })
                            .toFile(screenshotPath);
                        try {
                            await promises_1.default.unlink(result.path);
                        }
                        catch (error) {
                            logger_1.logger.warn('Failed to cleanup original image file', { path: result.path, error });
                        }
                        processedImages.push(screenshotFileName);
                        screenshotPaths.push(screenshotPath);
                        logger_1.logger.info(`Screenshot saved for page ${pageNumber}`, {
                            fileName: screenshotFileName,
                            page: pageNumber
                        });
                    }
                }
                const content = this.createImageContentDescription(processedImages, fileName, results.length);
                const result = this.createSuccessResult(content, {
                    pageCount: results.length,
                    language: 'pt',
                    screenshotCount: processedImages.length,
                    screenshotPaths: screenshotPaths
                });
                this.logExtraction(fileName, result);
                return result;
            }
            finally {
                try {
                    await promises_1.default.unlink(tempPdfPath);
                }
                catch (error) {
                    logger_1.logger.warn('Failed to delete temporary PDF file', { tempPdfPath, error });
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error extracting PDF screenshots:', error);
            if (error.message && error.message.includes('Invalid PDF')) {
                return this.createErrorResult('Arquivo PDF inválido. Verifique se o arquivo não está corrompido.');
            }
            if (error.message && error.message.includes('Password required')) {
                return this.createErrorResult('PDF protegido por senha. Não é possível processar o arquivo.');
            }
            return this.createErrorResult(`Erro ao processar PDF em screenshots: ${error.message || 'Erro desconhecido'}`);
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
            return true;
        }
        catch (error) {
            logger_1.logger.warn('Error validating PDF buffer:', error);
            return false;
        }
    }
    createImageContentDescription(imageFiles, fileName, pageCount) {
        const imageList = imageFiles.map((file, index) => `Página ${index + 1}: ${file}`).join('\n');
        return `PDF CONVERTIDO EM SCREENSHOTS PARA ANÁLISE POR IA

Arquivo Original: ${fileName}
Total de Páginas: ${pageCount}
Screenshots Gerados: ${imageFiles.length}

LISTA DE SCREENSHOTS:
${imageList}

INSTRUÇÕES PARA IA:
Este PDF foi convertido em screenshots de alta qualidade para análise visual. 
Cada screenshot representa uma página completa do documento original.
Use as imagens para extrair informações, analisar conteúdo visual, 
tabelas, gráficos, diagramas e qualquer elemento visual presente.

As imagens estão salvas na pasta uploads e podem ser acessadas pelos nomes listados acima.
Cada screenshot foi otimizado para análise por IA com resolução adequada (1200x1600px).`;
    }
    async cleanupScreenshots(screenshotPaths) {
        try {
            for (const screenshotPath of screenshotPaths) {
                try {
                    await promises_1.default.unlink(screenshotPath);
                    logger_1.logger.info('Screenshot cleaned up', { path: screenshotPath });
                }
                catch (error) {
                    logger_1.logger.warn('Failed to cleanup screenshot', { path: screenshotPath, error });
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error cleaning up screenshots:', error);
        }
    }
}
exports.PdfScreenshotExtractor = PdfScreenshotExtractor;
//# sourceMappingURL=PdfScreenshotExtractor.js.map