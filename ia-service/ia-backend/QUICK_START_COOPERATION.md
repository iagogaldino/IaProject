# 🚀 Quick Start - Cooperação entre Agentes

## 📦 Instalação e Setup

### 1. Compilar o projeto

```bash
cd ia-backend
npm run build
```

### 2. Iniciar o servidor

```bash
npm start
```

## 🎯 Testando a Cooperação

### Opção 1: Script de Teste Automatizado

```bash
cd ia-backend
node test-agent-cooperation.js
```

**Ou para testar permissões:**

```bash
node test-agent-cooperation.js --permissions
```

### Opção 2: Testes Manuais com Postman/curl

#### Exemplo 1: Pergunta Geral

```bash
POST http://localhost:3000/api/agents/{agent-id}/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Qual foi o total de vendas hoje?"
    }
  ]
}
```

**Resposta esperada:**
```json
{
  "agentId": "...",
  "response": {
    "role": "assistant",
    "content": "O total de vendas hoje foi de R$ 1.500,00...\n\n✨ (Informação fornecida através de cooperação: Agente Geral → Agente Vendas)"
  }
}
```

## 🔧 Configurando Agentes para Cooperação

### Criar Agente Geral (Pode consultar todos)

```bash
POST http://localhost:3000/api/agents
Content-Type: application/json

{
  "name": "Assistente Geral",
  "description": "Assistente geral que pode consultar especialistas quando necessário",
  "status": "active",
  "canCommunicateWith": []
}
```

**`canCommunicateWith: []` = Pode consultar TODOS os agentes**

### Criar Agente Especialista

```bash
POST http://localhost:3000/api/agents
Content-Type: application/json

{
  "name": "Agente Vendas",
  "description": "Especialista em informações de vendas, receitas e produtos",
  "status": "active",
  "canCommunicateWith": []
}
```

### Criar Agente com Permissões Específicas

```bash
POST http://localhost:3000/api/agents
Content-Type: application/json

{
  "name": "Agente Atendimento",
  "description": "Atendimento ao cliente com acesso limitado",
  "status": "active",
  "canCommunicateWith": [
    "60dd38f0221b326224e81974",  // ID do Agente Vendas
    "60dd625e8be0682166a76f97"   // ID do Agente Database
  ]
}
```

**`canCommunicateWith: [ids]` = Pode consultar APENAS esses agentes**

### Criar Agente Database

```bash
POST http://localhost:3000/api/agents
Content-Type: application/json

{
  "name": "Agente Database",
  "description": "Especialista em busca e consulta de informações armazenadas",
  "status": "active",
  "canCommunicateWith": [],
  "databaseAccess": {
    "enabled": true,
    "allowedCollections": ["metadata", "documents"],
    "allowedOperations": ["read"],
    "queryLimits": {
      "maxResults": 100,
      "timeout": 30000
    }
  }
}
```

## 📊 Monitorando a Cooperação

### Ver logs em tempo real

```bash
# Windows PowerShell
Get-Content ia-backend\logs\ai-backend.log -Wait -Tail 50

# Linux/Mac
tail -f ia-backend/logs/ai-backend.log
```

### Filtrar logs de cooperação

```bash
# Windows PowerShell
Get-Content ia-backend\logs\ai-backend.log | Select-String "cooperation"

# Linux/Mac
tail -f ia-backend/logs/ai-backend.log | grep "cooperation"
```

### Logs importantes para procurar

```
[INFO] 🤝 Agent cooperation initiated
[INFO] AI selected specialist agent
[INFO] Agent cooperation completed successfully
[WARN] Detected potential infinite loop in agent cooperation
```

## 🎓 Exemplos de Perguntas

### Perguntas que DEVEM acionar cooperação:

1. **Vendas:**
   - "Qual foi o total de vendas hoje?"
   - "Me mostre o histórico de vendas"
   - "Quais produtos mais venderam?"

2. **Obras/Construção:**
   - "Quanto foi gasto em obras?"
   - "Qual o status da pavimentação?"
   - "Investimento total em construção"

3. **Busca de Documentos:**
   - "Busque documentos sobre trabalho remoto"
   - "Encontre informações sobre produtividade"
   - "Procure metadados sobre vendas"

### Perguntas que NÃO devem acionar cooperação:

