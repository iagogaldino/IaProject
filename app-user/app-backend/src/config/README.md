# Configuração Centralizada

Este diretório contém a configuração centralizada da aplicação.

## Arquivo `config.ts`

O arquivo `config.ts` centraliza todas as configurações da aplicação, incluindo:

- **OpenAI API Key**: Configuração da chave da API OpenAI
- **Database Configuration**: Configurações do banco de dados PostgreSQL
- **Server Configuration**: Configurações do servidor

## Como usar

### Importar a configuração

```typescript
import { Config } from '../config/config';
```

### Acessar a API Key do OpenAI

```typescript
// Verificar se a API key está configurada
if (Config.isOpenAIKeyValid()) {
  // Usar a API key
  const apiKey = Config.getOpenAIKey();
}

// Ou usar diretamente (lança erro se não estiver configurada)
const apiKey = Config.getOpenAIKey();
```

### Acessar configurações do banco de dados

```typescript
const dbConfig = Config.getDatabaseConfig();
// Retorna: { user, host, database, password, port }
```

### Acessar outras configurações

```typescript
const serverPort = Config.SERVER_PORT;
const dbHost = Config.DB_HOST;
```

## Vantagens

1. **Centralização**: Todas as configurações em um local
2. **Validação**: Validação automática da API key
3. **Type Safety**: Tipagem TypeScript para todas as configurações
4. **Debugging**: Método `logConfigStatus()` para debug
5. **Manutenibilidade**: Fácil de manter e atualizar

## Configuração do ambiente

As configurações são carregadas do arquivo `config.env` na raiz do backend:

```env
OPENAI_API_KEY=sk-proj-...
PGUSER=dev
PGHOST=db
PGDATABASE=app_db
PGPASSWORD=devpass
PGPORT=5432
SERVER_PORT=3000
```
