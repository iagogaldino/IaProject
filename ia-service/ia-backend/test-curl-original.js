const axios = require('axios');

async function testOriginalCurl() {
  console.log('🔍 Testando CURL original...\n');

  const curlData = {
    messages: [
      {
        role: 'user',
        content: 'Qual o total de gastos nas pavimentações de Petrolina?'
      }
    ]
  };

  try {
    const response = await axios.post(
      'http://localhost:3001/api/agents/68dd625e8be0682166a76f97/chat',
      curlData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'ai-backend-2024-abc123xyz789'
        }
      }
    );

    console.log('✅ Resposta recebida:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data && response.data.data && response.data.data.response) {
      const content = response.data.data.response.content;
      
      if (content.includes('Busca Semântica') && content.includes('similar')) {
        console.log('\n🎯 ✅ CURL FUNCIONANDO! A consulta foi processada corretamente como busca semântica.');
        
        // Extrair scores de similaridade
        const similarityMatches = content.match(/(\d+\.?\d*)% similar/g);
        if (similarityMatches) {
          console.log(`📊 Scores de similaridade encontrados: ${similarityMatches.join(', ')}`);
        }
      } else if (content.includes('não encontrei documentos')) {
        console.log('\n⚠️ CURL funcionando, mas não encontrou documentos similares.');
        console.log('💡 Isso pode indicar que o threshold ainda está alto ou os documentos não têm conteúdo relevante.');
      } else {
        console.log('\n❌ CURL não foi processado como busca semântica.');
      }
    }

  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    if (error.response) {
      console.log(`📊 Status: ${error.response.status}`);
      console.log(`📋 Dados: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

testOriginalCurl();
