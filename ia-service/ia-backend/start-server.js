const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando servidor AI Backend...\n');

function killProcessOnPort(port) {
  try {
    console.log(`🔍 Verificando porta ${port}...`);
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    
    if (result.trim()) {
      console.log(`⚠️  Porta ${port} está em uso. Parando processo...`);
      const lines = result.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        }
      });
      
      pids.forEach(pid => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
          console.log(`✅ Processo ${pid} finalizado`);
        } catch (error) {
          console.log(`⚠️  Não foi possível finalizar processo ${pid}`);
        }
      });
      
      // Wait a moment for the port to be released
      console.log('⏳ Aguardando liberação da porta...');
      setTimeout(() => {
        startServer();
      }, 2000);
    } else {
      console.log(`✅ Porta ${port} está livre`);
      startServer();
    }
  } catch (error) {
    console.log(`✅ Porta ${port} está livre`);
    startServer();
  }
}

function startServer() {
  try {
    console.log('\n🎯 Iniciando servidor...');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  Arquivo .env não encontrado. Copiando do exemplo...');
      const envExamplePath = path.join(__dirname, 'env.example');
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Arquivo .env criado a partir do exemplo');
        console.log('📝 Configure as variáveis de ambiente no arquivo .env');
      }
    }
    
    // Start the server
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    server.on('error', (error) => {
      console.error('❌ Erro ao iniciar servidor:', error);
    });
    
    server.on('close', (code) => {
      console.log(`\n🛑 Servidor finalizado com código ${code}`);
    });
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Finalizando servidor...');
      server.kill('SIGINT');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Start the process
killProcessOnPort(3001);
