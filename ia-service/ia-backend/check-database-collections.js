/**
 * Script para verificar todas as coleções e dados no MongoDB
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'ia-service';

async function checkDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Listar todas as coleções
    const collections = await db.listCollections().toArray();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 Database: ${DB_NAME}`);
    console.log(`📦 Total de coleções: ${collections.length}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (collections.length === 0) {
      console.log('⚠️  Nenhuma coleção encontrada no banco de dados!\n');
      console.log('Isso significa que:');
      console.log('1. Os agentes ainda não foram criados');
      console.log('2. O servidor pode não ter sido iniciado ainda');
      console.log('3. O banco de dados está vazio\n');
      return;
    }
    
    // Verificar cada coleção
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      
      console.log(`📁 Coleção: ${collectionName}`);
      console.log(`   Documentos: ${count}`);
      
      if (count > 0) {
        // Mostrar alguns documentos
        const docs = await collection.find({}).limit(3).toArray();
        console.log(`   Exemplos:\n`);
        
        docs.forEach((doc, index) => {
          if (collectionName === 'agents') {
            console.log(`   ${index + 1}. 🤖 ${doc.name || 'Sem nome'}`);
            console.log(`      ID: ${doc._id}`);
            console.log(`      Status: ${doc.status || 'N/A'}`);
            if (doc.canCommunicateWith) {
              console.log(`      Pode comunicar com: ${doc.canCommunicateWith.length} agente(s)`);
            }
            if (doc.databaseAccess?.enabled) {
              console.log(`      ✅ Acesso a DATABASE`);
            }
          } else if (collectionName === 'metadata') {
            console.log(`   ${index + 1}. 📄 ${doc.theme || 'Sem tema'}`);
            console.log(`      ID: ${doc._id}`);
            console.log(`      Agent: ${doc.agentId || 'N/A'}`);
          } else {
            console.log(`   ${index + 1}. ${JSON.stringify(doc).substring(0, 100)}...`);
          }
          console.log('');
        });
      }
      
      console.log('');
    }
    
    // Informações sobre como criar agentes
    console.log('═══════════════════════════════════════════════════════');
    console.log('💡 COMO CRIAR AGENTES:\n');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Para criar agentes, você pode:');
    console.log('1. Usar a API POST /api/agents');
    console.log('2. Executar um script de setup');
    console.log('3. Usar o frontend para criar agentes\n');
    console.log('Exemplo de criação via curl:\n');
    console.log('curl -X POST http://localhost:3001/api/agents \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "X-API-Key: ai-backend-2024-abc123xyz789" \\');
    console.log('  -d \'{\n');
    console.log('    "name": "Database Agent",\n');
    console.log('    "description": "Especialista em consultas de banco de dados",\n');
    console.log('    "status": "active",\n');
    console.log('    "databaseAccess": {\n');
    console.log('      "enabled": true,\n');
    console.log('      "allowedCollections": ["metadata", "files"],\n');
    console.log('      "allowedOperations": ["read"]\n');
    console.log('    },\n');
    console.log('    "canCommunicateWith": []\n');
    console.log('  }\'');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

checkDatabase();

