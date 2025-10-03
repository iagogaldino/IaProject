const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'your-secure-api-key-here'; // Use the same key from your .env file

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

async function testEndpoints() {
  console.log('🧪 Testing AI Backend Endpoints...\n');

  try {
    // 1. Test Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    console.log('   Services:', Object.keys(healthResponse.data.services).map(service => 
      `${service}: ${healthResponse.data.services[service] ? '✅' : '❌'}`
    ).join(', '));
    console.log('');

    // 2. Create Test Agent
    console.log('2. Creating Test Agent...');
    const agentData = {
      name: 'test_agent',
      description: 'Agent de teste para validação do sistema',
      status: 'active',
      canCommunicateWith: []
    };

    const createResponse = await axios.post(`${BASE_URL}/api/agents`, agentData, { headers });
    const agentId = createResponse.data.data.id;
    console.log('✅ Agent Created:', agentId);
    console.log('   Name:', createResponse.data.data.name);
    console.log('   Status:', createResponse.data.data.status);
    console.log('');

    // 3. Get All Agents
    console.log('3. Fetching All Agents...');
    const agentsResponse = await axios.get(`${BASE_URL}/api/agents`, { headers });
    console.log('✅ Agents Retrieved:', agentsResponse.data.data.length);
    console.log('');

    // 4. Get Agent by ID
    console.log('4. Fetching Agent by ID...');
    const agentResponse = await axios.get(`${BASE_URL}/api/agents/${agentId}`, { headers });
    console.log('✅ Agent Retrieved:', agentResponse.data.data.name);
    console.log('');

    // 5. Update Agent
    console.log('5. Updating Agent...');
    const updateData = {
      description: 'Agent de teste atualizado',
      canCommunicateWith: ['1', '2']
    };
    const updateResponse = await axios.put(`${BASE_URL}/api/agents/${agentId}`, updateData, { headers });
    console.log('✅ Agent Updated:', updateResponse.data.data.description);
    console.log('');

    // 6. Test Agent Chat
    console.log('6. Testing Agent Chat...');
    const chatData = {
      messages: [
        { role: 'user', content: 'Olá, você pode me ajudar?' },
        { role: 'agent', content: 'Claro! Como posso ajudar você hoje?' },
        { role: 'user', content: 'Me conte sobre o sistema de agentes' }
      ]
    };
    
    try {
      const chatResponse = await axios.post(`${BASE_URL}/api/agents/${agentId}/chat`, chatData, { headers });
      console.log('✅ Agent Chat:', chatResponse.data.data.response.content.substring(0, 100) + '...');
    } catch (chatError) {
      console.log('⚠️  Agent Chat Error (expected if OpenAI API key not configured):', chatError.response?.data?.error?.message || chatError.message);
    }
    console.log('');

    // 7. Test AI Process Endpoint
    console.log('7. Testing AI Process Endpoint...');
    const aiProcessData = {
      prompt: 'Olá, como você está?',
      userId: 'test-user',
      sessionId: 'test-session'
    };
    
    try {
      const aiResponse = await axios.post(`${BASE_URL}/api/ai/process`, aiProcessData);
      console.log('✅ AI Process:', aiResponse.data.data.substring(0, 100) + '...');
    } catch (aiError) {
      console.log('⚠️  AI Process Error (expected if OpenAI API key not configured):', aiError.response?.data?.error?.message || aiError.message);
    }
    console.log('');

    // 8. Update Agent Status
    console.log('8. Updating Agent Status...');
    const statusData = { status: 'inactive' };
    const statusResponse = await axios.patch(`${BASE_URL}/api/agents/${agentId}/status`, statusData, { headers });
    console.log('✅ Agent Status Updated:', statusResponse.data.data.status);
    console.log('');

    // 9. Get Communication Stats
    console.log('9. Testing Communication Stats...');
    const statsResponse = await axios.get(`${BASE_URL}/api/agents/communication/stats`, { headers });
    console.log('✅ Communication Stats:', statsResponse.data.data.totalMessages, 'total messages');
    console.log('');

    // 10. Delete Test Agent
    console.log('10. Deleting Test Agent...');
    await axios.delete(`${BASE_URL}/api/agents/${agentId}`, { headers });
    console.log('✅ Agent Deleted');
    console.log('');

    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure to set the correct API_KEY in the script and in your .env file');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure the server is running on port 3001');
      console.log('   Run: npm run dev');
    }
    
    if (error.message.includes('MongoDB')) {
      console.log('\n💡 Tip: Make sure MongoDB is running');
      console.log('   Run: mongod (or start MongoDB service)');
    }
  }
}

// Run tests
testEndpoints();
