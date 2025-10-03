import { Message, CreateMessageRequest } from '../types';
export declare class CommunicationService {
    createMessage(messageData: CreateMessageRequest): Promise<Message>;
    getMessagesByAgent(agentId: string, limit?: number, offset?: number): Promise<Message[]>;
    getMessagesBetweenAgents(agentId1: string, agentId2: string, limit?: number): Promise<Message[]>;
    getUnreadMessages(agentId: string): Promise<Message[]>;
    getMessageCount(agentId: string): Promise<number>;
    deleteMessage(messageId: string): Promise<boolean>;
    getCommunicationStats(): Promise<{
        totalMessages: number;
        messagesByAgent: Record<string, number>;
        recentActivity: number;
    }>;
    private verifyAgentsCanCommunicate;
    private mapMongooseMessageToMessage;
}
export declare const communicationService: CommunicationService;
//# sourceMappingURL=communicationService.d.ts.map