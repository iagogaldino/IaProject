#!/bin/bash

# Script para parar todos os serviços do IaProject
echo "🛑 Parando IaProject - Sistema de IA Municipal"
echo "=============================================="

# Parar e remover containers
echo "🐳 Parando containers..."
docker-compose down

# Remover volumes (opcional - descomente se quiser limpar dados)
# echo "🗑️ Removendo volumes..."
# docker-compose down -v

# Remover imagens (opcional - descomente se quiser limpar imagens)
# echo "🗑️ Removendo imagens..."
# docker-compose down --rmi all

echo "✅ Serviços parados com sucesso!"
echo ""
echo "💡 Dicas:"
echo "   • Para remover volumes: docker-compose down -v"
echo "   • Para remover imagens: docker-compose down --rmi all"
echo "   • Para limpar tudo: docker system prune -a"
