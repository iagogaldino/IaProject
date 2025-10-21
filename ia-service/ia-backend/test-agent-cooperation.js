const axios = require('axios');
const colors = require('colors');

const BASE_URL = 'http://localhost:3000/api';

// Configuração
const config = {
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * Testa cooperação entre agentes
 */
async function testAgentCooperation() {
    console.log('\n' + '='.repeat(70).cyan);
    console.log('🤝 TESTE DE COOPERAÇÃO INTELIGENTE ENTRE AGENTES'.cyan.bold);
    console.log('='.repeat(70).cyan + '\n');

    try {
        // 1. Listar agentes disponíveis
        console.log('📋 PASSO 1: Listando agentes disponíveis...\n'.yellow.bold);

        const agentsResponse = await axios.get(`${BASE_URL}/agents`, config);
        const agents = agentsResponse.data;

        if (agents.length === 0) {
            console.log('❌ Nenhum agente encontrado. Por favor, crie agentes primeiro.'.red);
            return;
        }

        console.log(`✅ Encontrados ${agents.length} agente(s):\n`.green);

        agents.forEach((agent, idx) => {
            console.log(`${idx + 1}. ${agent.name.bold} (${agent.status === 'active' ? '✓ Ativo'.green : '✗ Inativo'.red})`);
            console.log(`   ID: ${agent.id.gray}`);
            console.log(`   Descrição: ${agent.description.gray}`);

            if (agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
                console.log(`   Pode comunicar com: ${agent.canCommunicateWith.length} agente(s)`.cyan);
            } else {
                console.log(`   Pode comunicar com: Todos os agentes`.cyan);
            }

            if (agent.databaseAccess?.enabled) {
                console.log(`   📊 Tem acesso a database`.blue);
            }

            if (agent.fileAccess?.enabled) {
                console.log(`   📁 Tem acesso a arquivos`.blue);
            }

            console.log('');
        });

        // 2. Selecionar agente principal para testes
        const generalAgent = agents.find(a =>
            a.status === 'active' &&
            (!a.canCommunicateWith || a.canCommunicateWith.length === 0 || a.canCommunicateWith.length > 0)
        );

        if (!generalAgent) {
            console.log('❌ Nenhum agente ativo encontrado para teste.'.red);
            return;
        }

        console.log('='.repeat(70).cyan);
        console.log(`\n🤖 Usando agente: ${generalAgent.name.bold.green}\n`);
        console.log('='.repeat(70).cyan + '\n');

        // 3. Testes de cooperação
        const testCases = [
            {
                name: 'Teste 1: Consulta que deve acionar cooperação (vendas)',
                query: 'Qual foi o total de vendas hoje?',
                expectedCooperation: true,
                description: 'Deve consultar agente de vendas se disponível'
            },
            {
                name: 'Teste 2: Consulta que deve acionar cooperação (obras)',
                query: 'Quanto foi gasto em obras de pavimentação?',
                expectedCooperation: true,
                description: 'Deve consultar agente de obras ou database'
            },
            {
                name: 'Teste 3: Consulta que pode acionar cooperação (busca)',
                query: 'Busque documentos sobre trabalho remoto',
                expectedCooperation: true,
                description: 'Deve consultar agente com acesso a database'
            },
            {
                name: 'Teste 4: Consulta simples (sem cooperação esperada)',
                query: 'Olá, como você está?',
                expectedCooperation: false,
                description: 'Deve responder com conhecimento próprio'
            },
            {
                name: 'Teste 5: Consulta técnica (pode ou não cooperar)',
                query: 'Explique o que você pode fazer',
                expectedCooperation: false,
                description: 'Deve responder sobre suas próprias capacidades'
            }
        ];

        for (let i = 0; i < testCases.length; i++) {
            const test = testCases[i];

            console.log(`\n${'▶'.repeat(3)} ${test.name.bold}\n`);
            console.log(`   Pergunta: "${test.query}".italic`);
            console.log(`   Expectativa: ${test.description.gray}`);
            console.log(`   Cooperação esperada: ${test.expectedCooperation ? '✓ Sim'.green : '✗ Não'.yellow}\n`);

            try {
                const startTime = Date.now();

                const response = await axios.post(
                    `${BASE_URL}/agents/${generalAgent.id}/chat`,
                    {
                        messages: [
                            {
                                role: 'user',
                                content: test.query
                            }
                        ]
                    },
                    config
                );

                const endTime = Date.now();
                const duration = endTime - startTime;

                const answer = response.data.response.content;

                // Verificar se houve cooperação
                const hasCooperation = answer.includes('*(Informação fornecida através de cooperação:') ||
                    answer.includes('*(Informação obtida do') ||
                    answer.includes('→');

                console.log('   📝 Resposta:'.bold);
                console.log('   ' + '─'.repeat(65).gray);

                // Formatar resposta (quebrar em linhas)
                const lines = answer.split('\n');
                lines.forEach(line => {
                    if (line.includes('*(Informação fornecida através de cooperação:')) {
                        console.log(`   ${'✨ ' + line}`.magenta.bold);
                    } else if (line.includes('*(Informação obtida do')) {
                        console.log(`   ${'✨ ' + line}`.magenta.bold);
                    } else {
                        console.log(`   ${line}`.white);
                    }
                });

                console.log('   ' + '─'.repeat(65).gray);

                // Status do teste
                console.log(`\n   ⏱️  Tempo: ${duration}ms`.gray);
                console.log(`   🤝 Cooperação detectada: ${hasCooperation ? '✓ SIM'.green.bold : '✗ NÃO'.yellow}`);

                if (test.expectedCooperation === hasCooperation) {
                    console.log(`   ✅ Resultado: ${'CONFORME ESPERADO'.green.bold}`);
                } else {
                    console.log(`   ⚠️  Resultado: ${'DIFERENTE DO ESPERADO'.yellow.bold}`);
                }

                // Aguardar um pouco entre testes
                if (i < testCases.length - 1) {
                    console.log('\n   ⏳ Aguardando 2s antes do próximo teste...'.gray);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

            } catch (error) {
                console.log(`   ❌ Erro no teste: ${error.message}`.red);
                if (error.response?.data) {
                    console.log(`   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`.gray);
                }
            }
        }

        // 4. Resumo
        console.log('\n' + '='.repeat(70).cyan);
        console.log('📊 RESUMO DOS TESTES'.cyan.bold);
        console.log('='.repeat(70).cyan + '\n');

        console.log('✅ Testes concluídos!'.green.bold);
        console.log('\n💡 Dicas:'.yellow.bold);
        console.log('   • Verifique os logs em ia-backend/logs/ai-backend.log para detalhes');
        console.log('   • Procure por "🤝 Agent cooperation initiated" nos logs');
        console.log('   • Configure canCommunicateWith para controlar permissões');
        console.log('   • Cooperação é inteligente: IA decide quando consultar especialistas\n');

    } catch (error) {
        console.error('❌ Erro no teste de cooperação:'.red.bold, error.message);
        if (error.response?.data) {
            console.error('Detalhes:', error.response.data);
        }
    }
}

/**
 * Teste de configuração de permissões
 */
async function testPermissions() {
    console.log('\n' + '='.repeat(70).cyan);
    console.log('🔐 TESTE DE PERMISSÕES DE COMUNICAÇÃO'.cyan.bold);
    console.log('='.repeat(70).cyan + '\n');

    try {
        const agentsResponse = await axios.get(`${BASE_URL}/agents`, config);
        const agents = agentsResponse.data;

        console.log('📋 Matriz de Permissões de Comunicação:\n'.yellow.bold);
        console.log('Legenda: ✓ Pode comunicar | ✗ Não pode comunicar | ∞ Pode com todos\n'.gray);

        agents.forEach(agent => {
            console.log(`${agent.name.bold}:`);

            if (!agent.canCommunicateWith || agent.canCommunicateWith.length === 0) {
                console.log(`   ∞ Pode comunicar com TODOS os agentes`.green);
            } else {
                console.log(`   Pode comunicar com ${agent.canCommunicateWith.length} agente(s):`.cyan);

                agent.canCommunicateWith.forEach(targetId => {
                    const targetAgent = agents.find(a => a.id === targetId);
                    if (targetAgent) {
                        console.log(`   ✓ ${targetAgent.name}`.green);
                    } else {
                        console.log(`   ? Agente desconhecido (${targetId})`.red);
                    }
                });
            }

            console.log('');
        });

    } catch (error) {
        console.error('❌ Erro ao testar permissões:'.red.bold, error.message);
    }
}

/**
 * Menu principal
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--permissions')) {
        await testPermissions();
    } else {
        await testAgentCooperation();
    }
}

// Executar
console.log('\n🚀 Iniciando testes...'.cyan.bold);
console.log('📍 API: ' + BASE_URL.gray + '\n');

main().then(() => {
    console.log('\n✨ Testes finalizados!\n'.green.bold);
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Erro fatal:'.red.bold, error.message);
    process.exit(1);
});

