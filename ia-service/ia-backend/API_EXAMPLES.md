# 🚀 IA Service API - Exemplos Práticos

## 📋 Cenários de Uso Completos

### 1. 🏗️ Configuração Inicial do Sistema

#### Passo 1: Criar Agente Principal
```bash
curl --location --request POST 'http://localhost:3001/api/agents' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "name": "Agente Principal",
  "description": "Agente coordenador que consulta outros agentes especializados",
  "status": "active",
  "canCommunicateWith": []
}'
```

#### Passo 2: Criar Agente de Vendas
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

#### Passo 3: Criar Agente de Obras
```bash
curl --location --request POST 'http://localhost:3001/api/agents' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "name": "Assistant Obras",
  "description": "Especialista em obras. Total gasto na obra: 500 reais.",
  "status": "active"
}'
```

#### Passo 4: Criar Agente de Banco de Dados
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

#### Passo 5: Configurar Comunicação Entre Agentes
```bash
# Atualizar agente principal para se comunicar com outros
curl --location --request PUT 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "canCommunicateWith": ["{VENDAS_ID}", "{OBRAS_ID}", "{DATABASE_ID}"]
}'
```

---

### 2. 💬 Cenários de Chat

#### Cenário 1: Consulta de Vendas
```bash
curl --location --request POST 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/chat' \
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

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "agentId": "{AGENT_PRINCIPAL_ID}",
    "response": {
      "role": "agent",
      "content": "O total de vendas hoje foi de 600 reais. (Informação obtida do Assistente Vendas)"
    }
  }
}
```

#### Cenário 2: Consulta de Obras
```bash
curl --location --request POST 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Quanto gastamos na obra?"
    }
  ]
}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "agentId": "{AGENT_PRINCIPAL_ID}",
    "response": {
      "role": "agent",
      "content": "O total gasto na obra foi 500 reais. (Informação obtida do Assistant Obras)"
    }
  }
}
```

#### Cenário 3: Consulta de Banco de Dados
```bash
curl --location --request POST 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/chat' \
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

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "agentId": "{AGENT_PRINCIPAL_ID}",
    "response": {
      "role": "agent",
      "content": "Encontrei 1 registros na coleção metadados: [dados] (Informação obtida do Agente Database)"
    }
  }
}
```

---

### 3. 🔄 Cenários de Comunicação Entre Agentes

#### Enviar Mensagem Direta
```bash
curl --location --request POST 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/communicate' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "toAgentId": "{VENDAS_ID}",
  "content": "Preciso de um relatório de vendas"
}'
```

#### Verificar Mensagens
```bash
curl --location --request GET 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/messages' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'
```

#### Verificar Mensagens Entre Dois Agentes
```bash
curl --location --request GET 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/messages/between?otherAgentId={VENDAS_ID}' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'
```

---

### 4. 🗄️ Cenários de Banco de Dados

#### Consulta Direta ao Agente de Database
```bash
curl --location --request POST 'http://localhost:3001/api/agents/{DATABASE_ID}/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Consulte quantos usuários temos no sistema"
    }
  ]
}'
```

#### Consulta de Metadados
```bash
curl --location --request POST 'http://localhost:3001/api/agents/{DATABASE_ID}/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Busque o conteúdo do campo texto na coleção metadados"
    }
  ]
}'
```

#### Consulta de Produtos
```bash
curl --location --request POST 'http://localhost:3001/api/agents/{DATABASE_ID}/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Liste todos os produtos ativos"
    }
  ]
}'
```

---

### 5. 🎯 Cenários de Consulta Inteligente

#### Consulta Automática com Roteamento
```bash
curl --location --request POST 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/consult' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "query": "metadados"
}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "specialistAgent": {
      "id": "{DATABASE_ID}",
      "name": "Agente Database",
      "description": "Especialista em consultas de banco de dados"
    },
    "response": {
      "role": "agent",
      "content": "Encontrei dados na coleção metadados: [conteúdo]"
    }
  }
}
```

