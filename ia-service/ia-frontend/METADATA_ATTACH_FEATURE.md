# Funcionalidade de Anexação de Metadados

## Visão Geral

Esta funcionalidade permite aos usuários anexar e desanexar metadados de arquivos através de um botão intuitivo na interface de gerenciamento de arquivos. Os metadados são gerados através de análise de IA e armazenados em uma coleção dedicada no MongoDB.

## Componentes Implementados

### 1. MetadataService (`src/app/services/metadata.service.ts`)

Serviço responsável por gerenciar todas as operações relacionadas aos metadados:

- **Verificação de Status**: Verifica se um arquivo possui metadados anexados
- **Anexação**: Chama o endpoint de análise de IA para gerar e anexar metadados
- **Desanexação**: Remove metadados de um arquivo
- **Cache Inteligente**: Mantém cache do status dos metadados para performance
- **Notificações**: Emite eventos quando o status dos metadados muda

### 2. MetadataAttachButtonComponent (`src/app/components/metadata-attach-button/`)

Componente de botão especializado com estados visuais:

- **Estados Visuais**: 
  - 🔗 "Anexar" (azul) - quando não há metadados
  - 🔗 "Desanexar" (vermelho) - quando há metadados anexados
  - ⏳ "Processando..." (azul com spinner) - durante análise
- **Animações**: Transições suaves e efeitos visuais
- **Tooltips**: Dicas contextuais para o usuário
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

### 3. Integração no FileManagementComponent

O botão foi integrado na interface de gerenciamento de arquivos:

- **Posicionamento**: Localizado à esquerda do botão "Ler"
- **Dados Necessários**: Recebe `fileId`, `agentId` e `fileContent`
- **Callbacks**: Emite eventos para atualização da interface

## Como Funciona

### Fluxo de Anexação

1. **Usuário clica em "Anexar"**
2. **Verificação**: Sistema verifica se o arquivo tem conteúdo
3. **Análise IA**: Chama endpoint `/api/agents/:agentId/files/:fileId/analyze`
4. **Geração**: IA analisa o conteúdo e gera metadados estruturados
5. **Armazenamento**: Metadados são salvos na coleção `metadata`
6. **Feedback**: Interface atualiza para mostrar status "anexado"

### Fluxo de Desanexação

1. **Usuário clica em "Desanexar"**
2. **Confirmação**: Sistema confirma a ação
3. **Remoção**: Chama endpoint `/api/files/:fileId/metadata`
4. **Limpeza**: Remove metadados da coleção
5. **Feedback**: Interface atualiza para mostrar status "desanexado"

## Endpoints Utilizados

### Anexação de Metadados
```
POST /api/agents/:agentId/files/:fileId/analyze
Content-Type: application/json

{
  "content": "conteúdo do arquivo",
  "options": {
    "language": "pt",
    "includeSentiment": true,
    "includeTopics": true,
    "includeSummary": true
  }
}
```

### Verificação de Metadados
```
GET /api/files/:fileId/metadata
```

### Desanexação de Metadados
```
DELETE /api/files/:fileId/metadata
```

## Estrutura dos Metadados

```typescript
interface Metadata {
  id: string;
  fileId: string;
  agentId: string;
  theme: string;
  improvedContent: string;
  tags: string[];
  analysis: {
    summary?: string;
    keyTopics?: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
    confidence?: number;
    language?: string;
  };
  aiAnalysis: {
    processedAt: string;
    agentId: string;
    version: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## Recursos Avançados

### Cache Inteligente
- **Status Cache**: Mantém cache do status de anexação de cada arquivo
- **Notificações**: Emite eventos quando status muda
- **Performance**: Evita chamadas desnecessárias à API

### Estados Visuais
- **Loading**: Spinner durante processamento
- **Success**: Indicador visual de sucesso
- **Error**: Mensagens de erro claras
- **Hover Effects**: Animações suaves

### Responsividade
- **Mobile**: Botão se adapta a telas pequenas
- **Tablet**: Layout otimizado para tablets
- **Desktop**: Experiência completa

## Configuração

### Variáveis de Ambiente
```typescript
// src/app/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
  apiKey: 'ai-backend-2024-abc123xyz789'
};
```

### Dependências
- Angular Material (botões, ícones, tooltips, snackbar)
- RxJS (observables, operadores)
- HttpClient (chamadas HTTP)

## Uso

### No Template
```html
<app-metadata-attach-button
  [fileId]="selectedFile.id"
  [agentId]="selectedFile.agentId"
  [fileContent]="selectedFile.content"
  (metadataAttached)="onMetadataAttached()"
  (metadataDetached)="onMetadataDetached()"
  (statusChanged)="onMetadataStatusChanged($event)">
</app-metadata-attach-button>
```

### No Componente
```typescript
onMetadataAttached() {
  console.log('Metadados anexados!');
  // Atualizar interface
}

onMetadataDetached() {
  console.log('Metadados desanexados!');
  // Atualizar interface
}

onMetadataStatusChanged(isAttached: boolean) {
  console.log(`Status: ${isAttached ? 'anexado' : 'desanexado'}`);
}
```

## Benefícios

1. **UX Intuitiva**: Interface clara e fácil de usar
2. **Performance**: Cache inteligente reduz chamadas à API
3. **Feedback**: Usuário sempre sabe o que está acontecendo
4. **Flexibilidade**: Fácil anexar/desanexar conforme necessário
5. **Escalabilidade**: Arquitetura preparada para crescimento
6. **Manutenibilidade**: Código bem estruturado e documentado

## Próximos Passos

- [ ] Adicionar filtros por metadados na listagem
- [ ] Implementar busca avançada por metadados
- [ ] Criar dashboard de estatísticas de metadados
- [ ] Adicionar exportação de metadados
- [ ] Implementar versionamento de metadados
