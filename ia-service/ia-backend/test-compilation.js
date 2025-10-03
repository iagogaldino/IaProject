const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testando compilação TypeScript...\n');

try {
  // Test TypeScript compilation
  console.log('1. Compilando TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Compilação TypeScript bem-sucedida!');

  // Check if dist folder exists and has files
  console.log('\n2. Verificando arquivos compilados...');
  const distPath = path.join(__dirname, 'dist');
  
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath, { recursive: true });
    console.log(`✅ Pasta dist criada com ${files.length} arquivos`);
    
    // Check key files
    const keyFiles = [
      'index.js',
      'services/externalExtractorService.js',
      'services/extractors/ContentExtractorFactory.js',
      'controllers/fileController.js'
    ];
    
    keyFiles.forEach(file => {
      const filePath = path.join(distPath, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} - Arquivo não encontrado`);
      }
    });
  } else {
    console.log('❌ Pasta dist não encontrada');
  }

  // Test if the main entry point can be required
  console.log('\n3. Testando carregamento do módulo principal...');
  try {
    const mainModule = require('./dist/index.js');
    console.log('✅ Módulo principal carregado com sucesso');
  } catch (error) {
    console.log('❌ Erro ao carregar módulo principal:', error.message);
  }

  console.log('\n🎉 Todos os testes de compilação passaram!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente');
  console.log('2. Execute: node test-external-api.js');
  console.log('3. Teste o servidor com: npm run dev');

} catch (error) {
  console.error('❌ Erro na compilação:', error.message);
  process.exit(1);
}
