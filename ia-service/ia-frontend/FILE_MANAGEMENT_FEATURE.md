# 📁 Funcionalidade de Gerenciamento de Arquivos

## Visão Geral

A funcionalidade de gerenciamento de arquivos foi implementada no frontend Angular para permitir o upload, processamento e gerenciamento de arquivos através dos agentes de IA. Esta funcionalidade está totalmente integrada com a API do backend e oferece uma interface intuitiva para gerenciar arquivos.

## 🚀 Funcionalidades Implementadas

### 1. **Serviço de Arquivos (`file.service.ts`)**
- Upload de arquivos para agentes específicos
- Listagem de arquivos por agente
- Processamento de arquivos com IA (ler, analisar, resumir, extrair)
- Obtenção de informações detalhadas de arquivos
- Exclusão de arquivos
- Validação de tipos e tamanhos de arquivo
- Utilitários para formatação e ícones

### 2. **Componente de Lista de Arquivos (`file-list.component.ts`)**
- Exibição em grid responsivo dos arquivos
- Cards informativos com ícones por tipo de arquivo
- Status de processamento (processando, processado, não processado)
- Menu de ações para cada arquivo:
  - **Ler**: Processa o arquivo para leitura
  - **Analisar**: Análise profunda com IA
  - **Resumir**: Cria resumo do conteúdo
  - **Extrair**: Extrai informações-chave
  - **Excluir**: Remove o arquivo
- Indicadores visuais de progresso
- Formatação de datas e tamanhos

### 3. **Componente de Upload (`file-upload.component.ts`)**
- Interface drag-and-drop para upload
- Seleção múltipla de arquivos
- Validação de tipos permitidos
- Barra de progresso para uploads
- Preview dos arquivos selecionados
- Instruções claras sobre tipos e tamanhos suportados

### 4. **Tela Principal de Gerenciamento (`file-management.component.ts`)**
- Seleção de agente com acesso a arquivos
- Estatísticas em tempo real:
  - Total de arquivos
  - Tamanho total
  - Percentual de arquivos processados
- Interface em abas (Lista de Arquivos / Upload)
- Navegação intuitiva
- Estados de loading e erro

## 🎯 Como Usar

### 1. **Acessar a Funcionalidade**
- No dashboard, clique no ícone de pasta (📁) no header
- Ou navegue diretamente para `/files`

### 2. **Selecionar Agente**
- A tela mostra apenas agentes com permissão de acesso a arquivos
- Clique no chip do agente desejado
- As estatísticas são atualizadas automaticamente

### 3. **Upload de Arquivos**
- Vá para a aba "Upload"
- Arraste arquivos para a área de upload ou clique para selecionar
- Tipos suportados: TXT, PDF, DOC, DOCX, CSV, JSON, XLS, XLSX
- Tamanho máximo: 10MB por arquivo
- Clique em "Enviar Arquivos" para fazer o upload

### 4. **Gerenciar Arquivos**
- Na aba "Arquivos", visualize todos os arquivos do agente
- Use o menu de ações (⋮) para cada arquivo:
  - **Ler**: Para leitura e explicação do conteúdo
  - **Analisar**: Para análise profunda com insights
  - **Resumir**: Para criar resumos concisos
  - **Extrair**: Para extrair informações específicas
  - **Excluir**: Para remover o arquivo

## 🔧 Integração com Backend

### Endpoints Utilizados
- `POST /agents/{id}/files/upload` - Upload de arquivos
- `GET /agents/{id}/files` - Listar arquivos do agente
- `GET /files/{fileId}` - Informações detalhadas do arquivo
- `POST /agents/{id}/files/{fileId}/process` - Processar arquivo com IA
- `DELETE /agents/{id}/files/{fileId}` - Excluir arquivo

### Autenticação
- Todos os requests incluem o header `X-API-Key`
- Configurado automaticamente no serviço

## 🎨 Design e UX

### Características Visuais
- **Ícones por tipo**: Cada tipo de arquivo tem um ícone e cor específicos
- **Status visual**: Chips coloridos indicam o status de processamento
- **Responsivo**: Interface adaptável para desktop e mobile
- **Feedback visual**: Loading states, progress bars
- **Estados vazios**: Mensagens informativas quando não há arquivos

### Cores por Tipo de Arquivo
- **PDF**: Vermelho (#f44336)
- **Word**: Azul (#2196f3)
- **Excel**: Verde (#4caf50)
- **CSV**: Laranja (#ff9800)
- **JSON**: Roxo (#9c27b0)
- **Texto**: Cinza (#607d8b)

## 📱 Responsividade

### Desktop
- Grid de 3 colunas para arquivos
- Layout em abas horizontal
- Estatísticas em grid

### Tablet
- Grid de 2 colunas para arquivos
- Layout adaptado

### Mobile
- Grid de 1 coluna para arquivos
- Navegação otimizada para touch
- Botões maiores para melhor usabilidade

## 🔒 Validações e Segurança

### Validações do Frontend
- Tipos de arquivo permitidos
- Tamanho máximo (10MB)
- Validação antes do upload

### Tratamento de Erros
- Mensagens de erro claras
- Fallbacks para estados de erro
- Retry automático em falhas de rede

## 🚀 Próximos Passos

### Melhorias Futuras
1. **Preview de arquivos**: Visualização inline de PDFs e imagens
2. **Busca e filtros**: Filtros por tipo, data, status
3. **Bulk operations**: Ações em lote para múltiplos arquivos
4. **Histórico**: Log de operações realizadas
5. **Compartilhamento**: Compartilhar arquivos entre agentes
6. **Versionamento**: Controle de versões de arquivos

### Otimizações
1. **Lazy loading**: Carregamento sob demanda de arquivos
2. **Cache**: Cache local para melhor performance
3. **Compressão**: Compressão automática de imagens
4. **CDN**: Integração com CDN para arquivos grandes

## 📋 Requisitos Técnicos

### Dependências
- Angular Material para componentes UI
- RxJS para programação reativa
- HttpClient para comunicação com API

### Configuração
- Variáveis de ambiente para API URL e chave
- Headers de autenticação automáticos
- Tratamento de CORS configurado

## 🎯 Casos de Uso

### 1. **Análise de Documentos**
- Upload de relatórios PDF
- Processamento com IA para extrair insights
- Resumos automáticos para relatórios longos

### 2. **Processamento de Dados**
- Upload de planilhas Excel/CSV
- Análise de dados com IA
- Extração de tendências e padrões

### 3. **Gestão de Conteúdo**
- Upload de documentos Word
- Processamento para indexação
- Busca e categorização automática

### 4. **Integração com Chat**
- Arquivos processados ficam disponíveis para consulta
- Agentes podem referenciar conteúdo dos arquivos
- Contexto enriquecido para conversas

## 🔍 Monitoramento

### Métricas Disponíveis
- Total de arquivos por agente
- Tamanho total de armazenamento
- Taxa de processamento
- Tipos de arquivo mais comuns

### Logs
- Todas as operações são logadas
- Erros são capturados e reportados
- Performance é monitorada

---

**Versão**: 1.0.0  
**Data**: 2025-01-27  
**Autor**: IA Service Team
