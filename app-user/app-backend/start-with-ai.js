/**
 * Script para iniciar o backend principal junto com o AI Backend
 */

const { spawn } = require('child_process');
const path = require('path');

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

// Configurações dos backends
const BACKENDS = [
  {
    name: 'AI Backend',
    path: path.join(__dirname, '..', 'ai-backend'),
    command: 'npm',
    args: ['run', 'dev'],
    port: 3001,
    color: 'cyan',
    startDelay: 0
  },
  {
    name: 'Main Backend',
    path: __dirname,
    command: 'npm',
    args: ['run', 'dev'],
    port: 3000,
    color: 'blue',
    startDelay: 3000 // Aguardar 3 segundos após o AI Backend
  }
];

const processes = [];

// Função para iniciar um backend
function startBackend(backend) {
  return new Promise((resolve, reject) => {
    log(`\n🚀 Iniciando ${backend.name}...`, backend.color);
    
    const process = spawn(backend.command, backend.args, {
      cwd: backend.path,
      stdio: 'pipe',
      shell: true
    });

    process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        log(`[${backend.name}] ${output}`, backend.color);
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        log(`[${backend.name}] ${output}`, 'red');
      }
    });

    process.on('close', (code) => {
      if (code !== 0) {
        log(`❌ ${backend.name} encerrado com código ${code}`, 'red');
        reject(new Error(`${backend.name} failed with code ${code}`));
      } else {
        log(`✅ ${backend.name} encerrado normalmente`, 'green');
        resolve();
      }
    });

    process.on('error', (error) => {
      log(`❌ Erro ao iniciar ${backend.name}: ${error.message}`, 'red');
      reject(error);
    });

    // Aguardar um pouco para verificar se o processo iniciou corretamente
    setTimeout(() => {
      if (process.killed) {
        reject(new Error(`${backend.name} failed to start`));
      } else {
        log(`✅ ${backend.name} iniciado com sucesso na porta ${backend.port}`, 'green');
        resolve(process);
      }
    }, 2000);

    processes.push(process);
  });
}

// Função para parar todos os processos
function stopAllProcesses() {
  log('\n🛑 Parando todos os backends...', 'yellow');
  
  processes.forEach((process, index) => {
    if (process && !process.killed) {
      log(`Parando ${BACKENDS[index].name}...`, 'yellow');
      process.kill('SIGTERM');
    }
  });

  setTimeout(() => {
    processes.forEach((process, index) => {
      if (process && !process.killed) {
        log(`Forçando parada do ${BACKENDS[index].name}...`, 'red');
        process.kill('SIGKILL');
      }
    });
    process.exit(0);
  }, 5000);
}

// Função principal para iniciar todos os backends
async function startAllBackends() {
  log('🚀 Iniciando Sistema Completo de Backends', 'blue');
  log('==========================================', 'blue');

  try {
    // Iniciar AI Backend primeiro
    log('\n📡 Iniciando AI Backend...', 'cyan');
    await startBackend(BACKENDS[0]);

    // Aguardar um pouco para o AI Backend estabilizar
    log('\n⏳ Aguardando AI Backend estabilizar...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Iniciar Main Backend
    log('\n🏠 Iniciando Main Backend...', 'blue');
    await startBackend(BACKENDS[1]);

    // Aguardar um pouco para ambos estabilizarem
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mostrar status final
    log('\n📊 Status dos Backends:', 'blue');
    log('======================', 'blue');
    
    processes.forEach((process, index) => {
      const backend = BACKENDS[index];
      if (process && !process.killed) {
        log(`✅ ${backend.name} rodando na porta ${backend.port}`, 'green');
      } else {
        log(`❌ ${backend.name} falhou ao iniciar`, 'red');
      }
    });

    log('\n🌐 URLs dos Backends:', 'blue');
    log('=====================', 'blue');
    log('Main Backend: http://localhost:3000', 'blue');
    log('AI Backend: http://localhost:3001', 'cyan');
    log('AI Backend Health: http://localhost:3001/health', 'cyan');
    log('AI Backend Docs: http://localhost:3001/api/docs', 'cyan');

    log('\n📝 Para testar a integração:', 'yellow');
    log('node ../ai-backend/test-integration.js', 'yellow');

    log('\n⏹️ Pressione Ctrl+C para parar todos os backends', 'yellow');

  } catch (error) {
    log(`\n💥 Erro ao iniciar backends: ${error.message}`, 'red');
    stopAllProcesses();
  }
}

// Tratamento de sinais para parada limpa
process.on('SIGINT', stopAllProcesses);
process.on('SIGTERM', stopAllProcesses);

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  log(`💥 Erro não capturado: ${error.message}`, 'red');
  stopAllProcesses();
});

process.on('unhandledRejection', (reason, promise) => {
  log(`💥 Promise rejeitada: ${reason}`, 'red');
  stopAllProcesses();
});

// Iniciar todos os backends
startAllBackends();
