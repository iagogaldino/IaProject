const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd625e8be0682166a76f97';

async function testAgentDirect() {
  console.log('🤖 TESTE DIRETO DO AGENTE DATABASE\n');
  
  const chatRequest = {
    messages: [
      {
        role: 'user',
        content: 'Consulte metadados sobre atendimento'
      }
    ]
  };

  try {
    console.log('📤 Enviando requisição...');
    console.log(`URL: ${API_BASE_URL}/agents/${AGENT_ID}/chat`);
    console.log(`Query: "${chatRequest.messages[0].content}"`);
    
    const response = await axios.post(
      `${API_BASE_URL}/agents/${AGENT_ID}/chat`,
      chatRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );

    console.log('\n✅ Resposta recebida:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Verificar se a resposta contém informações sobre embeddings
    if (response.data && response.data.response) {
      const content = response.data.response.content;
      console.log('\n📝 Conteúdo da resposta:');
      console.log(content);
      
      if (content.toLowerCase().includes('busca semântica') || 
          content.toLowerCase().includes('embedding') || 
          content.toLowerCase().includes('similaridade')) {
        console.log('\n🎯 EMBEDDINGS DETECTADOS! ✅');
      } else {
        console.log('\n⚠️  Resposta não indica uso de embeddings');
      }
    }

  } catch (error) {
    console.log('\n❌ Erro na requisição:');
    console.log('Status:', error.response?.status);
    console.log('Headers:', error.response?.headers);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Message:', error.message);
  }
}

// Testar também com outras consultas
async function testMultipleQueries() {
  console.log('\n\n🔍 TESTANDO MÚLTIPLAS CONSULTAS\n');
  console.log('================================');
  
  const queries = [
    'Consulte metadados sobre atendimento',
    'Busque documentos similares sobre inteligência artificial',
    'Encontre textos sobre análise de dados',
    'Procure por documentos relacionados a tecnologia'
  ];

  for (const query of queries) {
    console.log(`\n📤 Testando: "${query}"`);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/agents/${AGENT_ID}/chat`,
        {
          messages: [{ role: 'user', content: query }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          }
        }
      );

      console.log('✅ Status:', response.status);
      console.log('📝 Resposta:', response.data.response.content.substring(0, 200) + '...');
      
    } catch (error) {
      console.log('❌ Erro:', error.response?.data?.error?.message || error.message);
    }
    
    // Pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Executar testes
testAgentDirect()
  .then(() => testMultipleQueries())
  .catch(console.error);