1. **Saudações:**
   - "Olá, como você está?"
   - "Bom dia!"
   - "Tudo bem?"

2. **Informações sobre o próprio agente:**
   - "O que você pode fazer?"
   - "Quais são suas capacidades?"
   - "Me explique suas funções"

3. **Perguntas genéricas:**
   - "Qual a capital do Brasil?"
   - "Explique o que é IA"
   - "Como funciona a internet?"

## 🔍 Verificando o Comportamento

### 1. Cooperação Acionada

**Indicadores:**
- ✨ Mensagem de crédito no final da resposta
- Log: `🤝 Agent cooperation initiated`
- Resposta vem de agente diferente

**Exemplo:**
```
"O total de vendas foi R$ 1.500,00"

✨ (Informação fornecida através de cooperação: Agente Geral → Agente Vendas)
```

### 2. Resposta Direta (Sem Cooperação)

**Indicadores:**
- Sem mensagem de crédito
- Log: `Agent responding with own knowledge`
- Resposta vem do próprio agente

**Exemplo:**
```
"Olá! Como posso ajudá-lo hoje?"
```

### 3. Recurso Local Usado

**Indicadores:**
- Log: `Agent querying database locally` ou `Agent processing files locally`
- Agente usa suas próprias capacidades
- Sem cooperação necessária

**Exemplo:**
```
"🔍 Busca Semântica (semantic similarity search):
Encontrados 3 documentos sobre produtividade..."
```

## 🐛 Troubleshooting

### Problema: Cooperação não está funcionando

**Verificações:**

1. **Agentes estão ativos?**
   ```bash
   GET http://localhost:3000/api/agents
   ```
   Verifique se `status: "active"`

2. **Permissões corretas?**
   - Verifique `canCommunicateWith` do agente
   - `[]` = pode consultar todos
   - `[ids]` = pode consultar apenas esses IDs

3. **IA está decidindo não cooperar?**
   - Verifique os logs: `AI decided current agent should handle query`
   - Tente perguntas mais específicas sobre especialidades

4. **Servidor está rodando?**
   ```bash
   curl http://localhost:3000/api/health
   ```

### Problema: Loop infinito detectado

**Causa:** Agentes configurados em círculo (A → B → C → A)

**Solução:** 
- Revise configurações de `canCommunicateWith`
- Evite ciclos de comunicação
- Use estrutura hierárquica

### Problema: Resposta muito lenta

**Possíveis causas:**
1. Cache expirado - aguarde 5 minutos para cache ser reconstruído
2. Múltiplas cooperações em cascata
3. Consultas complexas ao banco de dados

**Solução:**
- Monitore logs para ver quantas cooperações estão acontecendo
- Otimize descrições dos agentes para decisões mais rápidas da IA

## 📈 Melhores Práticas

### ✅ DO:

1. **Use descrições claras e específicas**
   ```json
   {
     "description": "Especialista em informações de vendas, receitas e produtos"
   }
   ```

2. **Configure permissões apropriadas**
   ```json
   {
     "canCommunicateWith": ["id1", "id2"]  // Específico
   }
   ```

3. **Estruture hierarquicamente**
   ```
   Agente Geral
   ├── Agente Vendas
   ├── Agente Obras
   └── Agente Database
   ```

### ❌ DON'T:

1. **Evite descrições vagas**
   ```json
   {
     "description": "Agente"  // Muito vago
   }
   ```

2. **Evite ciclos**
   ```
   Agente A → Agente B → Agente A  // LOOP!
   ```

3. **Não dê permissões desnecessárias**
   ```json
   {
     "canCommunicateWith": []  // Se não precisa consultar outros
   }
   ```

## 📚 Documentação Adicional

- **AGENT_COOPERATION_SYSTEM.md** - Documentação técnica completa
- **logs/ai-backend.log** - Logs detalhados do sistema
- **API_DOCUMENTATION.md** - Documentação da API

## 🆘 Suporte

Se você encontrar problemas:

1. Verifique os logs em `logs/ai-backend.log`
2. Execute o teste automatizado: `node test-agent-cooperation.js`
3. Verifique configurações dos agentes
4. Revise a documentação técnica

---

**Desenvolvido com ❤️ usando IA e cooperação inteligente**

