# 🏗️ Arquitetura Docker - IaProject

## Visão Geral

O IaProject agora pode ser executado com um único comando Docker, gerenciando todos os serviços de forma integrada.

## 📊 Arquitetura dos Serviços

```
┌─────────────────────────────────────────────────────────────────┐
│                        IaProject Docker                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   App       │    │   IA        │    │   Database  │          │
│  │ Frontend    │    │ Frontend    │    │ PostgreSQL  │          │
│  │ :4200       │    │ :4201       │    │ :5432      │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│         │                   │                   ▲               │
│         │                   │                   │               │
│         ▼                   ▼                   │               │
│  ┌─────────────┐    ┌─────────────┐             │               │
│  │   App       │    │   IA        │             │               │
│  │ Backend     │    │ Backend     │             │               │
│  │ :3000       │    │ :3001       │             │               │
│  └─────────────┘    └─────────────┘             │               │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│  ┌─────────────────────────▼─────────────────────────────────┐  │
│  │              iaproject-network                            │  │
│  │              (Docker Network)                            │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Componentes

### 1. **Database (PostgreSQL)**
- **Container**: `iaproject-postgres`
- **Porta**: 5432
- **Volume**: `postgres_data`
- **Health Check**: Verifica se o banco está pronto
- **Inicialização**: Scripts SQL em `app-user/database/init/`

### 2. **App Backend**
- **Container**: `iaproject-app-backend`
- **Porta**: 3000
- **Dependência**: PostgreSQL
- **Funcionalidade**: API principal do aplicativo
- **Build**: Dockerfile em `app-user/app-backend/`

### 3. **App Frontend (Ionic)**
- **Container**: `iaproject-app-frontend`
- **Porta**: 4200
- **Funcionalidade**: Interface mobile/web
- **Build**: Dockerfile em `app-user/app-frontend/`

### 4. **IA Backend**
- **Container**: `iaproject-ia-backend`
- **Porta**: 3001
- **Dependência**: PostgreSQL
- **Funcionalidade**: API de IA e agentes
- **Build**: Dockerfile em `ia-service/ia-backend/`

### 5. **IA Frontend (Admin)**
- **Container**: `iaproject-ia-frontend`
- **Porta**: 4201
- **Funcionalidade**: Interface de administração
- **Build**: Dockerfile em `ia-service/ia-frontend/`

## 🌐 Rede e Comunicação

### Rede Docker
- **Nome**: `iaproject-network`
- **Tipo**: Bridge
- **Comunicação**: Todos os serviços podem se comunicar internamente

### URLs de Acesso
- **App Frontend**: http://localhost:4200
- **App Backend**: http://localhost:3000
- **IA Frontend**: http://localhost:4201
- **IA Backend**: http://localhost:3001
- **Database**: localhost:5432

## 📁 Estrutura de Arquivos

```
IaProject/
├── docker-compose.yml          # Configuração principal
├── docker-compose.dev.yml      # Override para desenvolvimento
├── Makefile                    # Comandos facilitados
├── env.example                 # Variáveis de ambiente
├── scripts/                    # Scripts de automação
│   ├── start.sh               # Iniciar (Linux/Mac)
│   ├── start.bat              # Iniciar (Windows)
│   ├── stop.sh                # Parar (Linux/Mac)
│   ├── stop.bat               # Parar (Windows)
│   ├── status.sh              # Status (Linux/Mac)
│   ├── status.bat             # Status (Windows)
│   └── test-deployment.sh     # Teste de conectividade
├── app-user/
│   ├── app-backend/
│   │   └── Dockerfile         # Backend principal
│   ├── app-frontend/
│   │   └── Dockerfile         # Frontend Ionic
│   └── database/
│       └── init/              # Scripts de inicialização
└── ia-service/
    ├── ia-backend/
    │   └── Dockerfile         # Backend IA
    └── ia-frontend/
        └── Dockerfile         # Frontend Admin
```

## 🚀 Comandos de Execução

### Início Rápido
```bash
# Opção 1: Make (recomendado)
make start

# Opção 2: Docker Compose direto
docker-compose up -d --build

# Opção 3: Scripts
./scripts/start.sh    # Linux/Mac
scripts/start.bat     # Windows
```

### Desenvolvimento
```bash
# Modo desenvolvimento com hot reload
make dev

# Ou diretamente
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Monitoramento
```bash
# Status dos serviços
make status

# Logs em tempo real
make logs

# Logs específicos
make logs-app    # App backend
make logs-ia     # IA backend
make logs-db     # Database
```

## 🔄 Fluxo de Dados

1. **Usuário** acessa App Frontend (4200)
2. **App Frontend** faz requisições para App Backend (3000)
3. **App Backend** consulta/atualiza PostgreSQL (5432)
4. **Admin** acessa IA Frontend (4201)
5. **IA Frontend** faz requisições para IA Backend (3001)
6. **IA Backend** processa IA e consulta PostgreSQL (5432)

## 🛡️ Segurança e Isolamento

- **Rede isolada**: Todos os serviços em rede privada
- **Volumes nomeados**: Dados persistentes seguros
- **Health checks**: Verificação de saúde dos serviços
- **Restart policies**: Recuperação automática de falhas

## 📈 Escalabilidade

- **Horizontal**: Adicionar réplicas de serviços
- **Vertical**: Ajustar recursos por container
- **Load balancing**: Nginx/Traefik para distribuição
- **Monitoring**: Prometheus/Grafana para métricas

## 🔧 Manutenção

### Backup
```bash
# Backup do banco
docker-compose exec postgres pg_dump -U dev app_db > backup.sql

# Backup de volumes
docker run --rm -v iaproject_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Atualizações
```bash
# Atualizar código e rebuild
git pull
docker-compose up -d --build

# Atualizar apenas um serviço
docker-compose up -d --build app-backend
```

### Limpeza
```bash
# Limpeza completa
make clean

# Limpeza seletiva
docker-compose down -v          # Remove volumes
docker-compose down --rmi all    # Remove imagens
docker system prune -a          # Limpeza geral
```
