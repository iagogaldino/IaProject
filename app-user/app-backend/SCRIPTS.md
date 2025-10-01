# Scripts do Backend Principal

Este documento explica como usar os scripts disponíveis no backend principal para gerenciar a integração com o AI Backend.

## 📋 Scripts Disponíveis

### Scripts Básicos
```bash
# Desenvolvimento (apenas Main Backend)
npm run dev

# Produção (apenas Main Backend)
npm start

# Build do projeto
npm run build
```

### Scripts com AI Backend
```bash
# Iniciar Main Backend + AI Backend juntos
npm run dev:with-ai

# Iniciar Main Backend + AI Backend em produção
npm run start:with-ai
```

### Scripts de Verificação
```bash
# Verificar se AI Backend está disponível
npm run check:ai

# Aguardar AI Backend e iniciar Main Backend em desenvolvimento
npm run dev:wait-ai

# Aguardar AI Backend e iniciar Main Backend em produção
npm run start:wait-ai
```

## 🚀 Como Usar

### 1. Desenvolvimento Completo (Recomendado)
```bash
# Inicia ambos os backends automaticamente
npm run dev:with-ai
```

**O que acontece:**
1. Inicia o AI Backend na porta 3001
2. Aguarda 3 segundos para estabilizar
3. Inicia o Main Backend na porta 3000
4. Mostra status de ambos os backends
5. Permite parar ambos com Ctrl+C

### 2. Desenvolvimento com Verificação
```bash
# Verifica se AI Backend está rodando antes de iniciar
npm run dev:wait-ai
```

**O que acontece:**
1. Verifica se AI Backend está disponível
2. Se não estiver, falha com erro
3. Se estiver, inicia apenas o Main Backend

### 3. Verificação Manual
```bash
# Apenas verifica se AI Backend está disponível
npm run check:ai
```

## 🔧 Configuração

### Variáveis de Ambiente
Certifique-se de que o arquivo `.env` contém:

```env
# Main Backend
NODE_ENV=development
SERVER_PORT=3000

# AI Backend
AI_BACKEND_URL=http://localhost:3001
AI_API_KEY=your-api-key-for-external-access

# Database
PGUSER=dev
PGHOST=db
PGDATABASE=app_db
PGPASSWORD=devpass
PGPORT=5432
```

### AI Backend
O AI Backend deve estar configurado com:

```env
# AI Backend
NODE_ENV=development
PORT=3001
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
API_KEY=your-api-key-for-external-access
MAIN_BACKEND_URL=http://localhost:3000
```

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

## 🧪 Testes

### Teste de Integração
```bash
# Executar testes de integração
node ../ai-backend/test-integration.js
```

### Teste Manual
1. Inicie ambos os backends: `npm run dev:with-ai`
2. Abra http://localhost:3000
3. Teste uma requisição para `/ask`
4. Verifique se a resposta vem do AI Backend

## 🛠️ Solução de Problemas

### AI Backend não inicia
```bash
# Verificar se as dependências estão instaladas
cd ../ai-backend
npm install

# Verificar se a porta 3001 está livre
netstat -an | findstr :3001
```

### Main Backend não consegue conectar ao AI Backend
```bash
# Verificar se AI Backend está rodando
npm run check:ai

# Verificar logs do AI Backend
cd ../ai-backend
npm run dev
```

### Erro de API Key
```bash
# Verificar se as API keys estão configuradas
echo $AI_API_KEY
echo $OPENAI_API_KEY
```

## 📝 Exemplos de Uso

### Desenvolvimento Local
```bash
# Terminal 1: Iniciar ambos os backends
cd backend
npm run dev:with-ai

# Terminal 2: Testar integração
node ../ai-backend/test-integration.js
```

### Produção
```bash
# Terminal 1: Iniciar AI Backend
cd ai-backend
npm run build
npm start

# Terminal 2: Iniciar Main Backend
cd backend
npm run build
npm run start:wait-ai
```

### Desenvolvimento Separado
```bash
# Terminal 1: AI Backend
cd ai-backend
npm run dev

# Terminal 2: Main Backend
cd backend
npm run dev:wait-ai
```

## 🔄 Fluxo de Trabalho

### 1. Desenvolvimento
```bash
# Iniciar desenvolvimento completo
npm run dev:with-ai

# Fazer alterações no código
# Os backends reiniciarão automaticamente

# Testar integração
node ../ai-backend/test-integration.js
```

### 2. Produção
```bash
# Build dos projetos
cd ai-backend && npm run build
cd ../backend && npm run build

# Iniciar em produção
cd backend
npm run start:with-ai
```

### 3. Debug
```bash
# Verificar status do AI Backend
npm run check:ai

# Iniciar apenas Main Backend
npm run dev

# Verificar logs
# Logs aparecem no console com cores diferentes
```

## 📞 Suporte

Para problemas com os scripts:
1. Verifique se todas as dependências estão instaladas
2. Verifique se as portas 3000 e 3001 estão livres
3. Verifique se as variáveis de ambiente estão configuradas
4. Execute `npm run check:ai` para verificar o AI Backend
5. Verifique os logs para mensagens de erro
