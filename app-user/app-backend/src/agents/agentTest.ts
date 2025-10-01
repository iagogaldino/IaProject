/**
 * Arquivo de teste para demonstrar o funcionamento do sistema de agentes
 * Este arquivo pode ser executado para testar os agentes individualmente
 */

import { AgentRouter } from './agentRouter';
import { UserCommunicationAgent } from './userCommunicationAgent';
import { DatabaseQueryAgent } from './databaseQueryAgent';

/**
 * Testa o sistema completo de agentes
 */
export async function testAgentSystem() {
    console.log('🧪 Testando Sistema de Agentes...\n');

    const agentRouter = new AgentRouter();

    // Casos de teste
    const testCases = [
        {
            name: 'Saudação (Resposta Direta)',
            prompt: 'Olá, como você pode me ajudar?',
            expectedAgent: 'DirectResponse'
        },
        {
            name: 'Consulta de Dados (Banco de Dados)',
            prompt: 'Quantos relatórios temos no sistema?',
            expectedAgent: 'DatabaseQueryAgent'
        },
        {
            name: 'Pergunta sobre Funcionamento (Resposta Direta)',
            prompt: 'Como funciona este sistema?',
            expectedAgent: 'DirectResponse'
        },
        {
            name: 'Consulta Específica (Banco de Dados)',
            prompt: 'Mostre dados sobre investimentos em saúde',
            expectedAgent: 'DatabaseQueryAgent'
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n📋 Teste: ${testCase.name}`);
        console.log(`❓ Prompt: "${testCase.prompt}"`);
        
        try {
            const result = await agentRouter.routeRequest(testCase.prompt, []);
            
            console.log(`✅ Agente usado: ${result.agentUsed}`);
            console.log(`📊 Requer banco: ${result.requiresDatabase}`);
            console.log(`⏱️ Tempo: ${result.processingTime}ms`);
            console.log(`🎯 Confiança: ${result.confidence}`);
            console.log(`📝 Resposta: ${result.response.substring(0, 100)}...`);
            
            // Verificar se o agente correto foi usado
            if (result.agentUsed === testCase.expectedAgent) {
                console.log('✅ Teste PASSOU - Agente correto usado');
            } else {
                console.log('❌ Teste FALHOU - Agente incorreto usado');
            }
            
        } catch (error: any) {
            console.log(`❌ Erro no teste: ${error.message}`);
        }
    }
}

/**
 * Testa o agente de comunicação individualmente
 */
export async function testUserCommunicationAgent() {
    console.log('\n🗣️ Testando UserCommunicationAgent...\n');

    const agent = new UserCommunicationAgent();

    const testPrompts = [
        'Olá, tudo bem?',
        'Quantos habitantes temos na cidade?',
        'Como funciona o sistema de saúde municipal?',
        'Mostre estatísticas de educação'
    ];

    for (const prompt of testPrompts) {
        console.log(`\n❓ Prompt: "${prompt}"`);
        
        try {
            const result = await agent.processUserRequest(prompt, []);
            
            console.log(`✅ Agente usado: ${result.agentUsed}`);
            console.log(`📊 Requer banco: ${result.requiresDatabase}`);
            console.log(`📝 Resposta: ${result.response.substring(0, 150)}...`);
            
        } catch (error: any) {
            console.log(`❌ Erro: ${error.message}`);
        }
    }
}

/**
 * Testa o agente de banco de dados individualmente
 */
export async function testDatabaseQueryAgent() {
    console.log('\n🗄️ Testando DatabaseQueryAgent...\n');

    const agent = new DatabaseQueryAgent();

    const testQueries = [
        'Quantos relatórios temos?',
        'Mostre todos os dados disponíveis',
        'Busque informações sobre saúde',
        'Quais são os investimentos em educação?'
    ];

    for (const query of testQueries) {
        console.log(`\n❓ Query: "${query}"`);
        
        try {
            const result = await agent.processQuery(query, []);
            
            console.log(`📊 Dados retornados: ${result.databaseData?.length || 0} registros`);
            console.log(`🔍 SQL Query: ${result.sqlQuery || 'N/A'}`);
            console.log(`📝 Resposta: ${result.formattedResponse.substring(0, 150)}...`);
            
        } catch (error: any) {
            console.log(`❌ Erro: ${error.message}`);
        }
    }
}

/**
 * Testa análise de intenção
 */
export async function testIntentAnalysis() {
    console.log('\n🧠 Testando Análise de Intenção...\n');

    const agentRouter = new AgentRouter();

    const testPrompts = [
        { prompt: 'Olá', expected: false },
        { prompt: 'Quantos dados temos?', expected: true },
        { prompt: 'Como funciona?', expected: false },
        { prompt: 'Mostre estatísticas', expected: true },
        { prompt: 'Obrigado', expected: false },
        { prompt: 'Busque relatórios de saúde', expected: true }
    ];

    for (const test of testPrompts) {
        console.log(`\n❓ Prompt: "${test.prompt}"`);
        
        try {
            const analysis = await agentRouter.analyzeUserIntent(test.prompt, []);
            
            console.log(`🎯 Intenção: ${analysis.intent}`);
            console.log(`📊 Requer banco: ${analysis.requiresDatabase}`);
            console.log(`🎯 Confiança: ${analysis.confidence}`);
            console.log(`🤖 Agente sugerido: ${analysis.suggestedAgent}`);
            
            // Verificar se a análise está correta
            if (analysis.requiresDatabase === test.expected) {
                console.log('✅ Análise CORRETA');
            } else {
                console.log('❌ Análise INCORRETA');
            }
            
        } catch (error: any) {
            console.log(`❌ Erro: ${error.message}`);
        }
    }
}

/**
 * Executa todos os testes
 */
export async function runAllTests() {
    console.log('🚀 Iniciando Testes do Sistema de Agentes\n');
    console.log('=' .repeat(50));
    
    try {
        await testAgentSystem();
        await testUserCommunicationAgent();
        await testDatabaseQueryAgent();
        await testIntentAnalysis();
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ Todos os testes concluídos!');
        
    } catch (error: any) {
        console.log('\n❌ Erro durante os testes:', error.message);
    }
}

// Executar testes se o arquivo for executado diretamente
if (require.main === module) {
    runAllTests().catch(console.error);
}
