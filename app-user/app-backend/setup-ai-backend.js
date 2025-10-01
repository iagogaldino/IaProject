/**
 * Script para configurar o AI Backend automaticamente
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const AI_BACKEND_PATH = path.join(__dirname, '..', 'ai-backend');

/**
 * Verifica se o AI Backend existe
 */
function checkAIBackendExists() {
  return fs.existsSync(AI_BACKEND_PATH);
}

/**
 * Instala dependências do AI Backend
 */
function installAIBackendDependencies() {
  return new Promise((resolve, reject) => {
    log('📦 Instalando dependências do AI Backend...', 'cyan');
    
    const process = spawn('npm', ['install'], {
      cwd: AI_BACKEND_PATH,
      stdio: 'pipe',
      shell: true
    });

    process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        log(`[AI Backend] ${output}`, 'cyan');
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        log(`[AI Backend] ${output}`, 'red');
      }
    });

    process.on('close', (code) => {
      if (code === 0) {
        log('✅ Dependências do AI Backend instaladas com sucesso', 'green');
        resolve();
      } else {
        log(`❌ Erro ao instalar dependências do AI Backend (código ${code})`, 'red');
        reject(new Error(`npm install failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      log(`❌ Erro ao executar npm install: ${error.message}`, 'red');
      reject(error);
    });
  });
}

/**
 * Verifica se o arquivo .env do AI Backend existe
 */
function checkAIBackendEnv() {
  const envPath = path.join(AI_BACKEND_PATH, '.env');
  return fs.existsSync(envPath);
}

/**
 * Cria arquivo .env do AI Backend se não existir
 */
function createAIBackendEnv() {
  const envPath = path.join(AI_BACKEND_PATH, '.env');
  const envExamplePath = path.join(AI_BACKEND_PATH, 'env.example');
  
  if (fs.existsSync(envExamplePath)) {
    log('📝 Criando arquivo .env do AI Backend...', 'cyan');
    fs.copyFileSync(envExamplePath, envPath);
    log('✅ Arquivo .env criado. Configure as variáveis de ambiente.', 'green');
    log('⚠️  Lembre-se de configurar OPENAI_API_KEY e API_KEY no arquivo .env', 'yellow');
  } else {
    log('⚠️  Arquivo env.example não encontrado. Configure manualmente o .env', 'yellow');
  }
}

/**
 * Verifica se o AI Backend está configurado corretamente
 */
function checkAIBackendConfig() {
  const envPath = path.join(AI_BACKEND_PATH, '.env');
  
  if (!fs.existsSync(envPath)) {
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Verificar se as variáveis essenciais estão configuradas
  const hasOpenAIKey = envContent.includes('OPENAI_API_KEY=sk-proj-') && !envContent.includes('OPENAI_API_KEY=sk-proj-your-openai-api-key-here');
  const hasAPIKey = envContent.includes('API_KEY=') && !envContent.includes('API_KEY=your-api-key-for-external-access');
  
  return hasOpenAIKey && hasAPIKey;
}

/**
 * Função principal
 */
async function setupAIBackend() {
  log('🔧 Configurando AI Backend...', 'blue');
  log('==============================', 'blue');

  try {
    // Verificar se o AI Backend existe
    if (!checkAIBackendExists()) {
      log('❌ AI Backend não encontrado em ../ai-backend', 'red');
      log('💡 Execute o script de criação do AI Backend primeiro', 'yellow');
      process.exit(1);
    }

    log('✅ AI Backend encontrado', 'green');

    // Instalar dependências
    await installAIBackendDependencies();

    // Verificar/criar arquivo .env
    if (!checkAIBackendEnv()) {
      createAIBackendEnv();
    } else {
      log('✅ Arquivo .env do AI Backend já existe', 'green');
    }

    // Verificar configuração
    if (checkAIBackendConfig()) {
      log('✅ AI Backend está configurado corretamente', 'green');
    } else {
      log('⚠️  AI Backend precisa de configuração adicional', 'yellow');
      log('📝 Configure as seguintes variáveis no arquivo .env:', 'yellow');
      log('   - OPENAI_API_KEY=sk-proj-your-actual-api-key', 'yellow');
      log('   - API_KEY=your-actual-api-key', 'yellow');
    }

    log('\n🎉 Configuração do AI Backend concluída!', 'green');
    log('\n📝 Próximos passos:', 'blue');
    log('1. Configure as variáveis de ambiente no arquivo .env', 'blue');
    log('2. Execute: npm run dev:with-ai', 'blue');
    log('3. Teste a integração: node ../ai-backend/test-integration.js', 'blue');

  } catch (error) {
    log(`💥 Erro durante configuração: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Executar configuração
setupAIBackend();
