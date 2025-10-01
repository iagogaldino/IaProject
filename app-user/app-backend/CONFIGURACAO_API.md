# 🔑 Configuração da Chave da API OpenAI

## ❌ PROBLEMA ATUAL
A aplicação está retornando erro 401 porque a chave da API da OpenAI não está configurada.

## ✅ SOLUÇÃO

### 1. Obter Chave da API OpenAI
1. Acesse: https://platform.openai.com/account/api-keys
2. Faça login na sua conta OpenAI
3. Clique em "Create new secret key"
4. Copie a chave gerada (começa com `sk-`)

### 2. Configurar a Chave
**Opção A - Arquivo config.env (Recomendado):**
1. Abra o arquivo `backend/config.env`
2. Substitua `sk-your-openai-api-key-here` pela sua chave real
3. Salve o arquivo

**Opção B - Variável de Ambiente do Sistema:**
```bash
# Windows (PowerShell)
$env:OPENAI_API_KEY="sk-sua-chave-aqui"

# Windows (CMD)
set OPENAI_API_KEY=sk-sua-chave-aqui

# Linux/Mac
export OPENAI_API_KEY="sk-sua-chave-aqui"
```

### 3. Reiniciar o Servidor
Após configurar a chave, reinicie o servidor:
```bash
cd backend
npm run dev
```

### 4. Verificar se Funcionou
Nos logs do servidor você deve ver:
- `OpenAI API Key configured: true`
- `API Key length: [número de caracteres]`

## 🚨 IMPORTANTE
- **NUNCA** commite a chave da API no Git
- Mantenha a chave segura e privada
- A chave deve começar com `sk-`
- Certifique-se de ter créditos na conta OpenAI
