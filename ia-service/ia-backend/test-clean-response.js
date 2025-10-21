/**
 * Script de teste para validar as melhorias de resposta limpa
 * 
 * Este script testa:
 * 1. Resposta LIMPA (padrão) - sem informações técnicas
 * 2. Resposta DETALHADA (debug) - com todas as informações técnicas
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd37501d9bfcc29e34574b'; // Substitua pelo ID do seu agente

// Cores para output no console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

async function testCleanResponse() {
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.green}TESTE 1: Resposta LIMPA (padrão)${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    try {
        const response = await axios.post(
            `${BASE_URL}/api/agents/${AGENT_ID}/chat`,
            {
                messages: [
                    {
                        role: 'user',
                        content: 'Me traga dados sobre pavimentação'
                    }
                ]
                // responseFormat: 'clean' não é necessário pois é o padrão
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                }
            }
        );

        console.log(`${colors.cyan}📤 Consulta:${colors.reset} "Me traga dados sobre pavimentação"\n`);
        console.log(`${colors.green}✅ Resposta LIMPA:${colors.reset}`);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}`);
        console.log(response.data.response.content);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}\n`);

        // Verificar se a resposta está limpa (sem emojis técnicos e informações de debug)
        const hasCleanResponse =
            !response.data.response.content.includes('🔍 **Busca Semântica') &&
            !response.data.response.content.includes('**💡 Tecnologia:**') &&
            !response.data.response.content.includes('**🤖 Agente:**') &&
            !response.data.response.content.includes('**📈 Método:**') &&
            !response.data.response.content.includes('*(Informação fornecida através de cooperação:');

        if (hasCleanResponse) {
            console.log(`${colors.green}✓ Resposta LIMPA verificada: ✅ OK${colors.reset}\n`);
        } else {
            console.log(`${colors.yellow}⚠ Atenção: Resposta ainda contém informações técnicas${colors.reset}\n`);
        }

    } catch (error) {
        console.error(`${colors.yellow}❌ Erro ao testar resposta limpa:${colors.reset}`, error.message);
        if (error.response) {
            console.error('Detalhes:', error.response.data);
        }
    }
}

async function testDetailedResponse() {
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.green}TESTE 2: Resposta DETALHADA (debug)${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    try {
        const response = await axios.post(
            `${BASE_URL}/api/agents/${AGENT_ID}/chat`,
            {
                messages: [
                    {
                        role: 'user',
                        content: 'Me traga dados sobre pavimentação'
                    }
                ],
                responseFormat: 'detailed' // Solicitar formato detalhado
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                }
            }
        );

        console.log(`${colors.cyan}📤 Consulta:${colors.reset} "Me traga dados sobre pavimentação" (modo detalhado)\n`);
        console.log(`${colors.green}✅ Resposta DETALHADA:${colors.reset}`);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}`);
        console.log(response.data.response.content);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}\n`);

        // Verificar se a resposta tem informações técnicas
        const hasDetailedInfo =
            response.data.response.content.includes('Busca Semântica') ||
            response.data.response.content.includes('Tecnologia:') ||
            response.data.response.content.includes('Agente:') ||
            response.data.response.content.includes('Método:');

        if (hasDetailedInfo) {
            console.log(`${colors.green}✓ Resposta DETALHADA verificada: ✅ OK (contém informações técnicas)${colors.reset}\n`);
        } else {
            console.log(`${colors.yellow}⚠ Atenção: Resposta detalhada não contém informações técnicas esperadas${colors.reset}\n`);
        }

    } catch (error) {
        console.error(`${colors.yellow}❌ Erro ao testar resposta detalhada:${colors.reset}`, error.message);
        if (error.response) {
            console.error('Detalhes:', error.response.data);
        }
    }
}

async function runTests() {
    console.log(`\n${colors.bright}${colors.green}🚀 Iniciando testes de resposta limpa vs detalhada...${colors.reset}\n`);

    await testCleanResponse();
    await testDetailedResponse();

    console.log(`${colors.bright}${colors.green}✅ Testes concluídos!${colors.reset}\n`);
    console.log(`${colors.cyan}📝 Resumo das melhorias:${colors.reset}`);
    console.log(`   • Modo LIMPO (padrão): Resposta focada no usuário final, sem emojis técnicos`);
    console.log(`   • Modo DETALHADO: Resposta com todas as informações técnicas para debug`);
    console.log(`   • Remoção de mensagens de cooperação entre agentes no modo limpo`);
    console.log(`   • Formato mais legível e profissional\n`);
}

// Executar testes
runTests().catch(error => {
    console.error(`${colors.yellow}Erro fatal:${colors.reset}`, error);
    process.exit(1);
});

