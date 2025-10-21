const axios = require('axios');

async function testDirectSearch() {
  console.log('🔍 Testando busca direta com diferentes variações...\n');

  const variations = [
    'Qual o total de gastos nas pavimentações de Petrolina?',
    'gastos pavimentação Petrolina',
    'investimentos pavimentação Petrolina',
    'obras pavimentação Petrolina',
    'infraestrutura urbana Petrolina',
    'prefeitura Petrolina pavimentação',
    'total gastos pavimentação',
    'pavimentação asfalto ruas'
  ];

  for (let i = 0; i < variations.length; i++) {
    const query = variations[i];
    console.log(`📝 Teste ${i + 1}: "${query}"`);
    
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
        console.log('✅ Encontrou resultados!');
        const similarityMatches = content.match(/(\d+\.?\d*)% similar/g);
        if (similarityMatches) {
          similarityMatches.forEach((match, index) => {
            const score = parseFloat(match.replace('% similar', ''));
            console.log(`   ${index + 1}. Score: ${score}%`);
          });
        }
      } else {
        console.log('❌ Não encontrou resultados');
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    console.log('');
  }
}

testDirectSearch();
