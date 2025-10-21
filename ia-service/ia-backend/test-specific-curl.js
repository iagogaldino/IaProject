const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd625e8be0682166a76f97';

async function testSpecificCurl() {
  console.log('🔍 Testando CURL específico...\n');

  const specificQuery = 'Qual o total de gastos nas pavimentações de Petrolina?';
  
  console.log(`📝 Query: "${specificQuery}"`);
  console.log('─'.repeat(80));

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/agents/${AGENT_ID}/chat`,
      {
        messages: [{ role: 'user', content: specificQuery }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );

    console.log('📊 Status:', response.status);
    
    if (response.data && response.data.data && response.data.data.response) {
      const content = response.data.data.response.content;
      console.log('✅ Resposta recebida:');
      console.log(content);
      
      // Verificar se foi tratada como consulta de metadados
      const isMetadataQuery = content.includes('Busca Semântica') || 
                             content.includes('embedding') ||
                             content.includes('similar');
      
      console.log('\n🔍 Análise:');
      console.log(`📊 Foi tratada como consulta de metadados: ${isMetadataQuery ? 'Sim' : 'Não'}`);
      console.log(`📊 Contém informações sobre gastos: ${content.toLowerCase().includes('gasto') ? 'Sim' : 'Não'}`);
      console.log(`📊 Contém informações sobre petrolina: ${content.toLowerCase().includes('petrolina') ? 'Sim' : 'Não'}`);
      console.log(`📊 Contém informações sobre pavimentação: ${content.toLowerCase().includes('pavimentação') || content.toLowerCase().includes('pavimentacao') ? 'Sim' : 'Não'}`);
      
    } else {
      console.log('❌ Resposta inválida');
    }

  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    if (error.response) {
      console.log(`📊 Status do erro: ${error.response.status}`);
      console.log(`📋 Dados do erro: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Testar variações da consulta
async function testQueryVariations() {
  console.log('\n🔄 Testando variações da consulta...\n');

  const variations = [
    'Qual o total de gastos nas pavimentações de Petrolina?',
    'Consulte metadados sobre gastos em pavimentação em Petrolina',
    'Busque informações sobre total de gastos em pavimentações',
    'Encontre documentos sobre pavimentação e gastos em Petrolina',
    'Procure por dados sobre investimentos em pavimentação',
    'Mostre metadados sobre gastos com pavimentação'
  ];

  for (let i = 0; i < variations.length; i++) {
    const query = variations[i];
    console.log(`📝 Variação ${i + 1}: "${query}"`);
    
    try {
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

      const content = response.data.data.response.content;
      const isMetadataQuery = content.includes('Busca Semântica') || content.includes('embedding');
      
      console.log(`   ${isMetadataQuery ? '✅' : '❌'} Tratada como metadados: ${isMetadataQuery ? 'Sim' : 'Não'}`);
      
      if (isMetadataQuery && content.includes('similar')) {
        const similarityMatch = content.match(/(\d+\.?\d*)% similar/);
        if (similarityMatch) {
          console.log(`   🎯 Score de similaridade: ${similarityMatch[1]}%`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    
    console.log('');
  }
}

async function main() {
  await testSpecificCurl();
  await testQueryVariations();
}

main();
