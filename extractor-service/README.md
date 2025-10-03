# Extractor Service API

API em Node.js com TypeScript para extração de conteúdo de arquivos PDF, Excel e TXT.

## 🚀 Funcionalidades

- **Extração de PDF**: Extrai texto e metadados de arquivos PDF
- **Extração de Excel**: Extrai dados de planilhas Excel (.xlsx, .xls)
- **Extração de TXT**: Extrai conteúdo de arquivos de texto com detecção automática de encoding
- **API RESTful**: Endpoints bem estruturados com documentação
- **Validação de arquivos**: Verificação de tipo e extensão
- **Tratamento de erros**: Sistema robusto de tratamento de erros
- **TypeScript**: Tipagem estática para melhor desenvolvimento

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd extractor-service
```

2. Instale as dependências:
```bash
npm install
```

3. Compile o TypeScript:
```bash
npm run build
```

4. Inicie o servidor:
```bash
npm start
```

Para desenvolvimento com hot reload:
```bash
npm run dev
```

## 📡 Endpoints da API

### Base URL
```
http://localhost:3000
```

### 1. Extrair Conteúdo
**POST** `/api/extract`

Extrai o conteúdo de um arquivo enviado.

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**
- `file`: Arquivo a ser processado (obrigatório)
- `fileType`: Tipo do arquivo - `pdf`, `excel` ou `txt` (obrigatório)

**Exemplo de requisição:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@documento.pdf" \
  -F "fileType=pdf"
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "data": {
    "filename": "documento.pdf",
    "fileType": "pdf",
    "content": {
      "text": "Conteúdo extraído do PDF...",
      "numpages": 3,
      "info": {
        "Title": "Título do Documento",
        "Author": "Autor"
      }
    },
    "metadata": {
      "size": 1024000,
      "pages": 3
    },
    "extractedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Conteúdo extraído com sucesso"
}
```

### 2. Tipos Suportados
**GET** `/api/supported-types`

Lista os tipos de arquivo suportados pela API.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "type": "pdf",
      "extensions": [".pdf"],
      "description": "Arquivos PDF"
    },
    {
      "type": "excel",
      "extensions": [".xlsx", ".xls"],
      "description": "Planilhas Excel"
    },
    {
      "type": "txt",
      "extensions": [".txt"],
      "description": "Arquivos de texto"
    }
  ],
  "message": "Tipos de arquivo suportados"
}
```

### 3. Health Check
**GET** `/api/health`

Verifica o status do serviço.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600
  },
  "message": "Serviço funcionando corretamente"
}
```

## 📁 Estrutura do Projeto

```
extractor-service/
├── src/
│   ├── middleware/
│   │   ├── errorHandler.ts      # Tratamento de erros
│   │   └── upload.ts            # Middleware de upload
│   ├── routes/
│   │   └── extraction.ts        # Rotas da API
│   ├── services/
│   │   └── ExtractionService.ts # Serviço de extração
│   ├── types/
│   │   └── index.ts             # Definições TypeScript
│   └── server.ts                # Servidor principal
├── uploads/                     # Diretório temporário de uploads
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
NODE_ENV=development
```

### Limites de Upload
- **Tamanho máximo**: 10MB por arquivo
- **Arquivos simultâneos**: 1 arquivo por requisição
- **Tipos suportados**: PDF, Excel (.xlsx, .xls), TXT

## 🧪 Testando a API

### Usando curl

**PDF:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@documento.pdf" \
  -F "fileType=pdf"
```

**Excel:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@planilha.xlsx" \
  -F "fileType=excel"
```

**TXT:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -F "file=@texto.txt" \
  -F "fileType=txt"
```

### Usando Postman

1. Configure o método como `POST`
2. URL: `http://localhost:3000/api/extract`
3. Na aba "Body", selecione "form-data"
4. Adicione os campos:
   - `file`: Selecione o arquivo
   - `fileType`: Digite o tipo (pdf, excel ou txt)

## 🚨 Tratamento de Erros

A API retorna erros estruturados no seguinte formato:

```json
{
  "success": false,
  "error": "Descrição do erro",
  "message": "Mensagem adicional"
}
```

**Códigos de status comuns:**
- `400`: Erro de validação (arquivo não enviado, tipo inválido, etc.)
- `404`: Rota não encontrada
- `500`: Erro interno do servidor

## 🛡️ Segurança

- **Helmet**: Headers de segurança HTTP
- **CORS**: Configuração de Cross-Origin Resource Sharing
- **Validação de arquivos**: Verificação de tipo e extensão
- **Limites de upload**: Proteção contra uploads maliciosos

## 📝 Logs

A API utiliza Morgan para logging de requisições HTTP. Os logs incluem:
- Método HTTP
- URL da requisição
- Status da resposta
- Tempo de processamento
- Tamanho da resposta

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas, abra uma issue no repositório ou entre em contato através dos canais oficiais.
