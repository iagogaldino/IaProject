# AI Backend

Backend dedicado para processamento de IA e agentes inteligentes.

## 🚀 Funcionalidades

- **Sistema de Agentes Inteligentes**: Roteamento automático para agentes especializados
- **API REST**: Interface completa para comunicação com IA
- **Autenticação**: Sistema de API keys para segurança
- **Monitoramento**: Métricas e logs detalhados
- **Rate Limiting**: Controle de taxa de requisições
- **Health Checks**: Monitoramento de saúde do sistema

## 📁 Estrutura do Projeto

```
ai-backend/
├── src/
│   ├── agents/              # Agentes inteligentes
│   │   ├── userCommunicationAgent.ts
│   │   ├── databaseQueryAgent.ts
│   │   └── agentRouter.ts
│   ├── controllers/         # Controllers da API
│   │   ├── aiController.ts
│   │   └── healthController.ts
│   ├── services/           # Serviços
│   │   ├── openaiService.ts
│   │   └── logger.ts
│   ├── middleware/         # Middlewares
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── logging.ts
│   ├── routes/            # Rotas da API
│   │   ├── aiRoutes.ts
│   │   └── healthRoutes.ts
│   ├── config/            # Configuração
│   │   └── config.ts
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts
│   └── index.ts           # Arquivo principal
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Instalação

1. **Instalar dependências**:
```bash
npm install
```

2. **Configurar variáveis de ambiente**:
```bash
cp env.example .env
# Editar .env com suas configurações
```

3. **Compilar TypeScript**:
```bash
npm run build
```

4. **Executar em desenvolvimento**:
```bash
npm run dev
```

5. **Executar em produção**:
```bash
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Servidor
NODE_ENV=development
PORT=3001
API_VERSION=v1

# OpenAI
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Segurança
JWT_SECRET=your-jwt-secret-key-here
API_KEY=your-api-key-for-external-access

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/ai-backend.log

# Serviços Externos
MAIN_BACKEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Monitoramento
ENABLE_METRICS=true
METRICS_PORT=9090
```

## 🔌 API Endpoints

### Processamento de IA

#### `POST /api/ai/process`
Processa solicitação do usuário usando sistema de agentes.

**Headers**:
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Body**:
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

**Response**:
```json
{
  "success": true,
  "data": "<h2>Resumo dos Dados</h2><p>Total de registros: 150</p>",
  "metadata": {
    "agentUsed": "DatabaseQueryAgent",
    "requiresDatabase": true,
    "processingTime": 1250,
    "confidence": 0.9,
    "databaseData": [...],
    "sqlQuery": "SELECT COUNT(*) FROM relatorio_texto"
  }
}
```

#### `POST /api/ai/analyze-intent`
Analisa a intenção do usuário.

#### `POST /api/ai/database-query`
Processa consulta específica ao banco de dados.

#### `POST /api/ai/general-query`
Processa solicitação geral (sem banco de dados).

### Health Check

#### `GET /health`
Verifica a saúde do sistema.

**Response**:
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

#### `GET /health/metrics`
Obter métricas do sistema.

#### `GET /health/config`
Obter status da configuração.

## 🤖 Sistema de Agentes

### UserCommunicationAgent
- **Função**: Agente principal de comunicação
- **Responsabilidades**:
  - Analisa intenção do usuário
  - Decide qual agente usar
  - Gera respostas diretas

### DatabaseQueryAgent
- **Função**: Agente especializado em consultas ao banco
- **Responsabilidades**:
  - Gera queries SQL
  - Executa consultas
  - Formata respostas com dados

### AgentRouter
- **Função**: Roteador inteligente
- **Responsabilidades**:
  - Coordena agentes
  - Gerencia métricas
  - Trata erros

## 🔒 Segurança

### Autenticação
- **API Key**: Autenticação via header `X-API-Key`
- **Bearer Token**: Autenticação via header `Authorization: Bearer <token>`

### Rate Limiting
- **Window**: 15 minutos (900000ms)
- **Max Requests**: 100 por janela
- **Headers**: Inclui informações de rate limit

### CORS
- **Origins**: Configuráveis via `ALLOWED_ORIGINS`
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-API-Key

## 📊 Monitoramento

### Logs
- **Níveis**: info, warn, error, debug
- **Formato**: JSON estruturado
- **Arquivos**: error.log, combined.log
- **Console**: Colorido em desenvolvimento

### Métricas
- **Total de Requisições**: Contador geral
- **Taxa de Sucesso**: Requisições bem-sucedidas
- **Tempo Médio**: Tempo de processamento
- **Uso de Agentes**: Distribuição por agente
- **Taxa de Erro**: Percentual de falhas

### Health Checks
- **OpenAI**: Verifica API key
- **Database**: Verifica conexão
- **Config**: Valida configurações
- **Services**: Status dos serviços

## 🚀 Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### PM2
```json
{
  "apps": [{
    "name": "ai-backend",
    "script": "dist/index.js",
    "instances": 2,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📝 Scripts

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Lint
npm run lint
npm run lint:fix
```

## 🔧 Desenvolvimento

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas
```

### Branches
- `main`: Produção
- `develop`: Desenvolvimento
- `feature/*`: Novas funcionalidades
- `hotfix/*`: Correções urgentes

## 📞 Suporte

Para suporte e dúvidas:
- **Issues**: GitHub Issues
- **Documentação**: `/api/docs`
- **Health Check**: `/health`
- **Métricas**: `/health/metrics`

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.
