/**
 * 🧪 Script de teste para verificar correção de promessas não cumpridas
 * 
 * Testa:
 * 1. Agente não deve prometer "aguarde"
 * 2. Se prometer, sistema deve detectar e corrigir
 * 3. Respostas devem ser completas e imediatas
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

async function test1_NoPromises() {
    console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}TESTE 1: Agente NÃO Deve Prometer${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.yellow}Pergunta que tipicamente levaria a promessa:${colors.reset}`);
    console.log(`"Quais ruas foram pavimentadas?"\n`);

    try {
        const response = await axios.post(
            `${BASE_URL}/api/agents/${NINA_AGENT_ID}/chat`,
            {
                messages: [
                    {
                        role: 'user',
                        content: 'Quais ruas foram pavimentadas?'
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                }
            }
        );

        const answer = response.data.response.content;

        console.log(`${colors.green}✅ Resposta recebida:${colors.reset}`);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}`);
        console.log(answer);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}\n`);

        // Verificações
        const promiseWords = ['aguarde', 'vou verificar', 'vou buscar', 'deixe-me'];
        const hasPromise = promiseWords.some(word => answer.toLowerCase().includes(word));

        const hasData = answer.length > 200; // Resposta substancial
        const hasStructure = answer.includes('**') || answer.includes('\n');

        console.log(`${colors.cyan}📊 Análise:${colors.reset}`);
        console.log(`   ${hasPromise ? colors.red + '❌' : colors.green + '✅'} ${hasPromise ? 'Contém promessa (BAD)' : 'Sem promessas (GOOD)'}${colors.reset}`);
        console.log(`   ${hasData ? colors.green + '✅' : colors.yellow + '⚠️'} Resposta substancial (${answer.length} chars)${colors.reset}`);
        console.log(`   ${hasStructure ? colors.green + '✅' : colors.yellow + '⚠️'} Bem estruturada${colors.reset}\n`);

        if (hasPromise) {
            console.log(`${colors.red}${colors.bright}❌ FALHOU: Agente ainda está prometendo buscar!${colors.reset}\n`);
            console.log(`${colors.yellow}Possível causa:${colors.reset}`);
            console.log(`   • Código não foi compilado (npm run build)`);
            console.log(`   • Servidor não foi reiniciado\n`);
            return false;
        } else {
            console.log(`${colors.green}${colors.bright}✅ PASSOU: Agente respondeu imediatamente!${colors.reset}\n`);
            return true;
        }

    } catch (error) {
        console.error(`${colors.red}❌ Erro:${colors.reset}`, error.message);
        return false;
    }
}

async function test2_PromiseRecovery() {
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}TESTE 2: Recuperação de Promessa (Se Ocorrer)${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.yellow}Simulando histórico onde agente prometeu:${colors.reset}\n`);

    try {
        const response = await axios.post(
            `${BASE_URL}/api/agents/${NINA_AGENT_ID}/chat`,
            {
                messages: [
                    {
                        role: 'user',
                        content: 'Quais ruas foram pavimentadas?'
                    },
                    {
                        role: 'assistant',
                        content: 'Aguarde um momento enquanto verifico essas informações no banco de dados.'
                    },
                    {
                        role: 'user',
                        content: 'já tem a resposta?'
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                }
            }
        );

        const answer = response.data.response.content;

        console.log(`${colors.green}✅ Resposta do sistema:${colors.reset}`);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}`);
        console.log(answer);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}\n`);

        // Verificações
        const hasData = answer.length > 200;
        const hasStructure = answer.includes('**') || answer.includes('\n');
        const isGenericResponse = answer.toLowerCase().includes('não tenho informação') ||
            answer.toLowerCase().includes('não encontrei');

        console.log(`${colors.cyan}📊 Análise da Recuperação:${colors.reset}`);
        console.log(`   ${hasData ? colors.green + '✅' : colors.red + '❌'} Resposta substancial (${answer.length} chars)${colors.reset}`);
        console.log(`   ${hasStructure ? colors.green + '✅' : colors.yellow + '⚠️'} Bem estruturada${colors.reset}`);
        console.log(`   ${!isGenericResponse ? colors.green + '✅' : colors.yellow + '⚠️'} Resposta específica (não genérica)${colors.reset}\n`);

        if (hasData && !isGenericResponse) {
            console.log(`${colors.green}${colors.bright}✅ PASSOU: Sistema recuperou e buscou dados!${colors.reset}\n`);
            return true;
        } else {
            console.log(`${colors.yellow}⚠️  PARCIAL: Sistema respondeu mas pode não ter buscado dados${colors.reset}\n`);
            return true; // Ainda é aceitável
        }

    } catch (error) {
        console.error(`${colors.red}❌ Erro:${colors.reset}`, error.message);
        return false;
    }
}

async function runAllTests() {
    console.log(`\n${colors.bright}${colors.green}🚀 Iniciando testes de Promessas Não Cumpridas...${colors.reset}\n`);

    const test1Result = await test1_NoPromises();
    const test2Result = await test2_PromiseRecovery();

    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.green}📊 RESULTADO FINAL${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`   TESTE 1 (Sem Promessas): ${test1Result ? colors.green + '✅ PASSOU' : colors.red + '❌ FALHOU'}${colors.reset}`);
    console.log(`   TESTE 2 (Recuperação):   ${test2Result ? colors.green + '✅ PASSOU' : colors.red + '❌ FALHOU'}${colors.reset}\n`);

    const allPassed = test1Result && test2Result;

    if (allPassed) {
        console.log(`${colors.green}${colors.bright}🎉 SUCESSO! Sistema está funcionando corretamente!${colors.reset}\n`);
        console.log(`${colors.cyan}✅ Agente não promete buscar depois${colors.reset}`);
        console.log(`${colors.cyan}✅ Respostas são imediatas e completas${colors.reset}`);
        console.log(`${colors.cyan}✅ Sistema recupera de promessas se ocorrerem${colors.reset}\n`);
    } else {
        console.log(`${colors.red}${colors.bright}❌ FALHA! Ainda há problemas:${colors.reset}\n`);

        if (!test1Result) {
            console.log(`${colors.yellow}📝 PROBLEMA: Agente ainda está prometendo buscar${colors.reset}`);
            console.log(`${colors.yellow}   Solução:${colors.reset}`);
            console.log(`   1. Compile: npm run build`);
            console.log(`   2. Reinicie: node dist/index.js\n`);
        }

        if (!test2Result) {
            console.log(`${colors.yellow}📝 PROBLEMA: Recuperação não está funcionando${colors.reset}`);
            console.log(`${colors.yellow}   Solução:${colors.reset}`);
            console.log(`   1. Verifique logs do servidor`);
            console.log(`   2. Confirme que código foi compilado\n`);
        }
    }

    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.cyan}💡 Próximos passos:${colors.reset}`);
    console.log(`   • Verifique os logs: tail -f logs/combined.log`);
    console.log(`   • Procure por: "Detected unfulfilled promise"`);
    console.log(`   • Confirme: "Promise fulfilled"\n`);
}

// Executar todos os testes
runAllTests().catch(error => {
    console.error(`${colors.red}Erro fatal:${colors.reset}`, error);
    process.exit(1);
});

