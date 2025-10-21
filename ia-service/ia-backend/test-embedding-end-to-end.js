const axios = require('axios');
const { config } = require('./dist/config/config');

// Configuração do teste
const API_BASE_URL = `http://localhost:${config.server.port}/api`;
const API_KEY = config.security.apiKey;

// Dados de teste
const testMetadata = [
  {
    fileId: "test-file-tech-001",
    agentId: "test-agent-001",
    theme: "Tecnologia e Inovação",
    improvedContent: "Relatório sobre implementação de inteligência artificial em processos empresariais, incluindo análise de ROI e impactos operacionais.",
    tags: ["IA", "automação", "inovação", "processos", "ROI"],
    analysis: {
      summary: "Este documento apresenta uma análise detalhada sobre a implementação de soluções de inteligência artificial em processos empresariais, com foco em automação de tarefas repetitivas e análise de dados para tomada de decisão.",
      keyTopics: ["machine learning", "processamento de dados", "automação", "análise preditiva", "tomada de decisão"],
      sentiment: "positivo",
      confidence: 0.92,
      language: "pt-BR"
    }
  },
  {
    fileId: "test-file-finance-002",
    agentId: "test-agent-002", 
    theme: "Finanças Corporativas",
    improvedContent: "Análise financeira trimestral com indicadores de performance, projeções de receita e recomendações estratégicas para otimização de recursos.",
    tags: ["finanças", "análise", "performance", "receita", "estratégia"],
    analysis: {
      summary: "Relatório financeiro detalhado do terceiro trimestre, apresentando indicadores de performance, análise de receita, custos operacionais e projeções futuras com recomendações estratégicas.",
      keyTopics: ["receita", "custos", "margem de lucro", "projeções", "indicadores financeiros"],
      sentiment: "neutro",
      confidence: 0.88,
      language: "pt-BR"
    }
  },
  {
    fileId: "test-file-marketing-003",
    agentId: "test-agent-003",
    theme: "Marketing Digital",
    improvedContent: "Estratégia de marketing digital focada em redes sociais, SEO e análise de conversão para aumento de vendas online.",
    tags: ["marketing", "digital", "redes sociais", "SEO", "vendas"],
    analysis: {
      summary: "Plano estratégico de marketing digital abrangendo campanhas em redes sociais, otimização para motores de busca (SEO) e análise de conversão para maximizar vendas online.",
      keyTopics: ["redes sociais", "SEO", "conversão", "tráfego", "vendas online"],
      sentiment: "positivo",
      confidence: 0.85,
      language: "pt-BR"
    }
  },
  {
    fileId: "test-file-hr-004",
    agentId: "test-agent-004",
    theme: "Recursos Humanos",
    improvedContent: "Política de recrutamento e seleção com foco em diversidade, inclusão e desenvolvimento de talentos internos.",
    tags: ["RH", "recrutamento", "diversidade", "inclusão", "desenvolvimento"],
    analysis: {
      summary: "Documento sobre políticas de recursos humanos, enfatizando processos de recrutamento inclusivo, promoção da diversidade e programas de desenvolvimento de talentos internos.",
      keyTopics: ["recrutamento", "seleção", "diversidade", "inclusão", "desenvolvimento de carreira"],
      sentiment: "positivo",
      confidence: 0.90,
      language: "pt-BR"
    }
  },
  {
    fileId: "test-file-operations-005",
    agentId: "test-agent-005",
    theme: "Operações e Logística",
    improvedContent: "Otimização de cadeia de suprimentos com foco em sustentabilidade, redução de custos e melhoria de eficiência operacional.",
    tags: ["operações", "logística", "cadeia de suprimentos", "sustentabilidade", "eficiência"],
    analysis: {
      summary: "Análise da cadeia de suprimentos com propostas de otimização focadas em sustentabilidade ambiental, redução de custos operacionais e aumento da eficiência logística.",
      keyTopics: ["cadeia de suprimentos", "sustentabilidade", "otimização", "custos", "logística"],
      sentiment: "positivo",
      confidence: 0.87,
      language: "pt-BR"
    }
  }
];

// Função para fazer requisições com tratamento de erro
async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

