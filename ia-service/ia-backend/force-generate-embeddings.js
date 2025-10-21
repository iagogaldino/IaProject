const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';

async function forceGenerateEmbeddings() {
  console.log('⚙️ FORÇANDO GERAÇÃO DE EMBEDDINGS\n');
  
  try {
    // 1. Tentar gerar embeddings em lotes
    console.log('📦 1. GERANDO EMBEDDINGS EM LOTES\n');
    
    for (let batchSize = 1; batchSize <= 10; batchSize++) {
      console.log(`\n📤 Tentando com batch size: ${batchSize}`);
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/metadata/embeddings/generate?batchSize=${batchSize}`,
          {},
          {
            headers: {
              'X-API-Key': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`✅ Batch ${batchSize}:`);
        console.log(`   Processados: ${response.data.data.processed}`);
        console.log(`   Erros: ${response.data.data.errors}`);
        console.log(`   Atualizados: ${response.data.data.updated}`);
        
        if (response.data.data.updated > 0) {
          console.log(`🎯 EMBEDDINGS GERADOS COM BATCH ${batchSize}!`);
          break;
        }
        
      } catch (error) {
        console.log(`❌ Erro no batch ${batchSize}:`, error.response?.data?.error?.message || error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 2. Tentar atualizar embeddings individualmente
    console.log('\n🔄 2. TENTANDO ATUALIZAR EMBEDDINGS INDIVIDUALMENTE\n');
    
    const metadataIds = [
      '68e1144871c6360ea6190d53', // Teste de Conexão OpenAI
      '68e113ba71c6360ea6190d44', // Atendimento ao Cliente e Suporte
      '68de6b837c9d334479eb7766', // Dicas de produtividade
      '68dfe268d9e3a4a2ef5432fc'  // Experiências de estágio
    ];
    
    for (const metadataId of metadataIds) {
      console.log(`\n📤 Atualizando embedding para: ${metadataId}`);
      
      try {
        const response = await axios.put(
          `${API_BASE_URL}/metadata/${metadataId}/embedding`,
          {},
          {
            headers: {
              'X-API-Key': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`✅ Atualizado com sucesso!`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
        
      } catch (error) {
        console.log(`❌ Erro ao atualizar ${metadataId}:`, error.response?.data?.error?.message || error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // 3. Verificar se os embeddings foram gerados
    console.log('\n🔍 3. VERIFICANDO SE EMBEDDINGS FORAM GERADOS\n');
    
    for (const metadataId of metadataIds) {
      try {
        // Buscar o metadado específico (vamos usar o agente para isso)
        const agentIds = ['68dd625e8be0682166a76f97', '68de6965a35f3420d9871fe6', '68de5d2bf6934dbd41a89f9f'];
        
        for (const agentId of agentIds) {
          const response = await axios.get(
            `${API_BASE_URL}/agents/${agentId}/metadata`,
            {
              headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );
          
          const metadata = response.data.data.find(m => m.id === metadataId);
          if (metadata) {
            console.log(`\n📄 ${metadata.theme}`);
            console.log(`   ID: ${metadata.id}`);
            console.log(`   Tem embedding: ${metadata.embedding && metadata.embedding.vector && metadata.embedding.vector.length > 0 ? '✅ SIM' : '❌ NÃO'}`);
            
            if (metadata.embedding && metadata.embedding.vector && metadata.embedding.vector.length > 0) {
              console.log(`   Vector length: ${metadata.embedding.vector.length}`);
              console.log(`   Model: ${metadata.embedding.model}`);
              console.log(`   Generated: ${new Date(metadata.embedding.generatedAt).toLocaleString('pt-BR')}`);
            }
            break;
          }
        }
        
      } catch (error) {
        console.log(`❌ Erro ao verificar ${metadataId}`);
      }
    }

    // 4. Testar busca final
    console.log('\n🧪 4. TESTANDO BUSCA FINAL\n');
    
    const testQueries = [
      'atendimento',
      'fisioterapia',
      'produtividade',
      'trabalho remoto'
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

    console.log('\n🎉 TENTATIVA DE GERAÇÃO CONCLUÍDA!');
    console.log('===================================');

  } catch (error) {
    console.log('❌ Erro geral:', error.response?.data?.error?.message || error.message);
  }
}

forceGenerateEmbeddings().catch(console.error);
