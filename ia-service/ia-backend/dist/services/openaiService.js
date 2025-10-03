"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config/config");
const logger_1 = require("./logger");
class OpenAIService {
    constructor() {
        if (!config_1.config.openai.apiKey) {
            throw new Error('OpenAI API key is required');
        }
        this.client = new openai_1.default({
            apiKey: config_1.config.openai.apiKey,
        });
        this.model = config_1.config.openai.model;
        this.maxTokens = config_1.config.openai.maxTokens;
        this.temperature = config_1.config.openai.temperature;
    }
    async processMessage(messages, agentContext) {
        try {
            const systemPrompt = agentContext || 'You are a helpful AI assistant. Provide clear and concise responses.';
            const chatMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            ];
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: chatMessages,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                stream: false,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response content received from OpenAI');
            }
            logger_1.logger.info('OpenAI request processed successfully', {
                model: this.model,
                tokensUsed: response.usage?.total_tokens,
                messagesCount: messages.length
            });
            return content;
        }
        catch (error) {
            logger_1.logger.error('OpenAI API error:', error);
            throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async testConnection() {
        try {
            await this.client.models.list();
            return true;
        }
        catch (error) {
            logger_1.logger.error('OpenAI connection test failed:', error);
            return false;
        }
    }
    async getAvailableModels() {
        try {
            const response = await this.client.models.list();
            return response.data
                .filter(model => model.id.includes('gpt'))
                .map(model => model.id)
                .sort();
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch OpenAI models:', error);
            return [];
        }
    }
    async uploadFileDirectly(fileBuffer, fileName, purpose = 'assistants') {
        try {
            const file = new File([fileBuffer], fileName, {
                type: this.getMimeType(fileName)
            });
            const response = await this.client.files.create({
                file: file,
                purpose: purpose
            });
            logger_1.logger.info('=== ARQUIVO ENVIADO PARA OPENAI ===', {
                fileId: response.id,
                fileName: fileName,
                purpose: purpose,
                size: fileBuffer.length,
                mimeType: this.getMimeType(fileName),
                uploadTimestamp: new Date().toISOString()
            });
            logger_1.logger.info('File uploaded directly to OpenAI', {
                fileId: response.id,
                fileName: fileName,
                purpose: purpose,
                size: fileBuffer.length
            });
            return response.id;
        }
        catch (error) {
            logger_1.logger.error('Error uploading file to OpenAI:', error);
            throw new Error(`OpenAI file upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async analyzeFileDirectly(fileId, prompt, language = 'pt') {
        try {
            const systemPrompt = language === 'pt'
                ? 'Você é um analista de documentos especializado. Analise o conteúdo fornecido e forneça insights detalhados.'
                : 'You are a specialized document analyst. Analyze the provided content and provide detailed insights.';
            const fileContent = await this.client.files.content(fileId);
            const fileText = await fileContent.text();
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: `${prompt}\n\nConteúdo do arquivo:\n${fileText}`
                    }
                ],
                max_tokens: this.maxTokens,
                temperature: this.temperature,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response content received from OpenAI');
            }
            logger_1.logger.info('=== RESPOSTA DA IA PARA ARQUIVO ===', {
                fileId,
                model: this.model,
                tokensUsed: response.usage?.total_tokens,
                prompt: prompt,
                responseLength: content.length,
                responsePreview: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
                fullResponse: content
            });
            logger_1.logger.info('File analyzed directly with OpenAI', {
                fileId,
                model: this.model,
                tokensUsed: response.usage?.total_tokens
            });
            return content;
        }
        catch (error) {
            logger_1.logger.error('Error analyzing file directly:', error);
            throw new Error(`OpenAI file analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteUploadedFile(fileId) {
        try {
            await this.client.files.delete(fileId);
            logger_1.logger.info('File deleted from OpenAI', { fileId });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error deleting file from OpenAI:', error);
            return false;
        }
    }
    getMimeType(fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const mimeTypes = {
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'csv': 'text/csv',
            'json': 'application/json'
        };
        return mimeTypes[extension || ''] || 'application/octet-stream';
    }
}
exports.openaiService = new OpenAIService();
//# sourceMappingURL=openaiService.js.map