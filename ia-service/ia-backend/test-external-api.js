const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_KEY = process.env.API_KEY || 'your-secure-api-key-here';
const EXTERNAL_API_URL = process.env.EXTERNAL_EXTRACTOR_API_URL || 'http://localhost:3000/api/extract';

console.log('🧪 Testando integração com API externa de extração de dados...\n');

async function testExternalApiHealth() {
  try {
    console.log('1. Testando saúde da API externa...');
    
    const response = await axios.get(`${API_BASE_URL}/api/files/external-api/health`, {
      headers: {
        'X-API-Key': API_KEY
      },
      timeout: 10000
    });

    console.log('✅ Status da API externa:', response.data);
    return response.data.success;
  } catch (error) {
    console.log('❌ Erro ao verificar saúde da API externa:', error.message);
    return false;
  }
}

async function testExternalApiConnection() {
  try {
    console.log('\n2. Testando conexão com API externa...');
    
    const response = await axios.get(`${API_BASE_URL}/api/files/external-api/test-connection`, {
      headers: {
        'X-API-Key': API_KEY
      },
      timeout: 15000
    });

    console.log('✅ Teste de conexão:', response.data);
    return response.data.success;
  } catch (error) {
    console.log('❌ Erro ao testar conexão:', error.message);
    return false;
  }
}

async function testDirectExternalApi() {
  try {
    console.log('\n3. Testando API externa diretamente...');
    
    // Create a test file
    const testContent = 'Este é um arquivo de teste para verificar a integração com a API externa.';
    const testBuffer = Buffer.from(testContent, 'utf-8');
    
    const formData = new FormData();
    formData.append('file', testBuffer, {
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

    console.log('✅ Resposta da API externa:', {
      success: response.data.success,
      hasContent: !!response.data.data?.content,
      contentLength: response.data.data?.content?.length || 0,
      metadata: response.data.data?.metadata
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

async function testFileUploadAndProcessing() {
  try {
    console.log('\n4. Testando upload e processamento de arquivo...');
    
    // Create a test PDF content (simplified)
    const testPdfContent = 'Teste de conteúdo PDF para verificação da integração.';
    const testBuffer = Buffer.from(testPdfContent, 'utf-8');
    
    // First, create a test agent (if needed)
    const agentId = 'test-agent-' + Date.now();
    
    // Upload file
    const formData = new FormData();
    formData.append('file', testBuffer, {
      filename: 'teste.pdf',
      contentType: 'application/pdf'
    });

    const uploadResponse = await axios.post(
      `${API_BASE_URL}/api/agents/${agentId}/files/upload`,
      formData,
      {
        headers: {
          'X-API-Key': API_KEY,
          ...formData.getHeaders(),
        },
        timeout: 30000
      }
    );

    if (!uploadResponse.data.success) {
      throw new Error('Falha no upload: ' + uploadResponse.data.error?.message);
    }

    const fileId = uploadResponse.data.data.id;
    console.log('✅ Arquivo enviado com sucesso. File ID:', fileId);

    // Process file
    const processResponse = await axios.post(
      `${API_BASE_URL}/api/agents/${agentId}/files/${fileId}/process`,
      {
        operation: 'read',
        options: {
          language: 'pt'
        }
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (!processResponse.data.success) {
      throw new Error('Falha no processamento: ' + processResponse.data.error?.message);
    }

    console.log('✅ Arquivo processado com sucesso:', {
      contentLength: processResponse.data.data.content.length,
      metadata: processResponse.data.data.metadata
    });

    return true;
  } catch (error) {
    console.log('❌ Erro no teste de upload e processamento:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de integração com API externa...\n');
  
  const results = {
    healthCheck: false,
    connectionTest: false,
    directApiTest: false,
    fileProcessingTest: false
  };

  // Test 1: Health check
  results.healthCheck = await testExternalApiHealth();
  
  // Test 2: Connection test
  results.connectionTest = await testExternalApiConnection();
  
  // Test 3: Direct API test
  results.directApiTest = await testDirectExternalApi();
  
  // Test 4: File upload and processing (only if previous tests pass)
  if (results.healthCheck && results.connectionTest) {
    results.fileProcessingTest = await testFileUploadAndProcessing();
  } else {
    console.log('\n⚠️  Pulando teste de processamento devido a falhas anteriores');
  }

  // Summary
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('================================');
  console.log(`✅ Verificação de saúde: ${results.healthCheck ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Teste de conexão: ${results.connectionTest ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Teste direto da API: ${results.directApiTest ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Processamento de arquivo: ${results.fileProcessingTest ? 'PASSOU' : 'FALHOU'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 RESULTADO GERAL: ${allPassed ? 'TODOS OS TESTES PASSARAM!' : 'ALGUNS TESTES FALHARAM'}`);
  
  if (!allPassed) {
    console.log('\n🔧 VERIFICAÇÕES NECESSÁRIAS:');
    if (!results.healthCheck) {
      console.log('- Verifique se a API externa está rodando em:', EXTERNAL_API_URL);
    }
    if (!results.connectionTest) {
      console.log('- Verifique a conectividade de rede');
    }
    if (!results.directApiTest) {
      console.log('- Verifique se a API externa está funcionando corretamente');
    }
    if (!results.fileProcessingTest) {
      console.log('- Verifique as configurações de agente e permissões');
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
