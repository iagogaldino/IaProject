/**
 * Script para verificar se o AI Backend está disponível
 */

const axios = require('axios');

const AI_BACKEND_URL = 'http://localhost:3001';
const MAX_RETRIES = 10;
const RETRY_DELAY = 2000; // 2 segundos

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Verifica se o AI Backend está disponível
 */
async function checkAIBackendHealth() {
  try {
    const response = await axios.get(`${AI_BACKEND_URL}/health`, {
      timeout: 5000
    });

    if (response.status === 200 && response.data.status === 'healthy') {
      log('✅ AI Backend está saudável e disponível', 'green');
      return true;
    } else {
      log('❌ AI Backend não está saudável', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ AI Backend não está disponível: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Aguarda o AI Backend ficar disponível
 */
async function waitForAIBackend() {
  log('🔍 Aguardando AI Backend ficar disponível...', 'blue');
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    log(`Tentativa ${i + 1}/${MAX_RETRIES}...`, 'yellow');
    
    const isHealthy = await checkAIBackendHealth();
    if (isHealthy) {
      return true;
    }

    if (i < MAX_RETRIES - 1) {
      log(`Aguardando ${RETRY_DELAY}ms antes da próxima tentativa...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  log('❌ AI Backend não ficou disponível após todas as tentativas', 'red');
  return false;
}

/**
 * Verifica se o AI Backend está disponível (função principal)
 */
async function main() {
  log('🔍 Verificando disponibilidade do AI Backend...', 'blue');
  
  const isAvailable = await waitForAIBackend();
  
  if (isAvailable) {
    log('✅ AI Backend está disponível. Main Backend pode ser iniciado.', 'green');
    process.exit(0);
  } else {
    log('❌ AI Backend não está disponível. Main Backend não pode ser iniciado.', 'red');
    process.exit(1);
  }
}

// Executar verificação
main().catch(error => {
  log(`💥 Erro durante verificação: ${error.message}`, 'red');
  process.exit(1);
});
