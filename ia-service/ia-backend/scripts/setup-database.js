const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up MongoDB database for IA Service...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/db-ia';
    console.log(`📋 Connecting to: ${mongoUri}`);
    
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
    };

    await mongoose.connect(mongoUri, options);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    
    console.log(`📊 Working with database: ${dbName}`);
    
    // Create collections with validation
    console.log('📝 Creating collections...');
    
    // Agents collection
    try {
      await db.createCollection('agents', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'type', 'status'],
            properties: {
              name: {
                bsonType: 'string',
                description: 'Agent name is required and must be a string'
              },
              description: {
                bsonType: 'string',
                description: 'Agent description must be a string'
              },
              type: {
                bsonType: 'string',
                enum: ['assistant', 'customer_service', 'technical_support', 'sales', 'other'],
                description: 'Agent type must be one of the enum values'
              },
              status: {
                bsonType: 'string',
                enum: ['active', 'inactive', 'maintenance'],
                description: 'Agent status must be one of the enum values'
              },
              configuration: {
                bsonType: 'object',
                properties: {
                  model: { bsonType: 'string' },
                  temperature: { bsonType: 'double', minimum: 0, maximum: 2 },
                  maxTokens: { bsonType: 'int', minimum: 1, maximum: 4000 }
                }
              },
              createdAt: {
                bsonType: 'date'
              },
              updatedAt: {
                bsonType: 'date'
              }
            }
          }
        }
      });
      console.log('✅ Agents collection created with validation');
    } catch (error) {
      if (error.code === 48) {
        console.log('ℹ️  Agents collection already exists');
      } else {
        throw error;
      }
    }
    
    // Messages collection
    try {
      await db.createCollection('messages', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['content', 'type', 'timestamp'],
            properties: {
              content: {
                bsonType: 'string',
                description: 'Message content is required and must be a string'
              },
              type: {
                bsonType: 'string',
                enum: ['user', 'agent', 'system'],
                description: 'Message type must be one of the enum values'
              },
              agentId: {
                bsonType: 'objectId',
                description: 'Agent ID must be a valid ObjectId'
              },
              userId: {
                bsonType: 'string',
                description: 'User ID must be a string'
              },
              context: {
                bsonType: 'string',
                description: 'Context must be a string'
              },
              timestamp: {
                bsonType: 'date',
                description: 'Timestamp is required and must be a date'
              },
              metadata: {
                bsonType: 'object',
                description: 'Metadata must be an object'
              }
            }
          }
        }
      });
      console.log('✅ Messages collection created with validation');
    } catch (error) {
      if (error.code === 48) {
        console.log('ℹ️  Messages collection already exists');
      } else {
        throw error;
      }
    }
    
    // Create indexes for better performance
    console.log('📈 Creating indexes...');
    
    // Agents indexes
    try {
      await db.collection('agents').createIndex({ name: 1 }, { unique: true });
      await db.collection('agents').createIndex({ status: 1 });
      await db.collection('agents').createIndex({ type: 1 });
      await db.collection('agents').createIndex({ createdAt: 1 });
      console.log('✅ Agents indexes created');
    } catch (error) {
      console.log('ℹ️  Agents indexes may already exist');
    }
    
    // Messages indexes
    try {
      await db.collection('messages').createIndex({ agentId: 1 });
      await db.collection('messages').createIndex({ userId: 1 });
      await db.collection('messages').createIndex({ timestamp: 1 });
      await db.collection('messages').createIndex({ type: 1 });
      console.log('✅ Messages indexes created');
    } catch (error) {
      console.log('ℹ️  Messages indexes may already exist');
    }
    
    // Insert sample data
    console.log('🌱 Inserting sample data...');
    
    // Sample agents
    const sampleAgents = [
      {
        name: 'Assistant Bot',
        description: 'General purpose assistant for various tasks',
        type: 'assistant',
        status: 'active',
        configuration: {
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 2000
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Customer Support',
        description: 'Specialized in customer service and support',
        type: 'customer_service',
        status: 'active',
        configuration: {
          model: 'gpt-3.5-turbo',
          temperature: 0.3,
          maxTokens: 1500
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    try {
      const agentsResult = await db.collection('agents').insertMany(sampleAgents);
      console.log(`✅ Inserted ${agentsResult.insertedCount} sample agents`);
    } catch (error) {
      if (error.code === 11000) {
        console.log('ℹ️  Sample agents may already exist');
      } else {
        throw error;
      }
    }
    
    // Get database stats
    const stats = await db.stats();
    console.log('📊 Database Statistics:');
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Start your application: npm run dev');
    console.log('   2. Test the API endpoints with the Postman collection');
    console.log('   3. Check health status: GET /health');
    
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Tip: Make sure MongoDB is running on your system');
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

// Run the setup
setupDatabase();