---

### 6. 📊 Cenários de Monitoramento

#### Verificar Status do Sistema
```bash
curl --location --request GET 'http://localhost:3001/health'
```

#### Listar Todos os Agentes
```bash
curl --location --request GET 'http://localhost:3001/api/agents' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'
```

#### Listar Apenas Agentes Ativos
```bash
curl --location --request GET 'http://localhost:3001/api/agents/active' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'
```

#### Estatísticas de Comunicação
```bash
curl --location --request GET 'http://localhost:3001/api/agents/communication/stats' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'
```

---

### 7. 🔧 Cenários de Manutenção

#### Atualizar Configuração de Banco de Dados
```bash
curl --location --request PUT 'http://localhost:3001/api/agents/{DATABASE_ID}' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "databaseAccess": {
    "enabled": true,
    "allowedCollections": ["users", "products", "orders", "metadados", "logs"],
    "allowedOperations": ["read", "write"],
    "queryLimits": {
      "maxResults": 100,
      "timeout": 60000
    }
  }
}'
```

#### Atualizar Comunicação Entre Agentes
```bash
curl --location --request PUT 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "canCommunicateWith": ["{VENDAS_ID}", "{OBRAS_ID}", "{DATABASE_ID}", "{NEW_AGENT_ID}"]
}'
```

#### Desativar Agente
```bash
curl --location --request PATCH 'http://localhost:3001/api/agents/{AGENT_ID}/status' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "status": "inactive"
}'
```

---

### 8. 🚨 Cenários de Tratamento de Erro

#### Agente Não Encontrado
```bash
curl --location --request POST 'http://localhost:3001/api/agents/INVALID_ID/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Teste"
    }
  ]
}'
```

**Resposta esperada:**
```json
{
  "success": false,
  "error": {
    "message": "Agent with ID INVALID_ID not found",
    "code": "AGENT_NOT_FOUND"
  }
}
```

#### API Key Inválida
```bash
curl --location --request GET 'http://localhost:3001/api/agents' \
--header 'X-API-Key: INVALID_KEY'
```

**Resposta esperada:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid API key",
    "code": "UNAUTHORIZED"
  }
}
```

#### Validação de Dados
```bash
curl --location --request POST 'http://localhost:3001/api/agents' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "name": "",
  "description": "Teste"
}'
```

**Resposta esperada:**
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
        "value": ""
      }
    ]
  }
}
```

---

### 9. 🎭 Cenários de Conversação Complexa

#### Conversa com Múltiplas Perguntas
```bash
# Pergunta 1: Vendas
curl --location --request POST 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/chat' \
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

# Pergunta 2: Obras
curl --location --request POST 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "E quanto gastamos na obra?"
    }
  ]
}'

# Pergunta 3: Banco de dados
curl --location --request POST 'http://localhost:3001/api/agents/{AGENT_PRINCIPAL_ID}/chat' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Consulte os dados do sistema"
    }
  ]
}'
```

---

### 10. 🔍 Cenários de Debugging

#### Verificar Logs de Comunicação
```bash
curl --location --request GET 'http://localhost:3001/api/agents/{AGENT_ID}/messages' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'
```

#### Verificar Configuração de Agente
```bash
curl --location --request GET 'http://localhost:3001/api/agents/{AGENT_ID}' \
--header 'X-API-Key: ai-backend-2024-abc123xyz789'
```

#### Testar Conectividade
```bash
curl --location --request GET 'http://localhost:3001/health'
```

---

## 📝 Notas Importantes

1. **Substitua os IDs**: Use os IDs reais retornados pela API
2. **API Key**: Use a chave correta para autenticação
3. **Status**: Verifique se os agentes estão ativos
4. **Comunicação**: Configure `canCommunicateWith` corretamente
5. **Banco de Dados**: Configure `databaseAccess` adequadamente

---

**Última atualização**: 2025-10-01  
**Versão**: 1.0.0
