import OpenAI from 'openai';
import { config } from '../config/config';
import { logger } from './logger';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface SimilaritySearchResult {
  metadata: any;
  similarity: number;
  distance: number;
}

export class EmbeddingService {
  private client: OpenAI;
  private model: string;

  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is required for embedding service');
    }

    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    
    // Usar o modelo de embedding mais recente da OpenAI
    this.model = 'text-embedding-3-small';
  }

  /**
   * Gera embedding para um texto usando OpenAI
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      // Limitar o texto a 8192 tokens (limite do modelo)
      const truncatedText = this.truncateText(text, 8192);

      const response = await this.client.embeddings.create({
        model: this.model,
        input: truncatedText,
        encoding_format: 'float',
      });

      const embedding = response.data[0].embedding;
      const usage = response.usage;

      logger.info('Embedding generated successfully', {
        textLength: text.length,
        truncatedLength: truncatedText.length,
        embeddingDimensions: embedding.length,
        model: this.model,
        tokensUsed: usage.total_tokens
      });

      return {
        embedding,
        model: this.model,
        usage: {
          prompt_tokens: usage.prompt_tokens,
          total_tokens: usage.total_tokens
        }
      };
    } catch (error: any) {
      logger.error('Error generating embedding:', error);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Gera embeddings para múltiplos textos em lote
   */
  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    try {
      const results: EmbeddingResult[] = [];
      
      // Processar em lotes para evitar limites de API
      const batchSize = 100;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        
        const response = await this.client.embeddings.create({
          model: this.model,
          input: batch.map(text => this.truncateText(text, 8192)),
          encoding_format: 'float',
        });

        for (let j = 0; j < response.data.length; j++) {
          const embeddingData = response.data[j];
          results.push({
            embedding: embeddingData.embedding,
            model: this.model,
            usage: {
              prompt_tokens: response.usage?.prompt_tokens || 0,
              total_tokens: response.usage?.total_tokens || 0
            }
          });
        }

        // Pequena pausa entre lotes para evitar rate limiting
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logger.info('Batch embeddings generated successfully', {
        totalTexts: texts.length,
        resultsCount: results.length,
        model: this.model
      });

      return results;
    } catch (error: any) {
      logger.error('Error generating batch embeddings:', error);
      throw new Error(`Batch embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Calcula similaridade coseno entre dois vetores
   */
  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      logger.warn('Vector length mismatch', {
        vectorALength: vectorA.length,
        vectorBLength: vectorB.length
      });
      // Retornar 0 para vetores de tamanhos diferentes
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Calcula distância euclidiana entre dois vetores
   */
  calculateEuclideanDistance(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      logger.warn('Vector length mismatch for euclidean distance', {
        vectorALength: vectorA.length,
        vectorBLength: vectorB.length
      });
      // Retornar uma distância alta para vetores de tamanhos diferentes
      return Number.MAX_VALUE;
    }

    let sum = 0;
    for (let i = 0; i < vectorA.length; i++) {
      const diff = vectorA[i] - vectorB[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }

  /**
   * Busca metadados similares usando embedding com algoritmo otimizado
   */
  async findSimilarMetadata(
    queryText: string,
    metadataList: Array<{ metadata: any; embedding: number[] }>,
    limit: number = 10,
    threshold: number = 0.3
  ): Promise<SimilaritySearchResult[]> {
    try {
      // Gerar embedding contextual para a consulta
      const queryEmbedding = await this.generateContextualEmbedding(queryText);

      // Primeira passada: calcular similaridades para todos os candidatos
      const candidateResults: Array<{ index: number; similarity: number; distance: number }> = [];
      
      for (let i = 0; i < metadataList.length; i++) {
        const item = metadataList[i];
        const similarity = this.calculateCosineSimilarity(
          queryEmbedding.embedding,
          item.embedding
        );
        
        const distance = this.calculateEuclideanDistance(
          queryEmbedding.embedding,
          item.embedding
        );

        candidateResults.push({
          index: i,
          similarity,
          distance
        });
      }

      // Ordenar candidatos por similaridade (maior primeiro)
      candidateResults.sort((a, b) => b.similarity - a.similarity);

      // Aplicar threshold e limit
      const filteredResults = candidateResults
        .filter(candidate => candidate.similarity >= threshold)
        .slice(0, limit);

      // Construir resultados finais
      const results: SimilaritySearchResult[] = filteredResults.map(candidate => ({
        metadata: metadataList[candidate.index].metadata,
        similarity: candidate.similarity,
        distance: candidate.distance
      }));

      logger.info('Optimized similar metadata search completed', {
        queryText: queryText.substring(0, 100) + (queryText.length > 100 ? '...' : ''),
        totalMetadata: metadataList.length,
        candidatesProcessed: candidateResults.length,
        foundResults: filteredResults.length,
        returnedResults: results.length,
        threshold,
        topSimilarity: results[0]?.similarity || 0,
        avgSimilarity: results.length > 0 ? 
          results.reduce((sum, r) => sum + r.similarity, 0) / results.length : 0
      });

      return results;
    } catch (error: any) {
      logger.error('Error finding similar metadata:', error);
      throw new Error(`Similar metadata search failed: ${error.message}`);
    }
  }

  /**
   * Gera embedding contextual otimizado para consultas de busca
   */
  async generateContextualEmbedding(queryText: string): Promise<EmbeddingResult> {
    try {
      // Enriquecer a consulta com contexto semântico
      const contextualQuery = this.enrichQuery(queryText);
      
      logger.info('Generating contextual embedding', {
        originalQuery: queryText.substring(0, 100),
        contextualQuery: contextualQuery.substring(0, 200),
        queryLength: queryText.length,
        contextualLength: contextualQuery.length
      });

      return await this.generateEmbedding(contextualQuery);
    } catch (error: any) {
      logger.error('Error generating contextual embedding:', error);
      throw error;
    }
  }

  /**
   * Enriquece a consulta com contexto semântico para melhorar a busca
   */
  private enrichQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Contexto base
    let enrichedQuery = query;
    
    // Adicionar contexto baseado em palavras-chave
    if (lowerQuery.includes('gasto') || lowerQuery.includes('total gasto')) {
      enrichedQuery += ' gastos financeiros despesas custos valores monetários investimentos obras públicas';
    }
    
    if (lowerQuery.includes('petrolina')) {
      enrichedQuery += ' cidade localização região nordeste brasil prefeitura municipal';
    }
    
    if (lowerQuery.includes('pavimentação') || lowerQuery.includes('pavimentacao')) {
      enrichedQuery += ' pavimentação asfalto ruas vias públicas infraestrutura urbana obras públicas';
    }
    
    if (lowerQuery.includes('consulte') || lowerQuery.includes('busque') || lowerQuery.includes('metadados')) {
      enrichedQuery += ' consulta busca informações dados documentos conteúdo análise';
    }
    
    if (lowerQuery.includes('vendas') || lowerQuery.includes('venda')) {
      enrichedQuery += ' vendas comerciais receita faturamento produtos serviços';
    }
    
    if (lowerQuery.includes('obra') || lowerQuery.includes('obras')) {
      enrichedQuery += ' construção obras projetos engenharia infraestrutura pavimentação';
    }
    
    if (lowerQuery.includes('investimento')) {
      enrichedQuery += ' investimentos obras públicas infraestrutura pavimentação gastos';
    }
    
    // Adicionar contexto temporal se mencionado
    if (lowerQuery.includes('hoje') || lowerQuery.includes('atual')) {
      enrichedQuery += ' atual momento presente data recente';
    }
    
    // Contexto específico para consultas sobre total de gastos
    if (lowerQuery.includes('qual o total') || lowerQuery.includes('total de')) {
      enrichedQuery += ' valor total quantidade montante gasto investimento obra';
    }
    
    return enrichedQuery;
  }

  /**
   * Gera embedding combinado para metadados (tema + tags + resumo)
   */
  async generateMetadataEmbedding(metadata: {
    theme: string;
    tags: string[];
    analysis?: {
      summary?: string;
      keyTopics?: string[];
    };
  }): Promise<EmbeddingResult> {
    try {
      // Combinar informações relevantes do metadado de forma mais contextual
      const contextualText = this.buildContextualMetadataText(metadata);

      return await this.generateEmbedding(contextualText);
    } catch (error: any) {
      logger.error('Error generating metadata embedding:', error);
      throw error;
    }
  }

  /**
   * Constrói texto contextual rico para metadados
   */
  private buildContextualMetadataText(metadata: {
    theme: string;
    tags: string[];
    analysis?: {
      summary?: string;
      keyTopics?: string[];
    };
  }): string {
    // Priorizar campos mais importantes para busca semântica
    const parts = [
      `Tema: ${metadata.theme}`,
      `Tags: ${metadata.tags.join(', ')}`,
      metadata.analysis?.summary ? `Resumo: ${metadata.analysis.summary}` : '',
      metadata.analysis?.keyTopics ? `Tópicos: ${metadata.analysis.keyTopics.join(', ')}` : ''
    ].filter(Boolean);

    return parts.join('. ');
  }

  /**
   * Trunca texto para caber no limite de tokens do modelo
   */
  private truncateText(text: string, maxTokens: number): string {
    // Estimativa aproximada: 1 token ≈ 4 caracteres
    const maxChars = maxTokens * 4;
    
    if (text.length <= maxChars) {
      return text;
    }

    return text.substring(0, maxChars - 3) + '...';
  }

  /**
   * Testa a conexão com o serviço de embedding
   */
  async testConnection(): Promise<boolean> {
    try {
      const testEmbedding = await this.generateEmbedding('Test connection');
      return testEmbedding.embedding.length > 0;
    } catch (error) {
      logger.error('Embedding service connection test failed:', error);
      return false;
    }
  }
}

export const embeddingService = new EmbeddingService();

