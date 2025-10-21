const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd625e8be0682166a76f97';

async function debugSearch() {
  console.log('🔍 Debug da busca vetorial...\n');

  const testQueries = [
    'Consulte metadados sobre o total gasto em Petrolina',
    'Busque informações sobre obras e construção',
    'Encontre documentos sobre investimentos'
  ];

  for (const query of testQueries) {
    console.log(`📝 Testando: "${query}"`);
    console.log('─'.repeat(60));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/agents/${AGENT_ID}/chat`,
        {
          messages: [{ role: 'user', content: query }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          timeout: 30000 // 30 segundos timeout
        }
      );

      console.log('📊 Status:', response.status);
      console.log('📋 Headers:', JSON.stringify(response.headers, null, 2));
      console.log('💾 Response data:', JSON.stringify(response.data, null, 2));

      if (response.data?.response?.content) {
        console.log('✅ Conteúdo da resposta encontrado!');
        console.log('📝 Resposta:', response.data.response.content);
      } else {
        console.log('❌ Nenhum conteúdo na resposta');
      }

    } catch (error) {
      console.log('❌ Erro:', error.message);
      if (error.response) {
        console.log('📊 Status do erro:', error.response.status);
        console.log('📋 Dados do erro:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

debugSearch();
