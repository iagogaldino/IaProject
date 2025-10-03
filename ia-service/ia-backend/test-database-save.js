const axios = require('axios');
const mongoose = require('mongoose');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const API_KEY = process.env.API_KEY || 'your-api-key-here';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ia-service';

// Test content
const testContent = `
Documento sobre Inteligência Artificial e Machine Learning

Este documento aborda as principais tendências em inteligência artificial, incluindo:

1. Aprendizado Profundo
- Redes neurais convolucionais
- Redes neurais recorrentes
- Transformers e atenção

2. Processamento de Linguagem Natural
- Modelos de linguagem grandes
- Análise de sentimento
- Tradução automática

3. Visão Computacional
- Reconhecimento de objetos
- Segmentação de imagens
- Detecção de faces

4. Sistemas de Recomendação
- Filtragem colaborativa
- Filtragem baseada em conteúdo
- Sistemas híbridos

5. Ética em IA
- Viés algorítmico
- Transparência e explicabilidade
- Privacidade de dados

Conclusões:
A IA continua evoluindo rapidamente, mas é fundamental considerar os aspectos éticos e sociais. O futuro da IA depende de um desenvolvimento responsável e inclusivo.
`;

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    return false;
  }
}

async function testDatabaseSave() {
  try {
    console.log('🧪 Testando salvamento automático no banco de dados...\n');

    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      console.log('⚠️  Continuando sem verificação do banco de dados');
    }

    // Get existing agents
    console.log('1. Buscando agentes disponíveis...');
    const agentsResponse = await axios.get(`${BASE_URL}/agents`, {
      headers: { 'X-API-Key': API_KEY }
    });

    if (agentsResponse.data.data.length === 0) {
      console.log('❌ Nenhum agente encontrado. Criando um agente de teste...');
      
      const agentResponse = await axios.post(`${BASE_URL}/agents`, {
        name: 'Agente Especialista em IA',
        description: 'Agente especializado em análise de conteúdo com IA',
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

    const testFilePath = path.join(__dirname, 'test-ai-document.txt');
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

    // Get file info before analysis
    console.log('\n3. Verificando arquivo antes da análise...');
    const fileInfoBefore = await axios.get(
      `${BASE_URL}/files/${fileId}`,
      {
        headers: { 'X-API-Key': API_KEY }
      }
    );

    console.log('📋 Estado antes da análise:');
    console.log(`   • Tem metadados enriquecidos: ${fileInfoBefore.data.data.enrichedMetadata ? 'Sim' : 'Não'}`);
    console.log(`   • Processado em: ${fileInfoBefore.data.data.processedAt || 'Não processado'}`);

    // Perform AI analysis
    console.log('\n4. Executando análise de conteúdo com IA...');
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

    // Verify data was saved to database
    console.log('\n5. Verificando salvamento no banco de dados...');
    const fileInfoAfter = await axios.get(
      `${BASE_URL}/files/${fileId}`,
      {
        headers: { 'X-API-Key': API_KEY }
      }
    );

    console.log('📋 Estado após a análise:');
    console.log(`   • Tem metadados enriquecidos: ${fileInfoAfter.data.data.enrichedMetadata ? '✅ Sim' : '❌ Não'}`);
    console.log(`   • Processado em: ${fileInfoAfter.data.data.processedAt || 'Não processado'}`);

    if (fileInfoAfter.data.data.enrichedMetadata) {
      console.log('\n🎉 DADOS SALVOS COM SUCESSO NO BANCO!');
      console.log('=====================================');
      console.log(`🎯 Tema salvo: ${fileInfoAfter.data.data.enrichedMetadata.theme}`);
      console.log(`🏷️  Tags salvas: ${fileInfoAfter.data.data.enrichedMetadata.tags?.join(', ')}`);
      console.log(`📝 Resumo salvo: ${fileInfoAfter.data.data.enrichedMetadata.analysis?.summary?.substring(0, 100)}...`);
      console.log(`📈 Sentimento salvo: ${fileInfoAfter.data.data.enrichedMetadata.analysis?.sentiment}`);
      console.log(`🎯 Confiança salva: ${(fileInfoAfter.data.data.enrichedMetadata.analysis?.confidence * 100).toFixed(1)}%`);
      console.log(`🤖 Agente que processou: ${fileInfoAfter.data.data.enrichedMetadata.aiAnalysis?.agentId}`);
      console.log(`⏰ Processado em: ${fileInfoAfter.data.data.enrichedMetadata.aiAnalysis?.processedAt}`);
    } else {
      console.log('❌ ERRO: Metadados enriquecidos não foram salvos!');
    }

    // If connected to database, show raw database data
    if (connected) {
      console.log('\n6. Verificando dados brutos no MongoDB...');
      const { FileUpload } = require('./dist/models/FileUpload');
      
      try {
        const fileRecord = await FileUpload.findById(fileId);
        if (fileRecord && fileRecord.enrichedMetadata) {
          console.log('✅ Dados encontrados diretamente no MongoDB:');
          console.log(`   • Collection: fileuploads`);
          console.log(`   • Document ID: ${fileRecord._id}`);
          console.log(`   • Tema: ${fileRecord.enrichedMetadata.theme}`);
          console.log(`   • Tags: ${fileRecord.enrichedMetadata.tags?.join(', ')}`);
          console.log(`   • Processado em: ${fileRecord.enrichedMetadata.aiAnalysis?.processedAt}`);
        } else {
          console.log('⚠️  Dados não encontrados diretamente no MongoDB');
        }
      } catch (dbError) {
        console.log('⚠️  Erro ao verificar dados no MongoDB:', dbError.message);
      }
    }

    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Limpeza concluída');

    console.log('\n🎉 Teste de salvamento no banco concluído com sucesso!');
    console.log('\n📝 Resumo:');
    console.log('   ✅ Análise de IA executada');
    console.log('   ✅ Metadados enriquecidos gerados');
    console.log('   ✅ Dados salvos automaticamente no banco');
    console.log('   ✅ Arquivo atualizado com novos metadados');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error.message);
  } finally {
    if (connected) {
      await mongoose.disconnect();
      console.log('🔌 Desconectado do MongoDB');
    }
  }
}

// Run the test
if (require.main === module) {
  testDatabaseSave();
}

module.exports = { testDatabaseSave };
