# Guia de Busca por Embeddings - Sistema de Metadados

## Visão Geral

O sistema de embeddings foi implementado para permitir buscas semânticas inteligentes na coleção de metadados. Isso significa que você pode encontrar documentos similares baseado no significado do conteúdo, não apenas em palavras-chave exatas.

## Como Funciona

### 1. Geração de Embeddings
- Quando um novo metadado é criado, automaticamente é gerado um embedding usando OpenAI
- O embedding é um vetor numérico que representa o significado semântico do conteúdo
- Combina: tema + tags + resumo + tópicos-chave

### 2. Busca por Similaridade
- Compara o embedding da consulta com os embeddings armazenados
- Calcula similaridade coseno para encontrar documentos relacionados
- Retorna resultados ordenados por relevância

## Endpoints Disponíveis

### 1. Busca por Similaridade Geral
```http
GET /api/metadata/search/similar?query=produtividade trabalho&limit=10&threshold=0.7
```

**Parâmetros:**
- `query` (obrigatório): Texto para busca semântica
- `limit`: Número máximo de resultados (padrão: 10)
- `threshold`: Limite mínimo de similaridade 0-1 (padrão: 0.7)
- `agentId`: Filtrar por agente específico
- `includeEmbedding`: Incluir vetores de embedding na resposta

### 2. Busca por Tema Semântico
```http
GET /api/metadata/search/theme?theme=gestão de projetos&limit=5&threshold=0.8
```

**Parâmetros:**
- `theme` (obrigatório): Tema para busca semântica
- `limit`: Número máximo de resultados (padrão: 10)
- `threshold`: Limite mínimo de similaridade 0-1 (padrão: 0.8)
- `agentId`: Filtrar por agente específico

### 3. Gerar Embeddings para Metadados Existentes
```http
POST /api/metadata/embeddings/generate?batchSize=50
```

**Parâmetros:**
- `batchSize`: Número de metadados para processar por lote (padrão: 50)

### 4. Atualizar Embedding de Metadado Específico
```http
PUT /api/metadata/{metadataId}/embedding
```

## Exemplos de Uso

### Exemplo 1: Busca por Produtividade
```bash
curl -X GET "http://localhost:3000/api/metadata/search/similar?query=como ser mais produtivo no trabalho&limit=5&threshold=0.6" \
  -H "X-API-Key: your-api-key"
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "metadata": {
        "id": "507f1f77bcf86cd799439011",
        "theme": "Dicas de produtividade no trabalho remoto",
        "tags": ["produtividade", "trabalho remoto", "organização"],
        "analysis": {
          "summary": "Guia completo para aumentar a produtividade...",
          "keyTopics": ["gestão de tempo", "ferramentas", "organização"]
        }
      },
      "similarity": 0.85,
      "distance": 0.32
    }
  ],
  "meta": {
    "total": 5,
    "query": "como ser mais produtivo no trabalho",
    "threshold": 0.6
  }
}
```

### Exemplo 2: Busca por Tema de Projetos
```bash
curl -X GET "http://localhost:3000/api/metadata/search/theme?theme=metodologias ágeis scrum&limit=3&threshold=0.7" \
  -H "X-API-Key: your-api-key"
```

### Exemplo 3: Migração de Embeddings
```bash
curl -X POST "http://localhost:3000/api/metadata/embeddings/generate?batchSize=20" \
  -H "X-API-Key: your-api-key"
```

## Scripts Utilitários

### 1. Migração de Embeddings Existentes
```bash
# Executar migração para metadados sem embedding
node scripts/migrate-metadata-embeddings.js
```

### 2. Teste de Funcionalidades
```bash
# Testar busca por embeddings
node test-embedding-search.js
```

## Configuração

### Variáveis de Ambiente
```env
# OpenAI API Key (obrigatório)
OPENAI_API_KEY=your-openai-api-key

# Configurações do modelo (opcional)
OPENAI_MODEL=text-embedding-3-small
```

### Índices MongoDB
O sistema cria automaticamente um índice para otimizar buscas vetoriais:
```javascript
MetadataSchema.index({ 'embedding.vector': '2dsphere' });
```

## Estrutura do Embedding

```typescript
interface Embedding {
  vector: number[];        // Vetor de 1536 dimensões (OpenAI)
  model: string;           // Modelo usado (text-embedding-3-small)
  generatedAt: Date;       // Timestamp de geração
  version: string;         // Versão do sistema (1.0)
}
```

## Performance e Limites

### Limites de API
- **Rate Limiting**: 100 requests/minuto (OpenAI)
- **Batch Size**: Máximo 100 textos por lote
- **Token Limit**: 8192 tokens por texto

### Otimizações
- Processamento em lotes para evitar rate limiting
- Cache de embeddings para evitar regeneração
- Índices MongoDB para busca rápida
- Limite de 1000 metadados por busca para performance

## Monitoramento

### Logs Importantes
```javascript
// Geração de embedding
logger.info('Embedding generated successfully', {
  textLength: 150,
  embeddingDimensions: 1536,
  tokensUsed: 25
});

// Busca de similaridade
logger.info('Similar metadata search completed', {
  queryText: 'produtividade trabalho',
  totalMetadata: 100,
  resultsFound: 5,
  threshold: 0.7
});
```

### Métricas de Performance
- Tempo de geração de embedding
- Número de tokens utilizados
- Taxa de sucesso nas buscas
- Similaridade média dos resultados

## Troubleshooting

### Problemas Comuns

1. **Erro de API Key**
   ```
   Error: OpenAI API key is required for embedding service
   ```
   - Verificar se OPENAI_API_KEY está configurada

2. **Rate Limiting**
   ```
   Error: Rate limit exceeded
   ```
   - Reduzir batchSize na migração
   - Implementar retry com backoff

3. **Metadados sem Embedding**
   ```
   No metadata with embeddings found
   ```
   - Executar script de migração
   - Verificar se metadados foram criados após implementação

### Comandos de Diagnóstico

```bash
# Verificar metadados com embedding
db.metadatas.countDocuments({"embedding.vector": {$exists: true}})

# Verificar metadados sem embedding
db.metadatas.countDocuments({"embedding.vector": {$exists: false}})

# Testar conexão OpenAI
node -e "const {embeddingService} = require('./dist/services/embeddingService'); embeddingService.testConnection().then(console.log)"
```

## Próximos Passos

1. **Implementar Cache**: Redis para embeddings frequentes
2. **Busca Híbrida**: Combinar busca vetorial com filtros tradicionais
3. **Clustering**: Agrupar metadados similares automaticamente
4. **Analytics**: Dashboard de similaridade e tendências
5. **API Avançada**: Busca por múltiplos critérios simultaneamente

## Suporte

Para dúvidas ou problemas:
1. Verificar logs em `ia-backend/logs/`
2. Executar scripts de teste
3. Consultar documentação da OpenAI Embeddings API
4. Verificar status da API OpenAI

