import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// Interfaces baseadas na API real
export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  canCommunicateWith: string[];
  databaseAccess?: {
    enabled: boolean;
    allowedCollections: string[];
    allowedOperations: string[];
    queryLimits: {
      maxResults: number;
      timeout: number;
    };
  };
  fileAccess?: {
    enabled: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
    allowedOperations: string[];
    storagePath: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentResponse {
  success: boolean;
  data: Agent;
}

export interface AgentsResponse {
  success: boolean;
  data: Agent[];
  meta: {
    total: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  data: {
    agentId: string;
    response: ChatMessage;
  };
}

export interface ConsultRequest {
  query: string;
}

export interface ConsultResponse {
  success: boolean;
  data: {
    specialistAgent: {
      id: string;
      name: string;
      description: string;
    };
    response: ChatMessage;
  };
}

export interface CommunicationRequest {
  toAgentId: string;
  content: string;
}

export interface CommunicationResponse {
  success: boolean;
  data: {
    id: string;
    fromAgentId: string;
    toAgentId: string;
    content: string;
    createdAt: string;
  };
}

export interface Message {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  createdAt: string;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  meta: {
    total: number;
    limit: number;
    page: number;
  };
}

export interface CommunicationStats {
  totalMessages: number;
  activeConversations: number;
  agentsWithMessages: number;
  averageResponseTime: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    openai: boolean;
    apiKey: boolean;
    jwtSecret: boolean;
    database: boolean;
  };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageProcessingTime: number;
    agentUsage: Record<string, number>;
    errorRate: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiBaseUrl = environment.apiBaseUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json'
    });
  }

  // Agentes
  getAgents(): Observable<AgentsResponse> {
    return this.http.get<AgentsResponse>(`${this.apiBaseUrl}/agents`, {
      headers: this.getHeaders()
    });
  }

  getAgent(id: string): Observable<AgentResponse> {
    return this.http.get<AgentResponse>(`${this.apiBaseUrl}/agents/${id}`, {
      headers: this.getHeaders()
    });
  }

  getActiveAgents(): Observable<AgentsResponse> {
    return this.http.get<AgentsResponse>(`${this.apiBaseUrl}/agents/active`, {
      headers: this.getHeaders()
    });
  }

  createAgent(agent: Partial<Agent>): Observable<AgentResponse> {
    return this.http.post<AgentResponse>(`${this.apiBaseUrl}/agents`, agent, {
      headers: this.getHeaders()
    });
  }

  updateAgent(id: string, agent: Partial<Agent>): Observable<AgentResponse> {
    return this.http.put<AgentResponse>(`${this.apiBaseUrl}/agents/${id}`, agent, {
      headers: this.getHeaders()
    });
  }

  updateAgentStatus(id: string, status: 'active' | 'inactive'): Observable<AgentResponse> {
    return this.http.patch<AgentResponse>(`${this.apiBaseUrl}/agents/${id}/status`, { status }, {
      headers: this.getHeaders()
    });
  }

  deleteAgent(id: string): Observable<{ success: boolean; data: { message: string } }> {
    return this.http.delete<{ success: boolean; data: { message: string } }>(`${this.apiBaseUrl}/agents/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Chat
  chatWithAgent(id: string, messages: ChatMessage[]): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiBaseUrl}/agents/${id}/chat`, { messages }, {
      headers: this.getHeaders()
    });
  }

  consultAgent(id: string, query: string): Observable<ConsultResponse> {
    return this.http.post<ConsultResponse>(`${this.apiBaseUrl}/agents/${id}/consult`, { query }, {
      headers: this.getHeaders()
    });
  }

  // Comunicação entre agentes
  sendMessage(agentId: string, message: CommunicationRequest): Observable<CommunicationResponse> {
    return this.http.post<CommunicationResponse>(`${this.apiBaseUrl}/agents/${agentId}/communicate`, message, {
      headers: this.getHeaders()
    });
  }

  getMessages(agentId: string, limit: number = 50, offset: number = 0): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.apiBaseUrl}/agents/${agentId}/messages?limit=${limit}&offset=${offset}`, {
      headers: this.getHeaders()
    });
  }

  getMessagesBetween(agentId: string, otherAgentId: string): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.apiBaseUrl}/agents/${agentId}/messages/between?otherAgentId=${otherAgentId}`, {
      headers: this.getHeaders()
    });
  }

  getUnreadMessages(agentId: string): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.apiBaseUrl}/agents/${agentId}/messages/unread`, {
      headers: this.getHeaders()
    });
  }

  getMessageCount(agentId: string): Observable<{ success: boolean; data: { count: number } }> {
    return this.http.get<{ success: boolean; data: { count: number } }>(`${this.apiBaseUrl}/agents/${agentId}/messages/count`, {
      headers: this.getHeaders()
    });
  }

  deleteMessage(messageId: string): Observable<{ success: boolean; data: { message: string } }> {
    return this.http.delete<{ success: boolean; data: { message: string } }>(`${this.apiBaseUrl}/agents/messages/${messageId}`, {
      headers: this.getHeaders()
    });
  }

  getCommunicationStats(): Observable<{ success: boolean; data: CommunicationStats }> {
    return this.http.get<{ success: boolean; data: CommunicationStats }>(`${this.apiBaseUrl}/agents/communication/stats`, {
      headers: this.getHeaders()
    });
  }

  // Health
  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.apiBaseUrl.replace('/api', '')}/health`);
  }
}