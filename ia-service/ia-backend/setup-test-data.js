const { MongoClient } = require('mongodb');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';

async function setupTestData() {
  console.log('🚀 Configurando dados de teste...\n');

  // 1. Primeiro, criar o Agente Database
  console.log('🤖 Criando Agente Database...');
  try {
    const agentData = {
      name: 'Agente Database',
      description: 'Agente especializado em consultas de banco de dados e busca semântica',
      status: 'active',
      databaseAccess: {
        enabled: true,
        allowedCollections: ['metadatas', 'files', 'agents'],
        queryLimits: {
          maxResults: 100
        }
      },
      canCommunicateWith: []
    };

    const response = await axios.post(`${API_BASE_URL}/api/agents`, agentData, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    console.log(`✅ Agente Database criado: ${response.data.agent.id}`);
    const agentId = response.data.agent.id;

    // 2. Criar metadados de teste
    console.log('\n📄 Criando metadados de teste...');
    
    const testMetadata = [
      {
        fileId: 'test-file-1',
        agentId: agentId,
        theme: 'Gastos financeiros em Petrolina - Relatório mensal',
        improvedContent: 'Relatório detalhado dos gastos realizados na cidade de Petrolina durante o mês. Inclui despesas com infraestrutura, obras públicas e investimentos municipais.',
        tags: ['gastos', 'petrolina', 'financeiro', 'relatório', 'municipal'],
        analysis: {
          summary: 'Documento contém informações sobre gastos públicos na cidade de Petrolina, incluindo investimentos em infraestrutura e obras municipais.',
          keyTopics: ['gastos municipais', 'infraestrutura', 'investimentos públicos'],
          sentiment: 'neutro',
          language: 'pt',
          confidence: 0.95
        }
      },
      {
        fileId: 'test-file-2',
        agentId: agentId,
        theme: 'Obras de construção - Projeto viário',
        improvedContent: 'Projeto de construção de vias públicas e infraestrutura rodoviária. Inclui custos de materiais, mão de obra e equipamentos.',
        tags: ['obras', 'construção', 'vias', 'infraestrutura', 'projeto'],
        analysis: {
          summary: 'Projeto de construção civil focado em infraestrutura viária com detalhamento de custos e cronograma.',
          keyTopics: ['construção civil', 'vias públicas', 'cronograma de obras'],
          sentiment: 'positivo',
          language: 'pt',
          confidence: 0.92
        }
      },
      {
        fileId: 'test-file-3',
        agentId: agentId,
        theme: 'Vendas e receita - Relatório comercial',
        improvedContent: 'Relatório de vendas e receita gerada através de produtos e serviços. Inclui análise de performance comercial e metas atingidas.',
        tags: ['vendas', 'receita', 'comercial', 'produtos', 'serviços'],
        analysis: {
          summary: 'Análise de performance comercial com foco em vendas de produtos e serviços, incluindo métricas de receita.',
          keyTopics: ['performance comercial', 'análise de vendas', 'métricas financeiras'],
          sentiment: 'positivo',
          language: 'pt',
          confidence: 0.88
        }
      },
      {
        fileId: 'test-file-4',
        agentId: agentId,
        theme: 'Produtividade no trabalho remoto - Guia prático',
        improvedContent: 'Guia completo com dicas e estratégias para manter alta produtividade durante o trabalho remoto. Inclui técnicas de organização e gestão de tempo.',
        tags: ['produtividade', 'trabalho remoto', 'organização', 'gestão de tempo'],
        analysis: {
          summary: 'Guia prático para melhorar a produtividade em ambiente de trabalho remoto, com foco em organização e gestão eficiente do tempo.',
          keyTopics: ['gestão de tempo', 'organização pessoal', 'trabalho remoto'],
          sentiment: 'positivo',
          language: 'pt',
          confidence: 0.90
        }
      }
    ];

    for (const metadata of testMetadata) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/metadata`, metadata, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          }
        });
        console.log(`✅ Metadado criado: ${metadata.theme.substring(0, 50)}...`);
      } catch (error) {
        console.log(`❌ Erro ao criar metadado: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n✅ Dados de teste configurados com sucesso!');
    console.log('\n🔍 Agora você pode testar a busca vetorial otimizada com:');
    console.log('   • "Consulte metadados sobre o total gasto em Petrolina"');
    console.log('   • "Busque informações sobre gastos financeiros"');
    console.log('   • "Encontre documentos relacionados a obras e construção"');
    console.log('   • "Procure por dados sobre vendas e receita"');
    console.log('   • "Mostre metadados sobre produtividade e trabalho remoto"');

  } catch (error) {
    console.log(`❌ Erro: ${error.response?.data?.message || error.message}`);
  }
}

setupTestData();
