const axios = require('axios');
const { config } = require('./dist/config/config');

// Configuração
const API_BASE_URL = `http://localhost:${config.server.port}/api`;
const API_KEY = config.security.apiKey;

// Dados de teste específicos
const testData = {
  fileId: "test-embedding-demo-001",
  agentId: "demo-agent-001",
  theme: "Inteligência Artificial e Machine Learning",
  improvedContent: "Análise completa sobre implementação de sistemas de IA em empresas, incluindo machine learning, deep learning, processamento de linguagem natural e visão computacional para automação de processos e análise preditiva de dados.",
  tags: ["inteligência artificial", "machine learning", "deep learning", "NLP", "visão computacional", "automação", "análise preditiva"],
  analysis: {
    summary: "Este documento apresenta uma análise abrangente sobre tecnologias de inteligência artificial, explorando desde conceitos básicos de machine learning até implementações avançadas de deep learning, processamento de linguagem natural e sistemas de visão computacional aplicados em ambientes corporativos.",
    keyTopics: [
      "machine learning algorithms",
      "deep learning neural networks", 
      "natural language processing",
      "computer vision",
      "predictive analytics",
      "process automation",
      "data analysis",
      "artificial intelligence implementation"
    ],
    sentiment: "positivo",
    confidence: 0.95,
    language: "pt-BR"
  }
};

async function createTestMetadata() {
  console.log('🚀 Criando metadado de teste para demonstração de embeddings...\n');
  console.log(`📋 Dados do teste:`);
  console.log(`   Tema: ${testData.theme}`);
  console.log(`   Tags: ${testData.tags.join(', ')}`);
  console.log(`   Resumo: ${testData.analysis.summary.substring(0, 100)}...\n`);

  try {
    const response = await axios.post(`${API_BASE_URL}/metadata`, testData, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Metadado criado com sucesso!');
      console.log(`   ID: ${response.data.data.id}`);
      console.log(`   Tema: ${response.data.data.theme}`);
      console.log(`   Agente: ${response.data.data.agentId}`);
      
      return response.data.data.id;
    } else {
      console.log('❌ Falha ao criar metadado:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.response?.data || error.message);
    return null;
  }
}

async function testSearchQueries(metadataId) {
  console.log('\n🔍 Testando buscas de similaridade...\n');

  const searchQueries = [
    {
      query: "inteligência artificial e aprendizado de máquina",
      description: "Busca por IA e ML"
    },
    {
      query: "processamento de linguagem natural e análise de dados",
      description: "Busca por NLP e análise"
    },
    {
      query: "automação de processos e visão computacional",
      description: "Busca por automação e visão"
    },
    {
      query: "deep learning e redes neurais",
      description: "Busca por deep learning"
    },
    {
      query: "análise preditiva e machine learning",
      description: "Busca por análise preditiva"
    }
  ];

  for (const search of searchQueries) {
    console.log(`🔎 "${search.description}"`);
    console.log(`   Query: "${search.query}"`);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/metadata/search/similar?query=${encodeURIComponent(search.query)}&limit=5&threshold=0.6`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const results = response.data.data;
        console.log(`   ✅ Encontrados ${results.length} resultados:`);
        
        results.forEach((result, index) => {
          const similarity = (result.similarity * 100).toFixed(1);
          console.log(`      ${index + 1}. ${result.metadata.theme} (${similarity}%)`);
          console.log(`         Tags: ${result.metadata.tags.slice(0, 3).join(', ')}${result.metadata.tags.length > 3 ? '...' : ''}`);
        });
        
        // Verificar se nosso metadado está nos resultados
        const foundOurMetadata = results.find(r => r.metadata.id === metadataId);
        if (foundOurMetadata) {
          console.log(`   🎯 NOSSO METADADO encontrado na posição ${results.indexOf(foundOurMetadata) + 1}!`);
        }
      } else {
        console.log(`   ❌ Erro na busca:`, response.data.error);
      }
    } catch (error) {
      console.log(`   ❌ Erro na requisição:`, error.response?.data || error.message);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testThemeSearch() {
  console.log('\n🎯 Testando busca por tema semântico...\n');

  const themeQueries = [
    {
      theme: "tecnologia de inteligência artificial",
      description: "Busca por tema de IA"
    },
    {
      theme: "automação e machine learning",
      description: "Busca por automação e ML"
    },
    {
      theme: "análise de dados e predição",
      description: "Busca por análise de dados"
    }
  ];

  for (const theme of themeQueries) {
    console.log(`🎯 "${theme.description}"`);
    console.log(`   Tema: "${theme.theme}"`);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/metadata/search/theme?theme=${encodeURIComponent(theme.theme)}&limit=3&threshold=0.7`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const results = response.data.data;
        console.log(`   ✅ Encontrados ${results.length} resultados:`);
        
        results.forEach((result, index) => {
          const similarity = (result.similarity * 100).toFixed(1);
          console.log(`      ${index + 1}. ${result.metadata.theme} (${similarity}%)`);
        });
      } else {
        console.log(`   ❌ Erro na busca:`, response.data.error);
      }
    } catch (error) {
      console.log(`   ❌ Erro na requisição:`, error.response?.data || error.message);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function runTest() {
  console.log('🧪 TESTE DE EMBEDDING - DEMONSTRAÇÃO INDIVIDUAL\n');
  console.log(`🌐 URL: ${API_BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...\n`);

  // 1. Criar metadado de teste
  const metadataId = await createTestMetadata();
  
  if (!metadataId) {
    console.log('❌ Não foi possível criar o metadado. Abortando teste.');
    return;
  }

  // Aguardar processamento do embedding
  console.log('\n⏳ Aguardando processamento do embedding...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 2. Testar buscas de similaridade
  await testSearchQueries(metadataId);

  // 3. Testar busca por tema
  await testThemeSearch();

  console.log('✅ TESTE CONCLUÍDO!');
  console.log(`📝 Metadado de teste criado com ID: ${metadataId}`);
  console.log('💡 Você pode usar este ID para testes adicionais ou removê-lo quando não precisar mais.');
}

// Executar teste
runTest().catch(console.error);
