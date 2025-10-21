import { ChatRequest, ChatResponse } from '../types';
interface CooperationTrace {
    sessionId: string;
    initiatedBy: string;
    query: string;
    chain: {
        agentId: string;
        agentName: string;
        action: 'received' | 'processing' | 'delegated' | 'responded';
        timestamp: Date;
        details?: string;
    }[];
    finalResponse?: string;
    totalDuration?: number;
}
export declare class ChatService {
    private agentCache;
    private CACHE_TTL;
    private callStack;
    private cooperationTrace;
    private traceSessionId;
    processAgentChat(agentId: string, chatRequest: ChatRequest): Promise<ChatResponse>;
    processAIRequest(request: any): Promise<any>;
    private createSystemPrompt;
    private tryAgentCooperation;
    private getAgentsAllowedToCommunicate;
    private selectBestAgentWithAI;
    private consultSpecialistAgent;
    private shouldQueryDatabase;
    private shouldProcessFiles;
    private processFiles;
    private queryMetadataWithEmbeddings;
    private queryDatabase;
    private filterRelevantRecords;
    private extractKeywords;
    private calculateRelevanceScore;
    private initializeTrace;
    private addToTrace;
    private finalizeTrace;
    private logCooperationTrace;
    private buildTraceVisualization;
    private getActionEmoji;
    getCurrentTrace(): CooperationTrace | null;
}
export declare const chatService: ChatService;
export {};
//# sourceMappingURL=chatService.d.ts.map