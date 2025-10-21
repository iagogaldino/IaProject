/**
 * 🧪 Script de teste para o fluxo de cooperação Database → Response Improver
 * 
 * Fluxo testado:
 * 1. Usuário faz consulta → Nina Petrolina
 * 2. Nina delega → Agente Database
 * 3. Agente Database busca dados e delega → Agente de resposta
 * 4. Agente de resposta formata → retorna para Nina
 * 5. Nina retorna → Usuário
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const NINA_AGENT_ID = '68dd37501d9bfcc29e34574b'; // ID da Nina Petrolina

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

async function testResponseImproverFlow() {
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.green}🧪 TESTE DE FLUXO: Database → Response Improver${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.cyan}📊 Fluxo esperado:${colors.reset}`);
    console.log(`   1. 👤 Usuário → Nina Petrolina`);
    console.log(`   2. 🤖 Nina → Agente Database`);
    console.log(`   3. 🗄️  Agente Database busca dados`);
    console.log(`   4. 🗄️  Agente Database → Agente de resposta`);
    console.log(`   5. ✨ Agente de resposta formata`);
    console.log(`   6. ✨ Agente de resposta → Nina → Usuário\n`);

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
                // responseFormat: 'clean' é o padrão (ativa Response Improver)
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                }
            }
        );

        const duration = Date.now() - startTime;

        console.log(`${colors.green}✅ Resposta recebida (${duration}ms):${colors.reset}`);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}`);
        console.log(response.data.response.content);
        console.log(`${colors.bright}────────────────────────────────────────────────────────${colors.reset}\n`);

        // Análise da resposta
        console.log(`${colors.cyan}🔍 Análise da resposta:${colors.reset}\n`);

        const content = response.data.response.content;

        // Verificar se passou pelo Response Improver
        const hasCleanFormat = !content.includes('🔍') &&
            !content.includes('**💡 Tecnologia:**') &&
            !content.includes('**🤖 Agente:**');

        const hasCooperationNote = content.includes('cooperação');

        const hasResponseImprover = content.includes('Agente de resposta') ||
            content.includes('Response Improver');

        if (hasCleanFormat) {
            console.log(`   ${colors.green}✅ Resposta está em formato limpo (sem detalhes técnicos)${colors.reset}`);
        } else {
            console.log(`   ${colors.yellow}⚠️  Resposta contém detalhes técnicos (modo detailed?)${colors.reset}`);
        }

        if (hasResponseImprover) {
            console.log(`   ${colors.green}✅ Detectada participação do Agente de resposta${colors.reset}`);
        } else {
            console.log(`   ${colors.yellow}⚠️  Não foi possível confirmar participação do Agente de resposta${colors.reset}`);
        }

        console.log(`\n   📏 Tamanho da resposta: ${content.length} caracteres`);
        console.log(`   ⏱️  Tempo de processamento: ${duration}ms\n`);

        // Verificar logs
        console.log(`${colors.cyan}💡 Próximo passo:${colors.reset}`);
        console.log(`   Verifique os logs do servidor para confirmar o fluxo:`);
        console.log(`   ${colors.bright}tail -f ia-backend/logs/combined.log${colors.reset}\n`);
        console.log(`   Procure por:`);
        console.log(`   - "Database Agent querying database"`);
        console.log(`   - "Delegating to Response Improver Agent"`);
        console.log(`   - "Response Improver Agent completed formatting"\n`);

    } catch (error) {
        console.error(`${colors.red}❌ Erro ao testar:${colors.reset}`, error.message);

        if (error.response) {
            console.error(`${colors.red}Status:${colors.reset}`, error.response.status);
            console.error(`${colors.red}Dados:${colors.reset}`, JSON.stringify(error.response.data, null, 2));
        }

        console.log(`\n${colors.yellow}💡 Possíveis causas:${colors.reset}`);
        console.log(`   1. Servidor não está rodando (npm start)`);
        console.log(`   2. MongoDB não está rodando`);
        console.log(`   3. Agentes não estão configurados corretamente`);
        console.log(`   4. O código ainda não foi compilado (npm run build)\n`);
    }

    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.green}🏁 Teste concluído!${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
}

// Executar teste
testResponseImproverFlow();

