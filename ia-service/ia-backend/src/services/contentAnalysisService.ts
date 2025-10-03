import { openaiService } from './openaiService';
import { logger } from './logger';
import { ContentAnalysisRequest, ContentAnalysisResponse } from '../types';

export class ContentAnalysisService {
  private readonly analysisVersion = '1.0';

  async analyzeContent(request: ContentAnalysisRequest): Promise<ContentAnalysisResponse> {
    try {
      const { fileId, agentId, content, options = {} } = request;
      const { language = 'pt', analysisDepth = 'detailed', includeImprovements = true } = options;

      logger.info('Starting content analysis', {
        fileId,
        agentId,
        contentLength: content.length,
        analysisDepth,
        language
      });

      // Analyze content with AI specialist agent
      const analysisResult = await this.performAIAnalysis(content, language, analysisDepth, includeImprovements);

      const response: ContentAnalysisResponse = {
        success: true,
        data: {
          theme: analysisResult.theme,
          improvedContent: analysisResult.improvedContent,
          tags: analysisResult.tags,
          analysis: {
            summary: analysisResult.analysis.summary,
            keyTopics: analysisResult.analysis.keyTopics,
            sentiment: analysisResult.analysis.sentiment,
            confidence: analysisResult.analysis.confidence,
            language: analysisResult.analysis.language
          },
          aiAnalysis: {
            processedAt: new Date(),
            agentId,
            version: this.analysisVersion
          }
        }
      };

      logger.info('Content analysis completed successfully', {
        fileId,
        agentId,
        theme: analysisResult.theme,
        tagsCount: analysisResult.tags.length,
        confidence: analysisResult.analysis.confidence
      });

      return response;
    } catch (error: any) {
      logger.error('Error analyzing content:', error);
      return {
        success: false,
        data: {
          theme: '',
          tags: [],
          analysis: {
            summary: '',
            keyTopics: [],
            sentiment: 'neutral',
            confidence: 0,
            language: 'pt'
          },
          aiAnalysis: {
            processedAt: new Date(),
            agentId: request.agentId,
            version: this.analysisVersion
          }
        },
        error: error.message
      };
    }
  }

  private async performAIAnalysis(
    content: string, 
    language: string, 
    depth: string, 
    includeImprovements: boolean
  ): Promise<{
    theme: string;
    improvedContent?: string;
    tags: string[];
    analysis: {
      summary: string;
      keyTopics: string[];
      sentiment: string;
      confidence: number;
      language: string;
    };
  }> {
    const systemPrompt = language === 'pt'
      ? `Você é um agente especialista em análise de conteúdo com expertise em:
- Identificação de temas e tópicos principais
- Análise de sentimento e tom
- Melhoria de conteúdo e estrutura
- Criação de tags relevantes e categorização
- Análise de linguagem e contexto

Sua tarefa é analisar o conteúdo fornecido e gerar uma análise estruturada e detalhada.`
      : `You are a content analysis specialist agent with expertise in:
- Identifying themes and main topics
- Sentiment and tone analysis
- Content improvement and structure
- Creating relevant tags and categorization
- Language and context analysis

Your task is to analyze the provided content and generate a structured and detailed analysis.`;

    const analysisPrompt = language === 'pt'
      ? `Analise o seguinte conteúdo de forma ${depth} e forneça uma análise estruturada:

CONTEÚDO:
${content}

Por favor, forneça sua análise no seguinte formato JSON (sem markdown, apenas JSON válido):
{
  "theme": "Tema principal identificado no conteúdo",
  "improvedContent": "${includeImprovements ? 'Versão melhorada do conteúdo com melhor estrutura e clareza' : ''}",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "analysis": {
    "summary": "Resumo executivo do conteúdo",
    "keyTopics": ["tópico1", "tópico2", "tópico3"],
    "sentiment": "positivo|negativo|neutro",
    "confidence": 0.85,
    "language": "pt"
  }
}

INSTRUÇÕES:
1. Identifique o tema principal do conteúdo
2. ${includeImprovements ? 'Melhore o conteúdo mantendo o significado original' : 'Pule a melhoria do conteúdo'}
3. Crie 3-7 tags relevantes e descritivas
4. Forneça um resumo claro e conciso
5. Identifique os tópicos-chave principais
6. Analise o sentimento geral (positivo, negativo, neutro)
7. Forneça um nível de confiança (0.0 a 1.0)
8. Identifique o idioma do conteúdo

Responda APENAS com o JSON válido, sem texto adicional.`
      : `Analyze the following content in a ${depth} manner and provide a structured analysis:

CONTENT:
${content}

Please provide your analysis in the following JSON format (no markdown, just valid JSON):
{
  "theme": "Main theme identified in the content",
  "improvedContent": "${includeImprovements ? 'Improved version of the content with better structure and clarity' : ''}",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "analysis": {
    "summary": "Executive summary of the content",
    "keyTopics": ["topic1", "topic2", "topic3"],
    "sentiment": "positive|negative|neutral",
    "confidence": 0.85,
    "language": "en"
  }
}

INSTRUCTIONS:
1. Identify the main theme of the content
2. ${includeImprovements ? 'Improve the content while maintaining the original meaning' : 'Skip content improvement'}
3. Create 3-7 relevant and descriptive tags
4. Provide a clear and concise summary
5. Identify the main key topics
6. Analyze the general sentiment (positive, negative, neutral)
7. Provide a confidence level (0.0 to 1.0)
8. Identify the content language

Respond ONLY with valid JSON, no additional text.`;

    try {
      const aiResponse = await openaiService.processMessage([
        { role: 'user', content: analysisPrompt }
      ], systemPrompt);

      // Parse JSON response
      const analysisResult = JSON.parse(aiResponse);

      // Validate required fields
      if (!analysisResult.theme || !analysisResult.tags || !analysisResult.analysis) {
        throw new Error('Invalid analysis result structure');
      }

      // Ensure confidence is a number between 0 and 1
      if (typeof analysisResult.analysis.confidence !== 'number') {
        analysisResult.analysis.confidence = 0.8;
      } else {
        analysisResult.analysis.confidence = Math.max(0, Math.min(1, analysisResult.analysis.confidence));
      }

      // Ensure tags is an array
      if (!Array.isArray(analysisResult.tags)) {
        analysisResult.tags = [];
      }

      // Ensure keyTopics is an array
      if (!Array.isArray(analysisResult.analysis.keyTopics)) {
        analysisResult.analysis.keyTopics = [];
      }

      return analysisResult;
    } catch (error: any) {
      logger.error('Error parsing AI analysis response:', error);
      
      // Return fallback analysis
      return {
        theme: 'Conteúdo não categorizado',
        improvedContent: includeImprovements ? content : undefined,
        tags: ['conteúdo', 'análise'],
        analysis: {
          summary: 'Análise não disponível devido a erro no processamento',
          keyTopics: ['conteúdo'],
          sentiment: 'neutral',
          confidence: 0.1,
          language: language
        }
      };
    }
  }

  async testAnalysisCapability(): Promise<boolean> {
    try {
      const testContent = 'Este é um teste de análise de conteúdo para verificar se o serviço está funcionando corretamente.';
      
      const result = await this.analyzeContent({
        fileId: 'test',
        agentId: 'test-agent',
        content: testContent,
        options: {
          language: 'pt',
          analysisDepth: 'basic',
          includeImprovements: false
        }
      });

      return result.success;
    } catch (error) {
      logger.error('Content analysis capability test failed:', error);
      return false;
    }
  }
}

export const contentAnalysisService = new ContentAnalysisService();
