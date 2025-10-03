# 🤖 IA Service API - Documentação Completa

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints de Agentes](#endpoints-de-agentes)
- [Endpoints de Chat](#endpoints-de-chat)
- [Endpoints de Comunicação](#endpoints-de-comunicação)
- [Endpoints de Arquivos](#endpoints-de-arquivos)
- [Endpoints de Saúde](#endpoints-de-saúde)
- [Exemplos de Uso](#exemplos-de-uso)
- [Configurações Avançadas](#configurações-avançadas)

## Visão Geral

A IA Service API é uma API RESTful que permite criar e gerenciar agentes de IA inteligentes com capacidades de:
- 🤖 **Chat inteligente** com agentes especializados
- 🔄 **Comunicação entre agentes**
- 🗄️ **Acesso controlado ao banco de dados**
- 📁 **Processamento e leitura de arquivos com persistência**
- 💾 **Armazenamento de arquivos no MongoDB**
- 🎯 **Roteamento automático** de consultas

### Base URL
```
http://localhost:3001/api
```

### Autenticação
Todos os endpoints (exceto health) requerem autenticação via API Key:
```
X-API-Key: ai-backend-2024-abc123xyz789
```

---

## 🔐 Autenticação

### Headers Obrigatórios
```http
Content-Type: application/json
X-API-Key: ai-backend-2024-abc123xyz789
```

---

## 🤖 Endpoints de Agentes

### 1. Criar Agente

**POST** `/agents`

Cria um novo agente com configurações personalizadas.

#### Request Body
```json
{
  "name": "Nome do Agente",
  "description": "Descrição do agente",
  "status": "active" | "inactive",
  "canCommunicateWith": ["agent_id_1", "agent_id_2"],
  "databaseAccess": {
    "enabled": true,
    "allowedCollections": ["users", "products", "orders"],
    "allowedOperations": ["read", "write", "update", "delete"],
    "queryLimits": {
      "maxResults": 100,
      "timeout": 30000
    }
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "68dd625e8be0682166a76f97",
    "name": "Nome do Agente",
    "description": "Descrição do agente",
    "status": "active",
    "canCommunicateWith": ["agent_id_1"],
    "databaseAccess": {
      "enabled": true,
      "allowedCollections": ["users"],
      "allowedOperations": ["read"],
      "queryLimits": {
        "maxResults": 100,
        "timeout": 30000
      }
    },
    "createdAt": "2025-10-01T17:18:22.454Z",
    "updatedAt": "2025-10-01T17:18:22.454Z"
  }
}
```

### 2. Listar Todos os Agentes

**GET** `/agents`

Retorna todos os agentes cadastrados.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "68dd625e8be0682166a76f97",
      "name": "Agente Database",
      "description": "Especialista em consultas de banco de dados",
      "status": "active",
      "canCommunicateWith": [],
      "databaseAccess": {
        "enabled": true,
        "allowedCollections": ["users", "products"],
        "allowedOperations": ["read"],
        "queryLimits": {
          "maxResults": 50,
          "timeout": 30000
        }
      },
      "createdAt": "2025-10-01T17:18:22.454Z",
      "updatedAt": "2025-10-01T17:18:22.454Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### 3. Buscar Agente por ID

**GET** `/agents/{id}`

Retorna um agente específico.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "68dd625e8be0682166a76f97",
    "name": "Agente Database",
    "description": "Especialista em consultas de banco de dados",
    "status": "active",
    "canCommunicateWith": [],
    "databaseAccess": {
      "enabled": true,
      "allowedCollections": ["users", "products"],
      "allowedOperations": ["read"],
      "queryLimits": {
        "maxResults": 50,
        "timeout": 30000
      }
    },
    "createdAt": "2025-10-01T17:18:22.454Z",
    "updatedAt": "2025-10-01T17:18:22.454Z"
  }
}
```

### 4. Atualizar Agente

**PUT** `/agents/{id}`

Atualiza um agente existente.

#### Request Body
```json
{
  "name": "Novo Nome",
  "description": "Nova descrição",
  "status": "active",
  "canCommunicateWith": ["agent_id_1"],
  "databaseAccess": {
    "enabled": true,
    "allowedCollections": ["users", "products", "orders"],
    "allowedOperations": ["read"],
    "queryLimits": {
      "maxResults": 100,
      "timeout": 30000
    }
  }
}
```

### 5. Atualizar Status do Agente

**PATCH** `/agents/{id}/status`

Atualiza apenas o status do agente.

#### Request Body
```json
{
  "status": "active"
}
```

### 6. Listar Agentes Ativos

**GET** `/agents/active`

Retorna apenas agentes com status "active".

### 7. Deletar Agente

**DELETE** `/agents/{id}`

Remove um agente do sistema.

#### Response
```json
{
  "success": true,
  "data": {
    "message": "Agent deleted successfully"
  }
}
```

---

## 💬 Endpoints de Chat

### 1. Chat com Agente

**POST** `/agents/{id}/chat`

Inicia uma conversa com um agente específico.

#### Request Body
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Olá! Como você pode me ajudar?"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "agentId": "68dd625e8be0682166a76f97",
    "response": {
      "role": "agent",
      "content": "Olá! Sou um agente especializado em consultas de banco de dados. Posso ajudar você a buscar informações do sistema."
    }
  }
}
```

### 2. Consulta Inteligente

**POST** `/agents/{id}/consult`

Consulta automática com roteamento inteligente para agentes especializados.

#### Request Body
```json
{
  "query": "Consulte os dados da coleção metadados"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "specialistAgent": {
      "id": "68dd625e8be0682166a76f97",
      "name": "Agente Database",
      "description": "Especialista em consultas de banco de dados"
    },
    "response": {
      "role": "agent",
      "content": "Encontrei 1 registros na coleção metadados: [dados]"
    }
  }
}
```

### 3. Processamento de IA

**POST** `/process`

Processamento geral de IA (autenticação opcional).

#### Request Body
```json
{
  "prompt": "Explique sobre inteligência artificial",
  "conversationHistory": [
    {
      "sender": "user",
      "text": "Olá",
      "timestamp": "2025-10-01T17:18:22.454Z"
    }
  ],
  "userId": "user123",
  "sessionId": "session456",
  "metadata": {
    "context": "general"
  }
}
```

---

## 🔄 Endpoints de Comunicação

### 1. Enviar Mensagem Entre Agentes

**POST** `/agents/{id}/communicate`

Envia uma mensagem de um agente para outro.

#### Request Body
```json
{
  "toAgentId": "68dd38f0221b326224e81974",
  "content": "Preciso de informações sobre vendas"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "message_id",
    "fromAgentId": "68dd37501d9bfcc29e34574b",
    "toAgentId": "68dd38f0221b326224e81974",
    "content": "Preciso de informações sobre vendas",
    "createdAt": "2025-10-01T17:18:22.454Z"
  }
}
```

### 2. Buscar Mensagens do Agente

**GET** `/agents/{id}/messages`

Retorna mensagens de um agente específico.

#### Query Parameters
- `limit`: Número máximo de mensagens (padrão: 50)
- `offset`: Número de mensagens para pular (padrão: 0)

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "message_id",
      "fromAgentId": "68dd37501d9bfcc29e34574b",
      "toAgentId": "68dd38f0221b326224e81974",
      "content": "Mensagem de exemplo",
      "createdAt": "2025-10-01T17:18:22.454Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 50,
    "page": 1
  }
}
```

### 3. Buscar Mensagens Entre Dois Agentes

**GET** `/agents/{id}/messages/between?otherAgentId={otherAgentId}`

Retorna mensagens entre dois agentes específicos.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "message_id",
      "fromAgentId": "68dd37501d9bfcc29e34574b",
      "toAgentId": "68dd38f0221b326224e81974",
      "content": "Conversa entre agentes",
      "createdAt": "2025-10-01T17:18:22.454Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 50
  }
}
```

### 4. Buscar Mensagens Não Lidas

**GET** `/agents/{id}/messages/unread`

Retorna mensagens não lidas de um agente.

### 5. Contar Mensagens

**GET** `/agents/{id}/messages/count`

Retorna o número total de mensagens de um agente.

#### Response
```json
{
  "success": true,
  "data": {
    "count": 15
  }
}
```

### 6. Deletar Mensagem

**DELETE** `/agents/messages/{messageId}`

Remove uma mensagem específica.

### 7. Estatísticas de Comunicação

**GET** `/agents/communication/stats`

Retorna estatísticas gerais de comunicação.

#### Response
```json
{
  "success": true,
  "data": {
    "totalMessages": 150,
    "activeConversations": 5,
    "agentsWithMessages": 3,
    "averageResponseTime": 2.5
  }
}
```

---

## 📁 Endpoints de Arquivos

### 1. Upload de Arquivo

**POST** `/agents/{id}/files/upload`

Faz upload de um arquivo para processamento por um agente específico.

#### Headers
```http
Content-Type: multipart/form-data
X-API-Key: ai-backend-2024-abc123xyz789
```

#### Form Data
- `file`: Arquivo a ser enviado (máximo 10MB)
- Tipos permitidos: txt, pdf, doc, docx, csv, json

#### Response
```json
{
  "success": true,
  "data": {
    "id": "file-uuid-123",
    "agentId": "68dd625e8be0682166a76f97",
    "originalName": "documento.pdf",
    "fileName": "unique-filename.pdf",
    "filePath": "/uploads/unique-filename.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-10-01T17:18:22.454Z",
    "metadata": {
      "originalName": "documento.pdf",
      "mimeType": "application/pdf",
      "size": 2048576
    }
  }
}
```

### 2. Processar Arquivo

**POST** `/agents/{id}/files/{fileId}/process`

Processa um arquivo com operações específicas.

#### Request Body
```json
{
  "operation": "read" | "analyze" | "summarize" | "extract",
  "options": {
    "language": "pt",
    "format": "text",
    "maxLength": 200
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "content": "Conteúdo processado do arquivo...",
    "summary": "Resumo do arquivo (se operation for summarize)",
    "metadata": {
      "wordCount": 150,
      "characterCount": 850,
      "language": "pt",
      "fileType": "text"
    }
  }
}
```

### 3. Listar Arquivos do Agente

**GET** `/agents/{id}/files`

Lista todos os arquivos de um agente específico.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "file-uuid-123",
      "agentId": "68dd625e8be0682166a76f97",
      "originalName": "documento.pdf",
      "fileName": "unique-filename.pdf",
      "filePath": "/uploads/unique-filename.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "uploadedAt": "2025-10-01T17:18:22.454Z",
      "metadata": {}
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### 4. Listar Todos os Arquivos

**GET** `/files`

Lista todos os arquivos do sistema, independente do agente.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "file-uuid-123",
      "agentId": "68dd625e8be0682166a76f97",
      "originalName": "documento.pdf",
      "fileName": "unique-filename.pdf",
      "filePath": "/uploads/unique-filename.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "uploadedAt": "2025-10-01T17:18:22.454Z",
      "processedAt": "2025-10-01T17:20:15.123Z",
      "content": "Conteúdo extraído do arquivo...",
      "metadata": {
        "originalName": "documento.pdf",
        "mimeType": "application/pdf",
        "size": 2048576
      },
      "enrichedMetadata": {
        "theme": "Documento técnico",
        "tags": ["tecnologia", "documentação"],
        "analysis": "Análise detalhada do conteúdo"
      }
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### 5. Obter Informações do Arquivo

**GET** `/files/{fileId}`

Retorna informações detalhadas de um arquivo específico.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "file-uuid-123",
    "agentId": "68dd625e8be0682166a76f97",
    "originalName": "documento.pdf",
    "fileName": "unique-filename.pdf",
    "filePath": "/uploads/unique-filename.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-10-01T17:18:22.454Z",
    "processedAt": "2025-10-01T17:20:15.123Z",
    "content": "Conteúdo extraído do arquivo...",
    "metadata": {
      "wordCount": 150,
      "characterCount": 850
    }
  }
}
```

### 6. Deletar Arquivo

**DELETE** `/agents/{id}/files/{fileId}`

Remove um arquivo do sistema.

#### Response
```json
{
  "success": true,
  "data": {
    "message": "Arquivo deletado com sucesso"
  }
}
```

---

## 💾 Persistência de Arquivos no Banco de Dados

### Modelo FileUpload

Todos os arquivos são automaticamente salvos no MongoDB com as seguintes informações:

```json
{
  "_id": "68de602fbb302ef317843107",
  "agentId": "68de5d2bf6934dbd41a89f9f",
  "originalName": "relatorio-vendas.csv",
  "fileName": "unique-filename.csv",
  "filePath": "/uploads/unique-filename.csv",
  "fileSize": 153,
  "mimeType": "text/csv",
  "uploadedAt": "2025-10-02T11:21:19.143Z",
  "processedAt": "2025-10-02T11:21:23.871Z",
  "content": "Conteúdo processado pela IA...",
  "metadata": {
    "originalName": "relatorio-vendas.csv",
    "mimeType": "text/csv",
    "size": 153
  },
  "createdAt": "2025-10-02T11:21:19.143Z",
  "updatedAt": "2025-10-02T11:21:23.871Z"
}
```

### Índices Otimizados

O sistema cria automaticamente os seguintes índices para otimizar consultas:

- `{ agentId: 1, uploadedAt: -1 }` - Busca por agente ordenada por data
- `{ fileName: 1 }` - Busca rápida por nome do arquivo
- `{ mimeType: 1 }` - Filtro por tipo de arquivo
- `{ uploadedAt: -1 }` - Ordenação por data de upload

### Fluxo de Persistência

1. **Upload**: Arquivo salvo no disco + registro criado no MongoDB
2. **Processamento**: IA analisa o conteúdo + resultado salvo no banco
3. **Listagem**: Busca registros diretamente do MongoDB
4. **Chat**: Agente acessa informações dos arquivos do banco
5. **Exclusão**: Remove arquivo físico + registro do MongoDB

### Vantagens da Persistência

- 🗄️ **Rastreabilidade**: Histórico completo de todos os arquivos
- 📊 **Metadados**: Informações detalhadas sobre cada arquivo
- 🤖 **IA Integrada**: Conteúdo processado salvo automaticamente
- 🔄 **Sincronização**: Banco sempre atualizado com operações
- 📈 **Analytics**: Possibilidade de relatórios sobre uso de arquivos
- 🔍 **Busca Avançada**: Consultas complexas por tipo, data, agente, etc.

---

## 🏥 Endpoints de Saúde

### 1. Health Check

**GET** `/health`

Verifica o status do sistema.

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2025-10-01T17:18:22.454Z",
  "uptime": 3600,
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
    "averageProcessingTime": 1.2,
    "agentUsage": {
      "68dd625e8be0682166a76f97": 300,
      "68dd37501d9bfcc29e34574b": 200
    },
    "errorRate": 0.05
  }
}
```

---

## 🎯 Exemplos de Uso

### 1. Criar Agente de Vendas

```bash
curl --location --request POST 'http://localhost:3001/api/agents' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "name": "Assistente Vendas",
  "description": "Especialista em informações de vendas. Total de vendas hoje: 600 reais.",
  "status": "active"
}'
```

### 2. Criar Agente de Banco de Dados

```bash
curl --location --request POST 'http://localhost:3001/api/agents' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "name": "Agente Database",
  "description": "Especialista em consultas de banco de dados",
  "status": "active",
  "databaseAccess": {
    "enabled": true,
    "allowedCollections": ["users", "products", "orders", "metadados"],
    "allowedOperations": ["read"],
    "queryLimits": {
      "maxResults": 50,
      "timeout": 30000
    }
  }
}'
```

### 3. Criar Agente de Processamento de Arquivos

```bash
curl --location --request POST 'http://localhost:3001/api/agents' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "name": "Agente Documentos",
  "description": "Especialista em leitura e análise de documentos com IA OpenAI",
  "status": "active",
  "fileAccess": {
    "enabled": true,
    "allowedFileTypes": ["txt", "pdf", "doc", "docx", "csv", "json"],
    "maxFileSize": 10485760,
    "allowedOperations": ["read", "upload", "delete"],
    "storagePath": "uploads"
  }
}'
```

### 4. Chat com Agente Principal

```bash
curl --location --request POST 'http://localhost:3001/api/agents/68dd37501d9bfcc29e34574b/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Qual foi o total de vendas hoje?"
    }
  ]
}'
```

### 5. Consulta de Banco de Dados

```bash
curl --location --request POST 'http://localhost:3001/api/agents/68dd37501d9bfcc29e34574b/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Consulte os dados da coleção metadados"
    }
  ]
}'
```

### 6. Comunicação Entre Agentes

```bash
curl --location --request POST 'http://localhost:3001/api/agents/68dd37501d9bfcc29e34574b/communicate' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "toAgentId": "68dd38f0221b326224e81975",
  "content": "Preciso de informações sobre vendas"
}'
```

### 7. Upload de Arquivo

```bash
curl --location --request POST 'http://localhost:3001/api/agents/68dd625e8be0682166a76f97/files/upload' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--form 'file=@"/path/to/document.pdf"'
```

### 8. Processar Arquivo

```bash
curl --location --request POST 'http://localhost:3001/api/agents/68dd625e8be0682166a76f97/files/file-uuid-123/process' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "operation": "summarize",
  "options": {
    "language": "pt",
    "maxLength": 100
  }
}'
```

### 9. Chat com Agente que Processa Arquivos

```bash
curl --location --request POST 'http://localhost:3001/api/agents/68dd625e8be0682166a76f97/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Liste os arquivos disponíveis"
    }
  ]
}'
```

### 10. Listar Todos os Arquivos

```bash
# Listar todos os arquivos do sistema (sem filtro por agente)
curl --location --request GET 'http://localhost:3001/api/files' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'
```

### 11. Verificar Persistência no Banco de Dados

```bash
# Listar todos os arquivos de um agente (dados do MongoDB)
curl --location --request GET 'http://localhost:3001/api/agents/68de5d2bf6934dbd41a89f9f/files' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'

# Obter informações detalhadas de um arquivo específico
curl --location --request GET 'http://localhost:3001/api/files/68de602fbb302ef317843107' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'
```

### 12. Teste Completo de Persistência

```bash
# 1. Upload de arquivo Excel
curl -X POST 'http://localhost:3001/api/agents/68de5d2bf6934dbd41a89f9f/files/upload' \
-H 'X-API-Key: ai-backend-2024-abc123xyz789' \
-F 'file=@"/path/to/planilha.xlsx"'

# 2. Processar com IA (salva conteúdo no banco)
curl -X POST 'http://localhost:3001/api/agents/68de5d2bf6934dbd41a89f9f/files/{fileId}/process' \
-H 'Content-Type: application/json' \
-H 'X-API-Key: ai-backend-2024-abc123xyz789' \
-d '{"operation": "analyze", "options": {"language": "pt"}}'

# 3. Verificar se foi salvo no banco
curl -X GET 'http://localhost:3001/api/files/{fileId}' \
-H 'X-API-Key: ai-backend-2024-abc123xyz789'

# 4. Chat com agente sobre arquivos salvos
curl -X POST 'http://localhost:3001/api/agents/68de5d2bf6934dbd41a89f9f/chat' \
-H 'Content-Type: application/json' \
-H 'X-API-Key: ai-backend-2024-abc123xyz789' \
-d '{"messages": [{"role": "user", "content": "Analise os arquivos que tenho salvos"}]}'
```

---

## ⚙️ Configurações Avançadas

### 1. Configuração de Acesso ao Banco de Dados

```json
{
  "databaseAccess": {
    "enabled": true,
    "allowedCollections": ["users", "products", "orders"],
    "allowedOperations": ["read", "write", "update", "delete"],
    "queryLimits": {
      "maxResults": 100,
      "timeout": 30000
    }
  }
}
```

#### Parâmetros:
- **enabled**: Habilita/desabilita acesso ao banco
- **allowedCollections**: Lista de coleções permitidas
- **allowedOperations**: Operações permitidas (read, write, update, delete)
- **queryLimits**: Limites de consulta
  - **maxResults**: Máximo de registros retornados
  - **timeout**: Timeout em milissegundos

### 2. Palavras-chave para Detecção Automática

#### Para Vendas:
- "vendas", "venda", "total de vendas", "vendas hoje"

#### Para Obras:
- "obra", "obras", "gasto", "gastos", "total gasto"

#### Para Banco de Dados:
- "consulte", "consulta", "busque", "buscar"
- "dados", "informações", "registros"
- "metadados", "texto", "conteúdo"

#### Para Arquivos:
- "arquivo", "file", "documento", "document"
- "leia", "read", "analise", "analyze"
- "resuma", "summarize", "extraia", "extract"
- "processe", "process", "conteúdo do arquivo"

### 3. Configuração de Acesso a Arquivos

```json
{
  "fileAccess": {
    "enabled": true,
    "allowedFileTypes": ["txt", "pdf", "doc", "docx", "csv", "json"],
    "maxFileSize": 10485760,
    "allowedOperations": ["read", "upload", "delete"],
    "storagePath": "uploads"
  }
}
```

#### Parâmetros:
- **enabled**: Habilita/desabilita acesso a arquivos
- **allowedFileTypes**: Tipos de arquivo permitidos
- **maxFileSize**: Tamanho máximo em bytes (padrão: 10MB)
- **allowedOperations**: Operações permitidas (read, upload, delete)
- **storagePath**: Diretório de armazenamento

### 4. Configuração de Comunicação

```json
{
  "canCommunicateWith": ["agent_id_1", "agent_id_2", "agent_id_3"]
}
```

### 5. Configuração de Persistência de Arquivos

```json
{
  "filePersistence": {
    "enabled": true,
    "database": "mongodb",
    "collection": "fileuploads",
    "autoSaveContent": true,
    "saveProcessedResults": true,
    "retentionDays": 365,
    "maxFileSize": 10485760,
    "supportedFormats": ["txt", "pdf", "doc", "docx", "xlsx", "xls", "csv", "json"]
  }
}
```

#### Parâmetros de Persistência:
- **enabled**: Habilita persistência no banco de dados
- **database**: Tipo de banco (mongodb)
- **collection**: Nome da coleção no MongoDB
- **autoSaveContent**: Salva conteúdo automaticamente após processamento
- **saveProcessedResults**: Salva resultados da IA no banco
- **retentionDays**: Dias para manter arquivos (padrão: 365)
- **maxFileSize**: Tamanho máximo em bytes
- **supportedFormats**: Formatos suportados para persistência

---

## 🚨 Códigos de Erro

### 400 - Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "name",
        "message": "Name is required",
        "value": null
      }
    ]
  }
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Invalid API key",
    "code": "UNAUTHORIZED"
  }
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": {
    "message": "Agent not found",
    "code": "AGENT_NOT_FOUND"
  }
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Internal Server Error",
    "code": "INTERNAL_ERROR"
  }
}
```

### Códigos de Erro Específicos para Arquivos

#### FILE_ACCESS_DENIED
```json
{
  "success": false,
  "error": {
    "message": "Agente não tem permissão para acessar arquivos",
    "code": "FILE_ACCESS_DENIED"
  }
}
```

#### FILE_TYPE_NOT_ALLOWED
```json
{
  "success": false,
  "error": {
    "message": "Tipo de arquivo não permitido",
    "code": "FILE_TYPE_NOT_ALLOWED"
  }
}
```

#### FILE_TOO_LARGE
```json
{
  "success": false,
  "error": {
    "message": "Arquivo muito grande",
    "code": "FILE_TOO_LARGE"
  }
}
```

#### FILE_NOT_FOUND
```json
{
  "success": false,
  "error": {
    "message": "Arquivo não encontrado",
    "code": "FILE_NOT_FOUND"
  }
}
```

#### FILE_PROCESSING_ERROR
```json
{
  "success": false,
  "error": {
    "message": "Erro ao processar arquivo",
    "code": "FILE_PROCESSING_ERROR"
  }
}
```

---

## 📊 Monitoramento

### Logs
Todos os requests são logados com:
- Timestamp
- Agent ID
- Operation
- Execution time
- Success/Error status

### Métricas
- Total de requests
- Requests bem-sucedidos
- Requests com erro
- Tempo médio de processamento
- Uso por agente
- Taxa de erro

### Métricas de Arquivos
- Total de arquivos uploadados
- Arquivos processados com IA
- Tipos de arquivo mais comuns
- Tamanho médio dos arquivos
- Taxa de sucesso no processamento
- Uso de armazenamento por agente

---

## 🔧 Desenvolvimento

### Instalação
```bash
npm install
```

### Execução
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Testes
```bash
npm test
```

---

## 📝 Notas Importantes

1. **Rate Limiting**: 100 requests por minuto por IP
2. **Timeout**: 30 segundos para operações de banco de dados
3. **Logs**: Todos os acessos ao banco são logados
4. **Segurança**: Validação de coleções e operações permitidas
5. **Performance**: Cache de agentes ativos

### Notas sobre Persistência de Arquivos

6. **Armazenamento Duplo**: Arquivos salvos no disco + metadados no MongoDB
7. **Processamento Automático**: Conteúdo da IA salvo automaticamente no banco
8. **Rastreabilidade**: Histórico completo de uploads e processamentos
9. **Limpeza**: Arquivos físicos removidos quando registro é deletado
10. **Backup**: Recomenda-se backup regular da coleção `fileuploads`
11. **Performance**: Índices otimizados para consultas rápidas
12. **Segurança**: Validação de tipos de arquivo e tamanho máximo

---

## 🔍 Consultas Avançadas no Banco de Dados

### Consultas MongoDB para Arquivos

#### Buscar arquivos por agente
```javascript
db.fileuploads.find({ agentId: "68de5d2bf6934dbd41a89f9f" })
```

#### Buscar arquivos por tipo
```javascript
db.fileuploads.find({ mimeType: "text/csv" })
```

#### Buscar arquivos processados
```javascript
db.fileuploads.find({ processedAt: { $exists: true } })
```

#### Buscar arquivos por período
```javascript
db.fileuploads.find({
  uploadedAt: {
    $gte: new Date("2025-01-01"),
    $lte: new Date("2025-12-31")
  }
})
```

#### Estatísticas de uso
```javascript
// Total de arquivos por agente
db.fileuploads.aggregate([
  { $group: { _id: "$agentId", count: { $sum: 1 } } }
])

