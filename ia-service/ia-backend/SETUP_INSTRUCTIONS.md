# 🚀 Instruções de Configuração - Backend de Agentes Inteligentes

## ✅ Status do Projeto

O backend foi **completamente implementado** com todas as funcionalidades solicitadas:

- ✅ **Gestão de Agentes** (CRUD completo)
- ✅ **Comunicação entre Agentes** 
- ✅ **Chat com IA** (stateless)
- ✅ **Integração com OpenAI**
- ✅ **Endpoint público** `/api/ai/process`
- ✅ **Health checks e monitoramento**
- ✅ **Autenticação via API Key**
- ✅ **Validação de dados**
- ✅ **Rate limiting**
- ✅ **Logs estruturados**

## 🛠️ Configuração Rápida

### 1. Instalar Dependências
```bash
cd ia-backend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar o arquivo .env com suas configurações
```

**Configurações obrigatórias:**
```env
# OpenAI (OBRIGATÓRIO para funcionalidade de IA)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# API Key para autenticação
API_KEY=your-secure-api-key-here

# Banco de dados MongoDB
DB_HOST=localhost
DB_PORT=27017
DB_NAME=ai_backend
DATABASE_URL=mongodb://localhost:27017/ai_backend
```

### 3. Configurar Banco de Dados MongoDB
```bash
# Iniciar MongoDB (escolha uma opção):

# Opção 1: Docker (recomendado)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Opção 2: Instalação local
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod
# macOS: brew services start mongodb/brew/mongodb-community

# As coleções serão criadas automaticamente na primeira execução
```

### 4. Executar o Servidor
```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção
npm run build
npm start
```

## 📡 Endpoints Implementados

### Gestão de Agentes
- `POST /api/agents` - Criar agente
- `GET /api/agents` - Listar agentes
- `GET /api/agents/:id` - Buscar agente
- `PUT /api/agents/:id` - Atualizar agente
- `PATCH /api/agents/:id/status` - Ativar/desativar
- `DELETE /api/agents/:id` - Remover agente

### Comunicação entre Agentes
- `POST /api/agents/:id/communicate` - Enviar mensagem
- `GET /api/agents/:id/messages` - Listar mensagens
- `GET /api/agents/communication/stats` - Estatísticas

### Chat com IA
- `POST /api/agents/:id/chat` - Chat com agente específico
- `POST /api/ai/process` - **Endpoint público** para processamento de IA

### Monitoramento
- `GET /health` - Status do sistema
- `GET /health/metrics` - Métricas
- `GET /health/config` - Configuração

## 🧪 Testando o Sistema

### 1. Teste Automatizado
```bash
# Executar script de teste
node scripts/test-endpoints.js
```

### 2. Teste Manual
```bash
# Health check
curl http://localhost:3001/health

# Criar agente
curl -X POST http://localhost:3001/api/agents \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"teste","description":"Agente de teste","status":"active"}'

# Testar chat
curl -X POST http://localhost:3001/api/agents/1/chat \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Olá!"}]}'
```

## 🔧 Funcionalidades Implementadas

### Sistema de Agentes
- ✅ Criação, edição, listagem e remoção de agentes
- ✅ Status ativo/inativo
- ✅ Lista de agentes com quem pode se comunicar
- ✅ Validação de dados com Joi

### Comunicação entre Agentes
- ✅ Envio de mensagens entre agentes
- ✅ Listagem de mensagens por agente
- ✅ Verificação de permissões de comunicação
- ✅ Estatísticas de comunicação

### Integração com IA
- ✅ Chat stateless com agentes específicos
- ✅ Endpoint público `/api/ai/process`
- ✅ Integração completa com OpenAI
- ✅ Contexto personalizado por agente

### Segurança e Monitoramento
- ✅ Autenticação via API Key
- ✅ Rate limiting (100 req/15min)
- ✅ CORS configurável
- ✅ Logs estruturados com Winston
- ✅ Health checks completos

## 📊 Estrutura do Banco de Dados MongoDB

### Coleção `agents`
```javascript
{
  _id: ObjectId("..."),
  name: "assistente_vendas",
  description: "Agente especializado em vendas",
  status: "active",
  canCommunicateWith: ["agent_id_1", "agent_id_2"],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Coleção `messages`
```javascript
{
  _id: ObjectId("..."),
  fromAgentId: "agent_id_1",
  toAgentId: "agent_id_2",
  content: "Mensagem entre agentes",
  createdAt: ISODate("...")
}
```

### Índices Otimizados
- **Agents**: `{ name: 1 }`, `{ status: 1 }`, `{ createdAt: -1 }`
- **Messages**: `{ fromAgentId: 1 }`, `{ toAgentId: 1 }`, `{ createdAt: -1 }`

## 🔗 Integração com Frontend

O backend está **totalmente compatível** com o frontend Angular existente:

- ✅ Endpoints correspondem aos serviços do frontend
- ✅ Estrutura de dados compatível
- ✅ Autenticação via API Key
- ✅ CORS configurado para `localhost:4200`

## 📝 Próximos Passos

1. **Configurar OpenAI API Key** no arquivo `.env`
2. **Executar o servidor**: `npm run dev`
3. **Testar endpoints** com o script fornecido
4. **Integrar com frontend** Angular
5. **Configurar produção** (MongoDB, variáveis de ambiente)

## 🆘 Solução de Problemas

### Erro de Conexão com MongoDB
```bash
# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Verificar configurações
echo $DB_HOST $DB_PORT $DB_NAME

# Testar conexão
npm run test:mongodb
```

### Erro de OpenAI
```bash
# Verificar API key
echo $OPENAI_API_KEY

# Testar conexão
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### Erro de Compilação
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Documentação Completa

- **API Documentation**: `API_DOCUMENTATION.md`
- **Quick Start**: `QUICK_START.md`
- **README**: `README.md`

---

**🎉 O backend está pronto para uso!** Todas as funcionalidades solicitadas foram implementadas com sucesso.
