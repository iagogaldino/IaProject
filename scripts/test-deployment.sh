#!/bin/bash

# Script para testar o deployment do IaProject
echo "🧪 Testando Deployment - IaProject"
echo "=================================="

# Função para testar conectividade
test_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Testando $name em $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $name está respondendo!"
            return 0
        fi
        
        echo "   Tentativa $attempt/$max_attempts - Aguardando..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $name não está respondendo após $max_attempts tentativas"
    return 1
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando"
    exit 1
fi

# Verificar se containers estão rodando
echo "🐳 Verificando containers..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Nenhum container está rodando"
    echo "💡 Execute: docker-compose up -d"
    exit 1
fi

# Testar serviços
echo ""
echo "🌐 Testando conectividade dos serviços..."

# Testar App Backend
if test_service "App Backend" "http://localhost:3000"; then
    echo "   ✅ App Backend API funcionando"
else
    echo "   ❌ App Backend API com problemas"
fi

# Testar IA Backend
if test_service "IA Backend" "http://localhost:3001"; then
    echo "   ✅ IA Backend API funcionando"
else
    echo "   ❌ IA Backend API com problemas"
fi

# Testar App Frontend
if test_service "App Frontend" "http://localhost:4200"; then
    echo "   ✅ App Frontend funcionando"
else
    echo "   ❌ App Frontend com problemas"
fi

# Testar IA Frontend
if test_service "IA Frontend" "http://localhost:4201"; then
    echo "   ✅ IA Frontend funcionando"
else
    echo "   ❌ IA Frontend com problemas"
fi

# Testar banco de dados
echo ""
echo "🗄️ Testando banco de dados..."
if docker-compose exec -T postgres pg_isready -U dev -d app_db > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL funcionando"
else
    echo "   ❌ PostgreSQL com problemas"
fi

# Resumo final
echo ""
echo "📊 Resumo do teste:"
docker-compose ps

echo ""
echo "🌐 URLs para acesso:"
echo "   • App Frontend: http://localhost:4200"
echo "   • App Backend: http://localhost:3000"
echo "   • IA Frontend: http://localhost:4201"
echo "   • IA Backend: http://localhost:3001"
echo "   • Database: localhost:5432"

echo ""
echo "✅ Teste concluído!"
