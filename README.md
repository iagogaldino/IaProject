# IA Project - Monorepo

Este é um monorepo contendo o frontend (Ionic/Angular) e backend (Node.js/Express) do projeto IA.

## 🚀 Modos de Execução

O projeto suporta dois modos de execução:

### 1. Modo Mock (`start:mock`)
- **Frontend**: Usa mocks locais, não faz requisições ao backend
- **Backend**: Usa `MockWorkflowService`, não faz chamadas a APIs externas
- **Uso**: Ideal para desenvolvimento rápido, testes e quando não há acesso à internet

### 2. Modo Dev (`start:dev`)
- **Frontend**: Faz requisições reais ao backend
- **Backend**: Usa `WorkflowService` real, faz integração com APIs oficiais
- **Uso**: Para desenvolvimento com integração real

## 📦 Instalação

```bash
# Instalar dependências de todos os projetos
npm run install:all
```

Ou instalar manualmente:

```bash
# Raiz
npm install

# Frontend
cd app-user/app-frontend
npm install

# Backend
cd app-user/backend
npm install
```

## 🎯 Como Usar

### Modo Mock

```bash
# Inicia frontend e backend em modo mock
npm run start:mock
```

Isso irá:
- Iniciar o backend na porta 3000 com mocks
- Iniciar o frontend na porta 4200 usando mocks locais

### Modo Dev

```bash
# Inicia frontend e backend em modo dev (integração real)
npm run start:dev
```

Isso irá:
- Iniciar o backend na porta 3000 com integração real
- Iniciar o frontend na porta 4200 fazendo requisições ao backend

## 🔧 Scripts Individuais

### Backend

```bash
cd app-user/backend

# Modo mock
npm run dev:mock

# Modo dev (real)
npm run dev:real

# Modo padrão (sem mocks)
npm run dev
```

### Frontend

```bash
cd app-user/app-frontend

# Modo mock
npm run start:mock

# Modo dev
npm run start:dev
```

## 📁 Estrutura do Projeto

```
.
├── app-user/
│   ├── app-frontend/     # Frontend Ionic/Angular
│   │   ├── src/
│   │   │   ├── environments/
│   │   │   │   ├── environment.mock.ts  # Configuração mock
│   │   │   │   └── environment.dev.ts   # Configuração dev
│   │   │   └── app/
│   │   │       └── services/
│   │   │           ├── api.service.ts   # Serviço de API
│   │   │           └── mock.service.ts  # Serviço de mocks
│   └── backend/          # Backend Node.js/Express
│       └── src/
│           ├── services/
│           │   ├── WorkflowService.ts      # Serviço real
│           │   └── MockWorkflowService.ts  # Serviço mock
│           └── routes/
│               └── askRoutes.ts           # Rotas da API
└── package.json          # Scripts do monorepo
```

## 🔑 Variáveis de Ambiente

### Backend

O backend usa a variável `USE_MOCKS` para determinar se deve usar mocks:

- `USE_MOCKS=true` → Usa `MockWorkflowService`
- `USE_MOCKS=false` ou não definido → Usa `WorkflowService` real

### Frontend

O frontend usa arquivos de ambiente:

- `environment.mock.ts` → `useMocks: true`
- `environment.dev.ts` → `useMocks: false`

## 📝 Notas

- No modo mock, o frontend não precisa do backend rodando
- No modo dev, o backend deve estar rodando antes do frontend
- Os mocks incluem respostas pré-definidas para perguntas comuns
- As respostas mockadas incluem formatação markdown

