const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';

async function debugEmbeddingSearch() {
  console.log('🔍 DEBUG - BUSCA DE EMBEDDINGS\n');
  
  try {
    // 1. Verificar se há metadados com embeddings na busca
    console.log('📊 1. VERIFICANDO FILTRO DE EMBEDDINGS\n');
    
    try {
      // Buscar todos os metadados (sem filtro de embedding)
      const allResponse = await axios.get(
        `${API_BASE_URL}/agents/68dd625e8be0682166a76f97/metadata`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Total de metadados do agente: ${allResponse.data.data.length}`);
      
      allResponse.data.data.forEach((metadata, index) => {
        console.log(`\n${index + 1}. ${metadata.theme}`);
        console.log(`   Tem embedding: ${metadata.embedding ? 'SIM' : 'NÃO'}`);
        if (metadata.embedding) {
          console.log(`   Vector length: ${metadata.embedding.vector?.length || 0}`);
          console.log(`   Model: ${metadata.embedding.model}`);
        }
      });
      
    } catch (error) {
      console.log('❌ Erro ao buscar metadados:', error.response?.data?.error?.message || error.message);
    }

    // 2. Testar busca com diferentes parâmetros
    console.log('\n\n🔍 2. TESTANDO BUSCA COM DIFERENTES PARÂMETROS\n');
    
    const testCases = [
      { query: 'atendimento', threshold: 0.1, limit: 10 },
      { query: 'atendimento', threshold: 0.05, limit: 10 },
      { query: 'atendimento', threshold: 0.01, limit: 10 },
      { query: 'cliente', threshold: 0.1, limit: 10 },
      { query: 'suporte', threshold: 0.1, limit: 10 },
      { query: 'teste', threshold: 0.1, limit: 10 }
    ];

    for (const testCase of testCases) {
      console.log(`\n📤 Testando: "${testCase.query}" (threshold: ${testCase.threshold}, limit: ${testCase.limit})`);
      
      try {
        const searchResponse = await axios.get(
          `${API_BASE_URL}/metadata/search/similar?query=${encodeURIComponent(testCase.query)}&limit=${testCase.limit}&threshold=${testCase.threshold}`,
          {
            headers: {
              'X-API-Key': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`   ✅ Status: ${searchResponse.status}`);
        console.log(`   📊 Resultados: ${searchResponse.data.data.length}`);
        console.log(`   🔍 Meta: ${JSON.stringify(searchResponse.data.meta, null, 2)}`);
        
        if (searchResponse.data.data.length > 0) {
          console.log('   🎯 RESULTADOS ENCONTRADOS! ✅');
          searchResponse.data.data.forEach((result, index) => {
            console.log(`      ${index + 1}. ${result.metadata.theme} (${(result.similarity * 100).toFixed(1)}%)`);
          });
        } else {
          console.log('   ❌ Nenhum resultado encontrado');
        }
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.response?.data?.error?.message || error.message}`);
      }
    }

    // 3. Testar busca por tema semântico
    console.log('\n\n🎯 3. TESTANDO BUSCA POR TEMA SEMÂNTICO\n');
    
    const themeQueries = [
      'atendimento ao cliente',
      'fisioterapia',
      'produtividade',
      'trabalho remoto'
    ];

    for (const theme of themeQueries) {
      console.log(`\n📤 Tema: "${theme}"`);
      
      try {
        const themeResponse = await axios.get(
          `${API_BASE_URL}/metadata/search/theme?theme=${encodeURIComponent(theme)}&limit=5&threshold=0.1`,
          {
            headers: {
              'X-API-Key': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`   ✅ Resultados: ${themeResponse.data.data.length}`);
        
        if (themeResponse.data.data.length > 0) {
          console.log('   🎯 TEMA ENCONTRADO! ✅');
          themeResponse.data.data.forEach((result, index) => {
            console.log(`      ${index + 1}. ${result.metadata.theme} (${(result.similarity * 100).toFixed(1)}%)`);
          });
        } else {
          console.log('   ❌ Tema não encontrado');
        }
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.response?.data?.error?.message || error.message}`);
      }
    }

    console.log('\n🎉 DEBUG CONCLUÍDO!');
    console.log('===================');

  } catch (error) {
    console.log('❌ Erro geral:', error.response?.data?.error?.message || error.message);
  }
}

debugEmbeddingSearch().catch(console.error);
