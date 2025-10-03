import { Agent as AgentModel, IAgent } from '../models/Agent';
import { logger } from './logger';
import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types';

export class AgentService {
  async createAgent(agentData: CreateAgentRequest): Promise<Agent> {
    try {
      const agent = new AgentModel({
        name: agentData.name,
        description: agentData.description,
        status: agentData.status || 'inactive',
        canCommunicateWith: agentData.canCommunicateWith || [],
        databaseAccess: agentData.databaseAccess ? {
          enabled: agentData.databaseAccess.enabled,
          allowedCollections: agentData.databaseAccess.allowedCollections || [],
          allowedOperations: agentData.databaseAccess.allowedOperations || ['read'],
          queryLimits: {
            maxResults: agentData.databaseAccess.queryLimits?.maxResults || 100,
            timeout: agentData.databaseAccess.queryLimits?.timeout || 30000
          }
        } : {
          enabled: false,
          allowedCollections: [],
          allowedOperations: ['read'],
          queryLimits: {
            maxResults: 100,
            timeout: 30000
          }
        },
        fileAccess: agentData.fileAccess ? {
          enabled: agentData.fileAccess.enabled,
          allowedFileTypes: agentData.fileAccess.allowedFileTypes || ['txt', 'pdf', 'doc', 'docx'],
          maxFileSize: agentData.fileAccess.maxFileSize || 10485760,
          allowedOperations: agentData.fileAccess.allowedOperations || ['read'],
          storagePath: agentData.fileAccess.storagePath || 'uploads'
        } : {
          enabled: false,
          allowedFileTypes: ['txt', 'pdf', 'doc', 'docx'],
          maxFileSize: 10485760,
          allowedOperations: ['read'],
          storagePath: 'uploads'
        }
      });

      const savedAgent = await agent.save();
      return this.mapMongooseAgentToAgent(savedAgent);
    } catch (error: any) {
      if (error.code === 11000) { // MongoDB duplicate key error
        throw new Error(`Agent with name '${agentData.name}' already exists`);
      }
      logger.error('Error creating agent:', error);
      throw error;
    }
  }

  async getAllAgents(): Promise<Agent[]> {
    try {
      const agents = await AgentModel.find()
        .sort({ createdAt: -1 })
        .exec();

      return agents.map((agent: IAgent) => this.mapMongooseAgentToAgent(agent));
    } catch (error: any) {
      logger.error('Error fetching agents:', error);
      throw error;
    }
  }

  async getAgentById(id: string): Promise<Agent | null> {
    try {
      // Check if id is a valid ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
      }

      const agent = await AgentModel.findById(id).exec();
      return agent ? this.mapMongooseAgentToAgent(agent) : null;
    } catch (error: any) {
      logger.error('Error fetching agent by ID:', error);
      throw error;
    }
  }

  async updateAgent(id: string, agentData: UpdateAgentRequest): Promise<Agent | null> {
    try {
      // Check if id is a valid ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
      }

      const updateData: any = {};
      
      if (agentData.name !== undefined) {
        updateData.name = agentData.name;
      }
      if (agentData.description !== undefined) {
        updateData.description = agentData.description;
      }
      if (agentData.status !== undefined) {
        updateData.status = agentData.status;
      }
      if (agentData.canCommunicateWith !== undefined) {
        updateData.canCommunicateWith = agentData.canCommunicateWith;
      }
      if (agentData.databaseAccess !== undefined) {
        updateData.databaseAccess = agentData.databaseAccess;
      }
      if (agentData.fileAccess !== undefined) {
        updateData.fileAccess = agentData.fileAccess;
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields to update');
      }

      const agent = await AgentModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).exec();

      return agent ? this.mapMongooseAgentToAgent(agent) : null;
    } catch (error: any) {
      if (error.code === 11000) { // MongoDB duplicate key error
        throw new Error(`Agent with name '${agentData.name}' already exists`);
      }
      logger.error('Error updating agent:', error);
      throw error;
    }
  }

  async updateAgentStatus(id: string, status: 'active' | 'inactive'): Promise<Agent | null> {
    try {
      // Check if id is a valid ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
      }

      const agent = await AgentModel.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).exec();

      return agent ? this.mapMongooseAgentToAgent(agent) : null;
    } catch (error: any) {
      logger.error('Error updating agent status:', error);
      throw error;
    }
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      // Check if id is a valid ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return false;
      }

      const result = await AgentModel.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error: any) {
      logger.error('Error deleting agent:', error);
      throw error;
    }
  }

  async getActiveAgents(): Promise<Agent[]> {
    try {
      const agents = await AgentModel.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .exec();

      return agents.map((agent: IAgent) => this.mapMongooseAgentToAgent(agent));
    } catch (error: any) {
      logger.error('Error fetching active agents:', error);
      throw error;
    }
  }

  async getAgentsThatCanCommunicateWith(agentId: string): Promise<Agent[]> {
    try {
      // Check if id is a valid ObjectId
      if (!agentId.match(/^[0-9a-fA-F]{24}$/)) {
        return [];
      }

      const agents = await AgentModel.find({
        $or: [
          { canCommunicateWith: agentId },
          { _id: agentId }
        ]
      })
      .sort({ name: 1 })
      .exec();

      return agents.map((agent: IAgent) => this.mapMongooseAgentToAgent(agent));
    } catch (error: any) {
      logger.error('Error fetching agents that can communicate:', error);
      throw error;
    }
  }

  async getAgentByName(name: string): Promise<Agent | null> {
    try {
      const agent = await AgentModel.findOne({ name }).exec();
      return agent ? this.mapMongooseAgentToAgent(agent) : null;
    } catch (error: any) {
      logger.error('Error fetching agent by name:', error);
      throw error;
    }
  }

  async findSpecialistAgent(query: string): Promise<Agent | null> {
    try {
      // Buscar agentes ativos que podem ter informações relevantes
      const agents = await AgentModel.find({ 
        status: 'active',
        description: { $regex: query, $options: 'i' }
      }).exec();

      if (agents.length === 0) {
        return null;
      }

      // Retornar o primeiro agente que corresponde à consulta
      return this.mapMongooseAgentToAgent(agents[0]);
    } catch (error: any) {
      logger.error('Error finding specialist agent:', error);
      throw error;
    }
  }

  async getAllActiveAgents(): Promise<Agent[]> {
    try {
      const agents = await AgentModel.find({ status: 'active' })
        .sort({ name: 1 })
        .exec();

      return agents.map((agent: IAgent) => this.mapMongooseAgentToAgent(agent));
    } catch (error: any) {
      logger.error('Error fetching all active agents:', error);
      throw error;
    }
  }

  private mapMongooseAgentToAgent(mongooseAgent: IAgent): Agent {
    return {
      id: (mongooseAgent as any)._id.toString(),
      name: mongooseAgent.name,
      description: mongooseAgent.description,
      status: mongooseAgent.status,
      canCommunicateWith: mongooseAgent.canCommunicateWith,
      databaseAccess: mongooseAgent.databaseAccess,
      fileAccess: mongooseAgent.fileAccess,
      createdAt: (mongooseAgent as any).createdAt,
      updatedAt: (mongooseAgent as any).updatedAt
    };
  }
}

export const agentService = new AgentService();
