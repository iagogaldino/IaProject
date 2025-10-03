# API Documentation - Sistema de Agentes Inteligentes

## Visão Geral

Esta API REST permite gerenciar agentes inteligentes e facilitar comunicação entre eles, com integração completa à OpenAI.

## Base URL

```
http://localhost:3001
```

## Autenticação

A maioria dos endpoints requer autenticação via API Key:

```http
X-API-Key: your-secure-api-key-here
```

Ou via Bearer Token:

```http
Authorization: Bearer your-secure-api-key-here
```

**Nota**: O endpoint `/api/ai/process` é público e não requer autenticação.

## Endpoints

### 🔹 Gestão de Agentes

#### Criar Agente
```http
POST /api/agents
```

**Body:**
```json
{
  "name": "assistente_vendas",
  "description": "Agente especializado em atendimento de vendas",
  "status": "active",
  "canCommunicateWith": ["1", "2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "assistente_vendas",
    "description": "Agente especializado em atendimento de vendas",
    "status": "active",
    "canCommunicateWith": ["1", "2"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Listar Agentes
```http
GET /api/agents
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "assistente_vendas",
      "description": "Agente especializado em atendimento de vendas",
      "status": "active",
      "canCommunicateWith": ["2"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

#### Buscar Agente por ID
```http
GET /api/agents/:id
```

#### Atualizar Agente
```http
PUT /api/agents/:id
```

**Body:**
```json
{
  "name": "assistente_vendas_atualizado",
  "description": "Nova descrição do agente",
  "status": "active"
}
```

#### Ativar/Desativar Agente
```http
PATCH /api/agents/:id/status
```

**Body:**
```json
{
  "status": "inactive"
}
```

#### Remover Agente
```http
DELETE /api/agents/:id
```

### 🔹 Comunicação entre Agentes

#### Enviar Mensagem
```http
POST /api/agents/:id/communicate
```

**Body:**
```json
{
  "toAgentId": "2",
  "content": "Preciso de ajuda com uma consulta de vendas"
}
```

#### Listar Mensagens
```http
GET /api/agents/:id/messages
```

**Query Parameters:**
- `limit` (opcional): Número máximo de mensagens (padrão: 50)
- `offset` (opcional): Número de mensagens para pular (padrão: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "fromAgentId": "1",
      "toAgentId": "2",
      "content": "Preciso de ajuda com uma consulta de vendas",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

#### Mensagens entre Agentes Específicos
```http
GET /api/agents/:id/messages/between?otherAgentId=2
```

#### Mensagens Não Lidas
```http
GET /api/agents/:id/messages/unread
```

#### Contar Mensagens
```http
GET /api/agents/:id/messages/count
```

### 🔹 Chat com IA

#### Chat com Agente Específico
```http
POST /api/agents/:id/chat
```

**Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Oi agente, pode me ajudar?"
    },
    {
      "role": "agent",
      "content": "Claro, sobre o que você precisa?"
    },
    {
      "role": "user",
      "content": "Resuma o relatório de ontem"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": "1",
    "response": {
      "role": "agent",
      "content": "O relatório mostra que as vendas subiram 20% ontem."
    }
  }
}
```

#### Processamento de IA (Endpoint Público)
```http
POST /api/ai/process
```

**Body:**
```json
{
  "prompt": "Quantos relatórios temos?",
  "conversationHistory": [
    {
      "sender": "user",
      "text": "Olá",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "userId": "user123",
  "sessionId": "session456",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": "<h2>Resumo dos Dados</h2><p>Total de registros: 150</p>",
  "metadata": {
    "agentUsed": "DatabaseQueryAgent",
    "requiresDatabase": true,
    "processingTime": 1250,
    "confidence": 0.9,
    "databaseData": [],
    "sqlQuery": "SELECT COUNT(*) FROM relatorio_texto"
  }
}
```

### 🔹 Health Check

#### Status do Sistema
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600000,
  "version": "1.0.0",
  "services": {
    "openai": true,
    "apiKey": true,
    "jwtSecret": true,
    "database": true
  },
  "metrics": {
    "totalRequests": 1000,
    "successfulRequests": 950,
    "failedRequests": 50,
    "averageProcessingTime": 1200,
    "agentUsage": {
      "DatabaseQueryAgent": 600,
      "DirectResponse": 350
    },
    "errorRate": 0.05
  }
}
```

#### Métricas do Sistema
```http
GET /health/metrics
```

#### Status da Configuração
```http
GET /health/config
```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autorizado
- `404` - Recurso não encontrado
- `409` - Conflito (ex: agente já existe)
- `500` - Erro interno do servidor
- `503` - Serviço indisponível

## Estrutura de Erro

```json
{
  "success": false,
  "error": {
    "message": "Descrição do erro",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## Rate Limiting

- **Janela**: 15 minutos (900000ms)
- **Máximo**: 100 requisições por janela
- **Headers**: Inclui informações de rate limit nas respostas

## Exemplos de Uso

### 1. Criar e Testar um Agente

```bash
# Criar agente
curl -X POST http://localhost:3001/api/agents \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "assistente_geral",
    "description": "Agente para atendimento geral",
    "status": "active"
  }'

# Testar chat
curl -X POST http://localhost:3001/api/agents/1/chat \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Olá, como você está?"}
    ]
  }'
```

### 2. Comunicação entre Agentes

```bash
# Enviar mensagem entre agentes
curl -X POST http://localhost:3001/api/agents/1/communicate \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "toAgentId": "2",
    "content": "Preciso de ajuda com esta consulta"
  }'
```

### 3. Usar Endpoint Público de IA

```bash
curl -X POST http://localhost:3001/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explique o que são agentes inteligentes",
    "userId": "user123"
  }'
```

## Configuração

Certifique-se de configurar as seguintes variáveis de ambiente:

```env
PORT=3001
OPENAI_API_KEY=your-openai-api-key
API_KEY=your-secure-api-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_backend
DB_USER=postgres
DB_PASSWORD=password
```

## Testes

Execute o script de teste para validar todos os endpoints:

```bash
node scripts/test-endpoints.js
```

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `logs/combined.log`
2. Consulte o health check: `GET /health`
3. Verifique as métricas: `GET /health/metrics`
