# Script PowerShell para testar funcionalidade de embeddings usando curl
# Configuração
$API_BASE_URL = "http://localhost:3001/api"
$API_KEY = "your-api-key-for-external-access"

Write-Host "🧪 TESTE DE EMBEDDINGS - COMANDOS CURL" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue
Write-Host ""

# Função para fazer requisições
function Make-Request {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = "",
        [string]$Description
    )
    
    Write-Host "🔍 $Description" -ForegroundColor Yellow
    Write-Host "Endpoint: $Method $Endpoint" -ForegroundColor Blue
    
    $headers = @{
        "X-API-Key" = $API_KEY
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Method -eq "POST") {
            $response = Invoke-RestMethod -Uri "$API_BASE_URL$Endpoint" -Method Post -Headers $headers -Body $Data
        } else {
            $response = Invoke-RestMethod -Uri "$API_BASE_URL$Endpoint" -Method Get -Headers $headers
        }
        
        Write-Host "✅ Sucesso!" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10
    }
    catch {
        Write-Host "❌ Erro na requisição: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 1. Criar metadado de teste
Write-Host "📝 1. CRIANDO METADADO DE TESTE" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

$testMetadata = @{
    fileId = "test-curl-embedding-001"
    agentId = "test-agent-curl-001"
    theme = "Inteligência Artificial e Automação"
    improvedContent = "Documento sobre implementação de sistemas de IA para automação de processos empresariais, incluindo machine learning, processamento de linguagem natural e análise preditiva de dados para otimização operacional."
    tags = @("inteligência artificial", "automação", "machine learning", "processamento", "análise preditiva", "otimização")
    analysis = @{
        summary = "Este documento apresenta uma análise detalhada sobre a implementação de tecnologias de inteligência artificial para automação de processos empresariais, explorando desde conceitos básicos até aplicações avançadas de machine learning e análise preditiva."
        keyTopics = @("machine learning", "processamento de linguagem natural", "automação de processos", "análise preditiva", "otimização operacional", "inteligência artificial")
        sentiment = "positivo"
        confidence = 0.93
        language = "pt-BR"
    }
} | ConvertTo-Json -Depth 10

Make-Request -Method "POST" -Endpoint "/metadata" -Data $testMetadata -Description "Criando metadado de teste sobre IA e automação"

# Aguardar processamento
Write-Host "⏳ Aguardando processamento do embedding..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 2. Testar buscas de similaridade
Write-Host "🔍 2. TESTANDO BUSCA POR SIMILARIDADE" -ForegroundColor Blue
Write-Host "=======================================" -ForegroundColor Blue

Make-Request -Method "GET" -Endpoint "/metadata/search/similar?query=inteligência%20artificial%20e%20machine%20learning&limit=5&threshold=0.6" -Description "Busca por IA e ML"

Make-Request -Method "GET" -Endpoint "/metadata/search/similar?query=automação%20de%20processos%20e%20análise%20preditiva&limit=3&threshold=0.7" -Description "Busca por automação e análise preditiva"

Make-Request -Method "GET" -Endpoint "/metadata/search/similar?query=tecnologia%20e%20inovação%20empresarial&limit=5&threshold=0.5" -Description "Busca por tecnologia e inovação (threshold baixo)"

# 3. Testar busca por tema semântico
Write-Host "🎯 3. TESTANDO BUSCA POR TEMA SEMÂNTICO" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue

Make-Request -Method "GET" -Endpoint "/metadata/search/theme?theme=tecnologia%20de%20inteligência%20artificial&limit=3&threshold=0.7" -Description "Busca por tema de IA"

Make-Request -Method "GET" -Endpoint "/metadata/search/theme?theme=automação%20e%20processamento%20de%20dados&limit=2&threshold=0.8" -Description "Busca por automação e processamento"

# 4. Testar estatísticas
Write-Host "📊 4. TESTANDO ESTATÍSTICAS" -ForegroundColor Blue
Write-Host "==========================" -ForegroundColor Blue

Make-Request -Method "GET" -Endpoint "/metadata/stats" -Description "Obtendo estatísticas de metadados"

# 5. Testar busca com filtros
Write-Host "🔧 5. TESTANDO BUSCA COM FILTROS" -ForegroundColor Blue
Write-Host "===============================" -ForegroundColor Blue

Make-Request -Method "GET" -Endpoint "/metadata/search/similar?query=IA&agentId=test-agent-curl-001&limit=5&threshold=0.6" -Description "Busca com filtro por agente"

Make-Request -Method "GET" -Endpoint "/metadata/search/similar?query=automação&includeEmbedding=true&limit=2" -Description "Busca incluindo embeddings na resposta"

# 6. Gerar embeddings para metadados existentes
Write-Host "⚙️  6. GERANDO EMBEDDINGS" -ForegroundColor Blue
Write-Host "=======================" -ForegroundColor Blue

Make-Request -Method "POST" -Endpoint "/metadata/embeddings/generate?batchSize=10" -Description "Gerando embeddings para metadados existentes"

Write-Host "✅ TODOS OS TESTES CONCLUÍDOS!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Blue
Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Yellow
Write-Host "   - Ajuste o threshold (0.0-1.0) para controlar a sensibilidade da busca"
Write-Host "   - Use 'limit' para controlar quantos resultados retornar"
Write-Host "   - Filtre por 'agentId' para buscar em metadados específicos"
Write-Host "   - Use 'includeEmbedding=true' para ver os vetores de embedding"
Write-Host ""
Write-Host "📝 Comandos curl individuais para testes manuais:" -ForegroundColor Blue
Write-Host ""
Write-Host "# Busca básica por similaridade:"
Write-Host "curl -X GET `"$API_BASE_URL/metadata/search/similar?query=seu%20texto%20aqui&limit=5&threshold=0.7`" \"
Write-Host "  -H `"X-API-Key: $API_KEY`" \"
Write-Host "  -H `"Content-Type: application/json`""
Write-Host ""
Write-Host "# Busca por tema:"
Write-Host "curl -X GET `"$API_BASE_URL/metadata/search/theme?theme=seu%20tema%20aqui&limit=3&threshold=0.8`" \"
Write-Host "  -H `"X-API-Key: $API_KEY`" \"
Write-Host "  -H `"Content-Type: application/json`""
Write-Host ""
Write-Host "# Estatísticas:"
Write-Host "curl -X GET `"$API_BASE_URL/metadata/stats`" \"
Write-Host "  -H `"X-API-Key: $API_KEY`" \"
Write-Host "  -H `"Content-Type: application/json`""
