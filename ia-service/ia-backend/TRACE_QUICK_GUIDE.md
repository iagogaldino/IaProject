# 🔍 Guia Rápido - Sistema de Trace de Cooperação

## ✅ O que foi adicionado?

Um sistema automático que registra **toda a cadeia de cooperação** entre agentes nos logs.

---

## 🎯 Formato do Trace

```
👤 User → Agente-A → Agente-B → Agente-C → 👤 User
```

Com detalhes de:
- ⏱️ Tempo de cada etapa
- 📥 Recebimento de consultas
- ⚙️ Processamento
- 🔀 Delegações
- 📤 Respostas

---

## 🚀 Como Ver os Traces

### Ver em Tempo Real

```powershell
# Windows PowerShell
cd ia-backend
Get-Content logs\ai-backend.log -Wait -Tail 50 | Select-String "🔍"
```

```bash
# Linux/Mac
cd ia-backend
tail -f logs/ai-backend.log | grep "🔍"
```

### Buscar Trace Específico

```powershell
# Windows PowerShell
Get-Content logs\ai-backend.log | Select-String "COOPERATION TRACE COMPLETE" -Context 0,15
```

---

## 📊 Exemplo de Trace Real

### Input:
```
POST /api/agents/123/chat
{
  "messages": [{
    "role": "user",
    "content": "Qual foi o total de vendas?"
  }]
}
```

### Output no Log:
```
🔍 ═══════════════════════════════════════════════════════════
🔍 COOPERATION TRACE COMPLETE {
  sessionId: 'trace_1696684522_x7k9m2',
  totalDuration: '1250ms',
  totalSteps: 7
}
🔍 ───────────────────────────────────────────────────────────
🔍 Query: "Qual foi o total de vendas?"
🔍 ───────────────────────────────────────────────────────────
🔍 COOPERATION CHAIN:
🔍 👤 User → Agente Geral → Agente Vendas → 👤 User
🔍 ───────────────────────────────────────────────────────────
🔍 [1] 14:25:10.123 📥 Agente Geral - received
🔍 [2] 14:25:10.234 ⚙️ Agente Geral - processing
🔍 [3] 14:25:10.456 🔀 Agente Geral - delegated
🔍 [4] 14:25:10.567 📥 Agente Vendas - received
🔍 [5] 14:25:10.678 ⚙️ Agente Vendas - processing
🔍 [6] 14:25:11.234 📤 Agente Vendas - responded
🔍 [7] 14:25:11.345 📤 Agente Geral - responded
🔍 ═══════════════════════════════════════════════════════════
```

---

## 🎨 Emojis e Significados

| Emoji | Ação | Significado |
|-------|------|-------------|
| 📥 | received | Agente recebeu consulta |
| ⚙️ | processing | Agente processando |
| 🔀 | delegated | Delegou para outro agente |
| 📤 | responded | Agente respondeu |
| 👤 | User | Usuário |

---

## 📋 Padrões Comuns

### Padrão 1: Resposta Direta
```
👤 User → Agente-A → 👤 User
```
Agente responde sozinho (sem cooperação)

### Padrão 2: Cooperação Simples
```
👤 User → Agente-A → Agente-B → 👤 User
```
Agente A delega para B

### Padrão 3: Cooperação em Cascata
```
👤 User → Agente-A → Agente-B → Agente-C → 👤 User
```
Múltiplas delegações

---

## 🔍 Filtrando Logs

### Ver apenas traces completos:
```powershell
Get-Content logs\ai-backend.log | Select-String "COOPERATION CHAIN:"
```

### Ver apenas delegações:
```powershell
Get-Content logs\ai-backend.log | Select-String "🔀"
```

### Ver traces com erro:
```powershell
Get-Content logs\ai-backend.log | Select-String "trace.*error" -Context 5,5
```

---

## 💡 Dicas

### ✅ Durante Desenvolvimento:
- Mantenha o log aberto em tempo real
- Procure por `🔍` para focar nos traces
- Use o sessionId para rastrear requisições específicas

### ✅ Durante Debug:
- Procure por `COOPERATION CHAIN:` para ver o fluxo
- Verifique timestamps para identificar gargalos
- Compare traces de requisições similares

### ✅ Durante Análise:
- Conte quantas delegações acontecem
- Identifique agentes mais consultados
- Analise duração total vs número de etapas

---

## 🎯 O que você pode fazer agora:

1. ✅ **Testar cooperação:**
   ```bash
   POST /api/agents/{id}/chat
   {"messages": [{"role": "user", "content": "Qual o total de vendas?"}]}
   ```

2. ✅ **Ver o trace:**
   ```powershell
   Get-Content logs\ai-backend.log -Wait | Select-String "🔍"
   ```

3. ✅ **Analisar o fluxo:**
   - Veja a cadeia visual
   - Verifique tempos
   - Identifique gargalos

---

## 📚 Documentação Completa

Para detalhes técnicos completos, veja:
- **COOPERATION_TRACE_SYSTEM.md** - Documentação completa do sistema

---

## 🎉 Pronto!

Agora toda cooperação entre agentes é **100% rastreável**!

**Formato:**
```
👤 User → Agente-A → Agente-B → Agente-C → 👤 User
```

**Automático:** Não precisa configurar nada  
**Completo:** Todos os detalhes registrados  
**Visual:** Fácil de entender  
**Performance:** Não impacta velocidade  

---

**🔍 Sistema de Trace ativo e funcionando!** ✨

