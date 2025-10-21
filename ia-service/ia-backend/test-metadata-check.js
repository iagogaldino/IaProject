const { MongoClient } = require('mongodb');

async function checkMetadata() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('db-ia');
    const metadataCollection = db.collection('metadatas');
    
    // Contar total de documentos
    const totalCount = await metadataCollection.countDocuments();
    console.log(`📊 Total de metadados: ${totalCount}`);
    
    // Contar documentos com embeddings
    const withEmbeddings = await metadataCollection.countDocuments({
      'embedding.vector': { $exists: true, $ne: [] }
    });
    console.log(`🔍 Com embeddings: ${withEmbeddings}`);
    
    // Mostrar alguns exemplos
    if (totalCount > 0) {
      const samples = await metadataCollection.find({}).limit(3).toArray();
      console.log('\n📋 Exemplos de metadados:');
      samples.forEach((doc, index) => {
        console.log(`\n${index + 1}. ID: ${doc._id}`);
        console.log(`   Tema: ${doc.theme}`);
        console.log(`   Tags: ${doc.tags?.join(', ') || 'N/A'}`);
        console.log(`   Tem embedding: ${doc.embedding?.vector ? 'Sim' : 'Não'}`);
        if (doc.embedding?.vector) {
          console.log(`   Dimensões do embedding: ${doc.embedding.vector.length}`);
          console.log(`   Modelo: ${doc.embedding.model || 'N/A'}`);
        }
      });
    }
    
    // Verificar agentes
    const agentsCollection = db.collection('agents');
    const agentCount = await agentsCollection.countDocuments();
    console.log(`\n🤖 Total de agentes: ${agentCount}`);
    
    const databaseAgent = await agentsCollection.findOne({ name: 'Agente Database' });
    if (databaseAgent) {
      console.log(`✅ Agente Database encontrado: ${databaseAgent._id}`);
      console.log(`   Status: ${databaseAgent.status}`);
      console.log(`   Database Access: ${databaseAgent.databaseAccess?.enabled ? 'Habilitado' : 'Desabilitado'}`);
    } else {
      console.log('❌ Agente Database não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

checkMetadata();
