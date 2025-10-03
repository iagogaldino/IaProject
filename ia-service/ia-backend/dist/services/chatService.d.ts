import { ChatRequest, ChatResponse } from '../types';
export declare class ChatService {
    processAgentChat(agentId: string, chatRequest: ChatRequest): Promise<ChatResponse>;
    processAIRequest(request: any): Promise<any>;
    private createSystemPrompt;
    private shouldConsultSpecialists;
    private consultSpecialistAgents;
    private shouldQueryDatabase;
    private shouldProcessFiles;
    private processFiles;
    private queryDatabase;
}
export declare const chatService: ChatService;
//# sourceMappingURL=chatService.d.ts.map