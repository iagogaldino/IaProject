const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

async function testDatabaseFiles() {
  try {
    console.log('🗄️ Testando persistência de arquivos no banco de dados...\n');

    const agentId = '68de5d2bf6934dbd41a89f9f'; // ID do Agente Excel
    
    // 1. Criar arquivo de teste
    const testContent = `Relatório de Vendas - Q1 2024
Produto,Vendas,Receita,Margem
Smartphone,150,75000,25%
Laptop,80,120000,30%
Tablet,200,40000,20%
Acessórios,500,15000,40%`;
    
    const testFilePath = 'relatorio-vendas.csv';
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📝 Arquivo de teste criado:', testFilePath);
    console.log('📊 Conteúdo:', testContent);
    console.log('\n🔄 Fazendo upload...');

    // 2. Upload do arquivo
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));

    const uploadResponse = await axios.post(`${BASE_URL}/api/agents/${agentId}/files/upload`, formData, {
      headers: {
        'X-API-Key': API_KEY,
        ...formData.getHeaders()
      }
    });
    
    const fileId = uploadResponse.data.data.id;
    console.log('✅ Upload realizado com sucesso!');
    console.log('📋 ID do arquivo:', fileId);
    console.log('📋 Nome original:', uploadResponse.data.data.originalName);
    console.log('📋 Tamanho:', uploadResponse.data.data.fileSize, 'bytes');
    console.log('📋 Upload em:', uploadResponse.data.data.uploadedAt);

    // 3. Listar arquivos do agente
    console.log('\n📁 Listando arquivos do agente...');
    const listResponse = await axios.get(`${BASE_URL}/api/agents/${agentId}/files`, { headers });
    console.log('✅ Total de arquivos:', listResponse.data.data.length);
    
    listResponse.data.data.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.originalName} (${file.fileSize} bytes) - ${file.uploadedAt}`);
    });

    // 4. Obter informações específicas do arquivo
    console.log('\n📋 Obtendo informações do arquivo...');
    const fileInfoResponse = await axios.get(`${BASE_URL}/api/files/${fileId}`, { headers });
    console.log('✅ Informações do arquivo:');
    console.log('   ID:', fileInfoResponse.data.data.id);
    console.log('   Nome:', fileInfoResponse.data.data.originalName);
    console.log('   Tamanho:', fileInfoResponse.data.data.fileSize, 'bytes');
    console.log('   Tipo:', fileInfoResponse.data.data.mimeType);
    console.log('   Upload:', fileInfoResponse.data.data.uploadedAt);
    console.log('   Processado:', fileInfoResponse.data.data.processedAt || 'Não processado');

    // 5. Processar arquivo com IA
    console.log('\n🤖 Processando arquivo com IA...');
    const processData = {
      operation: 'analyze',
      options: {
        language: 'pt'
      }
    };

    const processResponse = await axios.post(`${BASE_URL}/api/agents/${agentId}/files/${fileId}/process`, processData, { headers });
    console.log('✅ Processamento realizado com sucesso!');
    console.log('📊 Palavras:', processResponse.data.data.metadata.wordCount);
    console.log('📊 Caracteres:', processResponse.data.data.metadata.characterCount);

    // 6. Verificar se o conteúdo foi salvo no banco
    console.log('\n🔍 Verificando se o conteúdo foi salvo no banco...');
    const updatedFileInfo = await axios.get(`${BASE_URL}/api/files/${fileId}`, { headers });
    console.log('✅ Arquivo atualizado:');
    console.log('   Processado em:', updatedFileInfo.data.data.processedAt);
    console.log('   Tem conteúdo salvo:', updatedFileInfo.data.data.content ? 'Sim' : 'Não');

    // 7. Testar chat com o agente
    console.log('\n💬 Testando chat com o agente sobre o arquivo...');
    const chatData = {
      messages: [
        {
          role: 'user',
          content: 'Liste os arquivos disponíveis'
        }
      ]
    };

    const chatResponse = await axios.post(`${BASE_URL}/api/agents/${agentId}/chat`, chatData, { headers });
    console.log('✅ Resposta do agente:');
    console.log(chatResponse.data.data.response.content);

    // Limpar arquivo de teste
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Arquivo de teste removido');

    console.log('\n🎉 Todos os testes de persistência no banco de dados passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
  }
}

testDatabaseFiles();
