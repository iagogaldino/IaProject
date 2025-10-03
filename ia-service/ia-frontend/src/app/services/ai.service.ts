import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ConversationHistory {
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface ProcessRequest {
  prompt: string;
  conversationHistory?: ConversationHistory[];
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ProcessResponse {
  success: boolean;
  data: string;
  metadata?: {
    agentUsed: string;
    requiresDatabase: boolean;
    processingTime: number;
    confidence: number;
    databaseData?: any[];
    sqlQuery?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  processAI(request: ProcessRequest): Observable<ProcessResponse> {
    return this.http.post<ProcessResponse>(`${this.apiBaseUrl}/process`, request);
  }
}
