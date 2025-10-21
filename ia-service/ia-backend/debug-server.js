#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🐛 Iniciando servidor em modo debug...\n');

// Configurações de debug
const debugConfig = {
    port: 9229,
    host: '127.0.0.1'
};

// Argumentos para o ts-node com debug
const args = [
    '--inspect=' + debugConfig.port,
    '-r',
    'ts-node/register',
    '--require',
    'tsconfig-paths/register',
    'src/index.ts'
];

// Variáveis de ambiente para debug
const env = {
    ...process.env,
    NODE_ENV: 'development',
    TS_NODE_PROJECT: path.join(__dirname, 'tsconfig.debug.json'),
    TS_NODE_SOURCE_MAPS: 'true',
    TS_NODE_TRANSPILE_ONLY: 'false',
    TS_NODE_FILES: 'true'
};

console.log('📋 Configuração de Debug:');
console.log(`   Porta: ${debugConfig.port}`);
console.log(`   Host: ${debugConfig.host}`);
console.log(`   TSConfig: ${env.TS_NODE_PROJECT}`);
console.log(`   Source Maps: ${env.TS_NODE_SOURCE_MAPS}`);
console.log('');

// Iniciar o processo
const child = spawn('node', args, {
    cwd: __dirname,
    env: env,
    stdio: 'inherit'
});

console.log('🚀 Servidor iniciado em modo debug!');
console.log(`🔗 Conecte o debugger em: chrome://inspect`);
console.log(`📡 Ou use VS Code com a configuração de debug`);
console.log('');

// Handle process events
child.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
});

child.on('close', (code) => {
    console.log(`\n🛑 Servidor finalizado com código ${code}`);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Finalizando servidor...');
    child.kill('SIGINT');
    process.exit(0);
});
