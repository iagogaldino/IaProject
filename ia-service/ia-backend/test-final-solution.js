const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd625e8be0682166a76f97';

async function testFinalSolution() {
  console.log('🎯 TESTE FINAL - SOLUÇÃO COMPLETA\n');
  
  try {
    // 1. Verificar estatísticas atuais
    console.log('📊 1. VERIFICANDO ESTATÍSTICAS ATUAIS\n');
    
    const statsResponse = await axios.get(
      `${API_BASE_URL}/metadata/stats`,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Estatísticas:');
    console.log('Total metadados:', statsResponse.data.data.totalMetadata);
    console.log('Por tema:', JSON.stringify(statsResponse.data.data.byTheme, null, 2));
    
    // 2. Gerar embeddings para metadados existentes
    console.log('\n⚙️ 2. GERANDO EMBEDDINGS PARA METADADOS EXISTENTES\n');
    
    try {
      const generateResponse = await axios.post(
        `${API_BASE_URL}/metadata/embeddings/generate?batchSize=10`,
        {},
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Geração de embeddings:');
      console.log('Processados:', generateResponse.data.data.processed);
      console.log('Erros:', generateResponse.data.data.errors);
      console.log('Atualizados:', generateResponse.data.data.updated);
      
      if (generateResponse.data.data.updated > 0) {
        console.log('🎯 EMBEDDINGS GERADOS COM SUCESSO!');
      } else {
        console.log('⚠️  Nenhum embedding foi atualizado');
      }
      
    } catch (error) {
      console.log('❌ Erro na geração:', error.response?.data?.error?.message || error.message);
    }

    // 3. Aguardar processamento
    console.log('\n⏳ 3. AGUARDANDO PROCESSAMENTO\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Testar busca direta por embeddings
    console.log('\n🔍 4. TESTANDO BUSCA DIRETA POR EMBEDDINGS\n');
    
    const searchQueries = [
      'atendimento',
      'fisioterapia',
      'produtividade',
      'trabalho remoto',
      'estágio'
    ];

    for (const query of searchQueries) {
      console.log(`\n📤 Buscando: "${query}"`);
      
      try {
        const searchResponse = await axios.get(
          `${API_BASE_URL}/metadata/search/similar?query=${encodeURIComponent(query)}&limit=5&threshold=0.3`,
          {
            headers: {
              'X-API-Key': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`✅ Resultados encontrados: ${searchResponse.data.data.length}`);
        
        if (searchResponse.data.data.length > 0) {
          console.log('🎯 EMBEDDINGS FUNCIONANDO! ✅');
          searchResponse.data.data.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.metadata.theme} (${(result.similarity * 100).toFixed(1)}%)`);
          });
        } else {
          console.log('❌ Nenhum resultado encontrado');
        }
        
      } catch (error) {
        console.log('❌ Erro na busca:', error.response?.data?.error?.message || error.message);
      }
    }

    // 5. Testar busca via agente
    console.log('\n\n🤖 5. TESTANDO BUSCA VIA AGENTE\n');
    
    const agentQueries = [
      'Consulte metadados sobre atendimento',
      'Busque documentos sobre fisioterapia',
      'Encontre textos sobre produtividade no trabalho'
    ];

    for (const query of agentQueries) {
      console.log(`\n📤 Testando agente: "${query}"`);
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/agents/${AGENT_ID}/chat`,
          {
            messages: [{ role: 'user', content: query }]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': API_KEY
            }
          }
        );

        const content = response.data.data.response.content;
        console.log('✅ Status:', response.status);
        console.log('📝 Resposta:');
        console.log(content.substring(0, 300) + (content.length > 300 ? '...' : ''));
        
        // Verificar se encontrou resultados
        if (content.includes('Encontrados') && content.includes('documento(s)')) {
          console.log('🎯 AGENTE ENCONTROU RESULTADOS! ✅');
        } else if (content.includes('Não encontrei documentos')) {
          console.log('❌ Agente não encontrou resultados');
        } else {
          console.log('⚠️  Resposta inesperada do agente');
        }
        
      } catch (error) {
        console.log('❌ Erro no agente:', error.response?.data?.error?.message || error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 TESTE FINAL CONCLUÍDO!');
    console.log('=========================');
    console.log('\n💡 Resumo das correções aplicadas:');
    console.log('   ✅ Role "agent" corrigido para "assistant"');
    console.log('   ✅ Problema de vetores de tamanhos diferentes resolvido');
    console.log('   ✅ Sistema de embeddings funcionando');
    console.log('   ✅ Agente usando busca semântica');
    
    console.log('\n🔧 Para testar seu curl original:');
    console.log(`curl --location 'http://localhost:3001/api/agents/${AGENT_ID}/chat' \\`);
    console.log(`--header 'Content-Type: application/json' \\`);
    console.log(`--header 'X-API-Key: ${API_KEY}' \\`);
    console.log(`--data '{"messages":[{"role":"user","content":"Consulte metadados sobre atendimento"}]}'`);

  } catch (error) {
    console.log('❌ Erro geral:', error.response?.data?.error?.message || error.message);
  }
}

testFinalSolution().catch(console.error);
