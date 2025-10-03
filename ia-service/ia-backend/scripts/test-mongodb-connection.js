const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const testMongoConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📋 Configuration:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || '27017'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'db-ia'}`);
    console.log(`   MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/db-ia'}`);
    console.log('');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/db-ia';
    
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
    };

    console.log('🔄 Attempting to connect...');
    await mongoose.connect(mongoUri, options);
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get connection info
    const connection = mongoose.connection;
    console.log('📊 Connection Details:');
    console.log(`   Host: ${connection.host}`);
    console.log(`   Port: ${connection.port}`);
    console.log(`   Database: ${connection.name}`);
    console.log(`   Ready State: ${connection.readyState} (1 = connected)`);
    
    // Test database operations
    console.log('🧪 Testing database operations...');
    
    // Create a test collection and document
    const testCollection = connection.db.collection('connection_test');
    const testDoc = {
      message: 'Connection test successful',
      timestamp: new Date(),
      testId: Math.random().toString(36).substr(2, 9)
    };
    
    // Insert test document
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ Test document inserted with ID: ${insertResult.insertedId}`);
    
    // Find test document
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`✅ Test document retrieved: ${foundDoc.message}`);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Test document cleaned up');
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Tip: Make sure MongoDB is running on your system');
      console.error('   - Windows: Start MongoDB service or run mongod');
      console.error('   - macOS: brew services start mongodb-community');
      console.error('   - Linux: sudo systemctl start mongod');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 Tip: Check if the host address is correct');
    } else if (error.code === 'MongoServerError') {
      console.error('💡 Tip: Check if the database name is valid');
    }
    
    process.exit(1);
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Connection closed');
    }
  }
};

// Run the test
testMongoConnection();
