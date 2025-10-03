const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

// Definir o modelo FileUpload
const FileUploadSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true },
  originalName: { type: String, required: true, trim: true },
  fileName: { type: String, required: true, trim: true, unique: true },
  filePath: { type: String, required: true, trim: true },
  fileSize: { type: Number, required: true, min: 0 },
  mimeType: { type: String, required: true, trim: true },
  uploadedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  content: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
  versionKey: false
});

const FileUpload = mongoose.model('FileUpload', FileUploadSchema);

// Testar upload de arquivo
const testFileUpload = async () => {
  try {
    console.log('🧪 Testando upload de arquivo...\n');
    
    // Verificar se há arquivos na pasta uploads
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    
    if (files.length === 0) {
      console.log('❌ Nenhum arquivo encontrado na pasta uploads');
      return;
    }
    
    console.log(`📁 Arquivos encontrados na pasta uploads: ${files.length}`);
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
    
    // Pegar o primeiro arquivo para teste
    const testFile = files[0];
    const filePath = path.join(uploadsDir, testFile);
    const stats = fs.statSync(filePath);
    
    console.log(`\n📄 Testando com arquivo: ${testFile}`);
    console.log(`   Tamanho: ${stats.size} bytes`);
    console.log(`   Modificado: ${stats.mtime}`);
    
    // Criar registro no banco
    const fileRecord = new FileUpload({
      agentId: '68de6965a35f3420d9871fe6', // ID do agente de teste
      originalName: testFile,
      fileName: testFile,
      filePath: filePath,
      fileSize: stats.size,
      mimeType: 'text/csv', // Assumindo CSV
      uploadedAt: new Date(),
      metadata: {
        originalName: testFile,
        mimeType: 'text/csv',
        size: stats.size
      }
    });
    
    console.log('\n💾 Salvando arquivo no banco de dados...');
    const savedFile = await fileRecord.save();
    console.log('✅ Arquivo salvo com sucesso!');
    console.log(`   ID: ${savedFile._id}`);
    console.log(`   Agent ID: ${savedFile.agentId}`);
    console.log(`   Nome: ${savedFile.originalName}`);
    
    // Verificar se foi salvo
    const count = await FileUpload.countDocuments();
    console.log(`\n📊 Total de arquivos no banco: ${count}`);
    
    // Listar arquivos do agente
    const agentFiles = await FileUpload.find({ agentId: '68de6965a35f3420d9871fe6' });
    console.log(`\n📋 Arquivos do agente: ${agentFiles.length}`);
    agentFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.originalName} (${file.fileSize} bytes)`);
    });
    
  } catch (error) {
    console.error('❌ Erro no teste de upload:', error);
    if (error.code === 11000) {
      console.log('   (Erro de chave duplicada - arquivo já existe)');
    }
  }
};

// Executar
const main = async () => {
  await connectDB();
  await testFileUpload();
  await mongoose.disconnect();
  console.log('\n✅ Teste concluído');
};

main().catch(console.error);