# Teste da API de busca vetorial otimizada
$uri = "http://localhost:3001/api/agents/68dd625e8be0682166a76f97/chat"
$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "ai-backend-2024-abc123xyz789"
}

$body = @{
    messages = @(
        @{
            role = "user"
            content = "Consulte metadados sobre o total gasto em Petrolina"
        }
    )
} | ConvertTo-Json -Depth 3

Write-Host "🔍 Testando busca vetorial otimizada..." -ForegroundColor Green
Write-Host "📝 Query: Consulte metadados sobre o total gasto em Petrolina" -ForegroundColor Yellow
Write-Host ""

try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
    $endTime = Get-Date
    $responseTime = ($endTime - $startTime).TotalMilliseconds
    
    Write-Host "✅ Resposta recebida em $([math]::Round($responseTime, 2))ms" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Resposta:" -ForegroundColor Cyan
    Write-Host $response.response.content -ForegroundColor White
    
    # Verificar se há scores de similaridade
    if ($response.response.content -match "(\d+\.?\d*)% similar") {
        Write-Host ""
        Write-Host "🎯 Scores de similaridade encontrados!" -ForegroundColor Green
        $matches = [regex]::Matches($response.response.content, "(\d+\.?\d*)% similar")
        foreach ($match in $matches) {
            Write-Host "   • $($match.Groups[1].Value)% similar" -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Detalhes: $responseBody" -ForegroundColor Red
    }
}
