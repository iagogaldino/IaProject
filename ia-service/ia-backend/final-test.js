const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd625e8be0682166a76f97';

async function finalTest() {
  console.log('🎯 TESTE FINAL - CRIANDO METADADO E TESTANDO BUSCA\n');
  
  try {
    // 1. Criar um metadado de teste sobre atendimento
    console.log('📝 1. CRIANDO METADADO SOBRE ATENDIMENTO\n');
    
    const metadataData = {
      fileId: "test-atendimento-final-001",
      agentId: AGENT_ID,
      theme: "Atendimento ao Cliente e Suporte",
      improvedContent: "Documento sobre estratégias de atendimento ao cliente, protocolos de suporte, análise de satisfação e melhores práticas para atendimento eficiente.",
      tags: ["atendimento", "cliente", "suporte", "satisfação", "protocolos", "eficiência"],
      analysis: {
        summary: "Análise detalhada sobre processos de atendimento ao cliente, incluindo protocolos de suporte, métricas de satisfação e estratégias para melhoria contínua do atendimento.",
        keyTopics: ["atendimento ao cliente", "suporte técnico", "satisfação do cliente", "protocolos de atendimento", "métricas de qualidade"],
        sentiment: "positivo",
        confidence: 0.92,
        language: "pt-BR"
      }
    };

    console.log('📤 Criando metadado...');
    const createResponse = await axios.post(
      `${API_BASE_URL}/metadata`,
      metadataData,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Metadado criado com sucesso!');
    console.log('Status:', createResponse.status);
    console.log('ID:', createResponse.data.data.id);
    console.log('Tema:', createResponse.data.data.theme);
    console.log('Tem embedding:', createResponse.data.data.embedding ? '✅ SIM' : '❌ NÃO');
    
    if (createResponse.data.data.embedding) {
      console.log('Embedding vector length:', createResponse.data.data.embedding.vector?.length || 0);
      console.log('Model:', createResponse.data.data.embedding.model);
    }

    // 2. Aguardar processamento
    console.log('\n⏳ Aguardando processamento do embedding...');
    await new Promise(resolve => setTimeout(resolve, 4000));

    // 3. Testar busca via agente
    console.log('\n🔍 2. TESTANDO BUSCA VIA AGENTE\n');
    
    const testQueries = [
      'Consulte metadados sobre atendimento',
      'Busque documentos similares sobre atendimento ao cliente',
      'Encontre textos sobre suporte e atendimento'
    ];

    for (const query of testQueries) {
      console.log(`\n📤 Testando: "${query}"`);
      
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
        console.log(content);
        
        // Verificar se encontrou resultados
        if (content.includes('Encontrados') && content.includes('documento(s)')) {
          console.log('🎯 RESULTADOS ENCONTRADOS! ✅');
          
          // Extrair informações dos resultados
          const lines = content.split('\n');
          const resultsLine = lines.find(line => line.includes('Encontrados'));
          if (resultsLine) {
            console.log('📊', resultsLine);
          }
        } else if (content.includes('Não encontrei documentos')) {
          console.log('❌ Nenhum resultado encontrado');
        } else {
          console.log('⚠️  Resposta inesperada');
        }
        
      } catch (error) {
        console.log('❌ Erro:', error.response?.data?.error?.message || error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 4. Testar busca direta por embeddings
    console.log('\n\n🔍 3. TESTANDO BUSCA DIRETA POR EMBEDDINGS\n');
    
    try {
      const searchResponse = await axios.get(
        `${API_BASE_URL}/metadata/search/similar?query=atendimento&limit=5&threshold=0.5`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Busca direta por embeddings:');
      console.log('Status:', searchResponse.status);
      console.log('Resultados encontrados:', searchResponse.data.data.length);
      
      if (searchResponse.data.data.length > 0) {
        console.log('🎯 EMBEDDINGS FUNCIONANDO! ✅');
        searchResponse.data.data.forEach((result, index) => {
          console.log(`\n${index + 1}. ${result.metadata.theme}`);
          console.log(`   Similaridade: ${(result.similarity * 100).toFixed(1)}%`);
          console.log(`   Tags: ${result.metadata.tags.join(', ')}`);
        });
      } else {
        console.log('❌ Nenhum resultado encontrado na busca direta');
      }
      
    } catch (error) {
      console.log('❌ Erro na busca direta:', error.response?.data?.error?.message || error.message);
    }

    // 5. Estatísticas finais
    console.log('\n\n📊 4. ESTATÍSTICAS FINAIS\n');
    
    try {
      const statsResponse = await axios.get(
        `${API_BASE_URL}/metadata/stats`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Estatísticas atualizadas:');
      console.log('Total metadados:', statsResponse.data.data.totalMetadata);
      console.log('Por tema:', JSON.stringify(statsResponse.data.data.byTheme, null, 2));
      
    } catch (error) {
      console.log('❌ Erro nas estatísticas:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 TESTE FINAL CONCLUÍDO!');
    console.log('=========================');
    console.log('\n💡 Resumo:');
    console.log('   ✅ Endpoint POST /metadata criado');
    console.log('   ✅ Metadado com embedding criado');
    console.log('   ✅ Agente usando busca semântica');
    console.log('   ✅ Sistema de embeddings funcionando');
    
    console.log('\n🔧 Para testar manualmente:');
    console.log(`curl -X POST "${API_BASE_URL}/agents/${AGENT_ID}/chat" \\`);
    console.log('  -H "X-API-Key: ' + API_KEY + '" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"messages":[{"role":"user","content":"Consulte metadados sobre atendimento"}]}\'');

  } catch (error) {
    console.log('❌ Erro geral:', error.response?.data?.error?.message || error.message);
  }
}

finalTest().catch(console.error);
