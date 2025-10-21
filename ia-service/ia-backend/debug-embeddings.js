const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';

async function debugEmbeddings() {
  console.log('🔍 DEBUG - EMBEDDINGS E METADADOS\n');
  
  try {
    // 1. Verificar estrutura dos metadados existentes
    console.log('📄 1. VERIFICANDO ESTRUTURA DOS METADADOS\n');
    
    const agentIds = ['68de6965a35f3420d9871fe6', '68de5d2bf6934dbd41a89f9f'];
    
    for (const agentId of agentIds) {
      console.log(`🤖 Agente: ${agentId}`);
      
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
        
        if (response.data.data.length > 0) {
          const metadata = response.data.data[0];
          console.log('📋 Estrutura do metadado:');
          console.log(`   ID: ${metadata.id}`);
          console.log(`   Tema: ${metadata.theme}`);
          console.log(`   Tags: ${JSON.stringify(metadata.tags)}`);
          console.log(`   Analysis: ${JSON.stringify(metadata.analysis)}`);
          console.log(`   Embedding: ${JSON.stringify(metadata.embedding)}`);
          console.log('');
        }
        
      } catch (error) {
        console.log(`❌ Erro:`, error.response?.data?.error?.message || error.message);
      }
    }

    // 2. Testar geração de embedding diretamente
    console.log('⚙️ 2. TESTANDO GERAÇÃO DE EMBEDDING DIRETA\n');
    
    try {
      // Usar o primeiro metadado para teste
      const testMetadata = {
        theme: "Teste de Embedding",
        tags: ["teste", "embedding"],
        analysis: {
          summary: "Teste de geração de embedding",
          keyTopics: ["teste", "embedding"]
        }
      };

      // Tentar criar um novo metadado com embedding
      const createResponse = await axios.post(
        `${API_BASE_URL}/metadata`,
        {
          fileId: "test-embedding-debug-001",
          agentId: "68dd625e8be0682166a76f97",
          theme: testMetadata.theme,
          improvedContent: "Conteúdo de teste para embedding",
          tags: testMetadata.tags,
          analysis: {
            summary: testMetadata.analysis.summary,
            keyTopics: testMetadata.analysis.keyTopics,
            sentiment: "positivo",
            confidence: 0.9,
            language: "pt-BR"
          }
        },
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Metadado criado com embedding:');
      console.log('Status:', createResponse.status);
      console.log('ID:', createResponse.data.data.id);
      console.log('Tem embedding:', createResponse.data.data.embedding ? 'SIM' : 'NÃO');
      
      if (createResponse.data.data.embedding) {
        console.log('Embedding vector length:', createResponse.data.data.embedding.vector?.length || 0);
        console.log('Model:', createResponse.data.data.embedding.model);
      }
      
      // Aguardar e testar busca
      console.log('\n⏳ Aguardando e testando busca...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const searchResponse = await axios.get(
        `${API_BASE_URL}/metadata/search/similar?query=teste&limit=5&threshold=0.5`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Busca após criação:');
      console.log('Resultados encontrados:', searchResponse.data.data.length);
      console.log('Dados:', JSON.stringify(searchResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Erro na criação/teste:', error.response?.data?.error?.message || error.message);
    }

    // 3. Verificar logs do servidor (se possível)
    console.log('\n📊 3. VERIFICANDO ESTATÍSTICAS FINAIS\n');
    
    try {
      const statsResponse = await axios.get(
        `${API_BASE_URL}/metadata/stats`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Estatísticas atuais:');
      console.log('Total metadados:', statsResponse.data.data.totalMetadata);
      console.log('Por tema:', JSON.stringify(statsResponse.data.data.byTheme, null, 2));
      console.log('Por agente:', JSON.stringify(statsResponse.data.data.byAgent, null, 2));
      
    } catch (error) {
      console.log('❌ Erro nas estatísticas:', error.response?.data?.error?.message || error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

debugEmbeddings().catch(console.error);
