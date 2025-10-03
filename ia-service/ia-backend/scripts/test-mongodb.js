const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/ai_backend';

async function testMongoDB() {
  console.log('🧪 Testing MongoDB Connection...\n');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log(`URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB connected successfully!');

    // Test basic operations
    console.log('\n📊 Testing basic operations...');

    // Create test collection
    const TestSchema = new mongoose.Schema({
      name: String,
      test: Boolean,
      createdAt: { type: Date, default: Date.now }
    });

    const TestModel = mongoose.model('Test', TestSchema);

    // Insert test document
    const testDoc = new TestModel({
      name: 'test-document',
      test: true
    });

    const savedDoc = await testDoc.save();
    console.log('✅ Document created:', savedDoc._id);

    // Find test document
    const foundDoc = await TestModel.findById(savedDoc._id);
    console.log('✅ Document found:', foundDoc.name);

    // Update test document
    await TestModel.findByIdAndUpdate(savedDoc._id, { test: false });
    console.log('✅ Document updated');

    // Delete test document
    await TestModel.findByIdAndDelete(savedDoc._id);
    console.log('✅ Document deleted');

    // Test indexes
    console.log('\n📈 Testing indexes...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Available collections:', collections.map(c => c.name));

    // Test connection info
    console.log('\n🔍 Connection Information:');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port);
    console.log('   Database:', mongoose.connection.name);
    console.log('   Ready State:', mongoose.connection.readyState);

    console.log('\n🎉 MongoDB test completed successfully!');
    console.log('   All operations working correctly.');

  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB connection refused. Make sure MongoDB is running:');
      console.log('   - Windows: Start MongoDB service or run mongod');
      console.log('   - Linux/Mac: sudo systemctl start mongod or mongod');
      console.log('   - Docker: docker run -d -p 27017:27017 mongo');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication failed. Check your MongoDB credentials.');
    }
    
    if (error.message.includes('timeout')) {
      console.log('\n💡 Connection timeout. Check if MongoDB is accessible.');
    }

    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔒 MongoDB connection closed.');
  }
}

// Run test
testMongoDB();
