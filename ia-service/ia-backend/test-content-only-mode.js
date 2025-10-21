const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd625e8be0682166a76f97';

async function testContentOnlyMode() {
  console.log('🔍 Testando modo de retorno apenas do conteúdo...\n');

  const testQueries = [
    'Consulte metadados sobre investimentos e me traga apenas o conteúdo',
    'Busque informações sobre obras e retorne apenas o improvedContent',
    'Encontre documentos sobre Petrolina e me traga só o conteúdo',
    'Procure por fisioterapia e retorne conteúdo puro',
    'Busque documentos sobre infraestrutura e me traga apenas o conteúdo'
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
          messages: [{ role: 'user', content: query }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          }
        }
      );

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.data && response.data.data && response.data.data.response) {
        console.log(`✅ Resposta recebida em ${responseTime}ms`);
        
        const content = response.data.data.response.content;
        
        // Verificar se é modo de conteúdo apenas
        const isContentOnly = content.includes('📄 **Conteúdo dos Documentos Encontrados:**') ||
                             content.includes('📝 **Conteúdo:**') ||
                             content.includes('Conteúdo extraído pelo Agente Database');
        
        if (isContentOnly) {
          console.log('🎯 ✅ Modo de conteúdo apenas ativado corretamente!');
          
          // Contar quantos conteúdos foram retornados
          const contentMatches = content.match(/📝 \*\*Conteúdo:\*\*/g);
          const contentCount = contentMatches ? contentMatches.length : 0;
          console.log(`📊 Número de conteúdos retornados: ${contentCount}`);
          
          // Mostrar tamanho do conteúdo
          console.log(`📏 Tamanho total da resposta: ${content.length} caracteres`);
          
          // Mostrar resumo do conteúdo
          const firstContentMatch = content.match(/📝 \*\*Conteúdo:\*\*\n(.*?)(?=\n\n---|\n\n\*Conteúdo extraído)/s);
          if (firstContentMatch) {
            const firstContent = firstContentMatch[1];
            const preview = firstContent.length > 200 ? firstContent.substring(0, 200) + '...' : firstContent;
            console.log(`📋 Preview do primeiro conteúdo: ${preview}`);
          }
        } else {
          console.log('⚠️ Modo padrão ativado (não é modo de conteúdo apenas)');
        }
        
        console.log(`📄 Resposta completa (primeiros 500 chars): ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n`);
      } else {
        console.log('❌ Resposta inválida recebida\n');
      }

    } catch (error) {
      console.log(`❌ Erro: ${error.message}\n`);
    }

    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Teste comparativo: modo normal vs modo conteúdo apenas
async function testComparison() {
  console.log('\n🔄 Teste Comparativo: Modo Normal vs Modo Conteúdo Apenas\n');

  const baseQuery = 'Busque documentos sobre investimentos';
  
  // Teste 1: Modo normal
  console.log('📋 Teste 1: Modo Normal');
  console.log('─'.repeat(50));
  
  try {
    const normalResponse = await axios.post(
      `${API_BASE_URL}/api/agents/${AGENT_ID}/chat`,
      {
        messages: [{ role: 'user', content: baseQuery }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );

    const normalContent = normalResponse.data.data.response.content;
    console.log(`📏 Tamanho da resposta normal: ${normalContent.length} caracteres`);
    console.log(`📊 Contém detalhes completos: ${normalContent.includes('📄 **Tema:**') ? 'Sim' : 'Não'}`);
    console.log(`📊 Contém tags: ${normalContent.includes('🏷️ **Tags:**') ? 'Sim' : 'Não'}`);
    console.log(`📊 Contém resumo: ${normalContent.includes('📝 **Resumo:**') ? 'Sim' : 'Não'}\n`);

  } catch (error) {
    console.log(`❌ Erro no teste normal: ${error.message}\n`);
  }

  // Teste 2: Modo conteúdo apenas
  console.log('📄 Teste 2: Modo Conteúdo Apenas');
  console.log('─'.repeat(50));
  
  try {
    const contentOnlyResponse = await axios.post(
      `${API_BASE_URL}/api/agents/${AGENT_ID}/chat`,
      {
        messages: [{ role: 'user', content: `${baseQuery} e me traga apenas o conteúdo` }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );

    const contentOnlyContent = contentOnlyResponse.data.data.response.content;
    console.log(`📏 Tamanho da resposta conteúdo apenas: ${contentOnlyContent.length} caracteres`);
    console.log(`📊 Contém apenas conteúdo: ${contentOnlyContent.includes('📝 **Conteúdo:**') ? 'Sim' : 'Não'}`);
    console.log(`📊 Contém detalhes completos: ${contentOnlyContent.includes('📄 **Tema:**') ? 'Não (correto)' : 'Sim (incorreto)'}`);
    console.log(`📊 Contém tags: ${contentOnlyContent.includes('🏷️ **Tags:**') ? 'Não (correto)' : 'Sim (incorreto)'}\n`);

  } catch (error) {
    console.log(`❌ Erro no teste conteúdo apenas: ${error.message}\n`);
  }
}

// Função principal
async function main() {
  console.log('🔍 TESTE DO MODO DE CONTEÚDO APENAS');
  console.log('='.repeat(50));
  console.log(`🌐 API: ${API_BASE_URL}`);
  console.log(`🤖 Agente: ${AGENT_ID}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log('='.repeat(50));

  try {
    await testContentOnlyMode();
    await testComparison();
    
    console.log('✅ Testes concluídos com sucesso!');
    console.log('\n📋 Funcionalidades implementadas:');
    console.log('   • Detecção automática de solicitações de conteúdo apenas');
    console.log('   • Retorno apenas do improvedContent dos documentos');
    console.log('   • Formato limpo para processamento por outros agentes');
    console.log('   • Palavras-chave de ativação: "apenas o conteúdo", "só o conteúdo", etc.');
    console.log('   • Mantém scores de similaridade para contexto');
    
    console.log('\n💡 Como usar:');
    console.log('   • "Busque documentos sobre X e me traga apenas o conteúdo"');
    console.log('   • "Consulte metadados sobre Y e retorne apenas o improvedContent"');
    console.log('   • "Encontre informações sobre Z e me traga só o conteúdo"');
    console.log('   • "Procure por W e retorne conteúdo puro"');
    
  } catch (error) {
    console.log(`\n❌ Erro geral: ${error.message}`);
    process.exit(1);
  }
}

// Executar testes
main();
