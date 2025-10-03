# 🔧 Solução de Problemas - MongoDB

## ❌ Problemas Comuns e Soluções

### 1. Erro de String de Conexão MongoDB

**Erro:**
```
MongoParseError: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
```

**Solução:**
```bash
# Verificar configuração do .env
npm run check:env

# O DATABASE_URL deve começar com mongodb://
DATABASE_URL=mongodb://localhost:27017/ai_backend
```

### 2. Warning de Índice Duplicado

**Erro:**
```
[MONGOOSE] Warning: Duplicate schema index on {"name":1} found
```

**Solução:** ✅ **Já corrigido!** Removido `unique: true` do schema e adicionado apenas no índice.

### 3. MongoDB Não Está Rodando

**Erro:**
```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solução:**
```bash
# Opção 1: Docker (recomendado)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Opção 2: Instalação local
# Windows
net start MongoDB

# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb/brew/mongodb-community
```

### 4. Arquivo .env Não Existe

**Solução:**
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar com suas configurações
nano .env
```

### 5. API Key Não Configurada

**Erro:**
```
OpenAI API error: API key not configured
```

**Solução:**
```bash
# Editar .env e adicionar sua chave OpenAI
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
```

## 🚀 Passos para Resolver

### 1. Verificar Configuração
```bash
cd ia-backend
npm run check:env
```

### 2. Configurar .env Corretamente
```env
# MongoDB
DATABASE_URL=mongodb://localhost:27017/ai_backend

# OpenAI (obrigatório para funcionalidade de IA)
OPENAI_API_KEY=sk-proj-your-openai-api-key

# API Key para autenticação
API_KEY=your-secure-api-key-here
```

### 3. Iniciar MongoDB
```bash
# Docker (recomendado)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verificar se está rodando
docker ps
```

### 4. Testar Conexão
```bash
# Testar MongoDB
npm run test:mongodb

# Iniciar servidor
npm run dev
```

### 5. Testar Endpoints
```bash
# Em outro terminal
npm run test:endpoints
```

## 🔍 Comandos de Diagnóstico

```bash
# Verificar se MongoDB está rodando
docker ps | grep mongo
# ou
sudo systemctl status mongod

# Verificar porta 27017
netstat -an | grep 27017

# Testar conexão MongoDB
mongosh mongodb://localhost:27017/ai_backend

# Ver logs do servidor
npm run dev
```

## 📋 Checklist de Configuração

- [ ] Arquivo `.env` existe e está configurado
- [ ] `DATABASE_URL` começa com `mongodb://`
- [ ] `OPENAI_API_KEY` está definida (se usar IA)
- [ ] `API_KEY` está definida
- [ ] MongoDB está rodando na porta 27017
- [ ] Projeto compila sem erros: `npm run build`
- [ ] Teste de MongoDB passa: `npm run test:mongodb`

## 🆘 Se Nada Funcionar

1. **Limpar e reinstalar:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Verificar logs detalhados:**
```bash
npm run dev
# Observar logs de erro
```

3. **Testar com configuração mínima:**
```bash
# .env mínimo
DATABASE_URL=mongodb://localhost:27017/ai_backend
API_KEY=test-key
```

4. **Usar Docker para MongoDB:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
docker logs mongodb
```

---

**💡 Dica:** Sempre execute `npm run check:env` antes de iniciar o servidor para verificar a configuração!
