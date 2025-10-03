# Teste do Processador de Imagens

Este arquivo contém exemplos de como testar o processador de imagens integrado ao ChatGPT.

## Iniciar o Servidor

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## Testes com cURL

### 1. Health Check do Serviço de Imagens

```bash
curl -X GET http://localhost:3000/api/images/health
```

### 2. Validação de Base64

```bash
curl -X POST http://localhost:3000/api/images/validate-base64 \
  -H "Content-Type: application/json" \
  -d '{
    "base64Data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }'
```

### 3. Processamento de Imagem (Exemplo com imagem pequena)

```bash
curl -X POST http://localhost:3000/api/images/process-image \
  -H "Content-Type: application/json" \
  -d '{
    "base64Data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "filename": "teste.png"
  }'
```

## Testes com JavaScript/Node.js

```javascript
const axios = require('axios');

async function testImageProcessing() {
  try {
    // 1. Health check
    console.log('=== HEALTH CHECK ===');
    const healthResponse = await axios.get('http://localhost:3000/api/images/health');
    console.log('Health Status:', healthResponse.data);

    // 2. Validar base64
    console.log('\n=== VALIDAÇÃO BASE64 ===');
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const validateResponse = await axios.post('http://localhost:3000/api/images/validate-base64', {
      base64Data
    });
    console.log('Validação:', validateResponse.data);

    // 3. Processar imagem
    console.log('\n=== PROCESSAMENTO DE IMAGEM ===');
    const processResponse = await axios.post('http://localhost:3000/api/images/process-image', {
      base64Data: `data:image/png;base64,${base64Data}`,
      filename: 'teste.png'
    });
    console.log('Resultado:', processResponse.data);

  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

testImageProcessing();
```

## Testes com Postman

### Collection JSON para importar no Postman:

```json
{
  "info": {
    "name": "Image Processing API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/images/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "images", "health"]
        }
      }
    },
    {
      "name": "Validate Base64",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"base64Data\": \"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/images/validate-base64",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "images", "validate-base64"]
        }
      }
    },
    {
      "name": "Process Image",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"base64Data\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==\",\n  \"filename\": \"teste.png\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/images/process-image",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "images", "process-image"]
        }
      }
    }
  ]
}
```

## Cenários de Teste

### 1. Imagem com Texto
- Use uma imagem que contenha texto legível
- Verifique se o texto é extraído corretamente
- Confirme as métricas de confiança

### 2. Imagem sem Texto
- Use uma imagem sem texto (ex: foto de paisagem)
- Verifique se retorna mensagem "Nenhum texto foi identificado"

### 3. Base64 Inválido
- Teste com dados base64 malformados
- Verifique se retorna erro apropriado

### 4. Dados Vazios
- Teste sem fornecer base64Data
- Verifique validação de entrada

## Integração com ChatGPT

Para integrar com ChatGPT, use o endpoint `/api/images/process-image` com:

```javascript
// Exemplo de integração
const response = await fetch('http://localhost:3000/api/images/process-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    base64Data: imageBase64, // Imagem em base64 do ChatGPT
    filename: 'chatgpt-image.png'
  })
});

const result = await response.json();

if (result.success) {
  if (result.data.content && result.data.content.trim().length > 0) {
    console.log('Texto extraído:', result.data.content);
  } else {
    console.log('Nenhum texto encontrado na imagem');
  }
} else {
  console.error('Erro:', result.error);
}
```

## Logs do Servidor

Durante o processamento, o servidor exibirá logs detalhados:

```
=== PROCESSAMENTO DE IMAGEM INICIADO ===
Tamanho dos dados base64: 1234 caracteres
Iniciando processamento OCR da imagem...
OCR Progress: 25%
OCR Progress: 50%
OCR Progress: 75%
OCR Progress: 100%
OCR concluído. Confiança: 85%
Texto extraído: 150 caracteres
=== PROCESSAMENTO DE IMAGEM CONCLUÍDO ===
```

## Troubleshooting

### Erro: "Falha ao inicializar processador OCR"
- Verifique se o Tesseract.js está instalado corretamente
- Confirme se o arquivo `por.traineddata` está presente

### Erro: "Dados base64 inválidos"
- Verifique se o base64 está correto
- Use o endpoint de validação primeiro

### Performance lenta
- Imagens muito grandes podem demorar para processar
- Considere redimensionar a imagem antes do envio
