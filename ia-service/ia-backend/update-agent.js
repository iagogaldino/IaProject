const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'ai-backend-2024-abc123xyz789';

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

async function updateAgent() {
  try {
    console.log('🔧 Atualizando agente para habilitar acesso a arquivos...\n');

    const agentId = '68de5d2bf6934dbd41a89f9f'; // ID do Agente Excel
    
    const updateData = {
      fileAccess: {
        enabled: true,
        allowedFileTypes: ['txt', 'pdf', 'doc', 'docx', 'xlsx', 'xls', 'csv', 'json'],
        maxFileSize: 10485760, // 10MB
        allowedOperations: ['read', 'upload', 'delete'],
        storagePath: 'uploads'
      }
    };

    console.log('📝 Dados de atualização:', JSON.stringify(updateData, null, 2));
    console.log('\n🔄 Atualizando agente...');

    const response = await axios.put(`${BASE_URL}/api/agents/${agentId}`, updateData, { headers });
    
    console.log('✅ Agente atualizado com sucesso!');
    console.log('📋 Detalhes do agente:');
    console.log(`   Nome: ${response.data.data.name}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   File Access: ${response.data.data.fileAccess.enabled ? '✅ Habilitado' : '❌ Desabilitado'}`);
    console.log(`   Tipos permitidos: ${response.data.data.fileAccess.allowedFileTypes.join(', ')}`);
    console.log(`   Operações: ${response.data.data.fileAccess.allowedOperations.join(', ')}`);
    console.log(`   Tamanho máximo: ${Math.round(response.data.data.fileAccess.maxFileSize / 1024 / 1024)}MB`);

  } catch (error) {
    console.error('❌ Erro ao atualizar agente:', error.response?.data || error.message);
  }
}

updateAgent();
