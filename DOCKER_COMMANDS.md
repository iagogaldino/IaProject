# 🐳 Comandos Docker - IaProject

## 🚀 Iniciar Serviços

### Modo Produção (Recomendado)
```bash
# Iniciar todos os serviços
docker-compose up -d --build

# Iniciar sem rebuild (mais rápido)
docker-compose up -d
```

### Modo Desenvolvimento (com hot-reload)
```bash
# Iniciar em modo desenvolvimento
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 📊 Monitoramento

### Status dos Serviços
```bash
# Ver status de todos os serviços
docker-compose ps

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f app-backend
docker-compose logs -f ia-backend
docker-compose logs -f app-frontend
docker-compose logs -f ia-frontend
docker-compose logs -f postgres
```

### Verificar Saúde dos Serviços
```bash
# Verificar se todos estão rodando
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f --tail=50
```

## 🔧 Gerenciamento

### Parar e Reiniciar
```bash
# Parar todos os serviços
docker-compose down

# Reiniciar todos os serviços
docker-compose restart

# Reiniciar um serviço específico
docker-compose restart app-backend
docker-compose restart ia-backend
```

### Limpeza
```bash
# Parar e remover containers
docker-compose down

# Parar, remover containers e volumes
docker-compose down -v

# Limpeza completa (remove imagens também)
docker-compose down -v --rmi all
docker system prune -f
```

## 🛠️ Desenvolvimento

### Acessar Shell dos Containers
```bash
# Acessar shell do app backend
docker-compose exec app-backend sh

# Acessar shell do IA backend
docker-compose exec ia-backend sh

# Acessar shell do banco de dados
docker-compose exec postgres psql -U dev -d app_db
```

### Rebuild Específico
```bash
# Rebuild apenas um serviço
docker-compose build app-backend
docker-compose build ia-backend
docker-compose build app-frontend
docker-compose build ia-frontend

# Rebuild e reiniciar
docker-compose up -d --build app-backend
```

## 🌐 URLs dos Serviços

- **📱 App Frontend (Ionic):** http://localhost:4200
- **🔧 App Backend:** http://localhost:3000  
- **🤖 IA Frontend (Admin):** http://localhost:4201
- **🧠 IA Backend:** http://localhost:3001
- **🗄️ PostgreSQL:** localhost:5432

## 🔍 Troubleshooting

### Verificar Portas em Uso
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :4200
netstat -ano | findstr :4201

# Finalizar processo que está usando a porta
taskkill /PID <PID> /F
```

### Verificar Logs de Erro
```bash
# Ver logs de erro específicos
docker-compose logs --tail=100 app-backend | grep -i error
docker-compose logs --tail=100 ia-backend | grep -i error
```

### Reset Completo
```bash
# Parar tudo
docker-compose down -v

# Remover imagens
docker rmi $(docker images -q)

# Limpeza do sistema Docker
docker system prune -a -f

# Rebuild completo
docker-compose up -d --build
```

## 📝 Comandos Rápidos

```bash
# Iniciar tudo
docker-compose up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Reiniciar tudo
docker-compose restart
```
