# Integração com API Externa de Extração de Dados

## Visão Geral

Este projeto foi atualizado para usar uma API externa especializada para extração de dados de arquivos, removendo a responsabilidade de processamento local e delegando essa funcionalidade para um serviço dedicado.

## Arquitetura

### Antes (Processamento Local)
- ❌ PdfContentExtractor (extração de texto)
- ❌ PdfScreenshotExtractor (conversão para imagens)
- ❌ Processamento local com bibliotecas como pdf-parse, pdf-poppler, sharp
- ❌ Gerenciamento de screenshots e limpeza de arquivos

### Depois (API Externa)
- ✅ ExternalExtractorService (integração com API externa)
- ✅ Processamento delegado para serviço especializado
- ✅ Menor complexidade e dependências
- ✅ Melhor escalabilidade e manutenibilidade

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Configuração da API Externa de Extração de Dados
EXTERNAL_EXTRACTOR_API_URL=http://localhost:3000/api/extract
EXTERNAL_EXTRACTOR_TIMEOUT=30000
```

### Dependências Removidas

As seguintes dependências foram removidas do `package.json`:
- `pdf-parse` - Extração de texto de PDF
- `pdf-poppler` - Conversão de PDF para imagens
- `sharp` - Processamento de imagens

### Dependências Mantidas
- `axios` - Cliente HTTP para comunicação com API externa
- `form-data` - Envio de arquivos via multipart/form-data

## Funcionalidades

### 1. ExternalExtractorService

**Arquivo:** `src/services/externalExtractorService.ts`

- **Extração Universal:** Suporta todos os tipos de arquivo (PDF, DOC, DOCX, TXT, CSV, XLSX, XLS, JSON)
- **Processamento com IA:** Integração com processamento de IA da API externa
- **Tratamento de Erros:** Gerenciamento robusto de erros e timeouts
- **Validação:** Verificação de conectividade e saúde da API

### 2. ContentExtractorFactory Atualizado

**Arquivo:** `src/services/extractors/ContentExtractorFactory.ts`

- **Delegação Total:** Todos os tipos de arquivo usam a API externa
- **Monitoramento:** Métodos para verificar saúde e conectividade
- **Fallback:** Tratamento de falhas da API externa

### 3. FileService Simplificado

**Arquivo:** `src/services/fileService.ts`

- **Remoção de Screenshots:** Não gerencia mais screenshots localmente
- **Metadados Simplificados:** Foco em metadados de processamento
- **Limpeza Automática:** Não precisa limpar arquivos temporários

## Endpoints da API

### Verificação de Saúde

#### GET `/api/files/external-api/health`
Verifica o status da API externa.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "API externa está funcionando",
    "apiUrl": "http://localhost:3000/api/extract"
  }
}
```

#### GET `/api/files/external-api/test-connection`
Testa a conectividade com a API externa.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "message": "API externa está funcionando"
  }
}
```

## Fluxo de Processamento

### 1. Upload de Arquivo
```
Cliente → FileController → FileService → Database
```

### 2. Processamento de Arquivo
```
FileService → ContentExtractorFactory → ExternalExtractorService → API Externa
```

### 3. Resposta
```
API Externa → ExternalExtractorService → FileService → Cliente
```

## Exemplo de Uso

### Upload e Processamento

```bash
# 1. Upload de arquivo
curl -X POST "http://localhost:3001/api/agents/agent-123/files/upload" \
  -H "X-API-Key: your-api-key" \
  -F "file=@documento.pdf"

# 2. Processamento
curl -X POST "http://localhost:3001/api/agents/agent-123/files/file-456/process" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "read",
    "options": {
      "language": "pt"
    }
  }'
```

### Verificação de Saúde

```bash
# Verificar saúde da API externa
curl -X GET "http://localhost:3001/api/files/external-api/health" \
  -H "X-API-Key: your-api-key"

# Testar conexão
curl -X GET "http://localhost:3001/api/files/external-api/test-connection" \
  -H "X-API-Key: your-api-key"
```

## Testes

### Script de Teste Automatizado

Execute o script de teste para verificar a integração:

```bash
cd ia-backend
node test-external-api.js
```

O script testa:
1. ✅ Verificação de saúde da API externa
2. ✅ Teste de conexão
3. ✅ Teste direto da API externa
4. ✅ Upload e processamento de arquivo

### Teste Manual

```bash
# Teste direto da API externa
curl --location 'http://localhost:3000/api/extract' \
  --form 'file=@"/path/to/test.pdf"' \
  --form 'fileType="pdf"' \
  --form 'processWithAI="true"'
```

## Tratamento de Erros

### Tipos de Erro

1. **ECONNREFUSED:** API externa não está disponível
2. **ETIMEDOUT:** Timeout na comunicação
3. **413:** Arquivo muito grande
4. **415:** Tipo de arquivo não suportado
5. **500:** Erro interno da API externa

### Logs

O sistema gera logs detalhados para:
- Tentativas de conexão
- Respostas da API externa
- Erros e timeouts
- Métricas de performance

## Vantagens da Nova Arquitetura

### ✅ Benefícios

1. **Separação de Responsabilidades:** Foco no core business
2. **Escalabilidade:** API externa pode ser escalada independentemente
3. **Manutenibilidade:** Menos dependências e código para manter
4. **Performance:** Processamento especializado na API externa
5. **Flexibilidade:** Fácil troca de provedor de extração

### 🔧 Considerações

1. **Dependência Externa:** Requer que a API externa esteja disponível
2. **Latência de Rede:** Comunicação via HTTP adiciona latência
3. **Configuração:** Necessário configurar URL e timeout da API externa

## Monitoramento

### Métricas Importantes

- Taxa de sucesso da API externa
- Tempo de resposta médio
- Número de erros por tipo
- Disponibilidade do serviço

### Alertas Recomendados

- API externa indisponível
- Timeout frequente
- Taxa de erro alta
- Tempo de resposta elevado

## Troubleshooting

### Problemas Comuns

1. **API Externa Indisponível**
   - Verificar se o serviço está rodando
   - Verificar URL de configuração
   - Testar conectividade de rede

2. **Timeout de Processamento**
   - Aumentar `EXTERNAL_EXTRACTOR_TIMEOUT`
   - Verificar tamanho dos arquivos
   - Otimizar API externa

3. **Erro de Autenticação**
   - Verificar chaves de API
   - Verificar headers de autenticação
   - Verificar configuração de CORS

### Comandos de Diagnóstico

```bash
# Verificar saúde
curl -X GET "http://localhost:3001/api/files/external-api/health" \
  -H "X-API-Key: your-api-key"

# Testar conexão
curl -X GET "http://localhost:3001/api/files/external-api/test-connection" \
  -H "X-API-Key: your-api-key"

# Executar testes completos
node test-external-api.js
```

## Migração

### Checklist de Migração

- [ ] Configurar variáveis de ambiente
- [ ] Instalar dependências atualizadas
- [ ] Testar conectividade com API externa
- [ ] Executar testes de integração
- [ ] Monitorar logs de erro
- [ ] Verificar performance

### Rollback

Em caso de problemas, é possível reverter para a implementação anterior:
1. Restaurar extractors antigos
2. Reinstalar dependências removidas
3. Reverter ContentExtractorFactory
4. Atualizar FileService

## Futuras Melhorias

- [ ] Cache de resultados da API externa
- [ ] Retry automático com backoff exponencial
- [ ] Múltiplos provedores de API externa
- [ ] Métricas de performance em tempo real
- [ ] Interface de administração para monitoramento
