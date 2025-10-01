# Configuração da API OpenAI

## Problema Identificado
As respostas estão vindo "mockadas" porque a chave da API da OpenAI não está configurada.

## Solução

### 1. Criar arquivo .env
Crie um arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 2. Obter chave da API OpenAI
1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Faça login na sua conta
3. Vá para "API Keys" no menu lateral
4. Clique em "Create new secret key"
5. Copie a chave gerada (começa com `sk-`)

### 3. Configurar a chave
Substitua `sk-your-actual-openai-api-key-here` pela sua chave real no arquivo `.env`.

### 4. Reiniciar o servidor
Após configurar a chave, reinicie o servidor backend:

```bash
cd backend
npm run dev
```

## Verificação
Após configurar, você verá nos logs do servidor:
- `OpenAI API Key configured: true`
- `API Key length: [número de caracteres]`

Se ainda houver problemas, verifique se:
1. O arquivo `.env` está na pasta `backend/`
2. A chave está correta e ativa
3. Você tem créditos na conta OpenAI
4. O servidor foi reiniciado após a configuração
