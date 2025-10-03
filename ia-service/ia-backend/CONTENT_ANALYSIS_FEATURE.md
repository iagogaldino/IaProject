# Funcionalidade de Análise de Conteúdo com IA

## Visão Geral

Esta funcionalidade permite que um agente especialista em IA analise o conteúdo de arquivos específicos e salve metadados enriquecidos no banco de dados. O agente pode identificar temas, melhorar o conteúdo, criar tags relacionadas e fornecer análises detalhadas.

## Funcionalidades

### 🎯 Análise de Tema
- Identifica automaticamente o tema principal do conteúdo
- Categoriza o conteúdo por área de conhecimento

### ✨ Melhoria de Conteúdo
- Gera uma versão melhorada do conteúdo original
- Mantém o significado original enquanto melhora a estrutura e clareza

### 🏷️ Geração de Tags
- Cria tags relevantes e descritivas automaticamente
- Facilita a categorização e busca de conteúdo

### 📊 Análise Detalhada
- **Resumo Executivo**: Visão geral do conteúdo
- **Tópicos Principais**: Identificação de temas-chave
- **Análise de Sentimento**: Tom geral do texto (positivo, negativo, neutro)
- **Nível de Confiança**: Precisão da análise (0.0 a 1.0)
- **Detecção de Idioma**: Identificação automática do idioma

## Endpoint

### POST `/api/agents/:agentId/files/:fileId/analyze`

Analisa o conteúdo de um arquivo específico usando IA especializada.

#### Parâmetros da URL
- `agentId`: ID do agente que está realizando a análise (pode ser diferente do agente que possui o arquivo)
- `fileId`: ID do arquivo a ser analisado

#### Corpo da Requisição
```json
{
  "content": "Conteúdo do arquivo para análise",
  "options": {
    "language": "pt",
    "analysisDepth": "detailed",
    "includeImprovements": true
  }
}
```

#### Opções de Análise
- `language`: Idioma para análise ("pt" ou "en")
- `analysisDepth`: Profundidade da análise ("basic", "detailed", "comprehensive")
- `includeImprovements`: Se deve gerar versão melhorada do conteúdo (boolean)

#### Resposta de Sucesso
```json
{
  "success": true,
  "data": {
    "theme": "Inteligência Artificial e Machine Learning",
    "improvedContent": "Versão melhorada do conteúdo...",
    "tags": ["IA", "Machine Learning", "Tecnologia", "Algoritmos"],
    "analysis": {
      "summary": "Documento sobre tendências em IA...",
      "keyTopics": ["Aprendizado Profundo", "NLP", "Visão Computacional"],
      "sentiment": "positivo",
      "confidence": 0.85,
      "language": "pt"
    },
    "aiAnalysis": {
      "processedAt": "2024-01-15T10:30:00Z",
      "agentId": "agent-123",
      "version": "1.0"
    },
    "fileId": "file-456",
    "agentId": "agent-123"
  }
}
```

## Estrutura de Dados

### Metadados Enriquecidos
Os metadados enriquecidos são salvos no campo `enrichedMetadata` do arquivo:

```typescript
interface EnrichedMetadata {
  theme?: string;                    // Tema principal identificado
  improvedContent?: string;          // Versão melhorada do conteúdo
  tags?: string[];                   // Tags geradas automaticamente
  analysis?: {
    summary?: string;                // Resumo executivo
    keyTopics?: string[];            // Tópicos principais
    sentiment?: string;              // Sentimento (positivo/negativo/neutro)
    confidence?: number;             // Nível de confiança (0.0-1.0)
    language?: string;               // Idioma detectado
  };
  aiAnalysis?: {
    processedAt: Date;               // Data/hora do processamento
    agentId: string;                 // ID do agente que processou
    version: string;                 // Versão do sistema de análise
  };
}
```

## Como Funciona

A análise de conteúdo funciona da seguinte forma:

