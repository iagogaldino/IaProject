# 🚀 Quick Start - Sistema de Agentes Dinâmicos

## Instalação Rápida

### 1. **Instalar Dependências**
```bash
# Instalar dependências do npm
npm install

# Ou usar o script automatizado
node scripts/install-dependencies.js
```

### 2. **Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar configurações
nano .env
```

**Configurações mínimas necessárias:**
```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_backend
DB_USER=postgres
DB_PASSWORD=password

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# API Key
API_KEY=your-secure-api-key
```

### 3. **Configurar Banco de Dados**
```bash
# Criar banco de dados
createdb ai_backend

# Executar migração
node scripts/migrate-agents.js
```

### 4. **Iniciar Servidor**
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm start
```

## 🎯 Teste Rápido

### 1. **Verificar Saúde do Sistema**
```bash
curl http://localhost:3000/health
```

### 2. **Acessar Interface de Administração**
```
http://localhost:3000/admin
```

### 3. **Criar Primeiro Agente**
```bash
curl -X POST http://localhost:3000/api/agents \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "teste_agente",
    "displayName": "Agente de Teste",
    "type": "general",
    "systemPrompt": "Você é um assistente de teste.",
    "activationKeywords": ["teste", "hello"]
  }'
```

### 4. **Listar Agentes**
```bash
curl -X GET http://localhost:3000/api/agents \
  -H "X-API-Key: your-api-key"
```

## 📊 Endpoints Principais

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/admin` | GET | Interface de administração |
| `/api/agents` | GET | Listar agentes |
| `/api/agents` | POST | Criar agente |
| `/api/agents/:id` | GET | Obter agente |
| `/api/agents/:id` | PUT | Atualizar agente |
| `/api/agents/:id` | DELETE | Remover agente |
| `/api/agents/:id/test` | POST | Testar agente |
| `/api/agents/stats` | GET | Estatísticas |
| `/api/docs` | GET | Documentação da API |

## 🔧 Configuração Avançada

### **Tipos de Agentes**

1. **General** - Comunicação geral
2. **Database** - Consultas ao banco
3. **Specialized** - Domínios específicos
4. **Custom** - Totalmente personalizável

### **Sistema de Prioridades**
- **Alta (8-10)**: Agentes especializados
- **Média (4-7)**: Agentes de domínio
- **Baixa (1-3)**: Agentes gerais
- **Negativa (-1)**: Agentes de fallback

### **Palavras-chave de Ativação**
```json
{
  "activationKeywords": ["saúde", "médico", "hospital"],
  "activationIntents": ["saude", "medico"]
}
```

## 🐛 Solução de Problemas

### **Erro de Conexão com Banco**
```bash
# Verificar se PostgreSQL está rodando
pg_isready

# Verificar configurações
echo $DB_HOST $DB_PORT $DB_NAME
```

### **Erro de API Key**
```bash
# Verificar se a chave está configurada
echo $OPENAI_API_KEY

# Testar conexão com OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### **Erro de Dependências**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentação Completa

- [Guia de Agentes Dinâmicos](AGENT_MANAGEMENT.md)
- [Exemplos de Uso](examples/agent-examples.md)
- [Documentação da API](http://localhost:3000/api/docs)

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `logs/combined.log`
2. Consulte a documentação: `/api/docs`
3. Teste a conectividade: `/health`

---

**🎉 Pronto! Seu sistema de agentes dinâmicos está funcionando!**
