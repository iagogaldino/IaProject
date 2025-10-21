/**
 * Script para procurar um agente específico por ID
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'ia-service';
const AGENT_ID = '68dd37501d9bfcc29e34574b'; // ID do curl original

async function findAgent() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Tentar encontrar o agente
    console.log(`🔍 Procurando agente com ID: ${AGENT_ID}\n`);
    
    const agentsCollection = db.collection('agents');
    
    // Tentar como ObjectId
    let agent = null;
    try {
      agent = await agentsCollection.findOne({ _id: new ObjectId(AGENT_ID) });
    } catch (e) {
      // Se falhar, tentar como string
      agent = await agentsCollection.findOne({ _id: AGENT_ID });
    }
    
    if (agent) {
      console.log('✅ AGENTE ENCONTRADO!\n');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`🤖 ${agent.name}`);
      console.log('═══════════════════════════════════════════════════════\n');
      console.log(`ID: ${agent._id}`);
      console.log(`Status: ${agent.status}`);
      console.log(`Descrição: ${agent.description}\n`);
      
      if (agent.databaseAccess?.enabled) {
        console.log('✅ ACESSO A DATABASE:');
        console.log(`   Collections: ${agent.databaseAccess.allowedCollections.join(', ')}`);
        console.log(`   Operations: ${agent.databaseAccess.allowedOperations.join(', ')}\n`);
      }
      
      if (agent.fileAccess?.enabled) {
        console.log('✅ ACESSO A ARQUIVOS:');
        console.log(`   File types: ${agent.fileAccess.allowedFileTypes.join(', ')}\n`);
      }
      
      if (agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
        console.log('📞 PODE COMUNICAR COM:');
        agent.canCommunicateWith.forEach((id, index) => {
          console.log(`   ${index + 1}. ${id}`);
        });
        console.log('');
        
        // Buscar nomes dos agentes
        console.log('📋 DETALHES DOS AGENTES NA LISTA:\n');
        for (const otherId of agent.canCommunicateWith) {
          try {
            const otherAgent = await agentsCollection.findOne({ _id: new ObjectId(otherId) });
            if (otherAgent) {
              console.log(`   🤖 ${otherAgent.name}`);
              console.log(`      ID: ${otherAgent._id}`);
              console.log(`      Descrição: ${otherAgent.description.substring(0, 80)}...`);
              
              // Verificar se é o agente de melhoria de respostas
              if (otherAgent.name.toLowerCase().includes('melhorar') || 
                  otherAgent.name.toLowerCase().includes('melhoria') ||
                  otherAgent.name.toLowerCase().includes('resposta')) {
                console.log(`      ⭐ ESTE É O AGENTE DE MELHORIA DE RESPOSTAS!`);
              }
              console.log('');
            } else {
              console.log(`   ⚠️  Agente ${otherId} não encontrado\n`);
            }
          } catch (e) {
            console.log(`   ⚠️  Erro ao buscar agente ${otherId}\n`);
          }
        }
      } else {
        console.log('📞 PODE COMUNICAR COM: TODOS (sem restrição)\n');
      }
      
    } else {
      console.log('❌ AGENTE NÃO ENCONTRADO\n');
      console.log('Isso pode significar:');
      console.log('1. O ID está incorreto');
      console.log('2. O agente ainda não foi criado');
      console.log('3. Os agentes estão em outro database ou coleção\n');
      
      // Listar todos os agentes disponíveis
      const allAgents = await agentsCollection.find({}).toArray();
      if (allAgents.length > 0) {
        console.log(`\n📋 Agentes disponíveis (${allAgents.length}):\n`);
        allAgents.forEach((a, index) => {
          console.log(`${index + 1}. ${a.name}`);
          console.log(`   ID: ${a._id}`);
          console.log('');
        });
      } else {
        console.log('\n⚠️  Nenhum agente encontrado no banco de dados.\n');
        console.log('💡 Você precisa criar os agentes primeiro!\n');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

findAgent();

