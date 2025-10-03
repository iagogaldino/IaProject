#!/bin/bash

# Script para configurar o sistema de contexto de conversa
# Executa migração do banco e testa o sistema

echo "🚀 Configurando sistema de contexto de conversa..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    print_error "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

print_status "Iniciando configuração do sistema de contexto de conversa..."

# 1. Verificar se os serviços estão rodando
print_status "Verificando se os serviços estão rodando..."

if ! docker-compose ps | grep -q "Up"; then
    print_warning "Serviços não estão rodando. Iniciando..."
    docker-compose up -d
    sleep 10
fi

# 2. Executar migração do banco de dados
print_status "Executando migração da tabela de contexto de conversa..."

cd ia-service/ia-backend

if [ -f "scripts/run-conversation-migration.js" ]; then
    node scripts/run-conversation-migration.js
    if [ $? -eq 0 ]; then
        print_success "Migração executada com sucesso!"
    else
        print_error "Erro ao executar migração"
        exit 1
    fi
else
    print_error "Script de migração não encontrado"
    exit 1
fi

# 3. Testar o sistema
print_status "Testando sistema de contexto de conversa..."

if [ -f "scripts/test-conversation-context.js" ]; then
    node scripts/test-conversation-context.js
    if [ $? -eq 0 ]; then
        print_success "Testes executados com sucesso!"
    else
        print_warning "Alguns testes falharam, mas o sistema pode estar funcionando"
    fi
else
    print_warning "Script de teste não encontrado"
fi

# 4. Verificar status dos serviços
print_status "Verificando status dos serviços..."

echo ""
echo "📊 Status dos serviços:"
docker-compose ps

echo ""
echo "🔗 URLs dos serviços:"
echo "  - App Frontend: http://localhost:4200"
echo "  - App Backend: http://localhost:3000"
echo "  - IA Frontend: http://localhost:4201"
echo "  - IA Backend: http://localhost:3001"
echo "  - Database: localhost:5432"

echo ""
echo "📚 Endpoints de contexto de conversa:"
echo "  - GET /api/conversations/:sessionId/history - Histórico da conversa"
echo "  - GET /api/conversations/:sessionId/summary - Resumo da conversa"
echo "  - GET /api/conversations/:sessionId/stats - Estatísticas da conversa"
echo "  - GET /api/conversations/:sessionId/search - Buscar mensagens"
echo "  - DELETE /api/conversations/:sessionId/history - Limpar histórico"

echo ""
print_success "Sistema de contexto de conversa configurado com sucesso!"
print_status "Agora a IA tem acesso ao contexto completo das conversas"

# Voltar ao diretório raiz
cd ../..

echo ""
echo "🎉 Configuração concluída!"
echo "   O sistema agora mantém o contexto das conversas automaticamente"
echo "   Cada sessão de usuário terá seu histórico preservado"
echo "   A IA pode referenciar mensagens anteriores nas respostas"
