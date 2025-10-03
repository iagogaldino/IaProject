const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

// Test data
const testContent = `
Este é um documento sobre inteligência artificial e machine learning.
O documento discute as principais tendências em IA, incluindo:
- Aprendizado profundo e redes neurais
- Processamento de linguagem natural
- Visão computacional
- Sistemas de recomendação
- Ética em IA e responsabilidade algorítmica

O documento também aborda os desafios atuais na área, como:
- Interpretabilidade dos modelos
- Viés algorítmico
- Privacidade de dados
- Escalabilidade de sistemas

Conclusões: A IA continua evoluindo rapidamente, mas é importante considerar os aspectos éticos e sociais.
`;

async function testContentAnalysis() {
  try {
    console.log('🧪 Testando análise de conteúdo com IA...\n');

    // First, let's get an existing agent (assuming one exists)
    console.log('1. Buscando agentes disponíveis...');
    const agentsResponse = await axios.get(`${BASE_URL}/agents`, {
      headers: { 'X-API-Key': API_KEY }
    });

    if (agentsResponse.data.data.length === 0) {
      console.log('❌ Nenhum agente encontrado. Criando um agente de teste...');
      
      // Create a test agent
      const agentResponse = await axios.post(`${BASE_URL}/agents`, {
        name: 'Agente de Teste IA',
        description: 'Agente especializado em análise de conteúdo',
        status: 'active',
        fileAccess: {
          enabled: true,
          allowedFileTypes: ['txt', 'pdf', 'doc', 'docx'],
          maxFileSize: 10485760, // 10MB
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

    // Upload a test file first
    console.log('\n2. Fazendo upload de arquivo de teste...');
    const FormData = require('form-data');
    const fs = require('fs');
    const path = require('path');

    // Create a temporary test file
    const testFilePath = path.join(__dirname, 'test-content.txt');
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

    // Test the new content analysis endpoint
    console.log('\n3. Testando análise de conteúdo com IA...');
    console.log(`   • Agente: ${agentId}`);
    console.log(`   • Arquivo: ${fileId}`);
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
    console.log(`📝 Resumo: ${analysisResponse.data.data.analysis.summary}`);
    console.log(`📈 Sentimento: ${analysisResponse.data.data.analysis.sentiment}`);
    console.log(`🎯 Confiança: ${(analysisResponse.data.data.analysis.confidence * 100).toFixed(1)}%`);
    console.log(`🌐 Idioma: ${analysisResponse.data.data.analysis.language}`);
    console.log(`📋 Tópicos principais: ${analysisResponse.data.data.analysis.keyTopics.join(', ')}`);

    if (analysisResponse.data.data.improvedContent) {
      console.log('\n✨ Conteúdo melhorado:');
      console.log('=====================================');
      console.log(analysisResponse.data.data.improvedContent);
    }

    // Verify the enriched metadata was saved
    console.log('\n4. Verificando metadados salvos...');
    const fileInfoResponse = await axios.get(
      `${BASE_URL}/files/${fileId}`,
      {
        headers: { 'X-API-Key': API_KEY }
      }
    );

    if (fileInfoResponse.data.data.enrichedMetadata) {
      console.log('✅ Metadados enriquecidos salvos com sucesso!');
      console.log(`🎯 Tema salvo: ${fileInfoResponse.data.data.enrichedMetadata.theme}`);
      console.log(`🏷️  Tags salvas: ${fileInfoResponse.data.data.enrichedMetadata.tags?.join(', ')}`);
    } else {
      console.log('⚠️  Metadados enriquecidos não encontrados');
    }

    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Limpeza concluída');

    console.log('\n🎉 Teste de análise de conteúdo concluído com sucesso!');

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
  testContentAnalysis();
}

module.exports = { testContentAnalysis };
