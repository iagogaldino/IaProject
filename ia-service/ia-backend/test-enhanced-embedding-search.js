const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd625e8be0682166a76f97'; // Agente Database

// Headers padrão
const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
};

// Função para testar a busca otimizada
async function testEnhancedEmbeddingSearch() {
  console.log('🚀 Testando busca vetorial otimizada...\n');

  const testQueries = [
    'Consulte metadados sobre o total gasto em Petrolina',
    'Busque informações sobre gastos financeiros',
    'Encontre documentos relacionados a obras e construção',
    'Procure por dados sobre vendas e receita',
    'Mostre metadados sobre produtividade e trabalho remoto'
  ];

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`📝 Teste ${i + 1}: "${query}"`);
    console.log('─'.repeat(80));

    try {
      const startTime = Date.now();
      
      const response = await axios.post(
        `${API_BASE_URL}/api/agents/${AGENT_ID}/chat`,
        {
          messages: [
            {
              role: 'user',
              content: query
            }
          ]
        },
        { headers }
      );

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.data && response.data.response) {
        console.log(`✅ Resposta recebida em ${responseTime}ms`);
        console.log(`📊 Tamanho da resposta: ${response.data.response.content.length} caracteres`);
        
        // Extrair informações sobre similaridade se disponível
        const content = response.data.response.content;
        const similarityMatches = content.match(/(\d+\.?\d*)% similar/g);
        if (similarityMatches) {
          console.log(`🎯 Scores de similaridade encontrados: ${similarityMatches.join(', ')}`);
        }
        
        // Mostrar resumo da resposta
        const summary = content.length > 200 ? content.substring(0, 200) + '...' : content;
        console.log(`📋 Resumo: ${summary}\n`);
      } else {
        console.log('❌ Resposta inválida recebida\n');
      }

    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}\n`);
      } else {
        console.log('\n');
      }
    }

    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Função para testar performance comparativa
async function testPerformanceComparison() {
  console.log('\n⚡ Testando performance da busca otimizada...\n');

  const query = 'Consulte metadados sobre o total gasto em Petrolina';
  const iterations = 3;
  const responseTimes = [];

  for (let i = 0; i < iterations; i++) {
    console.log(`🔄 Iteração ${i + 1}/${iterations}`);
    
    try {
      const startTime = Date.now();
      
      await axios.post(
        `${API_BASE_URL}/api/agents/${AGENT_ID}/chat`,
        {
          messages: [{ role: 'user', content: query }]
        },
        { headers }
      );

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      responseTimes.push(responseTime);
      
      console.log(`   ⏱️  Tempo de resposta: ${responseTime}ms`);
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (responseTimes.length > 0) {
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minTime = Math.min(...responseTimes);
    const maxTime = Math.max(...responseTimes);
    
    console.log(`\n📈 Estatísticas de Performance:`);
    console.log(`   ⚡ Tempo médio: ${avgTime.toFixed(2)}ms`);
    console.log(`   🏃 Tempo mínimo: ${minTime}ms`);
    console.log(`   🐌 Tempo máximo: ${maxTime}ms`);
    console.log(`   📊 Desvio padrão: ${Math.sqrt(responseTimes.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / responseTimes.length).toFixed(2)}ms`);
  }
}

// Função principal
async function main() {
  console.log('🔍 TESTE DE BUSCA VETORIAL OTIMIZADA');
  console.log('='.repeat(50));
  console.log(`🌐 API: ${API_BASE_URL}`);
  console.log(`🤖 Agente: ${AGENT_ID}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log('='.repeat(50));

  try {
    await testEnhancedEmbeddingSearch();
    await testPerformanceComparison();
    
    console.log('\n✅ Testes concluídos com sucesso!');
    console.log('\n📋 Melhorias implementadas:');
    console.log('   • Threshold reduzido de 0.7 para 0.25');
    console.log('   • numCandidates aumentado para 5000');
    console.log('   • Embeddings contextuais enriquecidos');
    console.log('   • Similaridade por cosseno otimizada');
    console.log('   • Filtros de modelo consistentes');
    console.log('   • Logs detalhados para monitoramento');
    
  } catch (error) {
    console.log(`\n❌ Erro geral: ${error.message}`);
    process.exit(1);
  }
}

// Executar testes
main();
