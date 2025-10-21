# 🔍 Sistema de Trace de Cooperação entre Agentes

## ✅ O que foi Implementado

Um sistema **completo de rastreamento** que registra toda a cadeia de cooperação entre agentes, mostrando exatamente o fluxo: **Usuário → Agente-A → Agente-B → Agente-C → Resposta ao Usuário**

---

## 🎯 Objetivo

Permitir **visibilidade total** do fluxo de cooperação entre agentes através de logs estruturados e visualmente claros.

---

## 📊 Exemplo de Output nos Logs

### Caso 1: Resposta Direta (Sem Cooperação)

```
[INFO] 🔍 COOPERATION TRACE STARTED { sessionId: 'trace_1234567890_abc123', ... }
[INFO] 🔍 ═══════════════════════════════════════════════════════════
[INFO] 🔍 COOPERATION TRACE COMPLETE {
  sessionId: 'trace_1234567890_abc123',
  totalDuration: '450ms',
  totalSteps: 3
}
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 Query: "Olá, como você está?"
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 COOPERATION CHAIN:
[INFO] 🔍 👤 User → Agente Geral → 👤 User
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 [1] 14:23:45.123 📥 Agente Geral - received
[INFO] 🔍 [2] 14:23:45.234 ⚙️ Agente Geral - processing
[INFO] 🔍 [3] 14:23:45.678 📤 Agente Geral - responded
[INFO] 🔍 ═══════════════════════════════════════════════════════════
```

### Caso 2: Cooperação Simples (A → B)

```
[INFO] 🔍 COOPERATION TRACE STARTED { sessionId: 'trace_1234567891_def456', ... }
[INFO] 🔍 ═══════════════════════════════════════════════════════════
[INFO] 🔍 COOPERATION TRACE COMPLETE {
  sessionId: 'trace_1234567891_def456',
  totalDuration: '1250ms',
  totalSteps: 7
}
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 Query: "Qual foi o total de vendas hoje?"
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 COOPERATION CHAIN:
[INFO] 🔍 👤 User → Agente Geral → Agente Vendas → 👤 User
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 [1] 14:25:10.123 📥 Agente Geral - received
[INFO] 🔍 [2] 14:25:10.234 ⚙️ Agente Geral - processing
[INFO] 🔍 [3] 14:25:10.456 🔀 Agente Geral - delegated (Delegating to Agente Vendas)
[INFO] 🔍 [4] 14:25:10.567 📥 Agente Vendas - received
[INFO] 🔍 [5] 14:25:10.678 ⚙️ Agente Vendas - processing
[INFO] 🔍 [6] 14:25:11.234 📤 Agente Vendas - responded
[INFO] 🔍 [7] 14:25:11.345 📤 Agente Geral - responded
[INFO] 🔍 ═══════════════════════════════════════════════════════════
```

### Caso 3: Cooperação em Cascata (A → B → C)

```
[INFO] 🔍 COOPERATION TRACE STARTED { sessionId: 'trace_1234567892_ghi789', ... }
[INFO] 🔍 ═══════════════════════════════════════════════════════════
[INFO] 🔍 COOPERATION TRACE COMPLETE {
  sessionId: 'trace_1234567892_ghi789',
  totalDuration: '2100ms',
  totalSteps: 11
}
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 Query: "Busque documentos sobre pavimentação"
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 COOPERATION CHAIN:
[INFO] 🔍 👤 User → Agente Geral → Agente Consultor → Agente Database → 👤 User
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 [1]  14:30:00.123 📥 Agente Geral - received
[INFO] 🔍 [2]  14:30:00.234 ⚙️ Agente Geral - processing
[INFO] 🔍 [3]  14:30:00.456 🔀 Agente Geral - delegated (Delegating to Agente Consultor)
[INFO] 🔍 [4]  14:30:00.567 📥 Agente Consultor - received
[INFO] 🔍 [5]  14:30:00.678 ⚙️ Agente Consultor - processing
[INFO] 🔍 [6]  14:30:00.890 🔀 Agente Consultor - delegated (Delegating to Agente Database)
[INFO] 🔍 [7]  14:30:01.001 📥 Agente Database - received
[INFO] 🔍 [8]  14:30:01.123 ⚙️ Agente Database - processing
[INFO] 🔍 [9]  14:30:02.012 📤 Agente Database - responded
[INFO] 🔍 [10] 14:30:02.123 📤 Agente Consultor - responded
[INFO] 🔍 [11] 14:30:02.234 📤 Agente Geral - responded
[INFO] 🔍 ═══════════════════════════════════════════════════════════
```

