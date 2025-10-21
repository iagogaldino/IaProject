#!/bin/bash

# Script para testar funcionalidade de embeddings usando curl
# Configuração
API_BASE_URL="http://localhost:3001/api"
API_KEY="your-api-key-for-external-access"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 TESTE DE EMBEDDINGS - COMANDOS CURL${NC}"
echo -e "${BLUE}===========================================${NC}\n"

# Função para fazer requisições
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}🔍 $description${NC}"
    echo -e "${BLUE}Endpoint: $method $endpoint${NC}"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$API_BASE_URL$endpoint" \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X GET "$API_BASE_URL$endpoint" \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json")
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Sucesso!${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo -e "${RED}❌ Erro na requisição${NC}"
    fi
    echo ""
}

# 1. Criar metadado de teste
echo -e "${BLUE}📝 1. CRIANDO METADADO DE TESTE${NC}"
echo "================================="

test_metadata='{
  "fileId": "test-curl-embedding-001",
  "agentId": "test-agent-curl-001",
  "theme": "Inteligência Artificial e Automação",
  "improvedContent": "Documento sobre implementação de sistemas de IA para automação de processos empresariais, incluindo machine learning, processamento de linguagem natural e análise preditiva de dados para otimização operacional.",
  "tags": ["inteligência artificial", "automação", "machine learning", "processamento", "análise preditiva", "otimização"],
  "analysis": {
    "summary": "Este documento apresenta uma análise detalhada sobre a implementação de tecnologias de inteligência artificial para automação de processos empresariais, explorando desde conceitos básicos até aplicações avançadas de machine learning e análise preditiva.",
    "keyTopics": ["machine learning", "processamento de linguagem natural", "automação de processos", "análise preditiva", "otimização operacional", "inteligência artificial"],
    "sentiment": "positivo",
    "confidence": 0.93,
    "language": "pt-BR"
  }
}'

make_request "POST" "/metadata" "$test_metadata" "Criando metadado de teste sobre IA e automação"

# Aguardar processamento
echo -e "${YELLOW}⏳ Aguardando processamento do embedding...${NC}"
sleep 3

# 2. Testar buscas de similaridade
echo -e "${BLUE}🔍 2. TESTANDO BUSCA POR SIMILARIDADE${NC}"
echo "======================================="

make_request "GET" "/metadata/search/similar?query=inteligência%20artificial%20e%20machine%20learning&limit=5&threshold=0.6" "" "Busca por IA e ML"

make_request "GET" "/metadata/search/similar?query=automação%20de%20processos%20e%20análise%20preditiva&limit=3&threshold=0.7" "" "Busca por automação e análise preditiva"

make_request "GET" "/metadata/search/similar?query=tecnologia%20e%20inovação%20empresarial&limit=5&threshold=0.5" "" "Busca por tecnologia e inovação (threshold baixo)"

# 3. Testar busca por tema semântico
echo -e "${BLUE}🎯 3. TESTANDO BUSCA POR TEMA SEMÂNTICO${NC}"
echo "========================================="

make_request "GET" "/metadata/search/theme?theme=tecnologia%20de%20inteligência%20artificial&limit=3&threshold=0.7" "" "Busca por tema de IA"

make_request "GET" "/metadata/search/theme?theme=automação%20e%20processamento%20de%20dados&limit=2&threshold=0.8" "" "Busca por automação e processamento"

# 4. Testar estatísticas
echo -e "${BLUE}📊 4. TESTANDO ESTATÍSTICAS${NC}"
echo "=========================="

make_request "GET" "/metadata/stats" "" "Obtendo estatísticas de metadados"

# 5. Testar busca com filtros
echo -e "${BLUE}🔧 5. TESTANDO BUSCA COM FILTROS${NC}"
echo "==============================="

make_request "GET" "/metadata/search/similar?query=IA&agentId=test-agent-curl-001&limit=5&threshold=0.6" "" "Busca com filtro por agente"

make_request "GET" "/metadata/search/similar?query=automação&includeEmbedding=true&limit=2" "" "Busca incluindo embeddings na resposta"

# 6. Gerar embeddings para metadados existentes
echo -e "${BLUE}⚙️  6. GERANDO EMBEDDINGS${NC}"
echo "======================="

make_request "POST" "/metadata/embeddings/generate?batchSize=10" "" "Gerando embeddings para metadados existentes"

echo -e "${GREEN}✅ TODOS OS TESTES CONCLUÍDOS!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${YELLOW}💡 Dicas:${NC}"
echo "   - Ajuste o threshold (0.0-1.0) para controlar a sensibilidade da busca"
echo "   - Use 'limit' para controlar quantos resultados retornar"
echo "   - Filtre por 'agentId' para buscar em metadados específicos"
echo "   - Use 'includeEmbedding=true' para ver os vetores de embedding"
echo ""
echo -e "${BLUE}📝 Comandos curl individuais para testes manuais:${NC}"
echo ""
echo "# Busca básica por similaridade:"
echo "curl -X GET \"$API_BASE_URL/metadata/search/similar?query=seu%20texto%20aqui&limit=5&threshold=0.7\" \\"
echo "  -H \"X-API-Key: $API_KEY\" \\"
echo "  -H \"Content-Type: application/json\""
echo ""
echo "# Busca por tema:"
echo "curl -X GET \"$API_BASE_URL/metadata/search/theme?theme=seu%20tema%20aqui&limit=3&threshold=0.8\" \\"
echo "  -H \"X-API-Key: $API_KEY\" \\"
echo "  -H \"Content-Type: application/json\""
echo ""
echo "# Estatísticas:"
echo "curl -X GET \"$API_BASE_URL/metadata/stats\" \\"
echo "  -H \"X-API-Key: $API_KEY\" \\"
echo "  -H \"Content-Type: application/json\""
