# 🐳 Docker Deployment - IaProject

Este documento descreve como executar todo o sistema IaProject com um único comando Docker.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose v2.0+
- 8GB+ de RAM disponível
- Portas 3000, 3001, 4200, 4201, 5432 disponíveis

## 🚀 Início Rápido

### 1. Iniciar todos os serviços
```bash
# Opção 1: Script automatizado (recomendado)
chmod +x scripts/start.sh
./scripts/start.sh

# Opção 2: Comando direto
docker-compose up -d --build
```

### 2. Verificar status
```bash
# Ver status dos serviços
./scripts/status.sh

# Ou diretamente
docker-compose ps
```

### 3. Parar serviços
```bash
# Script automatizado
./scripts/stop.sh

# Ou diretamente
docker-compose down
```

## 🏗️ Arquitetura dos Serviços

| Serviço | Porta | Descrição | Dependências |
|---------|-------|-----------|--------------|
| **postgres** | 5432 | Banco de dados PostgreSQL | - |
| **app-backend** | 3000 | API do aplicativo principal | postgres |
| **app-frontend** | 4200 | Frontend Ionic/Angular | - |
| **ia-backend** | 3001 | API de IA e agentes | postgres |
| **ia-frontend** | 4201 | Frontend de administração IA | - |

## 🌐 Acesso aos Serviços

Após iniciar, acesse:

- **App Frontend (Ionic)**: http://localhost:4200
- **App Backend API**: http://localhost:3000
- **IA Frontend (Admin)**: http://localhost:4201
- **IA Backend API**: http://localhost:3001
- **Database**: localhost:5432

## 📝 Comandos Úteis

### Gerenciamento de Serviços
```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Reiniciar um serviço específico
docker-compose restart app-backend

# Ver logs de um serviço
docker-compose logs -f app-backend

# Ver logs de todos os serviços
docker-compose logs -f
```

### Desenvolvimento
```bash
# Rebuild de um serviço específico
docker-compose up -d --build app-backend

# Executar comando em um container
docker-compose exec app-backend npm run dev

# Acessar shell do container
docker-compose exec postgres psql -U dev -d app_db
```

### Limpeza
```bash
# Parar e remover volumes
docker-compose down -v

# Parar e remover imagens
docker-compose down --rmi all

# Limpeza completa do Docker
docker system prune -a
```

## 🔧 Configuração

### Variáveis de Ambiente
Copie `env.example` para `.env` e ajuste conforme necessário:

```bash
cp env.example .env
```

### Volumes Persistentes
- **postgres_data**: Dados do PostgreSQL
- **node_modules**: Cache de dependências Node.js

### Rede
Todos os serviços estão conectados na rede `iaproject-network` para comunicação interna.

## 🐛 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar processos usando as portas
   netstat -tulpn | grep :3000
   ```

2. **Erro de permissão nos scripts**
   ```bash
   chmod +x scripts/*.sh
   ```

3. **Containers não iniciam**
   ```bash
   # Ver logs detalhados
   docker-compose logs
   
   # Verificar recursos do sistema
   docker system df
   ```

4. **Problemas de rede**
   ```bash
   # Recriar rede
   docker network rm iaproject-network
   docker network create iaproject-network
   ```

### Logs e Debugging
```bash
# Logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f app-backend

# Status detalhado
docker-compose ps
docker stats
```

## 📊 Monitoramento

### Verificar saúde dos serviços
```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Espaço em disco
docker system df
```

### Testes de conectividade
```bash
# Testar API do app backend
curl http://localhost:3000/health

# Testar API do IA backend
curl http://localhost:3001/health

# Testar banco de dados
docker-compose exec postgres pg_isready -U dev
```

## 🔄 Atualizações

Para atualizar o sistema:

1. Pare os serviços: `docker-compose down`
2. Atualize o código
3. Rebuild: `docker-compose up -d --build`
4. Verifique: `docker-compose ps`

## 📚 Documentação Adicional

- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [App Backend Docs](./app-user/app-backend/README.md)
- [IA Backend Docs](./ia-service/ia-backend/README.md)
- [Database Setup](./app-user/database/README.md)
