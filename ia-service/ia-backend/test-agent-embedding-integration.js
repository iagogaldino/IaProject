const axios = require('axios');
const { config } = require('./dist/config/config');

// Configuração do teste
const API_BASE_URL = `http://localhost:${config.server.port}/api`;
const API_KEY = config.security.apiKey;
const DATABASE_AGENT_ID = '68dd625e8be0682166a76f97'; // ID do agente de banco de dados

// Função para fazer requisições
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

// Função para testar o agente de banco de dados
async function testDatabaseAgent() {
  console.log('🤖 TESTE DE INTEGRAÇÃO - AGENTE DATABASE COM EMBEDDINGS\n');
  console.log(`🌐 URL: ${API_BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
  console.log(`🤖 Agent ID: ${DATABASE_AGENT_ID}\n`);

  // 1. Verificar se o agente existe e está ativo
  console.log('📋 1. VERIFICANDO AGENTE DATABASE');
  console.log('================================');
  
  const agentResult = await makeRequest('GET', `/agents/${DATABASE_AGENT_ID}`);
  
  if (!agentResult.success) {
    console.log('❌ Erro ao buscar agente:', agentResult.error);
    return;
  }

  const agent = agentResult.data.data;
  console.log(`✅ Agente encontrado: ${agent.name}`);
  console.log(`   Status: ${agent.status}`);
  console.log(`   Database Access: ${agent.databaseAccess?.enabled ? '✅ Habilitado' : '❌ Desabilitado'}`);
  console.log(`   Collections Permitidas: ${agent.databaseAccess?.allowedCollections?.join(', ') || 'Nenhuma'}\n`);

  if (agent.status !== 'active') {
    console.log('⚠️  Agente não está ativo. Ativando...');
    const activateResult = await makeRequest('PUT', `/agents/${DATABASE_AGENT_ID}/status`, { status: 'active' });
    if (activateResult.success) {
      console.log('✅ Agente ativado com sucesso!\n');
    } else {
      console.log('❌ Erro ao ativar agente:', activateResult.error);
      return;
    }
  }

  // 2. Criar alguns metadados de teste se não existirem
  console.log('📝 2. VERIFICANDO/CRIANDO METADADOS DE TESTE');
  console.log('===========================================');

  const testMetadata = [
    {
      fileId: "agent-test-file-001",
      agentId: DATABASE_AGENT_ID,
      theme: "Inteligência Artificial e Machine Learning",
      improvedContent: "Documento sobre implementação de sistemas de IA para automação de processos empresariais, incluindo machine learning, processamento de linguagem natural e análise preditiva.",
      tags: ["IA", "machine learning", "automação", "NLP", "análise preditiva"],
      analysis: {
        summary: "Análise detalhada sobre tecnologias de inteligência artificial aplicadas em ambientes corporativos, explorando desde conceitos básicos até aplicações avançadas de machine learning e análise preditiva.",
        keyTopics: ["machine learning", "deep learning", "NLP", "visão computacional", "análise preditiva"],
        sentiment: "positivo",
        confidence: 0.95,
        language: "pt-BR"
      }
    },
    {
      fileId: "agent-test-file-002",
      agentId: DATABASE_AGENT_ID,
      theme: "Finanças e Análise de Dados",
      improvedContent: "Relatório financeiro sobre análise de dados, indicadores de performance e projeções de receita para otimização de recursos empresariais.",
      tags: ["finanças", "análise de dados", "performance", "receita", "otimização"],
      analysis: {
        summary: "Relatório abrangente sobre análise financeira, indicadores de performance e estratégias de otimização de recursos baseadas em dados.",
        keyTopics: ["análise financeira", "indicadores de performance", "projeções", "otimização", "dados"],
        sentiment: "neutro",
        confidence: 0.88,
        language: "pt-BR"
      }
    }
  ];

  const createdMetadata = [];
  for (const metadata of testMetadata) {
    console.log(`📄 Criando metadado: ${metadata.theme}`);
    const result = await makeRequest('POST', '/metadata', metadata);
    
    if (result.success) {
      console.log(`   ✅ Criado com sucesso! ID: ${result.data.data.id}`);
      createdMetadata.push(result.data.data.id);
    } else {
      console.log(`   ❌ Erro:`, result.error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (createdMetadata.length === 0) {
    console.log('⚠️  Nenhum metadado foi criado. Continuando com os existentes...\n');
  } else {
    console.log('\n⏳ Aguardando processamento dos embeddings...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // 3. Testar consultas do agente com embeddings
  console.log('🔍 3. TESTANDO CONSULTAS DO AGENTE COM EMBEDDINGS');
  console.log('================================================');

  const testQueries = [
    {
      query: "Consulte metadados sobre inteligência artificial",
      description: "Consulta básica sobre IA"
    },
    {
      query: "Busque documentos similares sobre machine learning",
      description: "Busca por similaridade"
    },
    {
      query: "Encontre textos sobre análise de dados e finanças",
      description: "Consulta sobre análise de dados"
    },
    {
      query: "Procure por documentos relacionados a tecnologia",
      description: "Consulta ampla sobre tecnologia"
    },
    {
      query: "Tema sobre automação de processos",
      description: "Busca por tema específico"
    }
  ];

  for (const test of testQueries) {
    console.log(`\n🔎 Testando: ${test.description}`);
    console.log(`   Query: "${test.query}"`);
    
    const chatRequest = {
      messages: [
        {
          role: 'user',
          content: test.query
        }
      ]
    };

    const result = await makeRequest('POST', `/agents/${DATABASE_AGENT_ID}/chat`, chatRequest);
    
    if (result.success) {
      console.log(`   ✅ Resposta recebida:`);
      console.log(`   ${result.data.response.content.substring(0, 200)}${result.data.response.content.length > 200 ? '...' : ''}`);
      
      // Verificar se a resposta indica uso de embeddings
      const response = result.data.response.content.toLowerCase();
      if (response.includes('busca semântica') || response.includes('embedding') || response.includes('similaridade')) {
        console.log(`   🎯 EMBEDDINGS DETECTADOS! ✅`);
      } else {
        console.log(`   ⚠️  Resposta não indica uso de embeddings`);
      }
    } else {
      console.log(`   ❌ Erro na consulta:`, result.error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 4. Verificar estatísticas finais
  console.log('\n📊 4. ESTATÍSTICAS FINAIS');
  console.log('========================');

  const statsResult = await makeRequest('GET', '/metadata/stats');
  if (statsResult.success) {
    const stats = statsResult.data.data;
    console.log(`✅ Total de metadados: ${stats.total}`);
    console.log(`   Com embeddings: ${stats.withEmbeddings}`);
    console.log(`   Por agente: ${JSON.stringify(stats.byAgent, null, 2)}`);
  }

  console.log('\n✅ TESTE DE INTEGRAÇÃO CONCLUÍDO!');
  console.log('==================================');
  console.log('\n💡 Resumo:');
  console.log('   - O agente Database foi atualizado para usar embeddings');
  console.log('   - Consultas sobre metadados agora usam busca semântica');
  console.log('   - Palavras-chave como "metadados", "texto", "similar" ativam embeddings');
  console.log('   - O agente fornece respostas formatadas com informações de similaridade');
  
  console.log('\n🔧 Como testar manualmente:');
  console.log('   1. Use o endpoint POST /api/agents/{agentId}/chat');
  console.log('   2. Inclua palavras como "metadados", "texto", "similar" na consulta');
  console.log('   3. O agente usará automaticamente embeddings para buscar');
  
  console.log('\n📝 Metadados de teste criados:');
  createdMetadata.forEach((id, index) => {
    console.log(`   ${index + 1}. ${id}`);
  });
}

// Executar teste
testDatabaseAgent().catch(console.error);
