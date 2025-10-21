/**
 * Script para verificar agentes no database correto: db-ia
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'db-ia'; // ⭐ Database correto!

async function checkAgents() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB\n');

        const db = client.db(DB_NAME);
        const agentsCollection = db.collection('agents');

        // Buscar todos os agentes
        const agents = await agentsCollection.find({}).toArray();

        console.log('═══════════════════════════════════════════════════════');
        console.log(`📊 Database: ${DB_NAME}`);
        console.log(`🤖 Total de agentes: ${agents.length}`);
        console.log('═══════════════════════════════════════════════════════\n');

        if (agents.length === 0) {
            console.log('⚠️  Nenhum agente encontrado!\n');
            return;
        }

        // Identificar agentes importantes
        let databaseAgent = null;
        let responseImproverAgent = null;
        let mainAgent = null;

        // Listar todos os agentes
        agents.forEach((agent, index) => {
            console.log(`${index + 1}. 🤖 ${agent.name}`);
            console.log(`   📝 ID: ${agent._id}`);
            console.log(`   ⚡ Status: ${agent.status}`);
            console.log(`   📄 Descrição: ${agent.description.substring(0, 100)}...`);

            // Database Access
            if (agent.databaseAccess?.enabled) {
                console.log(`   ✅ Acesso a DATABASE`);
                console.log(`      Collections: ${agent.databaseAccess.allowedCollections.join(', ')}`);
                databaseAgent = agent;
            }

            // File Access
            if (agent.fileAccess?.enabled) {
                console.log(`   ✅ Acesso a ARQUIVOS`);
                console.log(`      Types: ${agent.fileAccess.allowedFileTypes.join(', ')}`);
            }

            // Communication
            if (agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
                console.log(`   📞 Pode comunicar com ${agent.canCommunicateWith.length} agente(s):`);
                agent.canCommunicateWith.forEach(id => {
                    console.log(`      → ${id}`);
                });
            } else {
                console.log(`   📞 Pode comunicar com: TODOS os agentes (array vazio/null)`);
            }

            console.log('');

            // Identificar tipos de agentes
            const nameLower = agent.name.toLowerCase();
            const descLower = agent.description.toLowerCase();

            if (nameLower.includes('database') || nameLower.includes('banco')) {
                databaseAgent = agent;
            }

            if (nameLower.includes('melhorar') || nameLower.includes('melhoria') ||
                nameLower.includes('resposta') || nameLower.includes('response') ||
                descLower.includes('formatar') || descLower.includes('format')) {
                responseImproverAgent = agent;
            }

            if (nameLower.includes('nina') || nameLower.includes('principal') ||
                (!agent.databaseAccess?.enabled && !agent.fileAccess?.enabled)) {
                mainAgent = agent;
            }
        });

        // ============================================================
        // ANÁLISE DE COOPERAÇÃO
        // ============================================================
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🔍 ANÁLISE DE COOPERAÇÃO');
        console.log('═══════════════════════════════════════════════════════\n');

        if (databaseAgent) {
            console.log(`✅ Agente de BANCO DE DADOS identificado:`);
            console.log(`   Nome: ${databaseAgent.name}`);
            console.log(`   ID: ${databaseAgent._id}\n`);
        } else {
            console.log(`⚠️  Agente de Banco de Dados NÃO identificado\n`);
        }

        if (responseImproverAgent) {
            console.log(`✅ Agente de MELHORIA DE RESPOSTA identificado:`);
            console.log(`   Nome: ${responseImproverAgent.name}`);
            console.log(`   ID: ${responseImproverAgent._id}\n`);
        } else {
            console.log(`⚠️  Agente de Melhoria de Resposta NÃO identificado\n`);
            console.log(`💡 Procurando por palavras-chave: "melhorar", "melhoria", "resposta", "response", "formatar"\n`);
        }

        // ============================================================
        // VERIFICAÇÃO CRÍTICA
        // ============================================================
        console.log('═══════════════════════════════════════════════════════');
        console.log('⚠️  VERIFICAÇÃO CRÍTICA: Database Agent → Response Improver');
        console.log('═══════════════════════════════════════════════════════\n');

        if (databaseAgent && responseImproverAgent) {
            const dbAgentCommunication = databaseAgent.canCommunicateWith || [];
            const responseImproverId = responseImproverAgent._id.toString();

            const canCommunicate =
                dbAgentCommunication.length === 0 || // Vazio = pode comunicar com todos
                dbAgentCommunication.includes(responseImproverId) ||
                dbAgentCommunication.some(id => id.toString() === responseImproverId);

            if (canCommunicate) {
                console.log(`✅ Database Agent PODE se comunicar com Response Improver`);

                if (dbAgentCommunication.length === 0) {
                    console.log(`   Motivo: canCommunicateWith está vazio (pode comunicar com todos)`);
                } else {
                    console.log(`   Motivo: ID do Response Improver está na lista`);
                }

                console.log(`\n   🎯 CONFIGURAÇÃO CORRETA! ✅`);
            } else {
                console.log(`❌ Database Agent NÃO PODE se comunicar com Response Improver`);
                console.log(`\n   🔧 SOLUÇÃO: Adicionar o ID do Response Improver ao canCommunicateWith:`);
                console.log(`\n   db.agents.updateOne(`);
                console.log(`     { _id: ObjectId("${databaseAgent._id}") },`);
                console.log(`     { $push: { canCommunicateWith: "${responseImproverId}" } }`);
                console.log(`   )\n`);
            }
        } else {
            console.log(`⚠️  Não foi possível verificar (um dos agentes não foi identificado)\n`);
        }

        // ============================================================
        // PROBLEMA DO CÓDIGO
        // ============================================================
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🚨 PROBLEMA NO CÓDIGO (chatService.ts)');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('Mesmo que a configuração esteja correta, o código atual NÃO');
        console.log('faz o Database Agent chamar o Response Improver!\n');

        console.log('❌ PROBLEMA (linhas 75-79 do chatService.ts):');
        console.log('   else if (this.shouldQueryDatabase(lastMessage.content, agent)) {');
        console.log('     response = await this.queryDatabase(agent, lastMessage.content);');
        console.log('   }\n');

        console.log('   → Database Agent processa E formata LOCALMENTE');
        console.log('   → NUNCA delega para outro agente\n');

        console.log('✅ SOLUÇÃO:');
        console.log('   1. Database Agent retorna dados BRUTOS');
        console.log('   2. Sistema detecta que precisa formatar');
        console.log('   3. Sistema chama Response Improver Agent');
        console.log('   4. Response Improver formata e retorna\n');

        console.log('🔧 Quer que eu implemente essa mudança no código?\n');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error(error);
    } finally {
        await client.close();
    }
}

checkAgents();

