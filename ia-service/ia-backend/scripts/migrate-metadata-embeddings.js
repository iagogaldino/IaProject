const mongoose = require('mongoose');
const { config } = require('../dist/config/config');
const { metadataService } = require('../dist/services/metadataService');
const { logger } = require('../dist/services/logger');

async function migrateMetadataEmbeddings() {
  try {
    console.log('🚀 Iniciando migração de embeddings para metadados existentes...');

    // Conectar ao MongoDB
    await mongoose.connect(config.database.url);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se há metadados sem embedding
    const totalMetadata = await mongoose.connection.db.collection('metadatas').countDocuments();
    const metadataWithEmbedding = await mongoose.connection.db.collection('metadatas').countDocuments({
      'embedding.vector': { $exists: true, $ne: [] }
    });
    const metadataWithoutEmbedding = totalMetadata - metadataWithEmbedding;

    console.log(`📊 Estatísticas dos metadados:`);
    console.log(`   Total de metadados: ${totalMetadata}`);
    console.log(`   Com embedding: ${metadataWithEmbedding}`);
    console.log(`   Sem embedding: ${metadataWithoutEmbedding}`);

    if (metadataWithoutEmbedding === 0) {
      console.log('✅ Todos os metadados já possuem embeddings. Migração não necessária.');
      return;
    }

    // Processar em lotes
    const batchSize = 10; // Processar 10 por vez para evitar rate limiting
    let totalProcessed = 0;
    let totalErrors = 0;
    let totalUpdated = 0;

    console.log(`🔄 Processando metadados em lotes de ${batchSize}...`);

    while (totalProcessed < metadataWithoutEmbedding) {
      const remaining = metadataWithoutEmbedding - totalProcessed;
      const currentBatchSize = Math.min(batchSize, remaining);
      
      console.log(`\n📦 Processando lote ${Math.floor(totalProcessed / batchSize) + 1} (${currentBatchSize} metadados)...`);

      const batchStats = await metadataService.generateMissingEmbeddings(currentBatchSize);
      
      totalProcessed += batchStats.processed;
      totalErrors += batchStats.errors;
      totalUpdated += batchStats.updated;

      console.log(`   ✅ Processados: ${batchStats.processed}`);
      console.log(`   ✅ Atualizados: ${batchStats.updated}`);
      console.log(`   ❌ Erros: ${batchStats.errors}`);

      // Pausa entre lotes para evitar rate limiting
      if (totalProcessed < metadataWithoutEmbedding) {
        console.log('⏳ Aguardando 2 segundos antes do próximo lote...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 Migração concluída!');
    console.log(`📊 Resumo final:`);
    console.log(`   Total processados: ${totalProcessed}`);
    console.log(`   Total atualizados: ${totalUpdated}`);
    console.log(`   Total erros: ${totalErrors}`);
    console.log(`   Taxa de sucesso: ${((totalUpdated / totalProcessed) * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateMetadataEmbeddings()
    .then(() => {
      console.log('✅ Migração finalizada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = { migrateMetadataEmbeddings };

