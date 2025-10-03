# Processamento de Páginas de PDF com IA

Este documento descreve os endpoints específicos para processar imagens de páginas de PDF extraídas anteriormente.

## 🎯 Funcionalidades

- **Processamento de página específica**: Processa uma página individual de PDF
- **Processamento de sessão completa**: Processa múltiplas páginas de uma sessão
- **Listagem de páginas**: Lista todas as páginas disponíveis de uma sessão
- **Validação de sessão**: Verifica se a sessão e página existem

## 📋 Endpoints Disponíveis

### 1. POST /api/images/process-pdf-page

Processa uma página específica de PDF usando OCR.

**Request Body:**
```json
{
  "sessionId": "1759498898296_2z4w0io16ug_teste",
  "pageNumber": 1,
  "filename": "pagina-1.png" // opcional
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "data": {
    "filename": "page-1.png",
    "fileType": "image",
    "content": "Texto extraído da página...",
    "metadata": {
      "size": 12345,
      "confidence": 85,
      "characters": 150,
      "words": 25,
      "lines": 3
    },
    "extractedAt": "2024-01-15T10:30:00.000Z",
    "sessionInfo": {
      "sessionId": "1759498898296_2z4w0io16ug_teste",
      "pageNumber": 1,
      "imagePath": "/path/to/page-1.png",
      "sessionPath": "/path/to/session"
    }
  },
  "message": "Página de PDF processada com sucesso"
}
```

### 2. GET /api/images/pdf-sessions/:sessionId/pages

Lista todas as páginas disponíveis de uma sessão.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "1759498898296_2z4w0io16ug_teste",
    "sessionPath": "/path/to/session",
    "totalPages": 2,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "modifiedAt": "2024-01-15T10:30:00.000Z",
    "pages": [
      {
        "pageNumber": 1,
        "filename": "page-1.png",
        "path": "/path/to/page-1.png",
        "size": 12345,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "modifiedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "pageNumber": 2,
        "filename": "page-2.png",
        "path": "/path/to/page-2.png",
        "size": 12345,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "modifiedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "message": "2 páginas encontradas na sessão 1759498898296_2z4w0io16ug_teste"
}
```

### 3. POST /api/images/process-pdf-session

Processa múltiplas páginas de uma sessão (ou todas se não especificado).

**Request Body:**
```json
{
  "sessionId": "1759498898296_2z4w0io16ug_teste",
  "pageNumbers": [1, 2], // opcional - se não especificado, processa todas
  "filename": "documento" // opcional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "1759498898296_2z4w0io16ug_teste",
    "totalPages": 2,
    "processedPages": 2,
    "errorPages": 0,
    "results": [
      {
        "pageNumber": 1,
        "filename": "page-1.png",
        "fileType": "image",
        "content": "Texto da página 1...",
        "metadata": {
          "size": 12345,
          "confidence": 85,
          "characters": 150,
          "words": 25,
          "lines": 3
        },
        "extractedAt": "2024-01-15T10:30:00.000Z",
        "sessionInfo": {
          "sessionId": "1759498898296_2z4w0io16ug_teste",
          "pageNumber": 1,
          "imagePath": "/path/to/page-1.png"
        }
      },
      {
        "pageNumber": 2,
        "filename": "page-2.png",
        "fileType": "image",
        "content": "Texto da página 2...",
        "metadata": {
          "size": 12345,
          "confidence": 90,
          "characters": 200,
          "words": 35,
          "lines": 5
        },
        "extractedAt": "2024-01-15T10:30:00.000Z",
        "sessionInfo": {
          "sessionId": "1759498898296_2z4w0io16ug_teste",
          "pageNumber": 2,
          "imagePath": "/path/to/page-2.png"
        }
      }
    ]
  },
  "message": "Sessão 1759498898296_2z4w0io16ug_teste processada: 2/2 páginas com sucesso"
}
```

## 🧪 Exemplos de Uso

### Exemplo 1: Processar página específica

```bash
curl -X POST http://localhost:3000/api/images/process-pdf-page \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "1759498898296_2z4w0io16ug_teste",
    "pageNumber": 1,
    "filename": "primeira-pagina.png"
  }'
```

### Exemplo 2: Listar páginas de uma sessão

```bash
curl -X GET http://localhost:3000/api/images/pdf-sessions/1759498898296_2z4w0io16ug_teste/pages
```

### Exemplo 3: Processar todas as páginas de uma sessão

```bash
curl -X POST http://localhost:3000/api/images/process-pdf-session \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "1759498898296_2z4w0io16ug_teste"
  }'
```

### Exemplo 4: Processar páginas específicas

```bash
curl -X POST http://localhost:3000/api/images/process-pdf-session \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "1759498898296_2z4w0io16ug_teste",
    "pageNumbers": [1, 3],
    "filename": "documento"
  }'
```

## 🔍 Tratamento de Erros

### Sessão não encontrada:
```json
{
  "success": false,
  "error": "Sessão 1759498898296_2z4w0io16ug_teste não encontrada"
}
```

### Página não encontrada:
```json
{
  "success": false,
  "error": "Página 5 não encontrada na sessão 1759498898296_2z4w0io16ug_teste"
}
```

### Parâmetros obrigatórios:
```json
{
  "success": false,
  "error": "sessionId é obrigatório"
}
```

## 📊 Logs do Servidor

Durante o processamento, o servidor exibirá logs detalhados:

```
=== PROCESSAMENTO DE PÁGINA PDF INICIADO ===
Sessão: 1759498898296_2z4w0io16ug_teste
Página: 1
Caminho: /path/to/page-1.png
Iniciando processamento OCR da imagem...
OCR Progress: 25%
OCR Progress: 50%
OCR Progress: 75%
OCR Progress: 100%
OCR concluído. Confiança: 85%
Texto extraído: 150 caracteres
=== PROCESSAMENTO DE PÁGINA PDF CONCLUÍDO ===
```

## 🚀 Integração com ChatGPT

Para integrar com ChatGPT, use os endpoints específicos:

```javascript
// Processar página específica
const response = await fetch('http://localhost:3000/api/images/process-pdf-page', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: '1759498898296_2z4w0io16ug_teste',
    pageNumber: 1,
    filename: 'pagina-1.png'
  })
});

const result = await response.json();

if (result.success) {
  if (result.data.content && result.data.content.trim().length > 0) {
    console.log('Texto extraído:', result.data.content);
    console.log('Confiança:', result.data.metadata.confidence + '%');
  } else {
    console.log('Nenhum texto encontrado na página');
  }
}
```

## 📁 Estrutura de Diretórios

```
uploads/pdf-images/
├── 1759498898296_2z4w0io16ug_teste/
│   ├── page-1.png
│   └── page-2.png
├── 1759499008840_bnhutrcnq1g_teste/
│   ├── page-1.png
│   └── page-2.png
└── 1759499080290_t7xu6npft5n_teste/
    ├── page-1.png
    └── page-2.png
```

## ⚡ Performance

- **Processamento individual**: ~2-5 segundos por página
- **Processamento em lote**: Processa páginas sequencialmente
- **Memória**: Otimizado para processar uma página por vez
- **Logs**: Acompanhamento detalhado do progresso

## 🔧 Configurações

- **Tamanho máximo**: Limitado pelo tamanho das imagens PNG
- **Formatos suportados**: PNG (gerado pela extração de PDF)
- **OCR**: Tesseract.js com idioma português
- **Limpeza**: Automática de caracteres de controle