// Tipos de arquivo mais comuns
db.fileuploads.aggregate([
  { $group: { _id: "$mimeType", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Tamanho médio dos arquivos
db.fileuploads.aggregate([
  { $group: { _id: null, avgSize: { $avg: "$fileSize" } } }
])
```

### Índices Recomendados

```javascript
// Índice composto para consultas por agente e data
db.fileuploads.createIndex({ agentId: 1, uploadedAt: -1 })

// Índice para consultas por tipo de arquivo
db.fileuploads.createIndex({ mimeType: 1 })

// Índice para consultas por status de processamento
db.fileuploads.createIndex({ processedAt: 1 })

// Índice para consultas por tamanho
db.fileuploads.createIndex({ fileSize: 1 })
```

---

## 🤝 Suporte

Para dúvidas ou problemas:
- Verifique os logs do sistema
- Consulte o endpoint `/health` para status
- Verifique as configurações de autenticação
- Confirme se os agentes estão ativos

---

**Versão**: 1.1.0  
**Última atualização**: 2025-10-02  
**Autor**: IA Service Team

### Novidades na Versão 1.1.0
- ✅ **Persistência de arquivos no MongoDB**
- ✅ **Modelo FileUpload com índices otimizados**
- ✅ **Salvamento automático de conteúdo processado**
- ✅ **Rastreabilidade completa de uploads**
- ✅ **Consultas avançadas no banco de dados**
- ✅ **Métricas de uso de arquivos**
- ✅ **Suporte aprimorado para Excel/CSV**
