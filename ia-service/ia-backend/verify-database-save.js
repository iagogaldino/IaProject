const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

async function verifyDatabaseSave() {
  try {
    console.log('🔍 Verificando salvamento automático no banco de dados...\n');

    // Get existing agents
    console.log('1. Buscando agentes...');
    const agentsResponse = await axios.get(`${BASE_URL}/agents`, {
      headers: { 'X-API-Key': API_KEY }
    });

    if (agentsResponse.data.data.length === 0) {
      console.log('❌ Nenhum agente encontrado. Execute primeiro o script de criação de agente.');
      return;
    }

    const agentId = agentsResponse.data.data[0].id;
    console.log(`✅ Agente encontrado: ${agentId}`);

    // List agent files
    console.log('\n2. Listando arquivos do agente...');
    const filesResponse = await axios.get(
      `${BASE_URL}/agents/${agentId}/files`,
      {
        headers: { 'X-API-Key': API_KEY }
      }
    );

    if (filesResponse.data.data.length === 0) {
      console.log('❌ Nenhum arquivo encontrado. Faça upload de um arquivo primeiro.');
      return;
    }

    const files = filesResponse.data.data;
    console.log(`✅ Encontrados ${files.length} arquivo(s)`);

    // Check each file for enriched metadata
    console.log('\n3. Verificando metadados enriquecidos...');
    console.log('=====================================');

    for (const file of files) {
      console.log(`\n📄 Arquivo: ${file.originalName}`);
      console.log(`   • ID: ${file.id}`);
      console.log(`   • Tamanho: ${file.fileSize} bytes`);
      console.log(`   • Upload: ${new Date(file.uploadedAt).toLocaleString()}`);
      console.log(`   • Processado: ${file.processedAt ? new Date(file.processedAt).toLocaleString() : 'Não processado'}`);
      
      if (file.enrichedMetadata) {
        console.log('   ✅ METADADOS ENRIQUECIDOS ENCONTRADOS:');
        console.log(`      🎯 Tema: ${file.enrichedMetadata.theme}`);
        console.log(`      🏷️  Tags: ${file.enrichedMetadata.tags?.join(', ') || 'Nenhuma'}`);
        console.log(`      📝 Resumo: ${file.enrichedMetadata.analysis?.summary?.substring(0, 100)}...`);
        console.log(`      📈 Sentimento: ${file.enrichedMetadata.analysis?.sentiment}`);
        console.log(`      🎯 Confiança: ${(file.enrichedMetadata.analysis?.confidence * 100).toFixed(1)}%`);
        console.log(`      🤖 Agente: ${file.enrichedMetadata.aiAnalysis?.agentId}`);
        console.log(`      ⏰ Processado: ${file.enrichedMetadata.aiAnalysis?.processedAt}`);
        
        if (file.enrichedMetadata.improvedContent) {
          console.log(`      ✨ Conteúdo melhorado: ${file.enrichedMetadata.improvedContent.substring(0, 100)}...`);
        }
      } else {
        console.log('   ❌ Nenhum metadado enriquecido encontrado');
        console.log('   💡 Execute a análise de conteúdo para gerar metadados');
      }
    }

    // Summary
    const filesWithMetadata = files.filter(f => f.enrichedMetadata).length;
    console.log('\n📊 RESUMO:');
    console.log('=====================================');
    console.log(`📁 Total de arquivos: ${files.length}`);
    console.log(`✅ Com metadados enriquecidos: ${filesWithMetadata}`);
    console.log(`❌ Sem metadados enriquecidos: ${files.length - filesWithMetadata}`);

    if (filesWithMetadata > 0) {
      console.log('\n🎉 SUCESSO: Metadados enriquecidos foram salvos automaticamente no banco!');
      console.log('   • Os dados estão na collection "fileuploads"');
      console.log('   • Campo "enrichedMetadata" contém todos os dados da análise');
      console.log('   • Os dados persistem entre reinicializações do servidor');
    } else {
      console.log('\n💡 Para gerar metadados enriquecidos:');
      console.log('   1. Faça upload de um arquivo');
      console.log('   2. Execute a análise de conteúdo com IA');
      console.log('   3. Os metadados serão salvos automaticamente');
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Dica: Verifique se a API_KEY está configurada corretamente');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Dica: Verifique se o servidor está rodando na porta 3000');
    }
  }
}

// Run the verification
if (require.main === module) {
  verifyDatabaseSave();
}

module.exports = { verifyDatabaseSave };
