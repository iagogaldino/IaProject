const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

async function testFileProcess() {
  try {
    console.log('🤖 Testando processamento de arquivo com IA...\n');

    const agentId = '68de5d2bf6934dbd41a89f9f'; // ID do Agente Excel
    const fileId = '9dc69f74-6e23-4d5a-94f0-21ccdc025ee4'; // ID do arquivo que acabamos de fazer upload
    
    console.log('📁 Processando arquivo:', fileId);
    console.log('🔄 Operação: analyze');
    console.log('🌐 Idioma: pt');

    const processData = {
      operation: 'analyze',
      options: {
        language: 'pt'
      }
    };

    const response = await axios.post(`${BASE_URL}/api/agents/${agentId}/files/${fileId}/process`, processData, { headers });
    
    console.log('✅ Processamento realizado com sucesso!');
    console.log('📋 Resultado da IA:');
    console.log('='.repeat(50));
    console.log(response.data.data.content);
    console.log('='.repeat(50));
    console.log('\n📊 Metadados:');
    console.log(`   Palavras: ${response.data.data.metadata.wordCount}`);
    console.log(`   Caracteres: ${response.data.data.metadata.characterCount}`);
    console.log(`   Idioma: ${response.data.data.metadata.language}`);
    console.log(`   Tipo: ${response.data.data.metadata.fileType}`);

  } catch (error) {
    console.error('❌ Erro no processamento:', error.response?.data || error.message);
  }
}

testFileProcess();
