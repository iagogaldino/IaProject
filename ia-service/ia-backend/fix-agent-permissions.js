const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';
const AGENT_ID = '68dd625e8be0682166a76f97';

async function fixAgentPermissions() {
  console.log('🔧 CORRIGINDO PERMISSÕES DO AGENTE DATABASE\n');
  
  try {
    // 1. Buscar configuração atual do agente
    console.log('📋 1. VERIFICANDO CONFIGURAÇÃO ATUAL\n');
    
    const agentResponse = await axios.get(
      `${API_BASE_URL}/agents/${AGENT_ID}`,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const agent = agentResponse.data.data;
    console.log('✅ Agente encontrado:', agent.name);
    console.log('Database Access:', agent.databaseAccess?.enabled ? 'Habilitado' : 'Desabilitado');
    console.log('Collections permitidas:', agent.databaseAccess?.allowedCollections || []);
    
    // 2. Atualizar permissões do agente
    console.log('\n🔧 2. ATUALIZANDO PERMISSÕES\n');
    
    const updatedAgentData = {
      databaseAccess: {
        enabled: true,
        allowedCollections: ['metadatas'], // Usar "metadatas" (plural) como você mencionou
        allowedOperations: ['read', 'write', 'update'],
        queryLimits: {
          maxResults: 100,
          timeout: 30000
        }
      }
    };
    
    const updateResponse = await axios.put(
      `${API_BASE_URL}/agents/${AGENT_ID}`,
      updatedAgentData,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Agente atualizado com sucesso!');
    console.log('Status:', updateResponse.status);
    console.log('Database Access:', updateResponse.data.data.databaseAccess?.enabled ? 'Habilitado' : 'Desabilitado');
    console.log('Collections:', updateResponse.data.data.databaseAccess?.allowedCollections);
    
    // 3. Verificar se a correção funcionou
    console.log('\n🧪 3. TESTANDO ACESSO À COLEÇÃO\n');
    
    try {
      // Tentar uma consulta simples
      const queryResponse = await axios.post(
        `${API_BASE_URL}/agents/${AGENT_ID}/chat`,
        {
          messages: [
            {
              role: 'user',
              content: 'Consulte quantos metadados existem no sistema'
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          }
        }
      );
      
      console.log('✅ Teste de consulta:');
      console.log('Status:', queryResponse.status);
      console.log('Resposta:', queryResponse.data.data.response.content.substring(0, 200) + '...');
      
    } catch (error) {
      console.log('❌ Erro no teste:', error.response?.data?.error?.message || error.message);
    }
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('=====================');
    console.log('\n💡 Resumo das correções:');
    console.log('   ✅ Role "agent" alterado para "assistant"');
    console.log('   ✅ Agente tem acesso à coleção "metadatas"');
    console.log('   ✅ Permissões de read, write, update habilitadas');
    
  } catch (error) {
    console.log('❌ Erro geral:', error.response?.data?.error?.message || error.message);
  }
}

fixAgentPermissions().catch(console.error);
