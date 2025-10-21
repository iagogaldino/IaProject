# Guia de Testes - Sistema de Embeddings

Este guia contém scripts e comandos para testar a funcionalidade de busca por embeddings no sistema IA-Service.

## 📋 Pré-requisitos

1. **Servidor rodando**: Certifique-se de que o servidor está rodando na porta 3001
2. **API Key configurada**: Verifique se a API key está configurada corretamente
3. **OpenAI API Key**: Certifique-se de que a chave da OpenAI está configurada para gerar embeddings
4. **Dependências instaladas**: `axios` e `jq` (para scripts bash)

## 🚀 Scripts de Teste Disponíveis

### 1. Teste Completo de Ponta a Ponta
```bash
# Executar teste completo com múltiplos metadados
node test-embedding-end-to-end.js
```

**O que faz:**
- Cria 5 metadados de teste com diferentes temas
- Testa buscas de similaridade semântica
- Testa busca por tema semântico
- Exibe estatísticas
- Mantém os dados para testes futuros

### 2. Teste Individual
```bash
# Executar teste com um único metadado
node test-single-metadata.js
```

**O que faz:**
- Cria um metadado específico sobre IA
- Testa múltiplas queries de busca
- Demonstra funcionalidades de similaridade

### 3. Teste com curl (Linux/Mac)
```bash
# Tornar executável e executar
chmod +x test-embedding-curl.sh
./test-embedding-curl.sh
```

### 4. Teste com PowerShell (Windows)
```powershell
# Executar script PowerShell
.\test-embedding-curl.ps1
```

## 🔧 Comandos curl Individuais

### Criar Metadado de Teste
```bash
curl -X POST "http://localhost:3001/api/metadata" \
  -H "X-API-Key: your-api-key-for-external-access" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "test-embedding-demo-001",
    "agentId": "demo-agent-001",
    "theme": "Inteligência Artificial e Machine Learning",
    "improvedContent": "Documento sobre implementação de IA em empresas...",
    "tags": ["IA", "machine learning", "automação", "análise preditiva"],
    "analysis": {
      "summary": "Análise sobre tecnologias de IA aplicadas em ambientes corporativos...",
      "keyTopics": ["machine learning", "deep learning", "NLP", "visão computacional"],
      "sentiment": "positivo",
      "confidence": 0.95,
      "language": "pt-BR"
    }
  }'
```

### Busca por Similaridade Semântica
```bash
# Busca básica
curl -X GET "http://localhost:3001/api/metadata/search/similar?query=inteligência%20artificial&limit=5&threshold=0.7" \
  -H "X-API-Key: your-api-key-for-external-access" \
  -H "Content-Type: application/json"

# Busca com filtro por agente
curl -X GET "http://localhost:3001/api/metadata/search/similar?query=automação&agentId=demo-agent-001&limit=3&threshold=0.6" \
  -H "X-API-Key: your-api-key-for-external-access" \
  -H "Content-Type: application/json"

# Busca incluindo embeddings na resposta
curl -X GET "http://localhost:3001/api/metadata/search/similar?query=machine%20learning&includeEmbedding=true&limit=2" \
  -H "X-API-Key: your-api-key-for-external-access" \
  -H "Content-Type: application/json"
```

### Busca por Tema Semântico
```bash
curl -X GET "http://localhost:3001/api/metadata/search/theme?theme=tecnologia%20de%20inteligência%20artificial&limit=3&threshold=0.8" \
  -H "X-API-Key: your-api-key-for-external-access" \
  -H "Content-Type: application/json"
```

### Estatísticas de Metadados
```bash
curl -X GET "http://localhost:3001/api/metadata/stats" \
  -H "X-API-Key: your-api-key-for-external-access" \
  -H "Content-Type: application/json"
```

### Gerar Embeddings para Metadados Existentes
```bash
curl -X POST "http://localhost:3001/api/metadata/embeddings/generate?batchSize=20" \
  -H "X-API-Key: your-api-key-for-external-access" \
  -H "Content-Type: application/json"
```

## 📊 Parâmetros de Busca