### Caso 4: Processamento Local (Database)

```
[INFO] 🔍 COOPERATION TRACE STARTED { sessionId: 'trace_1234567893_jkl012', ... }
[INFO] 🔍 ═══════════════════════════════════════════════════════════
[INFO] 🔍 COOPERATION TRACE COMPLETE {
  sessionId: 'trace_1234567893_jkl012',
  totalDuration: '850ms',
  totalSteps: 3
}
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 Query: "Busque metadados sobre produtividade"
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 COOPERATION CHAIN:
[INFO] 🔍 👤 User → Agente Database → 👤 User
[INFO] 🔍 ───────────────────────────────────────────────────────────
[INFO] 🔍 [1] 14:32:00.123 📥 Agente Database - received
[INFO] 🔍 [2] 14:32:00.234 ⚙️ Agente Database - processing (Querying database locally)
[INFO] 🔍 [3] 14:32:00.973 📤 Agente Database - responded (Response from database query)
[INFO] 🔍 ═══════════════════════════════════════════════════════════
```

---

## 🔍 Componentes do Trace

### 1. **Session ID**
- Identificador único para cada requisição
- Formato: `trace_<timestamp>_<random>`
- Exemplo: `trace_1234567890_abc123`

### 2. **Metadata**
```json
{
  "sessionId": "trace_1234567890_abc123",
  "initiatedBy": "user",
  "query": "Qual foi o total de vendas?",
  "totalDuration": "1250ms",
  "totalSteps": 7
}
```

### 3. **Cooperation Chain (Cadeia Visual)**
Representação simplificada do fluxo:
```
👤 User → Agente A → Agente B → Agente C → 👤 User
```

### 4. **Detailed Steps (Passos Detalhados)**
Cada passo contém:
- **Índice**: `[1]`, `[2]`, `[3]`...
- **Timestamp**: `14:25:10.123`
- **Emoji**: Identifica tipo de ação
- **Agent Name**: Nome do agente
- **Action**: Tipo de ação
- **Details**: Informações adicionais

---

## 📋 Tipos de Ações

| Ação | Emoji | Descrição |
|------|-------|-----------|
| **received** | 📥 | Agente recebeu a consulta |
| **processing** | ⚙️ | Agente está processando |
| **delegated** | 🔀 | Agente delegou para outro |
| **responded** | 📤 | Agente forneceu resposta |

---

## 🚀 Como Ver os Traces

### Método 1: Logs em Tempo Real

```bash
# Windows PowerShell
Get-Content ia-backend\logs\ai-backend.log -Wait -Tail 100

# Linux/Mac
tail -f ia-backend/logs/ai-backend.log
```

### Método 2: Filtrar Apenas Traces

```bash
# Windows PowerShell
Get-Content ia-backend\logs\ai-backend.log | Select-String "COOPERATION TRACE"

# Linux/Mac
grep "COOPERATION TRACE" ia-backend/logs/ai-backend.log
```

### Método 3: Ver Trace Completo de uma Session

```bash
# Windows PowerShell
Get-Content ia-backend\logs\ai-backend.log | Select-String "trace_1234567890"

# Linux/Mac
grep "trace_1234567890" ia-backend/logs/ai-backend.log
```

---

## 🎯 Casos de Uso

### 1. **Debugging**
Identifique exatamente onde ocorreu um problema na cadeia de cooperação.

### 2. **Performance Analysis**
Veja quanto tempo cada agente levou para processar.

### 3. **Flow Understanding**
Entenda visualmente como os agentes estão cooperando.

### 4. **Audit Trail**
Mantenha registro completo de todas as interações.

### 5. **Optimization**
Identifique gargalos e otimize cooperação.

---

## 🔧 Configuração

### Trace está SEMPRE Ativo

O sistema de trace é **automático** e registra **todas** as requisições de chat.

- ✅ Não precisa configurar nada
- ✅ Não afeta performance significativamente
- ✅ Logs são escritos em `logs/ai-backend.log`
- ✅ Automaticamente limpa após cada requisição

---

## 📊 Estrutura do Trace

```typescript
interface CooperationTrace {
  sessionId: string;                // ID único da sessão
  initiatedBy: string;               // 'user' ou agentId
  query: string;                     // Consulta original
  chain: {                           // Cadeia de ações
    agentId: string;                 // ID do agente
    agentName: string;               // Nome do agente
    action: 'received' | 'processing' | 'delegated' | 'responded';
    timestamp: Date;                 // Timestamp da ação
    details?: string;                // Detalhes adicionais
  }[];
  finalResponse?: string;            // Resposta final
  totalDuration?: number;            // Duração total em ms
}
```

