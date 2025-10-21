# Script PowerShell para testar respostas limpas vs detalhadas
# Execute: .\test-clean-curl.ps1

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "TESTE DE RESPOSTAS LIMPAS" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Cyan

# Configurações
$BASE_URL = "http://localhost:3001"
$API_KEY = "ai-backend-2024-abc123xyz789"
$AGENT_ID = "68dd37501d9bfcc29e34574b" # Substitua pelo ID do seu agente

# Teste 1: Resposta LIMPA (padrão)
Write-Host "TESTE 1: Modo LIMPO (padrão - sem informações técnicas)" -ForegroundColor Yellow
Write-Host "------------------------------------------------------------`n" -ForegroundColor Gray

$body1 = @{
    messages = @(
        @{
            role = "user"
            content = "Me traga dados sobre pavimentação"
        }
    )
} | ConvertTo-Json

Write-Host "Enviando requisição...`n" -ForegroundColor Gray

try {
    $response1 = Invoke-RestMethod -Uri "$BASE_URL/api/agents/$AGENT_ID/chat" `
        -Method Post `
        -Headers @{
            "Content-Type" = "application/json"
            "X-API-Key" = $API_KEY
        } `
        -Body $body1

    Write-Host "✅ RESPOSTA LIMPA:" -ForegroundColor Green
    Write-Host "------------------------------------------------------------" -ForegroundColor Gray
    Write-Host $response1.response.content -ForegroundColor White
    Write-Host "------------------------------------------------------------`n" -ForegroundColor Gray

    # Verificar se está limpa
    $isClean = -not ($response1.response.content -match '🔍.*Busca Semântica' -or 
                     $response1.response.content -match '\*\*💡 Tecnologia:' -or
                     $response1.response.content -match '\*\*🤖 Agente:' -or
                     $response1.response.content -match 'Informação fornecida através de cooperação')
    
    if ($isClean) {
        Write-Host "✓ Resposta está LIMPA (sem informações técnicas) ✅" -ForegroundColor Green
    } else {
        Write-Host "⚠ Atenção: Resposta ainda contém informações técnicas" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro ao enviar requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n`n============================================================" -ForegroundColor Cyan
Write-Host "TESTE 2: Modo DETALHADO (debug - com informações técnicas)" -ForegroundColor Yellow
Write-Host "------------------------------------------------------------`n" -ForegroundColor Gray

# Teste 2: Resposta DETALHADA
$body2 = @{
    messages = @(
        @{
            role = "user"
            content = "Me traga dados sobre pavimentação"
        }
    )
    responseFormat = "detailed"
} | ConvertTo-Json

Write-Host "Enviando requisição com responseFormat: 'detailed'...`n" -ForegroundColor Gray

try {
    $response2 = Invoke-RestMethod -Uri "$BASE_URL/api/agents/$AGENT_ID/chat" `
        -Method Post `
        -Headers @{
            "Content-Type" = "application/json"
            "X-API-Key" = $API_KEY
        } `
        -Body $body2

    Write-Host "✅ RESPOSTA DETALHADA:" -ForegroundColor Green
    Write-Host "------------------------------------------------------------" -ForegroundColor Gray
    Write-Host $response2.response.content -ForegroundColor White
    Write-Host "------------------------------------------------------------`n" -ForegroundColor Gray

    # Verificar se está detalhada
    $isDetailed = $response2.response.content -match 'Busca Semântica' -or 
                  $response2.response.content -match 'Tecnologia:' -or
                  $response2.response.content -match 'Agente:'
    
    if ($isDetailed) {
        Write-Host "✓ Resposta está DETALHADA (contém informações técnicas) ✅" -ForegroundColor Green
    } else {
        Write-Host "⚠ Atenção: Resposta detalhada não contém informações técnicas esperadas" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro ao enviar requisição:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n`n============================================================" -ForegroundColor Cyan
Write-Host "RESUMO DAS MELHORIAS" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "• Modo LIMPO (padrão): Resposta focada no usuário final" -ForegroundColor White
Write-Host "• Modo DETALHADO: Resposta com informações técnicas para debug" -ForegroundColor White
Write-Host "• Sem emojis técnicos no modo limpo (🔍, 💡, 🤖, 📈)" -ForegroundColor White
Write-Host "• Sem mensagens de cooperação entre agentes no modo limpo" -ForegroundColor White
Write-Host "• Formato mais legível e profissional" -ForegroundColor White
Write-Host "============================================================`n" -ForegroundColor Cyan

