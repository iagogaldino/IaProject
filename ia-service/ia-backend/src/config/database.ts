import mongoose from 'mongoose';
import { config } from './config';
import { logger } from '../services/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    const mongoUri = config.database.url;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined. Please check your environment variables.');
    }
    
    // Connection options to prevent timeout
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
    };
    await mongoose.connect(mongoUri, options);
    
    console.log('✅ Connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};

class Database {
  async initialize(): Promise<void> {
    try {
      await connectDatabase();
      logger.info('MongoDB database initialized successfully');
    } catch (error) {
      logger.error('MongoDB initialization failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    return mongoose.connection.readyState === 1;
  }

  async getConnectionInfo(): Promise<any> {
    const connection = mongoose.connection;
    return {
      host: connection.host,
      port: connection.port,
      name: connection.name,
      readyState: connection.readyState,
      models: Object.keys(connection.models)
    };
  }
}

export const database = new Database();
