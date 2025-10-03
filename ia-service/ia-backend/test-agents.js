const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

async function testAgents() {
  try {
    console.log('🔍 Verificando agentes no banco de dados...\n');

    // 1. Listar todos os agentes
    console.log('1. Listando todos os agentes:');
    const agentsResponse = await axios.get(`${BASE_URL}/api/agents`, { headers });
    console.log('✅ Total de agentes:', agentsResponse.data.data.length);
    
    if (agentsResponse.data.data.length > 0) {
      console.log('\n📋 Agentes encontrados:');
      agentsResponse.data.data.forEach((agent, index) => {
        console.log(`\n${index + 1}. Agente: ${agent.name}`);
        console.log(`   ID: ${agent.id}`);
        console.log(`   Status: ${agent.status}`);
        console.log(`   Descrição: ${agent.description}`);
        console.log(`   File Access: ${agent.fileAccess ? (agent.fileAccess.enabled ? '✅ Habilitado' : '❌ Desabilitado') : '❌ Não configurado'}`);
        if (agent.fileAccess && agent.fileAccess.enabled) {
          console.log(`   Tipos permitidos: ${agent.fileAccess.allowedFileTypes.join(', ')}`);
          console.log(`   Operações: ${agent.fileAccess.allowedOperations.join(', ')}`);
          console.log(`   Tamanho máximo: ${Math.round(agent.fileAccess.maxFileSize / 1024 / 1024)}MB`);
        }
      });
    } else {
      console.log('❌ Nenhum agente encontrado no banco de dados');
    }

    // 2. Verificar agentes ativos
    console.log('\n2. Verificando agentes ativos:');
    const activeResponse = await axios.get(`${BASE_URL}/api/agents/active`, { headers });
    console.log('✅ Agentes ativos:', activeResponse.data.data.length);
    
    if (activeResponse.data.data.length > 0) {
      activeResponse.data.data.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent.name} (${agent.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar agentes:', error.response?.data || error.message);
  }
}

testAgents();