---

## 📈 Benefícios

### ✅ Visibilidade Total
Veja exatamente o que acontece em cada requisição.

### ✅ Performance Tracking
Identifique quanto tempo cada etapa leva.

### ✅ Debug Facilitado
Encontre problemas rapidamente com logs visuais.

### ✅ Auditoria Completa
Registro completo de todas as cooperações.

### ✅ Zero Configuração
Funciona automaticamente sem setup adicional.

---

## 🎨 Exemplo Real Completo

### Requisição:
```bash
POST /api/agents/12345/chat
{
  "messages": [{
    "role": "user",
    "content": "Quanto foi gasto em obras de pavimentação?"
  }]
}
```

### Output no Log:
```
[2025-10-07 14:35:22] [INFO] Processing agent chat
[2025-10-07 14:35:22] [INFO] 🔍 COOPERATION TRACE STARTED {
  sessionId: 'trace_1696684522123_x7k9m2',
  initiatorAgent: '12345',
  query: 'Quanto foi gasto em obras de pavimentação?'
}
[2025-10-07 14:35:22] [INFO] Agent responding with own knowledge
[2025-10-07 14:35:22] [INFO] 🤝 Agent cooperation initiated {
  fromAgent: 'Agente Geral',
  toAgent: 'Agente Obras'
}
[2025-10-07 14:35:23] [INFO] Agent cooperation completed successfully
[2025-10-07 14:35:23] [INFO] Agent chat processed successfully

[2025-10-07 14:35:23] [INFO] 🔍 ═══════════════════════════════════════════════════════════
[2025-10-07 14:35:23] [INFO] 🔍 COOPERATION TRACE COMPLETE {
  sessionId: 'trace_1696684522123_x7k9m2',
  totalDuration: '1150ms',
  totalSteps: 7
}
[2025-10-07 14:35:23] [INFO] 🔍 ───────────────────────────────────────────────────────────
[2025-10-07 14:35:23] [INFO] 🔍 Query: "Quanto foi gasto em obras de pavimentação?"
[2025-10-07 14:35:23] [INFO] 🔍 ───────────────────────────────────────────────────────────
[2025-10-07 14:35:23] [INFO] 🔍 COOPERATION CHAIN:
[2025-10-07 14:35:23] [INFO] 🔍 👤 User → Agente Geral → Agente Obras → 👤 User
[2025-10-07 14:35:23] [INFO] 🔍 ───────────────────────────────────────────────────────────
[2025-10-07 14:35:23] [INFO] 🔍 [1] 14:35:22.123 📥 Agente Geral - received (Agent received query)
[2025-10-07 14:35:23] [INFO] 🔍 [2] 14:35:22.234 ⚙️ Agente Geral - processing (Evaluating need for specialist cooperation)
[2025-10-07 14:35:23] [INFO] 🔍 [3] 14:35:22.567 🔀 Agente Geral - delegated (Delegating to Agente Obras)
[2025-10-07 14:35:23] [INFO] 🔍 [4] 14:35:22.678 📥 Agente Obras - received (Agent received query)
[2025-10-07 14:35:23] [INFO] 🔍 [5] 14:35:22.789 ⚙️ Agente Obras - processing (Responding with own knowledge)
[2025-10-07 14:35:23] [INFO] 🔍 [6] 14:35:23.156 📤 Agente Obras - responded (Direct response provided)
[2025-10-07 14:35:23] [INFO] 🔍 [7] 14:35:23.267 📤 Agente Geral - responded (Response from cooperation)
[2025-10-07 14:35:23] [INFO] 🔍 ═══════════════════════════════════════════════════════════
```

---

## 💡 Dicas de Uso

### ✅ Para Desenvolvimento:
```bash
# Monitore em tempo real
Get-Content logs\ai-backend.log -Wait | Select-String "🔍"
```

### ✅ Para Produção:
```bash
# Analise traces específicos
grep "trace_<sessionId>" logs/ai-backend.log
```

### ✅ Para Análise:
```bash
# Conte cooperações por dia
grep "COOPERATION TRACE COMPLETE" logs/ai-backend.log | wc -l
```

---

## 🎉 Resultado

Agora você tem **visibilidade total** de toda cooperação entre agentes!

**Formato claro:**
```
👤 User → Agente-A → Agente-B → Agente-C → 👤 User
```

**Detalhes completos:**
- Session ID único
- Timestamps precisos
- Ações de cada agente
- Duração total
- Logs visuais e estruturados

---

**🔍 Trace implementado com ❤️ para máxima observabilidade!**

