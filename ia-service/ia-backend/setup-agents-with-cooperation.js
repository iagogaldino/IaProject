/**
 * 🚀 Script para criar agentes com cooperação configurada
 * 
 * Este script cria:
 * 1. Agente Nina Petrolina (agente principal)
 * 2. Agente Database (especialista em banco de dados)
 * 3. Agente de Melhoria de Respostas (formata respostas do banco)
 * 
 * E configura a cooperação:
 * Nina → Database → Response Improver
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'ia-service';

async function setupAgents() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');
    
    const db = client.db(DB_NAME);
    const agentsCollection = db.collection('agents');
    
    // Limpar agentes existentes (opcional - comente se não quiser limpar)
    const existingCount = await agentsCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Encontrados ${existingCount} agente(s) existente(s)`);
      console.log('🗑️  Limpando agentes antigos...\n');
      await agentsCollection.deleteMany({});
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 CRIANDO AGENTES COM COOPERAÇÃO');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // ============================================================
    // PASSO 1: Criar Agente de Melhoria de Respostas (PRIMEIRO!)
    // ============================================================
    console.log('1️⃣  Criando Agente de Melhoria de Respostas...');
    
    const responseImproverAgent = {
      name: 'Response Improver Agent',
      description: 'Especialista em formatar e melhorar respostas para o usuário final. Recebe dados brutos e transforma em respostas claras, bem estruturadas e amigáveis.',
      status: 'active',
      canCommunicateWith: [], // Não precisa se comunicar com outros
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const responseImproverResult = await agentsCollection.insertOne(responseImproverAgent);
    const responseImproverId = responseImproverResult.insertedId.toString();
    
    console.log(`   ✅ Criado: ${responseImproverAgent.name}`);
    console.log(`   📝 ID: ${responseImproverId}\n`);
    
    // ============================================================
    // PASSO 2: Criar Agente Database (SEGUNDO!)
    // ============================================================
    console.log('2️⃣  Criando Agente Database...');
    
    const databaseAgent = {
      name: 'Database Agent',
      description: 'Especialista em consultas de banco de dados. Realiza buscas semânticas usando embeddings e retorna dados estruturados. Delega a formatação para o Response Improver Agent.',
      status: 'active',
      databaseAccess: {
        enabled: true,
        allowedCollections: ['metadata', 'files', 'agents'],
        allowedOperations: ['read'],
        queryLimits: {
          maxResults: 100,
          timeout: 30000
        }
      },
      canCommunicateWith: [responseImproverId], // ⭐ PODE CHAMAR O RESPONSE IMPROVER
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const databaseAgentResult = await agentsCollection.insertOne(databaseAgent);
    const databaseAgentId = databaseAgentResult.insertedId.toString();
    
    console.log(`   ✅ Criado: ${databaseAgent.name}`);
    console.log(`   📝 ID: ${databaseAgentId}`);
    console.log(`   📞 Pode comunicar com: Response Improver Agent\n`);
    
    // ============================================================
    // PASSO 3: Criar Agente Principal Nina Petrolina
    // ============================================================
    console.log('3️⃣  Criando Agente Principal (Nina Petrolina)...');
    
    const mainAgent = {
      name: 'Nina Petrolina',
      description: 'Assistente virtual da cidade de Petrolina. Especialista em informações municipais, obras públicas, e serviços da cidade. Coordena com agentes especializados quando necessário.',
      status: 'active',
      canCommunicateWith: [databaseAgentId, responseImproverId], // ⭐ PODE CHAMAR OS DOIS
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const mainAgentResult = await agentsCollection.insertOne(mainAgent);
    const mainAgentId = mainAgentResult.insertedId.toString();
    
    console.log(`   ✅ Criado: ${mainAgent.name}`);
    console.log(`   📝 ID: ${mainAgentId}`);
    console.log(`   📞 Pode comunicar com: Database Agent, Response Improver Agent\n`);
    
    // ============================================================
    // RESUMO FINAL
    // ============================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ AGENTES CRIADOS COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📊 HIERARQUIA DE COOPERAÇÃO:\n');
    console.log('   👤 Usuário Final');
    console.log('    ↓');
    console.log(`   🤖 ${mainAgent.name} (${mainAgentId})`);
    console.log('    ↓ (delega consultas de dados)');
    console.log(`   🗄️  ${databaseAgent.name} (${databaseAgentId})`);
    console.log('    ↓ (delega formatação)');
    console.log(`   ✨ ${responseImproverAgent.name} (${responseImproverId})`);
    console.log('    ↓');
    console.log('   👤 Usuário Final (resposta formatada)\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 TESTE COM CURL:');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`curl --location 'http://localhost:3001/api/agents/${mainAgentId}/chat' \\`);
    console.log(`  --header 'Content-Type: application/json' \\`);
    console.log(`  --header 'X-API-Key: ai-backend-2024-abc123xyz789' \\`);
    console.log(`  --data '{`);
    console.log(`    "messages": [`);
    console.log(`      {`);
    console.log(`        "role": "user",`);
    console.log(`        "content": "Me traga dados sobre pavimentação"`);
    console.log(`      }`);
    console.log(`    ]`);
    console.log(`  }'`);
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 PRÓXIMOS PASSOS:');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('1. ✅ Agentes criados e configurados');
    console.log('2. ⚠️  ATENÇÃO: O código ainda precisa ser modificado!');
    console.log('');
    console.log('   Atualmente, o Database Agent:');
    console.log('   ❌ Busca E formata localmente (linhas 75-79 do chatService.ts)');
    console.log('');
    console.log('   Para que ele chame o Response Improver, precisamos:');
    console.log('   ✅ Modificar queryDatabase() para retornar dados BRUTOS');
    console.log('   ✅ Modificar processAgentChat() para delegar formatação');
    console.log('');
    console.log('3. Quer que eu implemente essas mudanças? (Pergunta: S/N)\n');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

setupAgents();

