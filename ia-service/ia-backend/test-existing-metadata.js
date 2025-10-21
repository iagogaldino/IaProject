const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd625e8be0682166a76f97';

async function testExistingMetadata() {
  console.log('🔍 TESTANDO COM METADADOS EXISTENTES\n');
  
  // Consultas que devem encontrar os metadados existentes
  const queries = [
    'Consulte metadados sobre produtividade',
    'Busque documentos sobre trabalho remoto',
    'Encontre textos sobre fisioterapia',
    'Procure por documentos sobre estágio',
    'Consulte metadados sobre atendimento a pacientes',
    'Busque documentos sobre deficiências',
    'Encontre textos sobre experiências profissionais',
    'Consulte metadados sobre trabalho',
    'Busque documentos sobre saúde',
    'Encontre textos sobre pacientes'
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

      const content = response.data.data.response.content;
      console.log('✅ Status:', response.status);
      console.log('📝 Resposta:');
      console.log(content);
      
      // Verificar se encontrou resultados
      if (content.includes('Encontrados') && content.includes('documento(s)')) {
        console.log('🎯 RESULTADOS ENCONTRADOS! ✅');
      } else if (content.includes('Não encontrei documentos')) {
        console.log('❌ Nenhum resultado encontrado');
      } else {
        console.log('⚠️  Resposta inesperada');
      }
      
    } catch (error) {
      console.log('❌ Erro:', error.response?.data?.error?.message || error.message);
    }
    
    // Pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

// Testar também com threshold mais baixo via busca direta
async function testDirectSearch() {
  console.log('\n\n🔍 TESTANDO BUSCA DIRETA COM THRESHOLD BAIXO\n');
  console.log('=============================================');
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/metadata/search/similar?query=atendimento&limit=5&threshold=0.3`,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Busca direta com threshold baixo:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro na busca direta:', error.response?.data?.error?.message || error.message);
  }
}

testExistingMetadata()
  .then(() => testDirectSearch())
  .catch(console.error);
