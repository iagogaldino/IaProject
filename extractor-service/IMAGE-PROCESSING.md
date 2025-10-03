# Processador de Imagens com OCR

Este documento descreve o processador de imagens integrado ao ChatGPT que recebe imagens em formato base64 e extrai texto usando OCR (Optical Character Recognition).

## Funcionalidades

- **Processamento de imagens base64**: Recebe imagens codificadas em base64
- **OCR com Tesseract.js**: Extração de texto usando reconhecimento óptico de caracteres
- **Limpeza automática de texto**: Remove caracteres de controle e normaliza espaços
- **Métricas de confiança**: Retorna nível de confiança do OCR
- **Validação de dados**: Verifica se o base64 é válido antes do processamento

## Endpoints Disponíveis

### POST /api/images/process-image

Processa uma imagem base64 e extrai texto usando OCR.

**Request Body:**
```json
{
  "base64Data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "filename": "documento.png" // opcional
}
```

**Response (Sucesso com texto):**
```json
{
  "success": true,
  "data": {
    "filename": "documento.png",
    "fileType": "image",
    "content": "Texto extraído da imagem...",
    "metadata": {
      "size": 12345,
      "confidence": 85,
      "characters": 150,
      "words": 25,
      "lines": 3
    },
    "extractedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Texto extraído da imagem com sucesso"
}
```

**Response (Sem texto encontrado):**
```json
{
  "success": true,
  "data": {
    "filename": "imagem.png",
    "fileType": "image",
    "content": "",
    "metadata": {
      "size": 12345,
      "confidence": 0,
      "characters": 0,
      "words": 0,
      "lines": 0
    },
    "extractedAt": "2024-01-15T10:30:00.000Z",
    "message": "Nenhum texto foi identificado na imagem"
  },
  "message": "Processamento concluído - nenhum texto encontrado"
}
```

### POST /api/images/validate-base64

Valida se os dados base64 são válidos antes do processamento.

**Request Body:**
```json
{
  "base64Data": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "size": 12345,
    "estimatedImageSize": "12 KB"
  },
  "message": "Dados base64 válidos"
}
```

### GET /api/images/health

Verifica o status do serviço de processamento de imagens.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "service": "Image Processing",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "features": [
      "OCR com Tesseract.js",
      "Suporte a base64",
      "Limpeza automática de texto",
      "Métricas de confiança"
    ]
  },
  "message": "Serviço de processamento de imagens funcionando"
}
```

## Exemplos de Uso

### Exemplo 1: Processamento básico

```bash
curl -X POST http://localhost:3000/api/images/process-image \
  -H "Content-Type: application/json" \
  -d '{
    "base64Data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "filename": "documento.png"
  }'
```

### Exemplo 2: Validação de base64

```bash
curl -X POST http://localhost:3000/api/images/validate-base64 \
  -H "Content-Type: application/json" \
  -d '{
    "base64Data": "iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

## Características Técnicas

- **OCR Engine**: Tesseract.js com idioma português
- **Formato de entrada**: Base64 (com ou sem prefixo data:image)
- **Limpeza de texto**: Remove caracteres de controle, normaliza espaços
- **Métricas**: Confiança, caracteres, palavras, linhas
- **Validação**: Verifica formato base64 antes do processamento

## Tratamento de Erros

- **Base64 inválido**: Retorna erro 400 com mensagem específica
- **Falha no OCR**: Retorna erro 500 com detalhes do erro
- **Imagem sem texto**: Retorna sucesso com conteúdo vazio e mensagem informativa

## Limitações

- Processamento limitado a imagens em formato base64
- OCR otimizado para português
- Tamanho máximo de 10MB para dados base64 (configurável)
- Dependência do Tesseract.js para funcionamento

## Integração com ChatGPT

Este processador foi desenvolvido especificamente para integração com ChatGPT, permitindo:

1. **Recebimento de imagens**: ChatGPT pode enviar imagens em base64
2. **Extração de texto**: OCR processa a imagem e extrai texto
3. **Resposta estruturada**: Retorna texto limpo e organizado
4. **Feedback claro**: Informa quando nenhum texto é encontrado
