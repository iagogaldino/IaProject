# Arquitetura dos Backends

## Visão Geral

O sistema foi desacoplado em dois backends especializados:

1. **Main Backend** (Porta 3000): Backend principal com banco de dados
2. **AI Backend** (Porta 3001): Backend dedicado para IA e agentes

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Voice Chat    │  │  Message Detail │  │ Saved Messages  │ │
│  │     Page        │  │     Page        │  │     Page        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MAIN BACKEND (3000)                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                OpenAIController                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  • Recebe Request do Frontend                          │ │ │
│  │  │  • Verifica Health do AI Backend                       │ │ │
│  │  │  • Chama AI Backend via HTTP                           │ │ │
│  │  │  • Retorna Response para Frontend                      │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  AIApiService                              │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  • Comunicação HTTP com AI Backend                     │ │ │
│  │  │  • Fallback em caso de erro                            │ │ │
│  │  │  • Logs de comunicação                                 │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI BACKEND (3001)                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  AIController                              │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  • Recebe Request do Main Backend                      │ │ │
│  │  │  • Valida Autenticação (API Key)                      │ │ │
│  │  │  • Valida Dados de Entrada                             │ │ │
│  │  │  │  • Chama AgentRouter                                │ │ │
│  │  │  │  • Retorna Response                                 │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  AgentRouter                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  • Analisa Intenção do Usuário                         │ │ │
│  │  │  • Roteia para Agente Apropriado                       │ │ │
│  │  │  • Gerencia Métricas                                   │ │ │
│  │  │  • Trata Erros                                         │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                ┌────────────────┼────────────────┐                │
│                ▼                ▼                ▼                │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ │
│  │UserCommunicationAgent│ │DatabaseQueryAgent   │ │    Error Handler     │ │
│  │                     │ │                     │ │                     │ │
│  │ • Analisa Intenção  │ │ • Gera SQL Query    │ │ • Trata Erros       │ │
│  │ • Resposta Direta   │ │ • Chama Main Backend│ │ • Fallback          │ │
│  │ • Coordena Agentes  │ │ • Formata Dados     │ │ • Logs de Erro      │ │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVIÇOS EXTERNOS                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   OpenAI API        │  │   PostgreSQL DB     │  │   Config Service    │ │
│  │                     │  │                     │  │                     │ │
│  │ • GPT-3.5-turbo     │  │ • relatorio_texto   │  │ • API Keys          │ │
│  │ • Chat Completions  │  │ • Ações Municipais  │  │ • DB Config         │ │
│  │ • Text Generation   │  │ • Dados Municipais  │  │ • Server Config     │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Comunicação

### 1. **Requisição do Frontend**
```
Frontend → Main Backend (POST /ask)
```

### 2. **Verificação de Health**
```
Main Backend → AI Backend (GET /health)
```

### 3. **Processamento de IA**
```
Main Backend → AI Backend (POST /api/ai/process)
```

### 4. **Análise de Intenção**
```
AI Backend → OpenAI API (Análise de intenção)
```

### 5. **Roteamento de Agentes**
```
Se requer banco → DatabaseQueryAgent
Se resposta direta → UserCommunicationAgent
```

### 6. **Consulta ao Banco (se necessário)**
```
DatabaseQueryAgent → Main Backend (POST /api/database/query)
Main Backend → PostgreSQL Database
```

### 7. **Formatação da Resposta**
```
AI Backend → OpenAI API (Formatação com dados)
```

### 8. **Retorno da Resposta**
```
AI Backend → Main Backend → Frontend
```

## 🛠️ Componentes

### Main Backend (Porta 3000)

#### **OpenAIController**
- Recebe requisições do frontend
- Verifica health do AI Backend
- Chama AI Backend via HTTP
- Retorna resposta formatada

#### **AIApiService**
- Comunicação HTTP com AI Backend
- Fallback em caso de erro
- Logs de comunicação
- Tratamento de timeouts

#### **DatabaseRouter**
- Endpoint para consultas SQL
- Execução de queries
- Retorno de dados
- Logs de consultas

### AI Backend (Porta 3001)

#### **AIController**
- Recebe requisições do Main Backend
- Validação de autenticação
- Validação de dados
- Roteamento para agentes

#### **AgentRouter**
- Coordenação de agentes
- Análise de intenção
- Roteamento inteligente
- Gerenciamento de métricas

#### **UserCommunicationAgent**
- Análise de intenção do usuário
- Geração de respostas diretas
- Coordenação de outros agentes

#### **DatabaseQueryAgent**
- Geração de queries SQL
- Comunicação com Main Backend
- Formatação de respostas
- Tratamento de erros

## 🔒 Segurança

### Autenticação
- **API Key**: Autenticação entre backends
- **Headers**: X-API-Key para comunicação
- **Validação**: Verificação de chaves

### Rate Limiting
- **AI Backend**: 100 requests/15min
- **Main Backend**: Sem rate limiting
- **Headers**: Informações de rate limit

### CORS
- **Origins**: Configuráveis
- **Methods**: GET, POST, PUT, DELETE
- **Headers**: Content-Type, Authorization, X-API-Key

## 📊 Monitoramento

### Logs
- **Estruturados**: JSON format
- **Níveis**: info, warn, error, debug
- **Arquivos**: error.log, combined.log
- **Console**: Colorido em desenvolvimento

### Métricas
- **Total de Requisições**: Contador geral
- **Taxa de Sucesso**: Requisições bem-sucedidas
- **Tempo Médio**: Tempo de processamento
- **Uso de Agentes**: Distribuição por agente
- **Taxa de Erro**: Percentual de falhas

### Health Checks
- **AI Backend**: `/health`
- **Main Backend**: `/`
- **Database**: Verificação de conexão
- **OpenAI**: Verificação de API key

## 🚀 Deploy

### Desenvolvimento
```bash
# Iniciar ambos os backends
node start-backends.js

# Ou iniciar separadamente
cd backend && npm run dev
cd ai-backend && npm run dev
```

### Produção
```bash
# Main Backend
cd backend
npm run build
npm start

# AI Backend
cd ai-backend
npm run build
npm start
```

### Docker
```dockerfile
# Main Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]

# AI Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 🧪 Testes

### Teste de Integração
```bash
# Executar testes de integração
node ai-backend/test-integration.js
```

### Testes Individuais
```bash
# Main Backend
cd backend
npm test

# AI Backend
cd ai-backend
npm test
```

## 📝 Configuração

### Main Backend (.env)
```env
NODE_ENV=development
SERVER_PORT=3000
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
PGUSER=dev
PGHOST=db
PGDATABASE=app_db
PGPASSWORD=devpass
PGPORT=5432
AI_BACKEND_URL=http://localhost:3001
AI_API_KEY=your-api-key-for-external-access
```

### AI Backend (.env)
```env
NODE_ENV=development
PORT=3001
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
JWT_SECRET=your-jwt-secret-key-here
API_KEY=your-api-key-for-external-access
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
MAIN_BACKEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/database
ENABLE_METRICS=true
METRICS_PORT=9090
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
- **Documentação**: README.md de cada backend
- **Health Checks**: `/health` endpoints
- **Métricas**: `/health/metrics` endpoints

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.
