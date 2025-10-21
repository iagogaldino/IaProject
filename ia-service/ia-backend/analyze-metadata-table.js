const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';

async function analyzeMetadataTable() {
  console.log('🔍 ANÁLISE DETALHADA DA TABELA METADATAS\n');
  
  try {
    // 1. Verificar estatísticas gerais
    console.log('📊 1. ESTATÍSTICAS GERAIS\n');
    
    const statsResponse = await axios.get(
      `${API_BASE_URL}/metadata/stats`,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const stats = statsResponse.data.data;
    console.log('✅ Estatísticas da tabela metadatas:');
    console.log(`   Total de metadados: ${stats.totalMetadata}`);
    console.log(`   Por tema: ${Object.keys(stats.byTheme).length} temas únicos`);
    console.log(`   Por sentimento: ${Object.keys(stats.bySentiment).length} tipos`);
    console.log(`   Por agente: ${Object.keys(stats.byAgent).length} agentes`);
    console.log(`   Atividade recente: ${stats.recentActivity} registros\n`);

    // 2. Buscar todos os metadados por agente
    console.log('📋 2. ANÁLISE DETALHADA POR AGENTE\n');
    
    const agentIds = Object.keys(stats.byAgent);
    
    for (const agentId of agentIds) {
      console.log(`🤖 Agente: ${agentId}`);
      console.log('================================');
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/agents/${agentId}/metadata`,
          {
            headers: {
              'X-API-Key': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const metadataList = response.data.data;
        console.log(`✅ Encontrados ${metadataList.length} metadados`);
        
        metadataList.forEach((metadata, index) => {
          console.log(`\n📄 ${index + 1}. ${metadata.theme}`);
          console.log(`   ID: ${metadata.id}`);
          console.log(`   File ID: ${metadata.fileId}`);
          console.log(`   Criado em: ${new Date(metadata.createdAt).toLocaleString('pt-BR')}`);
          console.log(`   Atualizado em: ${new Date(metadata.updatedAt).toLocaleString('pt-BR')}`);
          
          // Análise do embedding
          if (metadata.embedding && metadata.embedding.vector && metadata.embedding.vector.length > 0) {
            console.log(`   🎯 EMBEDDING: ✅ SIM`);
            console.log(`      Vector length: ${metadata.embedding.vector.length}`);
            console.log(`      Model: ${metadata.embedding.model}`);
            console.log(`      Generated at: ${new Date(metadata.embedding.generatedAt).toLocaleString('pt-BR')}`);
            console.log(`      Version: ${metadata.embedding.version}`);
            
            // Mostrar alguns valores do vetor como exemplo
            const sampleValues = metadata.embedding.vector.slice(0, 5);
            console.log(`      Sample values: [${sampleValues.map(v => v.toFixed(6)).join(', ')}...]`);
          } else {
            console.log(`   ❌ EMBEDDING: NÃO`);
            console.log(`      Status: ${metadata.embedding ? 'Estrutura existe mas sem vector' : 'Sem estrutura de embedding'}`);
          }
          
          // Análise das tags
          console.log(`   🏷️  Tags: ${metadata.tags.join(', ')}`);
          
          // Análise do resumo
          const summaryLength = metadata.analysis.summary.length;
          console.log(`   📝 Resumo: ${summaryLength} caracteres`);
          console.log(`      ${metadata.analysis.summary.substring(0, 100)}${summaryLength > 100 ? '...' : ''}`);
          
          // Análise dos tópicos
          console.log(`   🔑 Tópicos: ${metadata.analysis.keyTopics.join(', ')}`);
          
          // Análise de sentimento e confiança
          console.log(`   😊 Sentimento: ${metadata.analysis.sentiment} (${(metadata.analysis.confidence * 100).toFixed(1)}% confiança)`);
        });
        
      } catch (error) {
        console.log(`❌ Erro ao buscar metadados do agente ${agentId}:`, error.response?.data?.error?.message || error.message);
      }
      
      console.log('\n');
    }

    // 3. Análise específica de embeddings
    console.log('🎯 3. ANÁLISE ESPECÍFICA DE EMBEDDINGS\n');
    
    let totalWithEmbeddings = 0;
    let totalWithoutEmbeddings = 0;
    const embeddingModels = new Set();
    const embeddingVersions = new Set();
    
    for (const agentId of agentIds) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/agents/${agentId}/metadata`,
          {
            headers: {
              'X-API-Key': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        response.data.data.forEach(metadata => {
          if (metadata.embedding && metadata.embedding.vector && metadata.embedding.vector.length > 0) {
            totalWithEmbeddings++;
            if (metadata.embedding.model) embeddingModels.add(metadata.embedding.model);
            if (metadata.embedding.version) embeddingVersions.add(metadata.embedding.version);
          } else {
            totalWithoutEmbeddings++;
          }
        });
        
      } catch (error) {
        console.log(`❌ Erro na análise de embeddings do agente ${agentId}`);
      }
    }
    
    console.log('📊 Resumo de embeddings:');
    console.log(`   ✅ Com embeddings: ${totalWithEmbeddings}`);
    console.log(`   ❌ Sem embeddings: ${totalWithoutEmbeddings}`);
    console.log(`   📈 Percentual com embeddings: ${((totalWithEmbeddings / (totalWithEmbeddings + totalWithoutEmbeddings)) * 100).toFixed(1)}%`);
    
    if (embeddingModels.size > 0) {
      console.log(`   🤖 Modelos usados: ${Array.from(embeddingModels).join(', ')}`);
    }
    
    if (embeddingVersions.size > 0) {
      console.log(`   📝 Versões: ${Array.from(embeddingVersions).join(', ')}`);
    }

    // 4. Testar busca com metadados que têm embeddings
    if (totalWithEmbeddings > 0) {
      console.log('\n🔍 4. TESTANDO BUSCA COM METADADOS QUE TÊM EMBEDDINGS\n');
      
      const testQueries = [
        'atendimento',
        'fisioterapia', 
        'produtividade',
        'trabalho remoto',
        'estágio'
      ];
      
      for (const query of testQueries) {
        console.log(`\n📤 Buscando: "${query}"`);
        
        try {
          const searchResponse = await axios.get(
            `${API_BASE_URL}/metadata/search/similar?query=${encodeURIComponent(query)}&limit=5&threshold=0.3`,
            {
              headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log(`   ✅ Resultados: ${searchResponse.data.data.length}`);
          
          if (searchResponse.data.data.length > 0) {
            console.log('   🎯 EMBEDDINGS FUNCIONANDO! ✅');
            searchResponse.data.data.forEach((result, index) => {
              console.log(`      ${index + 1}. ${result.metadata.theme} (${(result.similarity * 100).toFixed(1)}%)`);
            });
          } else {
            console.log('   ❌ Nenhum resultado encontrado');
          }
          
        } catch (error) {
          console.log(`   ❌ Erro na busca: ${error.response?.data?.error?.message || error.message}`);
        }
      }
    } else {
      console.log('\n⚠️  4. NENHUM METADADO COM EMBEDDINGS ENCONTRADO');
      console.log('   Todos os metadados precisam ter embeddings gerados para funcionar a busca semântica.');
    }

    // 5. Recomendações
    console.log('\n💡 5. RECOMENDAÇÕES\n');
    
    if (totalWithoutEmbeddings > 0) {
      console.log(`🔧 Ação necessária: Gerar embeddings para ${totalWithoutEmbeddings} metadados`);
      console.log('   Execute: POST /api/metadata/embeddings/generate');
    }
    
    if (totalWithEmbeddings > 0) {
      console.log('✅ Sistema de embeddings funcionando corretamente');
      console.log('   O agente deve conseguir encontrar resultados para consultas relacionadas aos temas existentes');
    }
    
    console.log('\n🎉 ANÁLISE CONCLUÍDA!');
    console.log('=====================');

  } catch (error) {
    console.log('❌ Erro geral:', error.response?.data?.error?.message || error.message);
  }
}

analyzeMetadataTable().catch(console.error);