### Similaridade Semântica (`/metadata/search/similar`)
- **query** (obrigatório): Texto para busca semântica
- **limit**: Número máximo de resultados (padrão: 10)
- **threshold**: Limiar de similaridade 0-1 (padrão: 0.7)
- **agentId**: Filtrar por agente específico (opcional)
- **includeEmbedding**: Incluir vetores de embedding (padrão: false)

### Tema Semântico (`/metadata/search/theme`)
- **theme** (obrigatório): Tema para busca semântica
- **limit**: Número máximo de resultados (padrão: 10)
- **threshold**: Limiar de similaridade 0-1 (padrão: 0.8)
- **agentId**: Filtrar por agente específico (opcional)

## 🎯 Exemplos de Queries de Teste

### Tecnologia e IA
- "inteligência artificial e machine learning"
- "automação de processos e análise preditiva"
- "deep learning e redes neurais"
- "processamento de linguagem natural"

### Finanças
- "análise financeira e receita"
- "indicadores de performance financeira"
- "projeções e orçamento empresarial"

### Marketing
- "estratégia de marketing digital"
- "redes sociais e SEO"
- "conversão e vendas online"

### Recursos Humanos
- "recrutamento e seleção"
- "diversidade e inclusão"
- "desenvolvimento de talentos"

### Operações
- "cadeia de suprimentos"
- "logística e distribuição"
- "otimização operacional"

## 📈 Interpretando Resultados

### Resposta de Busca por Similaridade
```json
{
  "success": true,
  "data": [
    {
      "metadata": {
        "id": "metadata-id",
        "theme": "Tema do documento",
        "tags": ["tag1", "tag2"],
        "analysis": {
          "summary": "Resumo do documento",
          "keyTopics": ["tópico1", "tópico2"]
        }
      },
      "similarity": 0.85,  // Similaridade coseno (0-1)
      "distance": 0.42     // Distância euclidiana
    }
  ],
  "meta": {
    "total": 1,
    "query": "sua query",
    "threshold": 0.7,
    "agentId": null
  }
}
```

### Métricas de Similaridade
- **similarity**: 0.0-1.0 (maior = mais similar)
- **distance**: Distância euclidiana (menor = mais similar)
- **threshold**: Limiar mínimo para incluir resultados

## 🔍 Troubleshooting

### Problemas Comuns

1. **Erro 401 Unauthorized**
   - Verifique se a API key está correta
   - Confirme se o header `X-API-Key` está sendo enviado

2. **Erro 500 Internal Server Error**
   - Verifique se a OpenAI API key está configurada
   - Confirme se o servidor está rodando
   - Verifique os logs do servidor

3. **Nenhum resultado encontrado**
   - Tente reduzir o threshold (ex: 0.5)
   - Verifique se existem metadados no banco
   - Confirme se os embeddings foram gerados

4. **Timeout na geração de embeddings**
   - Verifique conexão com OpenAI
   - Reduza o batchSize na geração em lote
   - Verifique se há rate limiting

### Verificar Status do Sistema
```bash
# Health check
curl -X GET "http://localhost:3001/health"

# Verificar logs
tail -f logs/combined.log
```

## 🧹 Limpeza de Dados de Teste

Para remover dados de teste criados pelos scripts:

```bash
# Remover metadado específico
curl -X DELETE "http://localhost:3001/api/metadata/METADATA_ID_AQUI" \
  -H "X-API-Key: your-api-key-for-external-access"

# Remover por fileId
curl -X DELETE "http://localhost:3001/api/files/FILE_ID_AQUI/metadata" \
  -H "X-API-Key: your-api-key-for-external-access"
```

## 📚 Próximos Passos

1. **Integração com Frontend**: Use os endpoints para implementar busca semântica na interface
2. **Otimização**: Ajuste thresholds baseado no comportamento dos usuários
3. **Monitoramento**: Implemente métricas de uso e performance
4. **Expansão**: Adicione mais tipos de busca e filtros

---

**💡 Dica**: Comece com o script `test-single-metadata.js` para uma demonstração rápida, depois use `test-embedding-end-to-end.js` para um teste mais abrangente.
