const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';

async function checkEmbeddings() {
  console.log('🔍 VERIFICANDO EMBEDDINGS DOS METADADOS EXISTENTES\n');
  
  try {
    // Primeiro, vamos tentar buscar metadados diretamente
    console.log('📡 Buscando metadados por agente...');
    
    // Tentar buscar metadados por cada agente que aparece nas estatísticas
    const agentIds = ['68de6965a35f3420d9871fe6', '68de5d2bf6934dbd41a89f9f'];
    
    for (const agentId of agentIds) {
      console.log(`\n🤖 Buscando metadados do agente: ${agentId}`);
      
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
        
        console.log(`✅ Encontrados ${response.data.data.length} metadados`);
        
        if (response.data.data.length > 0) {
          const metadata = response.data.data[0];
          console.log('📄 Primeiro metadado:');
          console.log(`   Tema: ${metadata.theme}`);
          console.log(`   Tem embedding: ${metadata.embedding ? '✅ SIM' : '❌ NÃO'}`);
          console.log(`   Embedding vector length: ${metadata.embedding?.vector?.length || 0}`);
          console.log(`   Model: ${metadata.embedding?.model || 'N/A'}`);
          console.log(`   Generated at: ${metadata.embedding?.generatedAt || 'N/A'}`);
        }
        
      } catch (error) {
        console.log(`❌ Erro ao buscar metadados do agente ${agentId}:`, error.response?.data?.error?.message || error.message);
      }
    }

    // Tentar gerar embeddings para metadados existentes
    console.log('\n\n⚙️ TENTANDO GERAR EMBEDDINGS PARA METADADOS EXISTENTES\n');
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/metadata/embeddings/generate?batchSize=10`,
        {},
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Geração de embeddings iniciada:');
      console.log('Status:', response.status);
      console.log('Resposta:', JSON.stringify(response.data, null, 2));
      
      // Aguardar um pouco e testar novamente
      console.log('\n⏳ Aguardando processamento...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Testar busca novamente
      console.log('\n🔍 Testando busca após geração de embeddings...');
      const searchResponse = await axios.get(
        `${API_BASE_URL}/metadata/search/similar?query=atendimento&limit=5&threshold=0.3`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Busca após geração:');
      console.log('Status:', searchResponse.status);
      console.log('Resultados encontrados:', searchResponse.data.data.length);
      console.log('Dados:', JSON.stringify(searchResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Erro ao gerar embeddings:', error.response?.data?.error?.message || error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkEmbeddings().catch(console.error);
