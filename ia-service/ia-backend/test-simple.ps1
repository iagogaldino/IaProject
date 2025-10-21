$uri = "http://localhost:3001/api/agents/68dd625e8be0682166a76f97/chat"
$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "ai-backend-2024-abc123xyz789"
}

$body = '{"messages": [{"role": "user", "content": "Consulte metadados sobre o total gasto em Petrolina"}]}'

Write-Host "Testando busca vetorial otimizada..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
    Write-Host "Resposta recebida:" -ForegroundColor Green
    Write-Host $response.response.content -ForegroundColor White
} catch {
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
}