1. **Agente Especialista**: Qualquer agente com permissões de arquivo pode analisar qualquer arquivo do sistema
2. **Flexibilidade**: O agente que faz a análise pode ser diferente do agente que possui o arquivo
3. **Segurança**: Apenas agentes com permissões adequadas podem acessar a funcionalidade
4. **Salvamento Automático**: Os resultados são **automaticamente salvos** nos metadados enriquecidos do arquivo original na collection `fileuploads`
5. **Persistência**: Os dados persistem no banco de dados entre reinicializações do servidor

## Exemplo de Uso

### 1. Upload de Arquivo
```bash
curl -X POST "http://localhost:3000/api/agents/agent-123/files/upload" \
  -H "X-API-Key: your-api-key" \
  -F "file=@documento.pdf"
```

### 2. Análise de Conteúdo
```bash
curl -X POST "http://localhost:3000/api/agents/agent-123/files/file-456/analyze" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Conteúdo do arquivo para análise...",
    "options": {
      "language": "pt",
      "analysisDepth": "detailed",
      "includeImprovements": true
    }
  }'
```

### 3. Verificar Metadados Salvos
```bash
curl -X GET "http://localhost:3000/api/files/file-456" \
  -H "X-API-Key: your-api-key"
```

## Salvamento Automático no Banco de Dados

### ✅ **Salvamento Automático**
Após executar a análise de conteúdo, o sistema **automaticamente salva** todos os metadados enriquecidos no banco de dados:

- **Collection**: `metadata` (collection dedicada)
- **Estrutura**: Documento separado com todos os metadados
- **Persistência**: Os dados ficam salvos permanentemente
- **Relacionamento**: Vinculado ao arquivo através do `fileId`

### 🔍 **Verificar Dados Salvos**
Para verificar se os dados foram salvos na collection metadata:

```bash
cd ia-backend
node test-metadata-collection.js
```

Este script mostra:
- ✅ Metadados salvos na collection `metadata`
- 📊 Estatísticas da collection
- 🔍 Funcionalidades de busca
- 🎯 Detalhes dos metadados salvos

### 📊 **Endpoints da Collection Metadata**

- `GET /api/files/:fileId/metadata` - Buscar metadados por arquivo
- `GET /api/agents/:agentId/metadata` - Buscar metadados por agente
- `GET /api/metadata/search` - Buscar metadados com filtros
- `GET /api/metadata/stats` - Estatísticas da collection
- `PUT /api/metadata/:metadataId` - Atualizar metadados
- `DELETE /api/metadata/:metadataId` - Deletar metadados

## Teste da Funcionalidade

Execute o script de teste para verificar se a funcionalidade está funcionando:

```bash
cd ia-backend
node test-content-analysis.js
```

### 🧪 **Teste Completo com Verificação de Banco**
Para um teste mais detalhado que verifica o salvamento no banco:

```bash
cd ia-backend
node test-database-save.js
```

## Requisitos

- OpenAI API Key configurada
- Agente com permissão de acesso a arquivos
- Arquivo existente no sistema

## Tratamento de Erros

### Códigos de Erro
- `CONTENT_REQUIRED`: Conteúdo não fornecido
- `AGENT_NOT_FOUND`: Agente não encontrado
- `FILE_NOT_FOUND`: Arquivo não encontrado
- `FILE_ACCESS_DENIED`: Agente sem permissão para o arquivo
- `ANALYSIS_ERROR`: Erro na análise de IA

### Exemplo de Resposta de Erro
```json
{
  "success": false,
  "error": {
    "message": "Conteúdo é obrigatório para análise",
    "code": "CONTENT_REQUIRED"
  }
}
```

## Logs e Monitoramento

A funcionalidade gera logs detalhados para monitoramento:
- Início e conclusão da análise
- Temas e tags identificados
- Nível de confiança da análise
- Erros durante o processamento

## Limitações

- Conteúdo máximo recomendado: 50.000 caracteres
- Dependência da OpenAI API
- Análise em português e inglês
- Requer agente com permissões de arquivo

## Futuras Melhorias

- Suporte a mais idiomas
- Análise de imagens e documentos multimídia
- Integração com outros provedores de IA
- Cache de análises para otimização
- Análise em lote de múltiplos arquivos
