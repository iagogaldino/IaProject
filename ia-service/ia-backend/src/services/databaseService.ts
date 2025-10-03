import mongoose, { Model, Document } from 'mongoose';
import { logger } from './logger';

export interface DatabaseQuery {
  collection: string;
  operation: 'find' | 'findOne' | 'count' | 'aggregate';
  query?: any;
  projection?: any;
  sort?: any;
  limit?: number;
  skip?: number;
  pipeline?: any[];
}

export interface DatabaseResult {
  success: boolean;
  data?: any;
  count?: number;
  error?: string;
  executionTime?: number;
}

export class DatabaseService {
  private connection: typeof mongoose;

  constructor() {
    this.connection = mongoose;
  }

  async executeQuery(agentId: string, query: DatabaseQuery, agentDatabaseAccess: any): Promise<DatabaseResult> {
    const startTime = Date.now();
    
    try {
      // Validate agent database access
      if (!agentDatabaseAccess?.enabled) {
        throw new Error('Agent does not have database access enabled');
      }

      // Check if collection is allowed
      if (!agentDatabaseAccess.allowedCollections.includes(query.collection)) {
        throw new Error(`Agent is not allowed to access collection: ${query.collection}`);
      }

      // Check if operation is allowed
      const allowedOps = agentDatabaseAccess.allowedOperations;
      if (query.operation === 'find' && !allowedOps.includes('read')) {
        throw new Error('Agent is not allowed to perform read operations');
      }

      // Apply query limits
      const maxResults = agentDatabaseAccess.queryLimits?.maxResults || 100;
      const timeout = agentDatabaseAccess.queryLimits?.timeout || 30000;

      if (query.limit && query.limit > maxResults) {
        query.limit = maxResults;
      }

      // Get the model/collection
      const model = this.getModel(query.collection);
      
      let result: any;
      
      // Execute the query based on operation
      switch (query.operation) {
        case 'find':
          result = await model.find(query.query || {}, query.projection)
            .sort(query.sort || {})
            .limit(query.limit || maxResults)
            .skip(query.skip || 0)
            .exec();
          break;
          
        case 'findOne':
          result = await model.findOne(query.query || {}, query.projection).exec();
          break;
          
        case 'count':
          result = await model.countDocuments(query.query || {}).exec();
          break;
          
        case 'aggregate':
          if (!query.pipeline) {
            throw new Error('Pipeline is required for aggregate operations');
          }
          result = await model.aggregate(query.pipeline).exec();
          break;
          
        default:
          throw new Error(`Unsupported operation: ${query.operation}`);
      }

      const executionTime = Date.now() - startTime;
      
      logger.info('Database query executed', {
        agentId,
        collection: query.collection,
        operation: query.operation,
        executionTime,
        resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0)
      });

      return {
        success: true,
        data: result,
        count: Array.isArray(result) ? result.length : (result ? 1 : 0),
        executionTime
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      logger.error('Database query failed', {
        agentId,
        collection: query.collection,
        operation: query.operation,
        error: error.message,
        executionTime
      });

      return {
        success: false,
        error: error.message,
        executionTime
      };
    }
  }

  private getModel(collectionName: string): any {
    // Get existing model or create a generic one
    if (mongoose.models[collectionName]) {
      return mongoose.models[collectionName];
    }

    // Create a generic model for the collection
    const schema = new mongoose.Schema({}, { strict: false });
    return mongoose.model(collectionName, schema);
  }

  async getCollectionInfo(collectionName: string): Promise<any> {
    try {
      const model = this.getModel(collectionName);
      
      // Get basic collection info
      const count = await model.countDocuments();
      const sample = await model.findOne();
      
      return {
        name: collectionName,
        count,
        hasData: count > 0,
        sampleDocument: sample
      };
    } catch (error: any) {
      logger.error('Error getting collection info', { collectionName, error: error.message });
      return {
        name: collectionName,
        count: 0,
        hasData: false,
        error: error.message
      };
    }
  }

  async listAvailableCollections(): Promise<string[]> {
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }

      const collections = await db.listCollections().toArray();
      return collections.map(col => col.name);
    } catch (error: any) {
      logger.error('Error listing collections', { error: error.message });
      return [];
    }
  }
}

export const databaseService = new DatabaseService();
