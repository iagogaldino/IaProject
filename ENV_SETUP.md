# 🔧 Configuração de Variáveis de Ambiente

## 📋 Como Configurar o Projeto

### 1. **Copiar o Arquivo de Exemplo**
```bash
cp .env.example .env
```

### 2. **Preencher as Credenciais**
Edite o arquivo `.env` com suas credenciais reais:

#### **🔑 OpenAI API Key (OBRIGATÓRIO)**
```bash
OPENAI_API_KEY=sk-proj-SUA_CHAVE_OPENAI_AQUI
```
- Obtenha sua chave em: https://platform.openai.com/account/api-keys

#### **🗄️ MongoDB (OBRIGATÓRIO)**
```bash
MONGO_INITDB_ROOT_PASSWORD=SUA_SENHA_MONGODB_AQUI
DB_PASSWORD=SUA_SENHA_MONGODB_AQUI
MONGODB_URI=mongodb://admin:SUA_SENHA_MONGODB_AQUI@mongodb:27017/db-ia?authSource=admin
```

#### **🔐 API Keys (OBRIGATÓRIO)**
```bash
API_KEY=SUA_API_KEY_AQUI
AI_API_KEY=SUA_AI_API_KEY_AQUI
AI_AGENT_ID=SEU_AGENT_ID_AQUI
```

### 3. **Iniciar o Projeto**

#### **Desenvolvimento:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

#### **Produção:**
```bash
docker-compose up -d
```

## 🚀 Serviços Disponíveis

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **App Frontend** | http://localhost:4200 | Interface principal |
| **IA Frontend** | http://localhost:4201 | Interface de administração |
| **App Backend** | http://localhost:3000 | API principal |
| **IA Backend** | http://localhost:3001 | API de IA |
| **MongoDB** | localhost:27018 | Banco de dados |
| **Mongo Express** | http://localhost:8081 | Interface do MongoDB |

## 🔒 Segurança

### **⚠️ IMPORTANTE:**
- ✅ **NUNCA** commite o arquivo `.env`
- ✅ Use senhas fortes e únicas
- ✅ Rotacione as chaves regularmente
- ✅ O arquivo `.env` já está no `.gitignore`

### **🛡️ Boas Práticas:**
1. **Desenvolvimento**: Use credenciais de teste
2. **Produção**: Use credenciais de produção
3. **Backup**: Mantenha backup seguro das credenciais
4. **Acesso**: Limite o acesso ao arquivo `.env`

## 🐛 Troubleshooting

### **Erro: "AI service unavailable"**
- Verifique se `OPENAI_API_KEY` está correta
- Teste a chave em: https://platform.openai.com/account/api-keys

### **Erro: "Database connection failed"**
- Verifique se `MONGODB_URI` está correto
- Verifique se o MongoDB está rodando

### **Erro: "API key invalid"**
- Verifique se `API_KEY` e `AI_API_KEY` estão corretos
- Verifique se os serviços estão se comunicando

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs [serviço]`
2. Verifique as variáveis: `docker-compose exec [serviço] env`
3. Reinicie os serviços: `docker-compose restart`
