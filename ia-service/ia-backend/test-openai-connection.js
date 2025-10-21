const axios = require('axios');

async function testOpenAIConnection() {
  console.log('🔍 TESTANDO CONEXÃO COM OPENAI\n');
  
  try {
    // Testar se o servidor está respondendo
    console.log('📡 1. TESTANDO SERVIDOR\n');
    
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Servidor respondendo:', healthResponse.status);
    
    // Testar endpoint de embeddings diretamente
    console.log('\n⚙️ 2. TESTANDO ENDPOINT DE EMBEDDINGS\n');
    
    try {
      const response = await axios.post(
        'http://localhost:3001/api/metadata/embeddings/generate?batchSize=1',
        {},
        {
          headers: {
            'X-API-Key': 'ai-backend-2024-abc123xyz789',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Endpoint de embeddings:');
      console.log('Status:', response.status);
      console.log('Processados:', response.data.data.processed);
      console.log('Erros:', response.data.data.errors);
      console.log('Atualizados:', response.data.data.updated);
      
    } catch (error) {
      console.log('❌ Erro no endpoint de embeddings:');
      console.log('Status:', error.response?.status);
      console.log('Erro:', error.response?.data?.error?.message || error.message);
    }

    // Verificar logs do servidor
    console.log('\n📋 3. VERIFICANDO LOGS DO SERVIDOR\n');
    console.log('💡 Dica: Verifique os logs do servidor para erros da OpenAI API');
    console.log('   - Procure por erros relacionados à API key');
    console.log('   - Verifique se a chave da OpenAI está configurada');
    console.log('   - Confirme se há rate limiting ou problemas de conexão');

    // Testar criação de metadado com debug
    console.log('\n🧪 4. TESTANDO CRIAÇÃO COM DEBUG\n');
    
    const testMetadata = {
      fileId: "test-openai-debug-001",
      agentId: "68dd625e8be0682166a76f97",
      theme: "Teste de Conexão OpenAI",
      improvedContent: "Teste para verificar se a API da OpenAI está funcionando corretamente.",
      tags: ["teste", "openai", "debug"],
      analysis: {
        summary: "Teste de conexão com a API da OpenAI para geração de embeddings.",
        keyTopics: ["teste", "openai", "embeddings"],
        sentiment: "neutro",
        confidence: 0.8,
        language: "pt-BR"
      }
    };

    try {
      console.log('📤 Criando metadado de teste...');
      const response = await axios.post(
        'http://localhost:3001/api/metadata',
        testMetadata,
        {
          headers: {
            'X-API-Key': 'ai-backend-2024-abc123xyz789',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Metadado criado:');
      console.log('Status:', response.status);
      console.log('ID:', response.data.data.id);
      console.log('Tema:', response.data.data.theme);
      console.log('Tem embedding:', response.data.data.embedding ? '✅ SIM' : '❌ NÃO');
      
      if (response.data.data.embedding) {
        console.log('🎯 EMBEDDING GERADO COM SUCESSO!');
        console.log('Vector length:', response.data.data.embedding.vector?.length || 0);
        console.log('Model:', response.data.data.embedding.model);
      } else {
        console.log('❌ EMBEDDING NÃO FOI GERADO');
        console.log('💡 Possíveis causas:');
        console.log('   - API key da OpenAI inválida ou não configurada');
        console.log('   - Erro na conexão com a OpenAI');
        console.log('   - Rate limiting da OpenAI');
        console.log('   - Erro no código de geração de embeddings');
      }
      
    } catch (error) {
      console.log('❌ Erro na criação:');
      console.log('Status:', error.response?.status);
      console.log('Erro:', error.response?.data?.error?.message || error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testOpenAIConnection().catch(console.error);
