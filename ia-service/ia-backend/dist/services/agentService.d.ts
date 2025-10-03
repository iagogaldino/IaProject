import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types';
export declare class AgentService {
    createAgent(agentData: CreateAgentRequest): Promise<Agent>;
    getAllAgents(): Promise<Agent[]>;
    getAgentById(id: string): Promise<Agent | null>;
    updateAgent(id: string, agentData: UpdateAgentRequest): Promise<Agent | null>;
    updateAgentStatus(id: string, status: 'active' | 'inactive'): Promise<Agent | null>;
    deleteAgent(id: string): Promise<boolean>;
    getActiveAgents(): Promise<Agent[]>;
    getAgentsThatCanCommunicateWith(agentId: string): Promise<Agent[]>;
    getAgentByName(name: string): Promise<Agent | null>;
    findSpecialistAgent(query: string): Promise<Agent | null>;
    getAllActiveAgents(): Promise<Agent[]>;
    private mapMongooseAgentToAgent;
}
export declare const agentService: AgentService;
//# sourceMappingURL=agentService.d.ts.map