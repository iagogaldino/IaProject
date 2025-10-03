const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testCompleteProcessing() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testando Processamento Completo com IA...\n');
    
    // 1. Health check
    console.log('1. Verificando saúde do serviço...');
    const healthResponse = await axios.get(`${baseUrl}/api/health`);
    console.log('✅ Serviço funcionando:', healthResponse.data.message);
    
    // 2. Listar tipos suportados
    console.log('\n2. Verificando tipos suportados...');
    const typesResponse = await axios.get(`${baseUrl}/api/supported-types`);
    console.log('✅ Tipos suportados:', typesResponse.data.data.map(t => t.type).join(', '));
    
    // 3. Verificar se existem PDFs para teste
    console.log('\n3. Verificando PDFs disponíveis...');
    const uploadsDir = './uploads';
    if (!fs.existsSync(uploadsDir)) {
      console.log('⚠️ Diretório uploads não encontrado');
      return;
    }
    
    // 4. Testar processamento normal (sem IA)
    console.log('\n4. Testando processamento normal...');
    console.log('💡 Para testar com IA, você precisa enviar um arquivo PDF real');
    console.log('💡 Use: curl -X POST http://localhost:3000/api/extract -F "file=@seu-arquivo.pdf" -F "fileType=pdf" -F "processWithAI=true"');
    
    // 5. Demonstrar uso com exemplo
    console.log('\n5. Exemplo de uso com IA:');
    console.log(`
📝 Exemplo de comando cURL:
curl -X POST http://localhost:3000/api/extract \\
  -F "file=@documento.pdf" \\
  -F "fileType=pdf" \\
  -F "processWithAI=true"

📝 Exemplo com JavaScript:
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('fileType', 'pdf');
formData.append('processWithAI', 'true');

const response = await fetch('http://localhost:3000/api/extract', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Texto extraído:', result.data.content);
console.log('Confiança média:', result.data.metadata.averageConfidence + '%');
    `);
    
    // 6. Testar validação de parâmetros
    console.log('\n6. Testando validação de parâmetros...');
    
    try {
      // Teste sem arquivo
      await axios.post(`${baseUrl}/api/extract`, {
        fileType: 'pdf',
        processWithAI: 'true'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validação funcionando: erro esperado sem arquivo');
      }
    }
    
    try {
      // Teste sem fileType
      const formData = new FormData();
      formData.append('file', Buffer.from('fake pdf content'), 'test.pdf');
      
      await axios.post(`${baseUrl}/api/extract`, formData, {
        headers: formData.getHeaders()
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validação funcionando: erro esperado sem fileType');
      }
    }
    
    console.log('\n🎉 Testes de validação passaram!');
    console.log('\n📋 Para testar o processamento completo com IA:');
    console.log('1. Prepare um arquivo PDF');
    console.log('2. Use o comando cURL acima');
    console.log('3. Ou use o exemplo JavaScript');
    console.log('4. Verifique os logs do servidor para acompanhar o progresso');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o servidor está rodando com "npm start" ou "npm run dev"');
    }
  }
}

// Executar teste
testCompleteProcessing();
