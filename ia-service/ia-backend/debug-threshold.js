const axios = require('axios');

async function debugThreshold() {
  console.log('🔍 Debugando threshold para consulta específica...\n');

  // Primeiro, vamos ver quais documentos existem e seus scores
  const debugQuery = 'Consulte metadados sobre investimentos em infraestrutura urbana';
  
  try {
    const response = await axios.post(
      'http://localhost:3001/api/agents/68dd625e8be0682166a76f97/chat',
      {
        messages: [{ role: 'user', content: debugQuery }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'ai-backend-2024-abc123xyz789'
        }
      }
    );

    console.log('📊 Documentos disponíveis:');
    const content = response.data.data.response.content;
    
    if (content.includes('similar')) {
      const similarityMatches = content.match(/(\d+\.?\d*)% similar/g);
      if (similarityMatches) {
        similarityMatches.forEach((match, index) => {
          const score = parseFloat(match.replace('% similar', ''));
          console.log(`   ${index + 1}. Score: ${score}%`);
        });
      }
    }

    console.log('\n📝 Conteúdo da resposta:');
    console.log(content);

  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }

  // Agora testar a consulta específica com threshold muito baixo
  console.log('\n🔍 Testando com threshold muito baixo...');
  
  try {
    // Temporariamente modificar o threshold no código para 0.05
    const response = await axios.post(
      'http://localhost:3001/api/agents/68dd625e8be0682166a76f97/chat',
      {
        messages: [{ role: 'user', content: 'Qual o total de gastos nas pavimentações de Petrolina?' }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'ai-backend-2024-abc123xyz789'
        }
      }
    );

    const content = response.data.data.response.content;
    
    if (content.includes('similar')) {
      console.log('✅ Encontrou resultados!');
      const similarityMatches = content.match(/(\d+\.?\d*)% similar/g);
      if (similarityMatches) {
        similarityMatches.forEach((match, index) => {
          const score = parseFloat(match.replace('% similar', ''));
          console.log(`   ${index + 1}. Score: ${score}%`);
        });
      }
    } else {
      console.log('❌ Ainda não encontrou resultados');
    }

  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
}

debugThreshold();
