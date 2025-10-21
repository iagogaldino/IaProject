# 🐛 Guia Completo de Debug - IA Service

Este guia fornece todas as ferramentas e métodos necessários para debugar o projeto IA Service, incluindo backend (Node.js/TypeScript) e frontend (Angular).

## 📋 Índice

- [Configuração do Ambiente](#configuração-do-ambiente)
- [Debug do Backend](#debug-do-backend)
- [Debug do Frontend](#debug-do-frontend)
- [Ferramentas de Debug](#ferramentas-de-debug)
- [Scripts de Teste](#scripts-de-teste)
- [Monitoramento e Logs](#monitoramento-e-logs)
- [Solução de Problemas](#solução-de-problemas)

## 🔧 Configuração do Ambiente

### 1. Pré-requisitos

```bash
# Node.js (versão 18+)
node --version

# npm ou yarn
npm --version

# MongoDB (para o backend)
mongod --version

# Angular CLI (para o frontend)
ng version
```

### 2. Configuração do VS Code

O projeto já inclui configurações completas de debug no VS Code:

- **`.vscode/launch.json`**: Configurações de debug
- **`.vscode/tasks.json`**: Tasks automatizadas
- **`.vscode/settings.json`**: Configurações do workspace

### 3. Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp ia-backend/env.example ia-backend/.env

# Configurar variáveis necessárias
# - OPENAI_API_KEY: Sua chave da OpenAI
# - API_KEY: Chave de autenticação do sistema
# - MONGODB_URI: URL de conexão do MongoDB
```

## 🖥️ Debug do Backend

### 1. Debug com VS Code

#### Opção A: Debug com Nodemon (Padrão)
```bash
# 1. Abrir VS Code
code .

# 2. Ir para a aba "Run and Debug" (Ctrl+Shift+D)
# 3. Selecionar "Debug Backend (Node.js)" (agora usa nodemon automaticamente)
# 4. Pressionar F5 ou clicar em "Start Debugging"
# 5. O servidor reiniciará automaticamente quando você fizer mudanças
```

#### Opção B: Debug com Nodemon Avançado
```bash
# 1. Selecionar "Debug Backend with Nodemon (Advanced)"
# 2. Pressionar F5
# 3. Inclui debug mode completo com porta específica (9229)
# 4. Logs de debug habilitados (DEBUG=*)
```

#### Opção C: Debug do Código Compilado
```bash
# 1. Buildar o projeto primeiro
npm run build

# 2. Selecionar "Debug Backend (Compiled)"
# 3. Pressionar F5
```

### 2. Debug via Terminal

#### Modo Desenvolvimento com Debug
```bash
cd ia-backend

# Iniciar com debug habilitado
node --inspect --legacy-watch --exec ts-node src/index.ts

# Ou usar o script automatizado
node start-server.js
```

#### Debug com Breakpoints
```bash
# Iniciar com debug em porta específica
node --inspect=9229 --legacy-watch --exec ts-node src/index.ts

# Conectar Chrome DevTools em: chrome://inspect
```

### 3. Breakpoints e Logging

#### Breakpoints no Código
```typescript
// Adicionar breakpoints no VS Code clicando na margem esquerda
// ou usando a palavra-chave 'debugger'
debugger; // Pausa a execução aqui

// Exemplo no chatService.ts
export class ChatService {
  async processMessage(message: string) {
    debugger; // Breakpoint aqui
    console.log('Processing message:', message);
    // ... resto do código
  }
}
```

#### Logging Detalhado
```typescript
import { logger } from './services/logger';

// Logs estruturados
logger.info('User message received', {
  userId: '123',
  message: message,
  timestamp: new Date()
});

logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack
});
```

## 🌐 Debug do Frontend

### 1. Debug com VS Code + Chrome

```bash
# 1. Iniciar o servidor Angular
cd ia-frontend
npm start

# 2. No VS Code, selecionar "Debug Frontend (Chrome)"
# 3. Pressionar F5
# 4. Chrome abrirá automaticamente com debug habilitado
```

### 2. Debug Manual

```bash
# 1. Iniciar Angular com source maps
ng serve --source-map

# 2. Abrir Chrome DevTools (F12)
# 3. Ir para Sources > webpack://
# 4. Adicionar breakpoints nos arquivos TypeScript
```

### 3. Debug de Componentes Angular

```typescript
// Adicionar logging no componente
export class ChatComponent implements OnInit {
  ngOnInit() {
    console.log('ChatComponent initialized');
    debugger; // Breakpoint aqui
  }

  sendMessage() {
    console.log('Sending message:', this.message);
    // ... lógica do componente
  }
}
```

## 🛠️ Ferramentas de Debug

### 1. Scripts de Teste Disponíveis

```bash
cd ia-backend

# Testar endpoints da API
npm run test:endpoints

# Testar conexão MongoDB
npm run test:mongodb

# Verificar variáveis de ambiente
npm run check:env

# Testar compilação
npm run test:compile
```

### 2. Scripts Manuais de Debug

```bash
# Testar conexão OpenAI
node test-openai-connection.js

# Debug de embeddings
node debug-embeddings.js

# Testar upload de arquivos
node test-file-upload.js

# Debug de busca por similaridade
node debug-embedding-search.js
```

### 3. Tasks do VS Code

Use `Ctrl+Shift+P` e digite "Tasks: Run Task":

- **build-backend**: Compila o backend
- **serve-frontend**: Inicia o servidor Angular
- **start-backend-dev**: Inicia backend em modo dev (npm run dev)
- **start-backend-nodemon-debug**: Inicia backend com nodemon e debug habilitado
- **test-endpoints**: Testa todos os endpoints
- **test-mongodb**: Testa conexão MongoDB
- **check-env**: Verifica variáveis de ambiente
- **lint-backend**: Executa linting
- **lint-fix-backend**: Executa linting e corrige automaticamente
- **start-both**: Inicia frontend e backend simultaneamente

## 📊 Scripts de Teste

### 1. Teste de Endpoints

```bash
# Executar teste completo
node scripts/test-endpoints.js

# Teste específico de agentes
node test-agents.js

# Teste de integração
node test-integration.js
```

### 2. Teste de Banco de Dados

```bash
# Testar conexão MongoDB
node scripts/test-mongodb-connection.js

# Testar operações CRUD
node test-database-save.js

# Verificar metadados
node check-metadata.js
```

### 3. Teste de IA

```bash
# Testar conexão OpenAI
node test-openai-connection.js

# Testar processamento de chat
node test-agent-direct.js

# Testar análise de conteúdo
node test-content-analysis.js
```

## 📈 Monitoramento e Logs

### 1. Logs do Sistema

```bash
# Ver logs em tempo real
tail -f ia-backend/logs/combined.log

# Ver apenas erros
tail -f ia-backend/logs/error.log

# Logs específicos do backend
tail -f ia-backend/logs/ai-backend.log
```

### 2. Health Checks

```bash
# Verificar saúde do sistema
curl http://localhost:3001/health

# Verificar métricas
curl http://localhost:3001/health/metrics

# Verificar configuração
curl http://localhost:3001/health/config
```

### 3. Monitoramento de Performance

```bash
# Usar o script de monitoramento
node scripts/monitor-performance.js

# Verificar uso de memória
node -e "console.log(process.memoryUsage())"

# Profile de CPU
node --prof src/index.ts
```

## 🔍 Solução de Problemas

### 1. Problemas Comuns

#### Erro de Conexão MongoDB
```bash
# Verificar se MongoDB está rodando
mongosh --eval "db.runCommand('ping')"

# Verificar configurações
node scripts/test-mongodb-connection.js
```

#### Erro de API Key OpenAI
```bash
# Verificar se a chave está configurada
node scripts/check-env.js

# Testar conexão
node test-openai-connection.js
```

#### Erro de Compilação TypeScript
```bash
# Limpar e recompilar
rm -rf dist
npm run build

# Verificar erros de lint
npm run lint
```

### 2. Debug de Performance

```bash
# Profile de CPU
node --prof src/index.ts
node --prof-process isolate-*.log > profile.txt

# Monitor de memória
node --inspect --legacy-watch --exec ts-node src/index.ts
# Abrir chrome://inspect e usar Memory tab
```

### 3. Debug de Rede

```bash
# Testar conectividade
curl -v http://localhost:3001/health

# Monitorar requisições
node --inspect --legacy-watch --exec ts-node src/index.ts
# Usar Network tab no Chrome DevTools
```

## 🚀 Debug Avançado

### 1. Debug de Agentes IA

```bash
# Debug específico de agentes
node debug-agent-permissions.js

# Testar roteamento de agentes
node test-agent-embedding-integration.js
```

### 2. Debug de Embeddings

```bash
# Debug de geração de embeddings
node debug-embedding-generation.js

# Debug de busca por similaridade
node debug-embedding-search.js

# Debug de threshold
node debug-threshold.js
```

### 3. Debug de Arquivos

```bash
# Debug de upload de arquivos
node debug-files.js

# Debug de processamento de conteúdo
node test-file-process.js
```

## 📝 Dicas de Debug

### 1. Estratégias Eficazes

- **Use breakpoints estratégicos**: Coloque breakpoints em pontos de entrada e saída de funções
- **Log estruturado**: Use objetos para logs complexos
- **Debug incremental**: Teste pequenas partes do código
- **Use o console do browser**: Para debug de frontend

### 2. Ferramentas Úteis

- **VS Code Debug Console**: Para executar código durante debug
- **Chrome DevTools**: Para debug de frontend e performance
- **MongoDB Compass**: Para visualizar dados do banco
- **Postman**: Para testar APIs manualmente

### 3. Boas Práticas

- **Sempre use source maps**: Para debug de TypeScript
- **Configure hot reload**: Para desenvolvimento mais rápido
- **Use logging apropriado**: Diferentes níveis para diferentes situações
- **Teste em ambiente isolado**: Antes de debugar em produção

---

## 🆘 Suporte

Se você encontrar problemas durante o debug:

1. **Verifique os logs**: `ia-backend/logs/`
2. **Execute os scripts de teste**: `npm run test:*`
3. **Verifique a documentação**: `README.md` e `API_DOCUMENTATION.md`
4. **Use o health check**: `http://localhost:3001/health`

**🎯 Com este guia, você tem todas as ferramentas necessárias para debugar eficientemente o projeto IA Service!**
