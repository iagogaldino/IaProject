# 🍃 MongoDB Setup - Sistema de Agentes Inteligentes

## ✅ Migração Concluída

O backend foi **completamente migrado** de PostgreSQL para MongoDB com todas as funcionalidades mantidas:

- ✅ **Mongoose ODM** implementado
- ✅ **Modelos otimizados** com índices
- ✅ **Validação de dados** com schemas
- ✅ **Agregações** para estatísticas
- ✅ **Relacionamentos** entre Agent e Message
- ✅ **Compatibilidade total** com APIs existentes

## 🛠️ Configuração MongoDB

### 1. Instalar MongoDB

**Windows:**
```bash
# Download do MongoDB Community Server
# https://www.mongodb.com/try/download/community

# Ou usar Chocolatey
choco install mongodb
```

**Linux (Ubuntu/Debian):**
```bash
# Importar chave pública
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Adicionar repositório
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Instalar
sudo apt-get update
sudo apt-get install -y mongodb-org
```

**macOS:**
```bash
# Usar Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

**Docker (Recomendado):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Iniciar MongoDB

**Windows:**
```bash
# Como serviço
net start MongoDB

# Ou manualmente
mongod --dbpath C:\data\db
```

**Linux/macOS:**
```bash
# Como serviço
sudo systemctl start mongod

# Ou manualmente
mongod --dbpath /var/lib/mongodb
```

**Docker:**
```bash
# Iniciar container
docker start mongodb

# Verificar logs
docker logs mongodb
```

### 3. Configurar Backend

```bash
cd ia-backend

# Instalar dependências atualizadas
npm install

# Configurar variáveis de ambiente
cp env.example .env

# Editar .env
nano .env
```

**Configuração mínima no .env:**
```env
# MongoDB
DB_HOST=localhost
DB_PORT=27017
DB_NAME=ai_backend
DATABASE_URL=mongodb://localhost:27017/ai_backend

# OpenAI (obrigatório)
OPENAI_API_KEY=sk-proj-your-openai-api-key

# API Key
API_KEY=your-secure-api-key
```

## 🧪 Testando MongoDB

### 1. Teste de Conexão
```bash
# Testar conexão com MongoDB
npm run test:mongodb
```

### 2. Teste Completo
```bash
# Iniciar servidor
npm run dev

# Em outro terminal, testar endpoints
npm run test:endpoints
```

### 3. Teste Manual
```bash
# Conectar ao MongoDB
mongosh

# Usar banco
use ai_backend

# Ver coleções
show collections

# Verificar dados
db.agents.find()
db.messages.find()
```

## 📊 Estrutura do Banco MongoDB

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

### Índices Criados Automaticamente

**Agents:**
- `{ name: 1 }` - Índice único para nome
- `{ status: 1 }` - Índice para status
- `{ createdAt: -1 }` - Índice para ordenação

**Messages:**
- `{ fromAgentId: 1 }` - Índice para remetente
- `{ toAgentId: 1 }` - Índice para destinatário
- `{ createdAt: -1 }` - Índice para ordenação temporal
- `{ fromAgentId: 1, toAgentId: 1, createdAt: -1 }` - Índice composto

## 🔧 Funcionalidades MongoDB

### Agregações para Estatísticas
```javascript
// Mensagens por agente
db.messages.aggregate([
  {
    $lookup: {
      from: 'agents',
      localField: 'fromAgentId',
      foreignField: '_id',
      as: 'agent'
    }
  },
  {
    $unwind: '$agent'
  },
  {
    $group: {
      _id: '$agent.name',
      messageCount: { $sum: 1 }
    }
  }
])
```

### Consultas Otimizadas
```javascript
// Buscar mensagens entre agentes
db.messages.find({
  $or: [
    { fromAgentId: ObjectId("..."), toAgentId: ObjectId("...") },
    { fromAgentId: ObjectId("..."), toAgentId: ObjectId("...") }
  ]
}).sort({ createdAt: -1 })

// Agentes ativos
db.agents.find({ status: "active" }).sort({ createdAt: -1 })
```

## 🚀 Vantagens da Migração

### Performance
- ✅ **Consultas mais rápidas** com índices otimizados
- ✅ **Agregações nativas** para estatísticas
- ✅ **Escalabilidade horizontal** com sharding

### Flexibilidade
- ✅ **Schema dinâmico** para evolução do modelo
- ✅ **Documentos aninhados** para dados complexos
- ✅ **Validação robusta** com Mongoose

### Desenvolvimento
- ✅ **ODM Mongoose** para TypeScript
- ✅ **Middleware** para validação e transformação
- ✅ **Relacionamentos** com populate

## 🔄 Migração de Dados (Se Necessário)

Se você tinha dados no PostgreSQL e quer migrar:

```bash
# 1. Exportar dados do PostgreSQL
pg_dump ai_backend > postgres_backup.sql

# 2. Converter para formato MongoDB
node scripts/migrate-from-postgres.js

# 3. Importar para MongoDB
mongoimport --db ai_backend --collection agents --file agents.json
mongoimport --db ai_backend --collection messages --file messages.json
```

## 🆘 Solução de Problemas

### MongoDB não inicia
```bash
# Verificar se porta 27017 está livre
netstat -an | grep 27017

# Verificar logs
tail -f /var/log/mongodb/mongod.log

# Verificar permissões
sudo chown -R mongodb:mongodb /var/lib/mongodb
```

### Erro de conexão
```bash
# Verificar se MongoDB está rodando
ps aux | grep mongod

# Testar conexão
telnet localhost 27017

# Verificar configuração
cat /etc/mongod.conf
```

### Erro de autenticação
```bash
# Conectar sem autenticação
mongosh --host localhost --port 27017

# Criar usuário
use admin
db.createUser({
  user: "admin",
  pwd: "password",
  roles: ["root"]
})
```

## 📚 Comandos Úteis

```bash
# Iniciar MongoDB
sudo systemctl start mongod

# Parar MongoDB
sudo systemctl stop mongod

# Status do serviço
sudo systemctl status mongod

# Reiniciar MongoDB
sudo systemctl restart mongod

# Ver logs em tempo real
sudo journalctl -u mongod -f
```

## 🔗 Links Úteis

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas (Cloud)](https://www.mongodb.com/atlas)
- [MongoDB Compass (GUI)](https://www.mongodb.com/products/compass)

---

**🎉 MongoDB está configurado e funcionando!** O backend agora usa MongoDB com todas as funcionalidades de agentes inteligentes.
