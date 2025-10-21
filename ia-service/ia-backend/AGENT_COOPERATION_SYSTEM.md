# 🤝 Sistema de Cooperação Inteligente entre Agentes

## 📋 Visão Geral

O sistema agora possui **cooperação inteligente e dinâmica** entre agentes, onde agentes podem consultar outros agentes especialistas automaticamente quando necessário.

## 🎯 Como Funciona

### Fluxo de Decisão

```
┌─────────────────────────────────────┐
│  Usuário envia mensagem ao Agente A │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Agente A pode responder sozinho?   │
└──────────────┬──────────────────────┘
               │
               ├──► SIM: Tem arquivo? → Processa arquivo
               │
               ├──► SIM: Tem database? → Consulta database
               │
               └──► NÃO: Precisa especialista?
                         │
                         ▼
               ┌─────────────────────────┐
               │  IA analisa a consulta  │
               └──────────┬──────────────┘
                          │
                          ├──► Não precisa → Responde com conhecimento próprio
                          │
                          └──► Precisa especialista
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │  Busca agentes      │
                          │  permitidos         │
                          │  (canCommunicateWith)│
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  IA seleciona o     │
                          │  melhor especialista│
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  Consulta o agente  │
                          │  especialista       │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  Retorna resposta   │
                          │  com crédito        │
                          └─────────────────────┘
```

## 🔑 Componentes Principais

### 1. **tryAgentCooperation()**
Método principal que coordena a cooperação entre agentes.

**Responsabilidades:**
- Verificar loops de chamadas (prevenir recursão infinita)
- Buscar agentes disponíveis
- Decidir se deve consultar especialista
- Coordenar a consulta

### 2. **getAgentsAllowedToCommunicate()**
Busca agentes que o agente atual pode consultar.

**Critérios:**
- ✅ Agente está ativo (`status === 'active'`)
- ✅ Não é o próprio agente
- ✅ Está em `canCommunicateWith` OU `canCommunicateWith` está vazio (= todos)

**Cache:** 5 minutos para performance

### 3. **selectBestAgentWithAI()**
Usa IA para selecionar o melhor especialista.

**Entrada:**
- Consulta do usuário
- Agente atual
- Lista de agentes disponíveis

**Saída:**
- Agente especialista selecionado
- `null` se não precisa de especialista

**Vantagens:**
- Decisão contextual baseada na consulta
- Considera capacidades de cada agente
- Analisa descrições e recursos

### 4. **consultSpecialistAgent()**
Executa a consulta ao agente especialista.

**Recursos:**
- Call stack para prevenir loops
- Pode resultar em cascata de consultas
- Formata resposta com crédito ao especialista

## 🚀 Casos de Uso

### Caso 1: Consulta Direta (Sem Cooperação)

```
Usuário → Agente Geral: "Olá, como você está?"
                  ↓
         Agente responde sozinho
                  ↓
         "Olá! Estou bem, obrigado..."
```

**Log:**
```
[INFO] Agent responding with own knowledge
```

### Caso 2: Cooperação Simples

```
Usuário → Agente Geral: "Qual o total de vendas?"
                  ↓
         IA detecta que precisa especialista
                  ↓
         Consulta Agente de Vendas
                  ↓
         "Total de vendas hoje: R$ 1.500,00"
         ✨ (Informação fornecida através de cooperação: Agente Geral → Agente Vendas)
```

**Log:**
```
[INFO] Found agents allowed for communication: { allowedCount: 3 }
[INFO] AI selected specialist agent: { selectedAgent: "Agente Vendas" }
[INFO] 🤝 Agent cooperation initiated
[INFO] Agent cooperation completed successfully
```

### Caso 3: Cooperação em Cascata

```
Usuário → Agente Geral: "Busque documentos sobre pavimentação"
                  ↓
         Consulta Agente Database
                  ↓
         Agente Database tem acesso ao DB
                  ↓
         Consulta embeddings e retorna documentos
                  ↓
         "Encontrados 3 documentos sobre pavimentação..."
         ✨ (Informação fornecida através de cooperação: Agente Geral → Agente Database)
```

### Caso 4: Recurso Local (Sem Cooperação)

```
Usuário → Agente Database: "Busque documentos sobre vendas"
                  ↓
         Agente tem acesso ao database
                  ↓
         Usa recurso local (shouldQueryDatabase = true)
                  ↓
         Consulta diretamente o banco
                  ↓
         "Encontrados 5 documentos sobre vendas..."
```

**Log:**
```
[INFO] Agent querying database locally
```

## 🔧 Configuração

### Permitir Comunicação com Todos os Agentes

```json
{
  "name": "Agente Geral",
  "description": "Assistente geral que pode consultar especialistas",
  "canCommunicateWith": []  // Vazio = pode consultar todos
}
```

### Permitir Comunicação com Agentes Específicos

