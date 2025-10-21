const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';

async function checkMetadata() {
  console.log('🔍 VERIFICANDO METADADOS NO BANCO DE DADOS\n');
  
  try {
    // Tentar diferentes endpoints para metadados
    const endpoints = [
      '/metadata/stats',
      '/metadatas/stats', 
      '/metadata',
      '/metadatas'
    ];

    for (const endpoint of endpoints) {
      console.log(`📡 Testando endpoint: ${endpoint}`);
      
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Sucesso! Status: ${response.status}`);
        console.log('Dados:', JSON.stringify(response.data, null, 2));
        console.log('');
        
      } catch (error) {
        console.log(`❌ Erro ${error.response?.status}: ${error.response?.data?.error?.message || error.message}`);
        console.log('');
      }
    }

    // Tentar criar um metadado de teste
    console.log('📝 TENTANDO CRIAR METADADO DE TESTE\n');
    
    const testMetadata = {
      fileId: "test-direct-001",
      agentId: "68dd625e8be0682166a76f97",
      theme: "Atendimento ao Cliente",
      improvedContent: "Documento sobre estratégias de atendimento ao cliente, incluindo protocolos de suporte e análise de satisfação do cliente.",
      tags: ["atendimento", "cliente", "suporte", "satisfação", "protocolos"],
      analysis: {
        summary: "Análise detalhada sobre processos de atendimento ao cliente, protocolos de suporte e métricas de satisfação.",
        keyTopics: ["atendimento ao cliente", "suporte técnico", "satisfação", "protocolos", "métricas"],
        sentiment: "positivo",
        confidence: 0.90,
        language: "pt-BR"
      }
    };

    const createEndpoints = [
      '/metadata',
      '/metadatas',
      '/metadata/create',
      '/metadatas/create'
    ];

    for (const endpoint of createEndpoints) {
      console.log(`📤 Tentando criar em: ${endpoint}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, testMetadata, {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Criado com sucesso! Status: ${response.status}`);
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        console.log('');
        
        // Se conseguiu criar, aguardar e testar novamente
        console.log('⏳ Aguardando processamento do embedding...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Testar busca novamente
        console.log('🔍 Testando busca após criação...');
        const chatResponse = await axios.post(
          `${API_BASE_URL}/agents/68dd625e8be0682166a76f97/chat`,
          {
            messages: [{ role: 'user', content: 'Consulte metadados sobre atendimento' }]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': API_KEY
            }
          }
        );
        
        console.log('✅ Busca após criação:');
        console.log(chatResponse.data.data.response.content);
        break;
        
      } catch (error) {
        console.log(`❌ Erro ${error.response?.status}: ${error.response?.data?.error?.message || error.message}`);
        console.log('');
      }
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkMetadata().catch(console.error);
