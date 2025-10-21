/**
 * Script para verificar se o agente de banco de dados está configurado
 * para se comunicar com o novo agente de melhoria de respostas
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'ia-service';

async function checkAgentCommunication() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');
    
    const db = client.db(DB_NAME);
    const agentsCollection = db.collection('agents');
    
    // Buscar todos os agentes
    const agents = await agentsCollection.find({}).toArray();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 Total de agentes encontrados: ${agents.length}\n`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Identificar agentes relevantes
    let databaseAgent = null;
    let responseImproverAgent = null;
    
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. 🤖 ${agent.name}`);
      console.log(`   ID: ${agent._id}`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Descrição: ${agent.description.substring(0, 100)}...`);
      
      // Database Access
      if (agent.databaseAccess?.enabled) {
        console.log(`   ✅ Tem acesso a DATABASE`);
        console.log(`      Collections: ${agent.databaseAccess.allowedCollections.join(', ')}`);
      }
      
      // File Access
      if (agent.fileAccess?.enabled) {
        console.log(`   ✅ Tem acesso a ARQUIVOS`);
      }
      
      // Communication
      if (agent.canCommunicateWith && agent.canCommunicateWith.length > 0) {
        console.log(`   📞 Pode comunicar com ${agent.canCommunicateWith.length} agente(s):`);
        agent.canCommunicateWith.forEach(id => {
          console.log(`      - ${id}`);
        });
      } else {
        console.log(`   📞 Pode comunicar com: TODOS os agentes (sem restrição)`);
      }
      
      console.log('');
      
      // Identificar agentes específicos
      if (agent.databaseAccess?.enabled && 
          (agent.name.toLowerCase().includes('database') || 
           agent.name.toLowerCase().includes('banco'))) {
        databaseAgent = agent;
      }
      
      if (agent.name.toLowerCase().includes('melhorar') || 
          agent.name.toLowerCase().includes('melhoria') ||
          agent.name.toLowerCase().includes('resposta') ||
          agent.name.toLowerCase().includes('response')) {
        responseImproverAgent = agent;
      }
    });
    
    // Análise específica
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 ANÁLISE DE COOPERAÇÃO\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (databaseAgent) {
      console.log(`✅ Agente de Banco de Dados identificado:`);
      console.log(`   Nome: ${databaseAgent.name}`);
      console.log(`   ID: ${databaseAgent._id}\n`);
    } else {
      console.log(`⚠️  Agente de Banco de Dados NÃO identificado\n`);
    }
    
    if (responseImproverAgent) {
      console.log(`✅ Agente de Melhoria de Resposta identificado:`);
      console.log(`   Nome: ${responseImproverAgent.name}`);
      console.log(`   ID: ${responseImproverAgent._id}\n`);
    } else {
      console.log(`⚠️  Agente de Melhoria de Resposta NÃO identificado\n`);
    }
    
    // Verificar se Database Agent pode chamar Response Improver
    if (databaseAgent && responseImproverAgent) {
      console.log('───────────────────────────────────────────────────────');
      console.log('🔗 VERIFICAÇÃO DE COMUNICAÇÃO:\n');
      
      const canCommunicate = 
        !databaseAgent.canCommunicateWith || 
        databaseAgent.canCommunicateWith.length === 0 ||
        databaseAgent.canCommunicateWith.includes(responseImproverAgent._id.toString());
      
      if (canCommunicate) {
        console.log(`✅ O agente "${databaseAgent.name}" PODE se comunicar com "${responseImproverAgent.name}"`);
        
        if (!databaseAgent.canCommunicateWith || databaseAgent.canCommunicateWith.length === 0) {
          console.log(`   Motivo: Sem restrições (pode comunicar com todos)\n`);
        } else {
          console.log(`   Motivo: ID está na lista canCommunicateWith\n`);
        }
      } else {
        console.log(`❌ O agente "${databaseAgent.name}" NÃO PODE se comunicar com "${responseImproverAgent.name}"`);
        console.log(`   Motivo: ID não está na lista canCommunicateWith\n`);
        console.log(`   📝 SOLUÇÃO: Adicione o ID "${responseImproverAgent._id}" na lista canCommunicateWith do Database Agent\n`);
      }
    } else {
      console.log('⚠️  Não foi possível verificar a comunicação (um dos agentes não foi encontrado)\n');
    }
    
    // Verificar lógica de quando Database Agent delega
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧠 LÓGICA DE DELEGAÇÃO (chatService.ts):\n');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('O Database Agent delega para outro agente quando:\n');
    console.log('1. Ele retorna dados do banco de dados');
    console.log('2. O sistema detecta que precisa de processamento adicional');
    console.log('3. Há um agente especialista disponível para formatar\n');
    console.log('⚠️  PROBLEMA ATUAL: Database Agent processa E formata localmente');
    console.log('   (linhas 75-79 do chatService.ts: queryDatabase é executado localmente)\n');
    console.log('💡 SOLUÇÃO: Modificar para que Database Agent retorne dados BRUTOS');
    console.log('   e delegue a formatação para o agente de melhoria\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

checkAgentCommunication();

