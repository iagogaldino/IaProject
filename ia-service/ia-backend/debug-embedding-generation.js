const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'ai-backend-2024-abc123xyz789';

async function debugEmbeddingGeneration() {
  console.log('🔍 DEBUG - GERAÇÃO DE EMBEDDINGS\n');
  
  try {
    // 1. Verificar se o serviço de embedding está funcionando
    console.log('⚙️ 1. TESTANDO SERVIÇO DE EMBEDDING\n');
    
    // Tentar gerar embedding para metadados existentes
    try {
      const response = await axios.post(
        `${API_BASE_URL}/metadata/embeddings/generate?batchSize=10`,
        {},
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Geração de embeddings:');
      console.log('Status:', response.status);
      console.log('Processados:', response.data.data.processed);
      console.log('Erros:', response.data.data.errors);
      console.log('Atualizados:', response.data.data.updated);
      
      if (response.data.data.errors > 0) {
        console.log('❌ Há erros na geração de embeddings!');
      }
      
    } catch (error) {
      console.log('❌ Erro ao gerar embeddings:', error.response?.data?.error?.message || error.message);
    }

    // 2. Verificar metadados específicos
    console.log('\n📄 2. VERIFICANDO METADADOS ESPECÍFICOS\n');
    
    // Buscar o metadado que acabamos de criar
    try {
      const response = await axios.get(
        `${API_BASE_URL}/agents/68dd625e8be0682166a76f97/metadata`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Encontrados ${response.data.data.length} metadados do agente`);
      
      response.data.data.forEach((metadata, index) => {
        console.log(`\n${index + 1}. ${metadata.theme}`);
        console.log(`   ID: ${metadata.id}`);
        console.log(`   Tem embedding: ${metadata.embedding ? '✅ SIM' : '❌ NÃO'}`);
        if (metadata.embedding) {
          console.log(`   Vector length: ${metadata.embedding.vector?.length || 0}`);
          console.log(`   Model: ${metadata.embedding.model}`);
          console.log(`   Generated: ${metadata.embedding.generatedAt}`);
        }
      });
      
    } catch (error) {
      console.log('❌ Erro ao buscar metadados:', error.response?.data?.error?.message || error.message);
    }

    // 3. Tentar atualizar embedding de um metadado específico
    console.log('\n🔄 3. TENTANDO ATUALIZAR EMBEDDING ESPECÍFICO\n');
    
    try {
      // Usar o ID do metadado criado
      const metadataId = '68e113ba71c6360ea6190d44';
      
      const response = await axios.put(
        `${API_BASE_URL}/metadata/${metadataId}/embedding`,
        {},
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Atualização de embedding:');
      console.log('Status:', response.status);
      console.log('Resposta:', JSON.stringify(response.data, null, 2));
      
      // Aguardar e verificar novamente
      console.log('\n⏳ Aguardando e verificando...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar se o embedding foi criado
      const checkResponse = await axios.get(
        `${API_BASE_URL}/agents/68dd625e8be0682166a76f97/metadata`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const updatedMetadata = checkResponse.data.data.find(m => m.id === metadataId);
      if (updatedMetadata) {
        console.log('📊 Status após atualização:');
        console.log(`   Tem embedding: ${updatedMetadata.embedding ? '✅ SIM' : '❌ NÃO'}`);
        if (updatedMetadata.embedding) {
          console.log(`   Vector length: ${updatedMetadata.embedding.vector?.length || 0}`);
          console.log(`   Model: ${updatedMetadata.embedding.model}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao atualizar embedding:', error.response?.data?.error?.message || error.message);
    }

    // 4. Testar busca novamente
    console.log('\n🔍 4. TESTANDO BUSCA APÓS CORREÇÕES\n');
    
    try {
      const searchResponse = await axios.get(
        `${API_BASE_URL}/metadata/search/similar?query=atendimento&limit=5&threshold=0.3`,
        {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Busca após correções:');
      console.log('Status:', searchResponse.status);
      console.log('Resultados encontrados:', searchResponse.data.data.length);
      
      if (searchResponse.data.data.length > 0) {
        console.log('🎯 EMBEDDINGS FUNCIONANDO! ✅');
        searchResponse.data.data.forEach((result, index) => {
          console.log(`\n${index + 1}. ${result.metadata.theme}`);
          console.log(`   Similaridade: ${(result.similarity * 100).toFixed(1)}%`);
        });
      } else {
        console.log('❌ Ainda nenhum resultado encontrado');
      }
      
    } catch (error) {
      console.log('❌ Erro na busca:', error.response?.data?.error?.message || error.message);
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

debugEmbeddingGeneration().catch(console.error);
