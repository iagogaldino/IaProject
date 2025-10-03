# IaProject - Sistema de Backends Desacoplados

Sistema completo de backends com IA desacoplada, incluindo Main Backend e AI Backend especializado.

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
│  │  • Recebe Request do Frontend                              │ │
│  │  • Comunica com AI Backend via HTTP                        │ │
│  │  • Executa consultas no banco de dados                    │ │
│  │  • Retorna resposta formatada                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI BACKEND (3001)                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  AIController                              │ │
│  │  • Recebe Request do Main Backend                          │ │
│  │  • Sistema de agentes inteligentes                        │ │
│  │  • Processamento com OpenAI                                │ │
│  │  • Roteamento automático de agentes                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Início Rápido

### 1. Configuração Inicial
```bash
# Clonar o repositório
git clone <repository-url>
cd IaProject

# Configurar AI Backend
cd backend
npm run setup:ai

# Instalar dependências do Main Backend
npm install
```

### 2. Configurar Variáveis de Ambiente

#### Main Backend (.env)
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

#### AI Backend (.env)
```env
NODE_ENV=development
PORT=3001
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
API_KEY=your-api-key-for-external-access
MAIN_BACKEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

### 3. Iniciar o Sistema

#### Opção 1: Iniciar Ambos os Backends (Recomendado)
```bash
cd backend
npm run dev:with-ai
```

#### Opção 2: Iniciar Separadamente
```bash
# Terminal 1: AI Backend
cd ai-backend
npm run dev

# Terminal 2: Main Backend
cd backend
npm run dev:wait-ai
```

## 📋 Scripts Disponíveis

### Main Backend
```bash
# Desenvolvimento
npm run dev                    # Apenas Main Backend
npm run dev:with-ai           # Main Backend + AI Backend
npm run dev:wait-ai           # Aguardar AI Backend e iniciar

# Produção
npm start                     # Apenas Main Backend
npm run start:with-ai        # Main Backend + AI Backend
npm run start:wait-ai        # Aguardar AI Backend e iniciar

# Utilitários
npm run check:ai             # Verificar se AI Backend está disponível
npm run setup:ai             # Configurar AI Backend automaticamente
```

### AI Backend
```bash
# Desenvolvimento
npm run dev                  # AI Backend apenas

# Produção
npm start                    # AI Backend apenas

# Testes
npm test                     # Executar testes
npm run test:watch          # Testes em modo watch
```

## 🧪 Testes

### Teste de Integração
```bash
# Executar testes de integração
node ai-backend/test-integration.js
```

### Teste Manual
1. Inicie ambos os backends: `npm run dev:with-ai`
2. Abra http://localhost:3000
3. Teste uma requisição para `/ask`
4. Verifique se a resposta vem do AI Backend

## 📊 Monitoramento

### URLs de Verificação
- **Main Backend**: http://localhost:3000
- **AI Backend**: http://localhost:3001
- **AI Health**: http://localhost:3001/health
- **AI Docs**: http://localhost:3001/api/docs

### Logs
Os scripts mostram logs coloridos:
- 🔵 **Azul**: Main Backend
- 🔵 **Ciano**: AI Backend
- 🟢 **Verde**: Sucesso
- 🔴 **Vermelho**: Erro
- 🟡 **Amarelo**: Aviso

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
IaProject/
├── backend/                 # Main Backend
│   ├── src/
│   │   ├── agents/         # Agentes (legado)
│   │   ├── controllers/    # Controllers
│   │   ├── services/       # Serviços
│   │   ├── routes/         # Rotas
│   │   └── config/         # Configuração
│   ├── start-with-ai.js    # Script para iniciar ambos
│   ├── check-ai-backend.js # Script de verificação
│   └── setup-ai-backend.js # Script de configuração
├── ai-backend/             # AI Backend
│   ├── src/
│   │   ├── agents/         # Sistema de agentes
│   │   ├── controllers/    # Controllers da API
│   │   ├── services/       # Serviços
│   │   ├── middleware/     # Middlewares
│   │   └── routes/         # Rotas da API
│   └── test-integration.js # Testes de integração
└── frontend/               # Frontend (Ionic)
```

### Fluxo de Desenvolvimento
1. **Configurar**: `npm run setup:ai`
2. **Desenvolver**: `npm run dev:with-ai`
3. **Testar**: `node ai-backend/test-integration.js`
4. **Deploy**: `npm run build && npm run start:with-ai`

## 🛠️ Solução de Problemas

### AI Backend não inicia
```bash
# Verificar dependências
cd ai-backend
npm install

# Verificar configuração
npm run setup:ai

# Verificar portas
netstat -an | findstr :3001
```

### Main Backend não consegue conectar
```bash
# Verificar AI Backend
npm run check:ai

# Verificar variáveis de ambiente
echo $AI_BACKEND_URL
echo $AI_API_KEY
```

### Erro de API Key
```bash
# Verificar configuração
npm run setup:ai

# Verificar arquivos .env
cat backend/.env
cat ai-backend/.env
```

## 📝 Documentação

- **Backend Principal**: [SCRIPTS.md](backend/SCRIPTS.md)
- **AI Backend**: [ai-backend/README.md](ai-backend/README.md)
- **Arquitetura**: [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md)

## 🔒 Segurança

### Autenticação
- **API Keys**: Autenticação entre backends
- **Rate Limiting**: Controle de taxa de requisições
- **CORS**: Configuração de origens permitidas

### Variáveis de Ambiente
- **OpenAI API Key**: Para processamento de IA
- **API Key**: Para comunicação entre backends
- **Database**: Configuração do PostgreSQL

## 🚀 Deploy

### Desenvolvimento
```bash
# Iniciar desenvolvimento completo
npm run dev:with-ai
```

### Produção
```bash
# Build dos projetos
cd ai-backend && npm run build
cd ../backend && npm run build

# Iniciar em produção
cd backend
npm run start:with-ai
```

### Docker
```bash
# Build das imagens
docker build -t main-backend ./backend
docker build -t ai-backend ./ai-backend

# Executar containers
docker run -p 3000:3000 main-backend
docker run -p 3001:3001 ai-backend
```

## 📞 Suporte

Para problemas:
1. Verifique os logs dos backends
2. Execute `npm run check:ai` para verificar o AI Backend
3. Execute `npm run setup:ai` para reconfigurar
4. Verifique as variáveis de ambiente
5. Consulte a documentação específica de cada backend

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.
