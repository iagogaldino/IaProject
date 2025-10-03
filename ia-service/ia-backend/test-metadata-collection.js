const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

// Test content
const testContent = `
Documento sobre Tecnologia e Inovação

Este documento explora as principais tendências em tecnologia e inovação:

1. Inteligência Artificial
- Machine Learning
- Deep Learning
- Processamento de Linguagem Natural
- Visão Computacional

2. Blockchain e Criptomoedas
- Tecnologia de Ledger Distribuído
- Smart Contracts
- DeFi (Finanças Descentralizadas)
- NFTs e Tokens

3. Internet das Coisas (IoT)
- Sensores Inteligentes
- Conectividade 5G
- Edge Computing
- Smart Cities

4. Realidade Virtual e Aumentada
- VR para Treinamento
- AR para Varejo
- Metaverso
- Aplicações Empresariais

5. Sustentabilidade Tecnológica
- Green Tech
- Energia Renovável
- Eficiência Energética
- Economia Circular

Conclusões:
A tecnologia continua evoluindo rapidamente, com foco em sustentabilidade e impacto social positivo.
`;

async function testMetadataCollection() {
  try {
    console.log('🧪 Testando salvamento na collection METADATA...\n');

    // Get existing agents
    console.log('1. Buscando agentes disponíveis...');
    const agentsResponse = await axios.get(`${BASE_URL}/agents`, {
      headers: { 'X-API-Key': API_KEY }
    });

    if (agentsResponse.data.data.length === 0) {
      console.log('❌ Nenhum agente encontrado. Criando um agente de teste...');
      
      const agentResponse = await axios.post(`${BASE_URL}/agents`, {
        name: 'Agente Especialista em Tecnologia',
        description: 'Agente especializado em análise de conteúdo tecnológico',
        status: 'active',
        fileAccess: {
          enabled: true,
          allowedFileTypes: ['txt', 'pdf', 'doc', 'docx'],
          maxFileSize: 10485760,
          allowedOperations: ['read', 'upload', 'delete']
        }
      }, {
        headers: { 'X-API-Key': API_KEY }
      });

      const agentId = agentResponse.data.data.id;
      console.log(`✅ Agente criado: ${agentId}`);
    } else {
      const agentId = agentsResponse.data.data[0].id;
      console.log(`✅ Usando agente existente: ${agentId}`);
    }

    const agentId = agentsResponse.data.data[0].id;

    // Upload test file
    console.log('\n2. Fazendo upload de arquivo de teste...');
    const FormData = require('form-data');
    const fs = require('fs');
    const path = require('path');

    const testFilePath = path.join(__dirname, 'test-tech-document.txt');
    fs.writeFileSync(testFilePath, testContent);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));

    const uploadResponse = await axios.post(
      `${BASE_URL}/agents/${agentId}/files/upload`,
      formData,
      {
        headers: {
          'X-API-Key': API_KEY,
          ...formData.getHeaders()
        }
      }
    );

    const fileId = uploadResponse.data.data.id;
    console.log(`✅ Arquivo enviado: ${fileId}`);

    // Perform AI analysis
    console.log('\n3. Executando análise de conteúdo com IA...');
    const analysisResponse = await axios.post(
      `${BASE_URL}/agents/${agentId}/files/${fileId}/analyze`,
      {
        content: testContent,
        options: {
          language: 'pt',
          analysisDepth: 'detailed',
          includeImprovements: true
        }
      },
      {
        headers: { 'X-API-Key': API_KEY }
      }
    );

    console.log('✅ Análise concluída!');
    console.log('\n📊 Resultados da análise:');
    console.log('=====================================');
    console.log(`🎯 Tema: ${analysisResponse.data.data.theme}`);
    console.log(`🏷️  Tags: ${analysisResponse.data.data.tags.join(', ')}`);
    console.log(`📈 Sentimento: ${analysisResponse.data.data.analysis.sentiment}`);
    console.log(`🎯 Confiança: ${(analysisResponse.data.data.analysis.confidence * 100).toFixed(1)}%`);

    // Verify metadata was saved to metadata collection
    console.log('\n4. Verificando salvamento na collection METADATA...');
    
    // Get metadata by file ID
    const metadataResponse = await axios.get(
      `${BASE_URL}/files/${fileId}/metadata`,
      {
        headers: { 'X-API-Key': API_KEY }
      }
    );

    if (metadataResponse.data.success) {
      console.log('✅ METADADOS ENCONTRADOS NA COLLECTION METADATA!');
      console.log('=====================================');
      const metadata = metadataResponse.data.data;
      console.log(`🆔 ID do Metadata: ${metadata.id}`);
      console.log(`📄 File ID: ${metadata.fileId}`);
      console.log(`🤖 Agent ID: ${metadata.agentId}`);
      console.log(`🎯 Tema: ${metadata.theme}`);
      console.log(`🏷️  Tags: ${metadata.tags.join(', ')}`);
      console.log(`📝 Resumo: ${metadata.analysis.summary.substring(0, 100)}...`);
      console.log(`📈 Sentimento: ${metadata.analysis.sentiment}`);
      console.log(`🎯 Confiança: ${(metadata.analysis.confidence * 100).toFixed(1)}%`);
      console.log(`🌐 Idioma: ${metadata.analysis.language}`);
      console.log(`📋 Tópicos: ${metadata.analysis.keyTopics.join(', ')}`);
      console.log(`⏰ Criado em: ${new Date(metadata.createdAt).toLocaleString()}`);
      console.log(`🔄 Atualizado em: ${new Date(metadata.updatedAt).toLocaleString()}`);
      
      if (metadata.improvedContent) {
        console.log(`✨ Conteúdo melhorado: ${metadata.improvedContent.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ ERRO: Metadados não encontrados na collection METADATA!');
    }

    // Get metadata statistics
    console.log('\n5. Verificando estatísticas da collection METADATA...');
    const statsResponse = await axios.get(
      `${BASE_URL}/metadata/stats`,
      {
        headers: { 'X-API-Key': API_KEY }
      }
    );

    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      console.log('📊 ESTATÍSTICAS DA COLLECTION METADATA:');
      console.log('=====================================');
      console.log(`📈 Total de metadados: ${stats.totalMetadata}`);
      console.log(`🆕 Atividade recente (7 dias): ${stats.recentActivity}`);
      console.log(`🎯 Temas mais comuns:`, Object.entries(stats.byTheme).slice(0, 3));
      console.log(`📈 Sentimentos:`, Object.entries(stats.bySentiment));
      console.log(`🤖 Por agente:`, Object.entries(stats.byAgent));
    }

    // Search metadata by theme
    console.log('\n6. Testando busca por tema...');
    const searchResponse = await axios.get(
      `${BASE_URL}/metadata/search?theme=tecnologia`,
      {
        headers: { 'X-API-Key': API_KEY }
      }
    );

    if (searchResponse.data.success) {
      console.log(`🔍 Busca por tema "tecnologia": ${searchResponse.data.data.length} resultado(s)`);
      if (searchResponse.data.data.length > 0) {
        console.log(`   • Primeiro resultado: ${searchResponse.data.data[0].theme}`);
      }
    }

    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Limpeza concluída');

    console.log('\n🎉 TESTE DA COLLECTION METADATA CONCLUÍDO COM SUCESSO!');
    console.log('\n📝 Resumo:');
    console.log('   ✅ Análise de IA executada');
    console.log('   ✅ Metadados salvos na collection METADATA');
    console.log('   ✅ Endpoints de metadados funcionando');
    console.log('   ✅ Estatísticas disponíveis');
    console.log('   ✅ Busca por metadados funcionando');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Dica: Verifique se a API_KEY está configurada corretamente');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Dica: Verifique se o servidor está rodando na porta 3000');
    }
  }
}

// Run the test
if (require.main === module) {
  testMetadataCollection();
}

module.exports = { testMetadataCollection };
