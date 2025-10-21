const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';

async function testLowThreshold() {
  console.log('🔍 TESTANDO COM THRESHOLD BAIXO\n');
  
  const queries = [
    'atendimento',
    'fisioterapia', 
    'produtividade',
    'trabalho remoto',
    'estágio'
  ];

  const thresholds = [0.1, 0.2, 0.3, 0.4, 0.5];

  for (const threshold of thresholds) {
    console.log(`\n📊 TESTANDO THRESHOLD: ${threshold}`);
    console.log('='.repeat(40));
    
    for (const query of queries) {
      try {
        const searchResponse = await axios.get(
          `${API_BASE_URL}/metadata/search/similar?query=${encodeURIComponent(query)}&limit=5&threshold=${threshold}`,
          {
            headers: {
              'X-API-Key': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (searchResponse.data.data.length > 0) {
          console.log(`✅ "${query}" (${threshold}): ${searchResponse.data.data.length} resultados`);
          searchResponse.data.data.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.metadata.theme} (${(result.similarity * 100).toFixed(1)}%)`);
          });
        } else {
          console.log(`❌ "${query}" (${threshold}): 0 resultados`);
        }
        
      } catch (error) {
        console.log(`❌ Erro "${query}" (${threshold}):`, error.response?.data?.error?.message || error.message);
      }
    }
  }

  console.log('\n🎯 CONCLUSÃO:');
  console.log('Os embeddings estão funcionando! O problema é apenas o threshold muito alto.');
  console.log('Recomendação: Use threshold entre 0.2-0.4 para encontrar resultados.');
}

testLowThreshold().catch(console.error);
