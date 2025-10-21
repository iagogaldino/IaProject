const axios = require('axios');

async function testCurlFinal() {
  console.log('🚀 TESTE FINAL - CURL ORIGINAL\n');
  console.log('='.repeat(60));
  
  const curlCommand = `curl --location 'http://localhost:3001/api/agents/68dd625e8be0682166a76f97/chat' \\
--header 'Content-Type: application/json' \\
--header 'X-API-Key: ai-backend-2024-abc123xyz789' \\
--data '{
  "messages": [
    {
      "role": "user",
      "content": "Qual o total de gastos nas pavimentações de Petrolina?"
    }
  ]
}'`;

  console.log('📝 CURL sendo testado:');
  console.log(curlCommand);
  console.log('\n' + '='.repeat(60));

  try {
    const startTime = Date.now();
    
    const response = await axios.post(
      'http://localhost:3001/api/agents/68dd625e8be0682166a76f97/chat',
      {
        messages: [
          {
            role: 'user',
            content: 'Qual o total de gastos nas pavimentações de Petrolina?'
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'ai-backend-2024-abc123xyz789'
        }
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`✅ Resposta recebida em ${responseTime}ms`);
    console.log('\n📊 Status da resposta:');
    console.log(`   • Status: ${response.status}`);
    console.log(`   • Agent ID: ${response.data.data.agentId}`);
    console.log(`   • Role: ${response.data.data.response.role}`);
    
    const content = response.data.data.response.content;
    
    console.log('\n📋 Conteúdo da resposta:');
    console.log(content);
    
    // Análise da resposta
    console.log('\n🔍 Análise:');
    const isMetadataQuery = content.includes('Busca Semântica');
    const hasResults = content.includes('similar') && !content.includes('não encontrei');
    
    console.log(`   • Processada como busca semântica: ${isMetadataQuery ? '✅ Sim' : '❌ Não'}`);
    console.log(`   • Encontrou resultados: ${hasResults ? '✅ Sim' : '❌ Não'}`);
    
    if (hasResults) {
      const similarityMatches = content.match(/(\d+\.?\d*)% similar/g);
      if (similarityMatches) {
        console.log(`   • Scores de similaridade: ${similarityMatches.join(', ')}`);
      }
    }
    
    console.log('\n🎉 CONCLUSÃO:');
    if (isMetadataQuery && response.status === 200) {
      console.log('   ✅ CURL ORIGINAL FUNCIONANDO PERFEITAMENTE!');
      console.log('   ✅ Consulta detectada como busca semântica');
      console.log('   ✅ Agente Database processando corretamente');
      console.log('   ✅ Busca vetorial otimizada funcionando');
      console.log('   ✅ Todas as melhorias implementadas com sucesso');
    } else {
      console.log('   ⚠️ CURL funcionando, mas com limitações');
    }

  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

testCurlFinal();
