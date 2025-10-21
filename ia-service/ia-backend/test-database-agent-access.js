const mongoose = require('mongoose');
require('dotenv').config();

// Configuração do MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-backend';

async function testDatabaseAgentAccess() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Conectar diretamente às coleções
    const db = mongoose.connection.db;
    const agentsCollection = db.collection('agents');
    const metadatasCollection = db.collection('metadatas');

    const agentId = "68dd625e8be0682166a76f97";
    
    // Buscar o agente
    const agent = await agentsCollection.findOne({ _id: new mongoose.Types.ObjectId(agentId) });
    
    if (agent) {
      console.log('🤖 Agente encontrado:');
      console.log(`   Nome: ${agent.name}`);
      console.log(`   ID: ${agent._id}`);
      
      // Verificar se é o Agente Database
      if (agent.name === 'Agente Database') {
        console.log('✅ É o Agente Database - deve ter acesso a TODOS os documentos');
        
        // Simular o filtro que o código modificado deveria usar
        const filter = { 'embedding.vector': { $exists: true } };
        // NÃO aplicar filtro por agentId para o Agente Database
        
        console.log(`\n📊 Filtro aplicado (sem agentId):`, JSON.stringify(filter, null, 2));

        const metadataList = await metadatasCollection.find(filter).toArray();
        console.log(`✅ Documentos encontrados: ${metadataList.length}`);

        if (metadataList.length > 0) {
          console.log(`\n📄 Documentos encontrados:`);
          metadataList.forEach((doc, index) => {
            const isPetrolina = doc.theme && doc.theme.includes('Petrolina');
            console.log(`${index + 1}. ${doc.theme} ${isPetrolina ? '🎯' : ''}`);
            console.log(`   Agent ID: ${doc.agentId}`);
          });

          // Verificar se o documento sobre Petrolina está incluído
          const petrolinaDoc = metadataList.find(doc => 
            doc.theme && doc.theme.includes('Petrolina')
          );

          if (petrolinaDoc) {
            console.log(`\n✅ Documento sobre Petrolina está incluído nos resultados!`);
            console.log(`   Theme: ${petrolinaDoc.theme}`);
            console.log(`   Agent ID: ${petrolinaDoc.agentId}`);
          } else {
            console.log(`\n❌ Documento sobre Petrolina NÃO está incluído nos resultados!`);
          }
        }
      } else {
        console.log('❌ Não é o Agente Database');
      }
    } else {
      console.log('❌ Agente não encontrado!');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

testDatabaseAgentAccess();
