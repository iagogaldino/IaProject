@echo off
REM Script para criar agente especialista em análise de conteúdo (Windows)
REM Configurações
set API_URL=http://localhost:3000/api
set API_KEY=your-api-key-here

echo 🤖 Criando agente especialista em análise de conteúdo...

REM Criar o agente especialista
curl -X POST "%API_URL%/agents" ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: %API_KEY%" ^
  -d "{\"name\": \"Agente Especialista em Análise de Conteúdo\", \"description\": \"Agente especializado em análise de conteúdo com IA, identificação de temas, melhoria de texto e geração de tags. Utiliza OpenAI para processar e enriquecer metadados de arquivos.\", \"status\": \"active\", \"canCommunicateWith\": [], \"databaseAccess\": {\"enabled\": true, \"allowedCollections\": [\"fileuploads\", \"agents\"], \"allowedOperations\": [\"read\", \"write\", \"update\"], \"queryLimits\": {\"maxResults\": 1000, \"timeout\": 30000}}, \"fileAccess\": {\"enabled\": true, \"allowedFileTypes\": [\"txt\", \"pdf\", \"doc\", \"docx\", \"csv\", \"xlsx\", \"json\", \"md\"], \"maxFileSize\": 10485760, \"allowedOperations\": [\"read\", \"upload\", \"delete\"], \"storagePath\": \"/uploads\"}}" ^
  -w "\n\nStatus Code: %%{http_code}\n"

echo.
echo ✅ Agente especialista criado com sucesso!
echo 📋 Características do agente:
echo    • Nome: Agente Especialista em Análise de Conteúdo
echo    • Especialização: Análise de conteúdo com IA
echo    • Tipos de arquivo suportados: txt, pdf, doc, docx, csv, xlsx, json, md
echo    • Tamanho máximo: 10MB
echo    • Operações: leitura, upload, exclusão
echo    • Acesso ao banco: habilitado para metadados
