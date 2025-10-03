const axios = require('axios');

async function testPDFPageProcessing() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testando Processamento de Páginas PDF...\n');
    
    // 1. Listar sessões disponíveis
    console.log('1. Listando sessões disponíveis...');
    const sessionsResponse = await axios.get(`${baseUrl}/api/pdf-images/sessions`);
    console.log('✅ Sessões encontradas:', sessionsResponse.data.data.length);
    
    if (sessionsResponse.data.data.length === 0) {
      console.log('⚠️ Nenhuma sessão encontrada. Execute primeiro a extração de imagens de PDF.');
      return;
    }
    
    // Usar a primeira sessão disponível
    const firstSession = sessionsResponse.data.data[0];
    const sessionId = firstSession.sessionId;
    console.log(`📁 Usando sessão: ${sessionId}`);
    console.log(`📄 Páginas disponíveis: ${firstSession.imageCount}`);
    
    // 2. Listar páginas da sessão
    console.log('\n2. Listando páginas da sessão...');
    const pagesResponse = await axios.get(`${baseUrl}/api/images/pdf-sessions/${sessionId}/pages`);
    console.log('✅ Páginas encontradas:', pagesResponse.data.data.totalPages);
    
    const pages = pagesResponse.data.data.pages;
    if (pages.length === 0) {
      console.log('⚠️ Nenhuma página encontrada na sessão.');
      return;
    }
    
    // 3. Processar primeira página
    console.log('\n3. Processando primeira página...');
    const firstPage = pages[0];
    console.log(`📄 Processando página ${firstPage.pageNumber}...`);
    
    const pageResponse = await axios.post(`${baseUrl}/api/images/process-pdf-page`, {
      sessionId: sessionId,
      pageNumber: firstPage.pageNumber,
      filename: `pagina-${firstPage.pageNumber}.png`
    });
    
    if (pageResponse.data.success) {
      const result = pageResponse.data.data;
      console.log('✅ Página processada com sucesso!');
      console.log(`📊 Métricas:`, {
        confiança: result.metadata?.confidence + '%',
        caracteres: result.metadata?.characters,
        palavras: result.metadata?.words,
        linhas: result.metadata?.lines
      });
      
      if (result.content && result.content.trim().length > 0) {
        console.log(`📝 Texto extraído (primeiros 100 caracteres): ${result.content.substring(0, 100)}...`);
      } else {
        console.log('📝 Nenhum texto encontrado na página');
      }
    }
    
    // 4. Processar todas as páginas da sessão
    console.log('\n4. Processando todas as páginas da sessão...');
    const sessionResponse = await axios.post(`${baseUrl}/api/images/process-pdf-session`, {
      sessionId: sessionId,
      filename: 'documento-completo'
    });
    
    if (sessionResponse.data.success) {
      const sessionResult = sessionResponse.data.data;
      console.log('✅ Sessão processada com sucesso!');
      console.log(`📊 Resultado: ${sessionResult.processedPages}/${sessionResult.totalPages} páginas processadas`);
      
      if (sessionResult.errorPages > 0) {
        console.log(`⚠️ ${sessionResult.errorPages} páginas com erro`);
      }
      
      // Mostrar resumo de cada página
      sessionResult.results.forEach((pageResult, index) => {
        if (pageResult.error) {
          console.log(`❌ Página ${pageResult.pageNumber}: ${pageResult.error}`);
        } else {
          const textLength = pageResult.content ? pageResult.content.length : 0;
          console.log(`✅ Página ${pageResult.pageNumber}: ${textLength} caracteres, confiança ${pageResult.metadata?.confidence}%`);
        }
      });
    }
    
    // 5. Testar processamento de páginas específicas
    if (pages.length > 1) {
      console.log('\n5. Testando processamento de páginas específicas...');
      const specificPages = pages.slice(0, 2).map(p => p.pageNumber); // Primeiras 2 páginas
      
      const specificResponse = await axios.post(`${baseUrl}/api/images/process-pdf-session`, {
        sessionId: sessionId,
        pageNumbers: specificPages,
        filename: 'paginas-especificas'
      });
      
      if (specificResponse.data.success) {
        console.log('✅ Páginas específicas processadas com sucesso!');
        console.log(`📊 ${specificResponse.data.data.processedPages} páginas processadas`);
      }
    }
    
    console.log('\n🎉 Todos os testes de processamento de páginas PDF passaram!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o servidor está rodando com "npm start" ou "npm run dev"');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Dica: Certifique-se de que existem sessões de imagens PDF extraídas');
    }
  }
}

// Executar teste
testPDFPageProcessing();
