const mongoose = require('mongoose');
const AgentModel = require('./dist/models/Agent.js').default;

async function analyzeDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ia-service');
        console.log('🔍 Conectado ao MongoDB');

        // Listar agentes
        const agents = await AgentModel.find();
        console.log('\n📊 AGENTES ENCONTRADOS:', agents.length);
        console.log('='.repeat(50));

        agents.forEach((agent, index) => {
            console.log(`${index + 1}. ${agent.name}`);
            console.log(`   ID: ${agent._id}`);
            console.log(`   Status: ${agent.status}`);
            console.log(`   Database Access: ${agent.databaseAccess ? 'Sim' : 'Não'}`);
            if (agent.databaseAccess) {
                console.log(`   Collections: ${agent.databaseAccess.allowedCollections?.join(', ') || 'Nenhuma'}`);
                console.log(`   Operations: ${agent.databaseAccess.allowedOperations?.join(', ') || 'Nenhuma'}`);
            }
            console.log('---');
        });

        // Conectar diretamente ao MongoDB para verificar collection metadatas
        const db = mongoose.connection.db;
        const metadatasCollection = db.collection('metadatas');

        console.log('\n📋 ANALISANDO COLLECTION METADATAS:');
        console.log('='.repeat(50));

        const metadataCount = await metadatasCollection.countDocuments();
        console.log(`Total de registros: ${metadataCount}`);

        if (metadataCount > 0) {
            const sampleDocs = await metadatasCollection.find().limit(2).toArray();
            console.log('\n📄 AMOSTRA DOS REGISTROS:');

            sampleDocs.forEach((doc, index) => {
                console.log(`\nRegistro ${index + 1}:`);
                console.log(`  _id: ${doc._id}`);
                console.log(`  theme: ${doc.theme || 'N/A'}`);
                console.log(`  improvedContent length: ${doc.improvedContent?.length || 0} chars`);
                console.log(`  tags count: ${doc.tags?.length || 0}`);
                console.log(`  analysis keys: ${doc.analysis ? Object.keys(doc.analysis).length : 0}`);
                console.log(`  aiAnalysis keys: ${doc.aiAnalysis ? Object.keys(doc.aiAnalysis).length : 0}`);
                console.log(`  embedding: ${doc.embedding ? 'Presente' : 'Ausente'}`);
                console.log(`  createdAt: ${doc.createdAt}`);
            });
        }

        await mongoose.disconnect();
        console.log('\n✅ Análise concluída!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

analyzeDatabase();
