#!/bin/bash

# Script para criar agente especialista em análise de conteúdo
# Configurações
API_URL="http://localhost:3000/api"
API_KEY="your-api-key-here"  # Substitua pela sua API key

echo "🤖 Criando agente especialista em análise de conteúdo..."

# Criar o agente especialista
curl -X POST "${API_URL}/agents" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "name": "Agente Especialista em Análise de Conteúdo",
    "description": "Agente especializado em análise de conteúdo com IA, identificação de temas, melhoria de texto e geração de tags. Utiliza OpenAI para processar e enriquecer metadados de arquivos.",
    "status": "active",
    "canCommunicateWith": [],
    "databaseAccess": {
      "enabled": true,
      "allowedCollections": ["fileuploads", "agents"],
      "allowedOperations": ["read", "write", "update"],
      "queryLimits": {
        "maxResults": 1000,
        "timeout": 30000
      }
    },
    "fileAccess": {
      "enabled": true,
      "allowedFileTypes": ["txt", "pdf", "doc", "docx", "csv", "xlsx", "json", "md"],
      "maxFileSize": 10485760,
      "allowedOperations": ["read", "upload", "delete"],
      "storagePath": "/uploads"
    }
  }' \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s

echo "\n✅ Agente especialista criado com sucesso!"
echo "📋 Características do agente:"
echo "   • Nome: Agente Especialista em Análise de Conteúdo"
echo "   • Especialização: Análise de conteúdo com IA"
echo "   • Tipos de arquivo suportados: txt, pdf, doc, docx, csv, xlsx, json, md"
echo "   • Tamanho máximo: 10MB"
echo "   • Operações: leitura, upload, exclusão"
echo "   • Acesso ao banco: habilitado para metadados"
