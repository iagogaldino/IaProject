const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

function checkEnvFile() {
  console.log('🔍 Checking .env file configuration...\n');

  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('💡 Creating .env from env.example...');
    
    const envExamplePath = path.join(__dirname, '..', 'env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created from env.example');
    } else {
      console.log('❌ env.example not found either!');
      return false;
    }
  }

  // Read and check .env content
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('📋 Current .env configuration:');
  
  let hasIssues = false;
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=');
      
      if (key && value) {
        console.log(`   ${key}=${value}`);
        
        // Check for common issues
        if ((key === 'MONGODB_URI' || key === 'DATABASE_URL') && value && !value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
          console.log(`   ⚠️  ${key} should start with mongodb:// or mongodb+srv://`);
          hasIssues = true;
        }
        
        if (key === 'OPENAI_API_KEY' && value.includes('your-openai-api-key')) {
          console.log(`   ⚠️  ${key} needs to be set to your actual OpenAI API key`);
          hasIssues = true;
        }
        
        if (key === 'API_KEY' && value.includes('your-secure-api-key')) {
          console.log(`   ⚠️  ${key} needs to be set to a secure API key`);
          hasIssues = true;
        }
      }
    }
  });
  
  console.log('');
  
  if (hasIssues) {
    console.log('⚠️  Issues found in .env file:');
    console.log('   1. Make sure MONGODB_URI or DATABASE_URL starts with mongodb://');
    console.log('   2. Set your actual OPENAI_API_KEY');
    console.log('   3. Set a secure API_KEY');
    console.log('');
    console.log('💡 Example of correct configuration:');
    console.log('   MONGODB_URI=mongodb://localhost:27017/ai_backend');
    console.log('   OPENAI_API_KEY=sk-proj-your-actual-openai-key');
    console.log('   API_KEY=your-secure-random-api-key');
    return false;
  } else {
    console.log('✅ .env file looks good!');
    return true;
  }
}

// Run check
const isValid = checkEnvFile();

if (!isValid) {
  console.log('\n🔧 Please fix the issues above and try again.');
  process.exit(1);
} else {
  console.log('\n🚀 Configuration is ready!');
  process.exit(0);
}
