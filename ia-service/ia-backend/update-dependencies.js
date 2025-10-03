const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Atualizando dependências após integração com API externa...\n');

// Dependências removidas
const removedDependencies = [
  'pdf-parse',
  'pdf-poppler', 
  'sharp'
];

// Dependências mantidas/necessárias
const requiredDependencies = [
  'axios',
  'form-data'
];

console.log('📦 Dependências removidas:');
removedDependencies.forEach(dep => {
  console.log(`   - ${dep}`);
});

console.log('\n📦 Dependências mantidas:');
requiredDependencies.forEach(dep => {
  console.log(`   - ${dep}`);
});

console.log('\n🔧 Executando npm install para atualizar dependências...');

try {
  // Remove dependências não utilizadas
  console.log('\n1. Removendo dependências não utilizadas...');
  removedDependencies.forEach(dep => {
    try {
      execSync(`npm uninstall ${dep}`, { stdio: 'inherit' });
      console.log(`   ✅ Removido: ${dep}`);
    } catch (error) {
      console.log(`   ⚠️  ${dep} não estava instalado ou erro ao remover`);
    }
  });

  // Instala dependências necessárias
  console.log('\n2. Verificando dependências necessárias...');
  requiredDependencies.forEach(dep => {
    try {
      execSync(`npm list ${dep}`, { stdio: 'pipe' });
      console.log(`   ✅ ${dep} já instalado`);
    } catch (error) {
      console.log(`   📥 Instalando: ${dep}`);
      execSync(`npm install ${dep}`, { stdio: 'inherit' });
    }
  });

  console.log('\n✅ Atualização de dependências concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente no arquivo .env');
  console.log('2. Execute: node test-external-api.js');
  console.log('3. Verifique se a API externa está funcionando');
  console.log('4. Teste o upload e processamento de arquivos');

} catch (error) {
  console.error('❌ Erro ao atualizar dependências:', error.message);
  process.exit(1);
}