```json
{
  "name": "Agente Atendimento",
  "description": "Atendimento ao cliente",
  "canCommunicateWith": [
    "60dd38f0221b326224e81974",  // ID do Agente de Vendas
    "60dd625e8be0682166a76f97"   // ID do Agente Database
  ]
}
```

### Agente Especialista (Não Consulta Outros)

```json
{
  "name": "Agente Database",
  "description": "Especialista em consultas de banco de dados",
  "canCommunicateWith": [],
  "databaseAccess": {
    "enabled": true,
    "allowedCollections": ["metadata", "documents"]
  }
}
```

## 🛡️ Proteções Implementadas

### 1. Prevenção de Loops Infinitos

```typescript
// Call stack mantém histórico de chamadas
if (this.callStack.includes(currentAgent.id)) {
  // Detecta loop e interrompe
  return null;
}
```

**Exemplo:**
```
Agente A → Agente B → Agente C → Agente A (LOOP DETECTADO!)
```

### 2. Cache de Agentes Disponíveis

- TTL: 5 minutos
- Reduz consultas ao banco
- Melhora performance

### 3. Validação de Permissões

- Sempre verifica `canCommunicateWith`
- Verifica se agente está ativo
- Não permite consultar a si mesmo

## 📊 Logs e Monitoramento

### Logs Disponíveis

```javascript
// Cooperação iniciada
[INFO] 🤝 Agent cooperation initiated {
  fromAgent: "Agente Geral",
  toAgent: "Agente Vendas",
  query: "Qual o total de vendas?"
}

// Agentes disponíveis
[INFO] Found agents allowed for communication {
  currentAgent: "Agente Geral",
  allowedCount: 3,
  allowedAgents: [...]
}

// Seleção de especialista
[INFO] AI selected specialist agent {
  currentAgent: "Agente Geral",
  selectedAgent: "Agente Vendas",
  confidence: "high"
}

// Cooperação concluída
[INFO] Agent cooperation completed successfully {
  fromAgent: "Agente Geral",
  toAgent: "Agente Vendas",
  responseLength: 150
}

// Loop detectado
[WARN] Detected potential infinite loop in agent cooperation {
  agentId: "...",
  callStack: [...]
}
```

## 🎓 Melhores Práticas

### 1. Estrutura de Agentes

✅ **BOM:**
```
Agente Geral (canCommunicateWith: [])
    ├── Agente Vendas (especialista em vendas)
    ├── Agente Obras (especialista em construção)
    └── Agente Database (acesso a dados)
```

❌ **EVITAR:**
```
Agente A → Agente B → Agente A (loop potencial)
```

### 2. Descrições Claras

✅ **BOM:**
```json
{
  "name": "Agente Vendas",
  "description": "Especialista em informações de vendas, receitas e produtos. Gerencia consultas sobre histórico de vendas e performance comercial."
}
```

❌ **EVITAR:**
```json
{
  "name": "Agente Vendas",
  "description": "Agente"
}
```

### 3. Capacidades Específicas

✅ **BOM:**
```json
{
  "name": "Agente Database",
  "description": "Especialista em busca de documentos e metadados",
  "databaseAccess": {
    "enabled": true,
    "allowedCollections": ["metadata", "documents"]
  }
}
```

## 🧪 Testes

### Testar Cooperação Básica

```bash
# No Postman ou curl
POST http://localhost:3000/api/agents/{agentId}/chat
{
  "messages": [
    {
      "role": "user",
      "content": "Qual o total de vendas hoje?"
    }
  ]
}
```

### Verificar Logs

```bash
# Monitorar logs em tempo real
tail -f ia-backend/logs/ai-backend.log | grep "cooperation"
```

## 📈 Benefícios

✅ **Dinâmico:** Sem IDs hard-coded, funciona com qualquer configuração de agentes  
✅ **Inteligente:** IA decide contextualmenterauto quando e qual agente consultar  
✅ **Escalável:** Adicione novos agentes sem modificar código  
✅ **Seguro:** Protegido contra loops infinitos  
✅ **Performático:** Cache de agentes disponíveis  
✅ **Observável:** Logs detalhados de toda cooperação  
✅ **Flexível:** Controle fino de permissões via `canCommunicateWith`  

## 🔮 Evolução Futura

Possíveis melhorias:

1. **Histórico de Cooperação:** Salvar histórico de consultas entre agentes
2. **Métricas:** Tempo de resposta, taxa de sucesso, agentes mais consultados
3. **Score de Confiança:** IA retornar score de confiança na decisão
4. **Feedback Loop:** Aprender com cooperações bem-sucedidas
5. **Cooperação Multi-Agente:** Consultar múltiplos especialistas simultaneamente
6. **Negociação:** Agentes podem negociar quem responde

## 📚 Referências

- `src/services/chatService.ts` - Implementação principal
- `src/models/Agent.ts` - Modelo de dados
- `src/services/agentService.ts` - Gerenciamento de agentes

