const mongoose = require('mongoose');

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ai_backend');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
};

// Verificar arquivos no banco
const checkFiles = async () => {
  try {
    console.log('🔍 Verificando arquivos no banco de dados...\n');
    
    // Verificar se a coleção existe
    const collections = await mongoose.connection.db.listCollections().toArray();
    const fileUploadCollection = collections.find(col => col.name === 'fileuploads');
    
    if (!fileUploadCollection) {
      console.log('❌ Coleção "fileuploads" não encontrada!');
      return;
    }
    
    console.log('✅ Coleção "fileuploads" encontrada');
    
    // Contar documentos
    const FileUpload = mongoose.model('FileUpload', new mongoose.Schema({}, { strict: false }));
    const count = await FileUpload.countDocuments();
    console.log(`📊 Total de arquivos no banco: ${count}`);
    
    if (count > 0) {
      // Listar arquivos
      const files = await FileUpload.find().sort({ uploadedAt: -1 });
      console.log('\n📋 Arquivos encontrados:');
      
      files.forEach((file, index) => {
        console.log(`\n${index + 1}. Arquivo: ${file.originalName}`);
        console.log(`   ID: ${file._id}`);
        console.log(`   Agent ID: ${file.agentId}`);
        console.log(`   Tamanho: ${file.fileSize} bytes`);
        console.log(`   Tipo: ${file.mimeType}`);
        console.log(`   Upload: ${file.uploadedAt}`);
        console.log(`   Caminho: ${file.filePath}`);
      });
    } else {
      console.log('\n⚠️  Nenhum arquivo encontrado no banco de dados!');
      console.log('   Isso pode indicar que:');
      console.log('   1. Os arquivos não estão sendo salvos no banco');
      console.log('   2. Há um problema na implementação do upload');
      console.log('   3. Os arquivos estão sendo salvos em uma coleção diferente');
    }
    
    // Verificar outras coleções relacionadas
    console.log('\n🔍 Verificando outras coleções...');
    const allCollections = await mongoose.connection.db.listCollections().toArray();
    console.log('Coleções disponíveis:');
    allCollections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar arquivos:', error);
  }
};

// Executar
const main = async () => {
  await connectDB();
  await checkFiles();
  await mongoose.disconnect();
  console.log('\n✅ Verificação concluída');
};

main().catch(console.error);
