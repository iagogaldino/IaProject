# Arquitetura do Sistema de Agentes

## Visão Geral

O sistema de agentes foi projetado para ser modular, inteligente e eficiente. Ele decide automaticamente qual agente usar baseado na solicitação do usuário.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Voice Chat    │  │  Message Detail │  │ Saved Messages  │ │
│  │     Page        │  │     Page        │  │     Page        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                OpenAIController                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  • Valida API Key                                      │ │ │
│  │  │  • Processa Request                                     │ │ │
│  │  │  • Retorna Response                                     │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  AgentRouter                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  • Analisa Intenção                                     │ │ │
│  │  │  • Roteia para Agente                                   │ │ │
│  │  │  • Gerencia Metadados                                   │ │ │
│  │  │  • Trata Erros                                          │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                ┌────────────────┼────────────────┐                │
│                ▼                ▼                ▼                │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ │
│  │UserCommunicationAgent│ │DatabaseQueryAgent  │ │    Error Handler     │ │
│  │                     │ │                     │ │                     │ │
│  │ • Analisa Intenção  │ │ • Gera SQL Query    │ │ • Trata Erros       │ │
│  │ • Resposta Direta   │ │ • Executa Query     │ │ • Fallback          │ │
│  │ • Coordena Agentes  │ │ • Formata Dados     │ │ • Logs de Erro      │ │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVIÇOS EXTERNOS                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   OpenAI API       │  │   PostgreSQL DB     │  │   Config Service    │ │
│  │                     │  │                     │  │                     │ │
│  │ • GPT-3.5-turbo    │  │ • relatorio_texto   │  │ • API Keys          │ │
│  │ • Chat Completions │  │ • Ações Municipais  │  │ • DB Config         │ │
│  │ • Text Generation  │  │ • Dados Municipais  │  │ • Server Config     │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Processamento

### 1. **Recepção da Solicitação**
```
Frontend → OpenAIController → Validação de API Key
```

### 2. **Análise de Intenção**
```
AgentRouter → UserCommunicationAgent → Análise de Intenção
```

### 3. **Roteamento Inteligente**
```
Se requer banco → DatabaseQueryAgent
Se resposta direta → UserCommunicationAgent
Se erro → Error Handler
```

### 4. **Processamento Especializado**

#### Para Consultas de Banco:
```
DatabaseQueryAgent → Gera SQL → Executa Query → Formata Resposta
```

#### Para Respostas Diretas:
```
UserCommunicationAgent → Gera Resposta Direta → Formata HTML
```

### 5. **Retorno da Resposta**
```
Agente → AgentRouter → OpenAIController → Frontend
```

## Componentes Detalhados

### 🎯 **AgentRouter**
- **Responsabilidade**: Coordenador central
- **Funcionalidades**:
  - Análise de intenção do usuário
  - Roteamento para agente apropriado
  - Gerenciamento de metadados
  - Tratamento de erros e fallbacks

### 🗣️ **UserCommunicationAgent**
- **Responsabilidade**: Comunicação principal com usuário
- **Funcionalidades**:
  - Análise de intenção usando IA
  - Geração de respostas diretas
  - Coordenação de outros agentes
  - Formatação de contexto de conversa

### 🗄️ **DatabaseQueryAgent**
- **Responsabilidade**: Consultas especializadas ao banco
- **Funcionalidades**:
  - Geração automática de SQL
  - Execução de queries
  - Formatação de dados
  - Tratamento de erros de banco

### 🔧 **Agent (Base)**
- **Responsabilidade**: Interface base para agentes
- **Funcionalidades**:
  - Comunicação com OpenAI
  - Interface padronizada
  - Gerenciamento de prompts

## Tipos de Solicitações

### 📊 **Consultas que Requerem Banco**
- Perguntas sobre dados específicos
- Solicitações de estatísticas
- Consultas sobre relatórios
- Perguntas que precisam de dados da tabela

**Exemplos**:
- "Quantos relatórios temos?"
- "Mostre dados sobre saúde"
- "Quais são os investimentos?"

### 💬 **Respostas Diretas**
- Saudações e cumprimentos
- Perguntas sobre funcionamento
- Explicações conceituais
- Perguntas gerais

**Exemplos**:
- "Olá, como funciona?"
- "O que você pode fazer?"
- "Explique sobre ações municipais"

## Metadados de Resposta

```typescript
interface AgentResponse {
  response: string;           // Resposta formatada
  agentUsed: string;          // Agente utilizado
  requiresDatabase: boolean;   // Se consultou banco
  processingTime: number;     // Tempo de processamento
  confidence: number;         // Confiança na resposta
  databaseData?: any;        // Dados do banco
  sqlQuery?: string;         // Query SQL executada
}
```

## Vantagens da Arquitetura

### ✅ **Modularidade**
- Cada agente tem responsabilidade específica
- Fácil manutenção e extensão
- Separação clara de responsabilidades

### ✅ **Inteligência**
- Decisão automática de qual agente usar
- Análise de intenção baseada em IA
- Roteamento inteligente

### ✅ **Robustez**
- Tratamento de erros em múltiplas camadas
- Fallbacks automáticos
- Logs detalhados para debug

### ✅ **Performance**
- Processamento otimizado por tipo de consulta
- Metadados de performance
- Timeouts e controle de recursos

### ✅ **Extensibilidade**
- Fácil adicionar novos agentes
- Interface padronizada
- Sistema de roteamento flexível

## Configuração e Dependências

### **Configuração Centralizada**
```typescript
import { Config } from '../config/config';

// API Key do OpenAI
Config.getOpenAIKey()

// Configuração do banco
Config.getDatabaseConfig()
```

### **Dependências**
- OpenAI API (GPT-3.5-turbo)
- PostgreSQL Database
- Node.js + TypeScript
- Express.js

## Monitoramento e Debug

### **Logs Estruturados**
```typescript
console.log('AgentRouter: Routing request:', prompt);
console.log('User intent analysis:', analysisResult);
console.log('Generated SQL query:', sqlQuery);
console.log('Database query executed, rows:', result.rows?.length);
```

### **Metadados de Performance**
- Tempo de processamento
- Agente utilizado
- Confiança na resposta
- Dados processados

### **Tratamento de Erros**
- Erros de API
- Erros de banco
- Timeouts
- Fallbacks automáticos

## Próximos Passos

1. **Monitoramento Avançado**: Métricas de uso e performance
2. **Cache Inteligente**: Cache de respostas frequentes
3. **Agentes Especializados**: Agentes para domínios específicos
4. **Aprendizado Contínuo**: Melhoria baseada em feedback
5. **Integração com Outros Sistemas**: APIs externas e serviços
