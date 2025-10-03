#!/bin/bash

# Script para iniciar todos os serviços do IaProject
echo "🚀 Iniciando IaProject - Sistema de IA Municipal"
echo "=================================================="

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Verificar se docker-compose está disponível
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não está instalado."
    exit 1
fi

# Criar rede se não existir
echo "📡 Configurando rede..."
docker network create iaproject-network 2>/dev/null || echo "Rede já existe"

# Iniciar serviços
echo "🐳 Iniciando containers..."
docker-compose up -d --build

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos serviços
echo "📊 Status dos serviços:"
docker-compose ps

echo ""
echo "✅ Serviços iniciados com sucesso!"
echo ""
echo "🌐 Acesse os serviços:"
echo "   • App Frontend (Ionic): http://localhost:4200"
echo "   • App Backend API: http://localhost:3000"
echo "   • IA Frontend (Admin): http://localhost:4201"
echo "   • IA Backend API: http://localhost:3001"
echo "   • Database: localhost:5432"
echo ""
echo "📝 Para parar os serviços: docker-compose down"
echo "📝 Para ver logs: docker-compose logs -f [serviço]"