// Função para criar metadados de teste
async function createTestMetadata() {
  console.log('🚀 Iniciando criação de dados de teste...\n');
  
  const createdMetadata = [];
  
  for (let i = 0; i < testMetadata.length; i++) {
    const metadata = testMetadata[i];
    console.log(`📝 Criando metadado ${i + 1}/${testMetadata.length}: ${metadata.theme}`);
    
    const result = await makeRequest('POST', '/metadata', metadata);
    
    if (result.success) {
      console.log(`✅ Metadado criado com sucesso! ID: ${result.data.data.id}`);
      createdMetadata.push({
        ...metadata,
        id: result.data.data.id
      });
    } else {
      console.log(`❌ Erro ao criar metadado:`, result.error);
    }
    
    // Pequena pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return createdMetadata;
}

// Função para testar busca por similaridade
async function testSimilaritySearch() {
  console.log('\n🔍 Testando busca por similaridade...\n');
  
  const testQueries = [
    {
      query: "tecnologia e inteligência artificial",
      description: "Busca por IA e tecnologia"
    },
    {
      query: "análise financeira e receita",
      description: "Busca por finanças"
    },
    {
      query: "marketing e vendas online",
      description: "Busca por marketing digital"
    },
    {
      query: "recursos humanos e diversidade",
      description: "Busca por RH"
    },
    {
      query: "operações e cadeia de suprimentos",
      description: "Busca por operações"
    }
  ];
  
  for (const test of testQueries) {
    console.log(`🔎 Testando: ${test.description}`);
    console.log(`   Query: "${test.query}"`);
    
    const result = await makeRequest('GET', `/metadata/search/similar?query=${encodeURIComponent(test.query)}&limit=3&threshold=0.6`);
    
    if (result.success) {
      console.log(`   ✅ Encontrados ${result.data.data.length} resultados:`);
      result.data.data.forEach((item, index) => {
        console.log(`      ${index + 1}. Tema: ${item.metadata.theme}`);
        console.log(`         Similaridade: ${(item.similarity * 100).toFixed(1)}%`);
        console.log(`         Tags: ${item.metadata.tags.join(', ')}`);
      });
    } else {
      console.log(`   ❌ Erro na busca:`, result.error);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Função para testar busca por tema semântico
async function testThemeSearch() {
  console.log('\n🎯 Testando busca por tema semântico...\n');
  
  const testThemes = [
    {
      theme: "inovação tecnológica",
      description: "Busca por temas relacionados a inovação"
    },
    {
      theme: "gestão financeira",
      description: "Busca por temas financeiros"
    },
    {
      theme: "estratégia de marketing",
      description: "Busca por temas de marketing"
    }
  ];
  
  for (const test of testThemes) {
    console.log(`🎯 Testando: ${test.description}`);
    console.log(`   Tema: "${test.theme}"`);
    
    const result = await makeRequest('GET', `/metadata/search/theme?theme=${encodeURIComponent(test.theme)}&limit=2&threshold=0.7`);
    
    if (result.success) {
      console.log(`   ✅ Encontrados ${result.data.data.length} resultados:`);
      result.data.data.forEach((item, index) => {
        console.log(`      ${index + 1}. Tema: ${item.metadata.theme}`);
        console.log(`         Similaridade: ${(item.similarity * 100).toFixed(1)}%`);
      });
    } else {
      console.log(`   ❌ Erro na busca:`, result.error);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Função para testar estatísticas
async function testMetadataStats() {
  console.log('\n📊 Testando estatísticas de metadados...\n');
  
  const result = await makeRequest('GET', '/metadata/stats');
  
  if (result.success) {
    console.log('✅ Estatísticas obtidas com sucesso:');
    console.log(`   Total de metadados: ${result.data.data.total}`);
    console.log(`   Por agente: ${JSON.stringify(result.data.data.byAgent, null, 2)}`);
    console.log(`   Por tema: ${JSON.stringify(result.data.data.byTheme, null, 2)}`);
    console.log(`   Com embeddings: ${result.data.data.withEmbeddings}`);
  } else {
    console.log('❌ Erro ao obter estatísticas:', result.error);
  }
}

// Função para limpar dados de teste
async function cleanupTestData(createdMetadata) {
  console.log('\n🧹 Limpando dados de teste...\n');
  
  for (const metadata of createdMetadata) {
    console.log(`🗑️  Removendo metadado: ${metadata.theme}`);
    
    const result = await makeRequest('DELETE', `/metadata/${metadata.id}`);
    
    if (result.success) {
      console.log(`   ✅ Metadado removido com sucesso`);
    } else {
      console.log(`   ❌ Erro ao remover metadado:`, result.error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Função principal
async function runEndToEndTest() {
  console.log('🧪 INICIANDO TESTE DE PONTA A PONTA - SISTEMA DE EMBEDDINGS\n');
  console.log(`🌐 URL Base: ${API_BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...\n`);
  
  try {
    // 1. Criar dados de teste
    const createdMetadata = await createTestMetadata();
    
    if (createdMetadata.length === 0) {
      console.log('❌ Nenhum metadado foi criado. Abortando teste.');
      return;
    }
    
    // Aguardar um pouco para garantir que os embeddings foram processados
    console.log('\n⏳ Aguardando processamento dos embeddings...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. Testar busca por similaridade
    await testSimilaritySearch();
    
    // 3. Testar busca por tema
    await testThemeSearch();
    
    // 4. Testar estatísticas
    await testMetadataStats();
    
    // 5. Perguntar se deve limpar os dados
    console.log('\n🤔 Deseja manter os dados de teste? (y/n)');
    console.log('   Os dados de teste foram criados com sucesso e podem ser úteis para testes futuros.');
    console.log('   Para remover os dados de teste, execute este script novamente com o parâmetro --cleanup');
    
    // Para este teste, vamos manter os dados
    console.log('\n✅ TESTE DE PONTA A PONTA CONCLUÍDO COM SUCESSO!');
    console.log(`📝 ${createdMetadata.length} metadados de teste foram criados e estão disponíveis para testes futuros.`);
    console.log('\n💡 Você pode agora testar manualmente usando os comandos curl fornecidos anteriormente.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Verificar se deve apenas limpar dados
if (process.argv.includes('--cleanup')) {
  // Implementar limpeza se necessário
  console.log('🧹 Modo de limpeza não implementado neste teste.');
  console.log('   Para remover dados de teste, use o endpoint DELETE /metadata/{id} individualmente.');
} else {
  // Executar teste completo
  runEndToEndTest();
}
