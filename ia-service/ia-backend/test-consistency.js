const axios = require('axios');

async function testConsistency() {
  console.log('🔍 Testando consistência da busca...\n');

  const query = 'Qual o total de gastos nas pavimentações de Petrolina?';
  
  // Fazer 5 tentativas consecutivas
  for (let i = 1; i <= 5; i++) {
    console.log(`🔄 Tentativa ${i}:`);
    
    try {
      const response = await axios.post(
        'http://localhost:3001/api/agents/68dd625e8be0682166a76f97/chat',
        {
          messages: [{ role: 'user', content: query }]
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
        console.log('   ✅ Encontrou resultados');
        const similarityMatches = content.match(/(\d+\.?\d*)% similar/g);
        if (similarityMatches) {
          const scores = similarityMatches.map(match => parseFloat(match.replace('% similar', '')));
          console.log(`   📊 Scores: ${scores.join(', ')}%`);
        }
      } else if (content.includes('não encontrei')) {
        console.log('   ❌ Não encontrou resultados');
      } else {
        console.log('   ⚠️ Resposta inesperada');
      }
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    
    // Pausa entre tentativas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testConsistency();
