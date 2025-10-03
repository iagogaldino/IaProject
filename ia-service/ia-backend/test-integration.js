const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testando integração com API externa...\n');

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'your-secure-api-key-here'; // Default key from env.example
const EXTERNAL_API_URL = 'http://localhost:3000/api/extract';

async function waitForServer(url, maxAttempts = 30, delay = 2000) {
  console.log(`⏳ Aguardando servidor em ${url}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(url, { timeout: 5000 });
      console.log(`✅ Servidor está rodando em ${url}`);
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        console.log(`   Tentativa ${i + 1}/${maxAttempts} - Aguardando ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.log(`❌ Servidor não está respondendo em ${url}`);
  return false;
}

async function testServerHealth() {
  try {
    console.log('1. Testando saúde do servidor...');
    
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 10000
    });
    
    console.log('✅ Servidor está saudável:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Servidor não está saudável:', error.message);
    return false;
  }
}

async function testExternalApiHealth() {
  try {
    console.log('\n2. Testando saúde da API externa...');
    
    const response = await axios.get(`${API_BASE_URL}/api/files/external-api/health`, {
      headers: {
        'X-API-Key': API_KEY
      },
      timeout: 10000
    });
    
    console.log('✅ API externa está saudável:', response.data);
    return response.data.success;
  } catch (error) {
    console.log('❌ API externa não está saudável:', error.message);
    return false;
  }
}

async function testExternalApiConnection() {
  try {
    console.log('\n3. Testando conexão com API externa...');
    
    const response = await axios.get(`${API_BASE_URL}/api/files/external-api/test-connection`, {
      headers: {
        'X-API-Key': API_KEY
      },
      timeout: 15000
    });
    
    console.log('✅ Conexão com API externa OK:', response.data);
    return response.data.success;
  } catch (error) {
    console.log('❌ Erro na conexão com API externa:', error.message);
    return false;
  }
}

async function testDirectExternalApi() {
  try {
    console.log('\n4. Testando API externa diretamente...');
    
    // Create a test file
    const testContent = 'Este é um arquivo de teste para verificar a integração.';
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', Buffer.from(testContent, 'utf-8'), {
      filename: 'teste.txt',
      contentType: 'text/plain'
    });
    formData.append('fileType', 'txt');
    formData.append('processWithAI', 'true');

    const response = await axios.post(EXTERNAL_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });

    console.log('✅ API externa funcionando:', {
      success: response.data.success,
      hasContent: !!response.data.data?.content,
      contentLength: response.data.data?.content?.length || 0
    });
    
    return response.data.success;
  } catch (error) {
    console.log('❌ Erro ao testar API externa diretamente:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de integração...\n');
  
  // Wait for server to be ready
  const serverReady = await waitForServer(API_BASE_URL);
  if (!serverReady) {
    console.log('\n❌ Servidor não está disponível. Execute: node start-server.js');
    process.exit(1);
  }
  
  const results = {
    serverHealth: false,
    externalApiHealth: false,
    externalApiConnection: false,
    directExternalApi: false
  };

  // Test 1: Server health
  results.serverHealth = await testServerHealth();
  
  // Test 2: External API health
  results.externalApiHealth = await testExternalApiHealth();
  
  // Test 3: External API connection
  results.externalApiConnection = await testExternalApiConnection();
  
  // Test 4: Direct external API test
  results.directExternalApi = await testDirectExternalApi();

  // Summary
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('================================');
  console.log(`✅ Saúde do servidor: ${results.serverHealth ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Saúde da API externa: ${results.externalApiHealth ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Conexão com API externa: ${results.externalApiConnection ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Teste direto da API externa: ${results.directExternalApi ? 'PASSOU' : 'FALHOU'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 RESULTADO GERAL: ${allPassed ? 'TODOS OS TESTES PASSARAM!' : 'ALGUNS TESTES FALHARAM'}`);
  
  if (!allPassed) {
    console.log('\n🔧 VERIFICAÇÕES NECESSÁRIAS:');
    if (!results.serverHealth) {
      console.log('- Verifique se o servidor está rodando');
    }
    if (!results.externalApiHealth || !results.externalApiConnection) {
      console.log('- Verifique se a API externa está rodando em:', EXTERNAL_API_URL);
    }
    if (!results.directExternalApi) {
      console.log('- Verifique se a API externa está funcionando corretamente');
    }
  }

  process.exit(allPassed ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  console.error('❌ Erro ao executar testes:', error);
  process.exit(1);
});
