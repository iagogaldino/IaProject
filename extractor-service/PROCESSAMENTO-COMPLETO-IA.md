# 🤖 Processamento Completo com IA - Endpoint /api/extract

## 🎯 Nova Funcionalidade

O endpoint `/api/extract` agora suporta um parâmetro `processWithAI=true` que executa um **pipeline completo automatizado**:

**PDF → Extração de Imagens → OCR com IA → Texto Estruturado**

## 🚀 Como Usar

### **Processamento Normal (sem IA):**
```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@documento.pdf" \
  -F "fileType=pdf"
```

### **Processamento Completo com IA:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@documento.pdf" \
  -F "fileType=pdf" \
  -F "processWithAI=true"
```

## 📊 Pipeline Automatizado

### **Passo 1: Extração de Imagens**
- Converte PDF em imagens PNG
- Cria sessão única para o documento
- Salva imagens em `uploads/pdf-images/{sessionId}/`

### **Passo 2: Processamento OCR**
- Processa cada página com Tesseract.js
- Aplica limpeza automática de texto
- Calcula métricas de confiança

### **Passo 3: Agregação de Resultados**
- Combina texto de todas as páginas
- Calcula estatísticas finais
- Retorna resultado estruturado

## 📋 Resposta Estruturada

### **Sucesso com IA:**
```json
{
  "success": true,
  "data": {
    "filename": "documento.pdf",
    "fileType": "pdf-ai-processed",
    "content": "Texto completo extraído de todas as páginas...",
    "metadata": {
      "size": 1234567,
      "pages": 3,
      "processedPages": 3,
      "errorPages": 0,
      "averageConfidence": 87,
      "totalCharacters": 1500,
      "totalWords": 250,
      "totalLines": 45,
      "sessionId": "1759498898296_2z4w0io16ug_teste",
      "processedAt": "2024-01-15T10:30:00.000Z"
    },
    "extractedAt": "2024-01-15T10:30:00.000Z",
    "processedPages": [
      {
        "pageNumber": 1,
        "content": "Texto da página 1...",
        "metadata": {
          "confidence": 85,
          "characters": 500,
          "words": 80,
          "lines": 15
        },
        "sessionInfo": {
          "sessionId": "1759498898296_2z4w0io16ug_teste",
          "pageNumber": 1,
          "imagePath": "/path/to/page-1.png"
        }
      }
    ],
    "processingInfo": {
      "method": "PDF → Images → OCR → Text",
      "steps": [
        "1. Extração de imagens do PDF",
        "2. Processamento OCR de cada página",
        "3. Limpeza e estruturação do texto",
        "4. Agregação de resultados"
      ]
    }
  },
  "message": "Processamento completo com IA concluído: 3/3 páginas processadas com sucesso"
}
```

### **Sem Texto Encontrado:**
```json
{
  "success": true,
  "data": {
    "filename": "documento.pdf",
    "fileType": "pdf-ai-processed",
    "content": "",
    "metadata": {
      "pages": 2,
      "processedPages": 0,
      "errorPages": 0,
      "averageConfidence": 0,
      "totalCharacters": 0,
      "totalWords": 0,
      "totalLines": 0
    },
    "message": "Nenhum texto foi identificado nas imagens"
  }
}
```

## 🧪 Exemplos de Teste

### **1. Teste Básico:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@teste.pdf" \
  -F "fileType=pdf" \
  -F "processWithAI=true"
```

### **2. Teste com JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('fileType', 'pdf');
formData.append('processWithAI', 'true');

const response = await fetch('http://localhost:3000/api/extract', {
  method: 'POST',
  body: formData
});

const result = await response.json();

if (result.success) {
  console.log('Texto extraído:', result.data.content);
  console.log('Confiança média:', result.data.metadata.averageConfidence + '%');
  console.log('Páginas processadas:', result.data.metadata.processedPages);
}
```

### **3. Teste com Postman:**
- **Method**: POST
- **URL**: `http://localhost:3000/api/extract`
- **Body**: form-data
  - `file`: [selecionar arquivo PDF]
  - `fileType`: `pdf`
  - `processWithAI`: `true`

## 📊 Logs do Servidor

Durante o processamento, o servidor exibirá logs detalhados:

```
=== PROCESSAMENTO COMPLETO COM IA INICIADO ===
Arquivo: documento.pdf
Tamanho: 1234567 bytes
📄 Passo 1: Extraindo imagens do PDF...
✅ Imagens extraídas: 3 páginas
🤖 Passo 2: Processando imagens com IA...
📄 Páginas encontradas: 1, 2, 3
🔄 Processando página 1...
✅ Página 1: 500 caracteres, confiança 85%
🔄 Processando página 2...
✅ Página 2: 600 caracteres, confiança 90%
🔄 Processando página 3...
✅ Página 3: 400 caracteres, confiança 85%
=== PROCESSAMENTO COMPLETO COM IA CONCLUÍDO ===
📊 Resultado final: 3/3 páginas processadas
📝 Texto total: 1500 caracteres, 250 palavras
🎯 Confiança média: 87%
```

## ⚡ Vantagens do Processamento Completo

### **✅ Automatização Total:**
- Um único endpoint para todo o processo
- Não precisa gerenciar sessões manualmente
- Pipeline completo em uma chamada

### **✅ Resultado Estruturado:**
- Texto agregado de todas as páginas
- Métricas detalhadas por página e totais
- Informações de processamento

### **✅ Tratamento de Erros:**
- Processa páginas válidas mesmo com erros
- Relatório detalhado de sucessos/falhas
- Logs detalhados para debugging

### **✅ Flexibilidade:**
- Funciona com qualquer PDF
- Adapta-se ao número de páginas
- Processamento otimizado

## 🔧 Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `file` | File | ✅ | Arquivo PDF para processar |
| `fileType` | String | ✅ | Deve ser `pdf` |
| `processWithAI` | String | ❌ | `true` para ativar IA |

## 🎯 Casos de Uso

### **1. Documentos Escaneados:**
- PDFs de documentos digitalizados
- Imagens com texto
- Documentos com layout complexo

### **2. Processamento em Lote:**
- Múltiplos PDFs automaticamente
- Extração de texto de documentos
- Análise de conteúdo

### **3. Integração com ChatGPT:**
- Upload direto de PDF
- Processamento automático
- Texto pronto para análise

## 🚀 Status: IMPLEMENTAÇÃO COMPLETA

O endpoint `/api/extract` agora suporta **processamento completo com IA**:

- ✅ **Parâmetro `processWithAI=true`** implementado
- ✅ **Pipeline automatizado** PDF → Imagens → OCR → Texto
- ✅ **Resposta estruturada** com métricas detalhadas
- ✅ **Tratamento de erros** robusto
- ✅ **Logs detalhados** para acompanhamento
- ✅ **Compatibilidade** com processamento normal

Agora você pode processar PDFs com IA em uma única chamada! 🎉
