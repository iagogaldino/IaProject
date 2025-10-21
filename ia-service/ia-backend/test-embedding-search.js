const mongoose = require('mongoose');
const { config } = require('./dist/config/config');
const { metadataService } = require('./dist/services/metadataService');
const { embeddingService } = require('./dist/services/embeddingService');
const { logger } = require('./dist/services/logger');

async function testEmbeddingSearch() {
  try {
    console.log('🧪 Testando funcionalidades de embedding...');

    // Conectar ao MongoDB
    await mongoose.connect(config.database.url);
    console.log('✅ Conectado ao MongoDB');

    // Teste 1: Verificar conexão com OpenAI
    console.log('\n🔍 Teste 1: Verificando conexão com OpenAI...');
    const connectionTest = await embeddingService.testConnection();
    console.log(`   Resultado: ${connectionTest ? '✅ Conectado' : '❌ Falha na conexão'}`);

    if (!connectionTest) {
      throw new Error('Falha na conexão com OpenAI');
    }

    // Teste 2: Gerar embedding para texto de exemplo
    console.log('\n🔍 Teste 2: Gerando embedding para texto de exemplo...');
    const testText = 'Dicas de produtividade no trabalho remoto e gestão de tempo';
    const embeddingResult = await embeddingService.generateEmbedding(testText);
    console.log(`   ✅ Embedding gerado com ${embeddingResult.embedding.length} dimensões`);
    console.log(`   📊 Modelo: ${embeddingResult.model}`);
    console.log(`   🔢 Tokens usados: ${embeddingResult.usage.total_tokens}`);

    // Teste 3: Verificar metadados com embeddings
    console.log('\n🔍 Teste 3: Verificando metadados com embeddings...');
    const metadataWithEmbeddings = await mongoose.connection.db.collection('metadatas').countDocuments({
      'embedding.vector': { $exists: true, $ne: [] }
    });
    const totalMetadata = await mongoose.connection.db.collection('metadatas').countDocuments();
    
    console.log(`   📊 Total de metadados: ${totalMetadata}`);
    console.log(`   📊 Com embeddings: ${metadataWithEmbeddings}`);
    console.log(`   📊 Sem embeddings: ${totalMetadata - metadataWithEmbeddings}`);

    if (metadataWithEmbeddings === 0) {
      console.log('   ⚠️  Nenhum metadado com embedding encontrado. Execute a migração primeiro.');
      return;
    }

    // Teste 4: Busca por similaridade
    console.log('\n🔍 Teste 4: Testando busca por similaridade...');
    const searchQuery = 'produtividade trabalho eficiência';
    console.log(`   🔍 Consulta: "${searchQuery}"`);
    
    const similarResults = await metadataService.searchSimilarMetadata(searchQuery, {
      limit: 5,
      threshold: 0.6
    });

    console.log(`   📊 Resultados encontrados: ${similarResults.length}`);
    similarResults.forEach((result, index) => {
      console.log(`   ${index + 1}. Tema: "${result.metadata.theme}"`);
      console.log(`      Similaridade: ${(result.similarity * 100).toFixed(2)}%`);
      console.log(`      Tags: [${result.metadata.tags.join(', ')}]`);
      console.log(`      Resumo: ${result.metadata.analysis.summary.substring(0, 100)}...`);
      console.log('');
    });

    // Teste 5: Busca por tema semântico
    console.log('\n🔍 Teste 5: Testando busca por tema semântico...');
    const themeQuery = 'gestão de projetos e metodologias ágeis';
    console.log(`   🔍 Tema: "${themeQuery}"`);
    
    const themeResults = await metadataService.searchBySemanticTheme(themeQuery, {
      limit: 3,
      threshold: 0.7
    });

    console.log(`   📊 Resultados encontrados: ${themeResults.length}`);
    themeResults.forEach((result, index) => {
      console.log(`   ${index + 1}. Tema: "${result.metadata.theme}"`);
      console.log(`      Similaridade: ${(result.similarity * 100).toFixed(2)}%`);
      console.log(`      Tópicos: [${result.metadata.analysis.keyTopics.join(', ')}]`);
      console.log('');
    });

    // Teste 6: Comparação de similaridade entre dois textos
    console.log('\n🔍 Teste 6: Comparando similaridade entre textos...');
    const text1 = 'Dicas para melhorar a produtividade no trabalho';
    const text2 = 'Como ser mais eficiente e produtivo no ambiente corporativo';
    
    const embedding1 = await embeddingService.generateEmbedding(text1);
    const embedding2 = await embeddingService.generateEmbedding(text2);
    
    const similarity = embeddingService.calculateCosineSimilarity(
      embedding1.embedding,
      embedding2.embedding
    );
    
    console.log(`   📝 Texto 1: "${text1}"`);
    console.log(`   📝 Texto 2: "${text2}"`);
    console.log(`   📊 Similaridade: ${(similarity * 100).toFixed(2)}%`);

    console.log('\n🎉 Todos os testes concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testEmbeddingSearch()
    .then(() => {
      console.log('✅ Testes finalizados com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro nos testes:', error);
      process.exit(1);
    });
}

module.exports = { testEmbeddingSearch };

