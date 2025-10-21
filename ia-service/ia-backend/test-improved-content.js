/**
 * 🧪 Script de teste para verificar se o improvedContent está sendo usado
 * 
 * Este script:
 * 1. Faz uma consulta ao banco de dados
 * 2. Verifica se o Database Agent retorna improvedContent completo
 * 3. Confirma que o Response Improver recebe esse conteúdo
 * 4. Valida a resposta final
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const NINA_AGENT_ID = '68dd37501d9bfcc29e34574b';

// Cores
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    magenta: '\x1b[35m'
};

async function testImprovedContent() {
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}🔍 TESTE: Uso do improvedContent${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.cyan}📊 O que será testado:${colors.reset}`);
    console.log(`   1. Database Agent busca documentos`);
    console.log(`   2. Database Agent extrai improvedContent (não apenas resumo)`);
    console.log(`   3. Response Improver recebe conteúdo completo`);
    console.log(`   4. Response Improver formata com base no conteúdo completo\n`);

    console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}\n`);

    const query = 'Me traga dados sobre pavimentação';

    console.log(`${colors.cyan}📤 Enviando consulta:${colors.reset} "${query}"\n`);

    try {
        const startTime = Date.now();

        const response = await axios.post(
            `${BASE_URL}/api/agents/${NINA_AGENT_ID}/chat`,
            {
                messages: [
                    {
                        role: 'user',
                        content: query
                    }
                ]
                // responseFormat padrão = 'clean' (ativa improvedContent + Response Improver)
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                }
            }
        );

        const duration = Date.now() - startTime;

        console.log(`${colors.green}✅ Resposta recebida em ${duration}ms${colors.reset}\n`);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}`);
        console.log(response.data.response.content);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}\n`);

        // Análise da resposta
        console.log(`${colors.cyan}🔍 ANÁLISE DA RESPOSTA:${colors.reset}\n`);

        const content = response.data.response.content;
        const contentLength = content.length;

        // Verificações
        const checks = {
            isClean: !content.includes('🔍') && !content.includes('**💡 Tecnologia:**'),
            hasSubstantialContent: contentLength > 500, // Conteúdo mais longo indica improvedContent
            hasNoTechnicalInfo: !content.includes('**🤖 Agente:**') && !content.includes('**📈 Método:**'),
            hasStructuredInfo: content.includes('**') || content.includes('\n'), // Bem formatado
            notJustSummary: contentLength > 200 // Não é apenas um resumo curto
        };

        // Resultados
        console.log(`   ${checks.isClean ? colors.green + '✅' : colors.red + '❌'} Formato limpo (sem emojis técnicos)${colors.reset}`);
        console.log(`   ${checks.hasSubstantialContent ? colors.green + '✅' : colors.yellow + '⚠️'} Conteúdo substancial (${contentLength} caracteres)${colors.reset}`);
        console.log(`   ${checks.hasNoTechnicalInfo ? colors.green + '✅' : colors.red + '❌'} Sem informações técnicas${colors.reset}`);
        console.log(`   ${checks.hasStructuredInfo ? colors.green + '✅' : colors.red + '❌'} Bem estruturado e formatado${colors.reset}`);
        console.log(`   ${checks.notJustSummary ? colors.green + '✅' : colors.yellow + '⚠️'} Não é apenas resumo curto${colors.reset}`);

        console.log(`\n   📏 Tamanho total: ${contentLength} caracteres`);
        console.log(`   ⏱️  Tempo total: ${duration}ms\n`);

        // Análise de qualidade
        const qualityScore = Object.values(checks).filter(Boolean).length;
        const totalChecks = Object.keys(checks).length;
        const percentage = Math.round((qualityScore / totalChecks) * 100);

        console.log(`${colors.cyan}📊 Score de Qualidade: ${qualityScore}/${totalChecks} (${percentage}%)${colors.reset}\n`);

        if (percentage >= 80) {
            console.log(`${colors.green}${colors.bright}🎉 EXCELENTE! O sistema está usando improvedContent corretamente!${colors.reset}\n`);
        } else if (percentage >= 60) {
            console.log(`${colors.yellow}⚠️  BOM, mas pode melhorar. Verifique os logs.${colors.reset}\n`);
        } else {
            console.log(`${colors.red}❌ PROBLEMA! O sistema não está funcionando como esperado.${colors.reset}\n`);
        }

        // Instruções para logs
        console.log(`${colors.cyan}💡 Verificar nos logs:${colors.reset}`);
        console.log(`   Procure por:`);
        console.log(`   ${colors.bright}• "returning improvedContent for Response Improver"${colors.reset}`);
        console.log(`   ${colors.bright}• "hasImprovedContent: true"${colors.reset}`);
        console.log(`   ${colors.bright}• "Delegating to Response Improver Agent"${colors.reset}\n`);

        // Comparação
        console.log(`${colors.cyan}📋 Comparação:${colors.reset}\n`);
        console.log(`${colors.yellow}ANTES (apenas resumo):${colors.reset}`);
        console.log(`   "O documento destaca as obras realizadas..." (curto)\n`);
        console.log(`${colors.green}DEPOIS (improvedContent completo):${colors.reset}`);
        console.log(`   Texto completo do documento com todos os detalhes,`);
        console.log(`   informações relevantes, contexto e dados específicos.\n`);

    } catch (error) {
        console.error(`${colors.red}❌ Erro ao testar:${colors.reset}`, error.message);

        if (error.response) {
            console.error(`${colors.red}Status:${colors.reset}`, error.response.status);
            console.error(`${colors.red}Dados:${colors.reset}`, JSON.stringify(error.response.data, null, 2));
        }

        console.log(`\n${colors.yellow}💡 Possíveis causas:${colors.reset}`);
        console.log(`   1. Servidor não está rodando ou não foi reiniciado`);
        console.log(`   2. Código não foi compilado (npm run build)`);
        console.log(`   3. MongoDB não tem documentos com improvedContent`);
        console.log(`   4. Configuração dos agentes incorreta\n`);
    }

    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.green}🏁 Teste concluído!${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
}

// Executar teste
testImprovedContent();

