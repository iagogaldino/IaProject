import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface ConversationMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationSummary {
  summary: string;
  recentMessages: ConversationMessage[];
  totalMessages: number;
}

export interface ConversationStats {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  firstMessage: Date | null;
  lastMessage: Date | null;
  averageMessageLength: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private readonly API_URL = 'http://localhost:3000'; // App Backend URL
  private readonly AI_API_URL = 'http://localhost:3001'; // AI Backend URL
  
  private currentSessionId = new BehaviorSubject<string | null>(null);
  private conversationHistory = new BehaviorSubject<ConversationMessage[]>([]);
  
  public currentSessionId$ = this.currentSessionId.asObservable();
  public conversationHistory$ = this.conversationHistory.asObservable();

  constructor(private http: HttpClient) {
    // Gerar sessionId ├║nico se n├úo existir
    this.initializeSession();
  }

  /**
   * Inicializa uma nova sess├úo de conversa
   */
  private initializeSession(): void {
    const existingSessionId = localStorage.getItem('conversation_session_id');
    if (existingSessionId) {
      this.currentSessionId.next(existingSessionId);
      this.loadConversationHistory(existingSessionId);
    } else {
      const newSessionId = this.generateSessionId();
      this.currentSessionId.next(newSessionId);
      localStorage.setItem('conversation_session_id', newSessionId);
    }
  }

  /**
   * Gera um ID ├║nico para a sess├úo
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obt├⌐m o ID da sess├úo atual
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId.value;
  }

  /**
   * Envia uma mensagem para a IA
   */
  sendMessage(prompt: string, userId?: string): Observable<any> {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) {
      throw new Error('No active session');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      prompt,
      userId: userId || 'anonymous',
      sessionId,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'frontend'
      }
    };

    return this.http.post(`${this.API_URL}/ask`, body, { headers }).pipe(
      tap((response: any) => {
        // Atualizar hist├│rico local
        this.updateLocalHistory(prompt, response.data);
      })
    );
  }

  /**
   * Carrega o hist├│rico de conversa do servidor
   */
  loadConversationHistory(sessionId: string): void {
    const headers = new HttpHeaders({
      'X-API-Key': 'ai-backend-2024-abc123xyz789' // API Key para AI Backend
    });

    this.http.get(`${this.AI_API_URL}/api/conversations/${sessionId}/history`, { headers })
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            const messages = response.data.map((msg: any) => ({
              sender: msg.sender,
              text: msg.text,
              timestamp: new Date(msg.timestamp),
              metadata: msg.metadata || {}
            }));
            this.conversationHistory.next(messages);
          }
        },
        error: (error) => {
          console.error('Erro ao carregar hist├│rico:', error);
        }
      });
  }

  /**
   * Obt├⌐m o hist├│rico de conversa atual
   */
  getConversationHistory(): ConversationMessage[] {
    return this.conversationHistory.value;
  }

  /**
   * Obt├⌐m resumo da conversa
   */
  getConversationSummary(): Observable<ConversationSummary> {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) {
      throw new Error('No active session');
    }

    const headers = new HttpHeaders({
      'X-API-Key': 'ai-backend-2024-abc123xyz789'
    });

    return this.http.get(`${this.AI_API_URL}/api/conversations/${sessionId}/summary`, { headers }).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * Obt├⌐m estat├¡sticas da conversa
   */
  getConversationStats(): Observable<ConversationStats> {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) {
      throw new Error('No active session');
    }

    const headers = new HttpHeaders({
      'X-API-Key': 'ai-backend-2024-abc123xyz789'
    });

    return this.http.get(`${this.AI_API_URL}/api/conversations/${sessionId}/stats`, { headers }).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * Busca mensagens na conversa
   */
  searchMessages(searchTerm: string, limit: number = 10): Observable<ConversationMessage[]> {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) {
      throw new Error('No active session');
    }

    const headers = new HttpHeaders({
      'X-API-Key': 'ai-backend-2024-abc123xyz789'
    });

    return this.http.get(`${this.AI_API_URL}/api/conversations/${sessionId}/search?searchTerm=${encodeURIComponent(searchTerm)}&limit=${limit}`, { headers }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data.map((msg: any) => ({
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            metadata: msg.metadata || {}
          }));
        }
        return [];
      })
    );
  }

  /**
   * Limpa o hist├│rico da conversa
   */
  clearConversationHistory(): Observable<any> {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) {
      throw new Error('No active session');
    }

    const headers = new HttpHeaders({
      'X-API-Key': 'ai-backend-2024-abc123xyz789'
    });

    return this.http.delete(`${this.AI_API_URL}/api/conversations/${sessionId}/history`, { headers }).pipe(
      tap(() => {
        // Limpar hist├│rico local
        this.conversationHistory.next([]);
      })
    );
  }

  /**
   * Inicia uma nova conversa
   */
  startNewConversation(): void {
    const newSessionId = this.generateSessionId();
    this.currentSessionId.next(newSessionId);
    localStorage.setItem('conversation_session_id', newSessionId);
    this.conversationHistory.next([]);
  }

  /**
   * Atualiza o hist├│rico local com nova mensagem
   */
  private updateLocalHistory(userPrompt: string, aiResponse: string): void {
    const currentHistory = this.conversationHistory.value;
    const newMessages: ConversationMessage[] = [
      ...currentHistory,
      {
        sender: 'user',
        text: userPrompt,
        timestamp: new Date(),
        metadata: {}
      },
      {
        sender: 'assistant',
        text: aiResponse,
        timestamp: new Date(),
        metadata: {}
      }
    ];

    this.conversationHistory.next(newMessages);
  }

  /**
   * Adiciona uma mensagem ao hist├│rico local
   */
  addMessageToHistory(message: ConversationMessage): void {
    const currentHistory = this.conversationHistory.value;
    const newHistory = [...currentHistory, message];
    this.conversationHistory.next(newHistory);
  }

  /**
   * Obt├⌐m mensagens recentes
   */
  getRecentMessages(count: number = 10): ConversationMessage[] {
    const history = this.conversationHistory.value;
    return history.slice(-count);
  }

  /**
   * Verifica se h├í mensagens na conversa
   */
  hasMessages(): boolean {
    return this.conversationHistory.value.length > 0;
  }

  /**
   * Obt├⌐m o n├║mero total de mensagens
   */
  getMessageCount(): number {
    return this.conversationHistory.value.length;
  }

  /**
   * Obt├⌐m a ├║ltima mensagem
   */
  getLastMessage(): ConversationMessage | null {
    const history = this.conversationHistory.value;
    return history.length > 0 ? history[history.length - 1] : null;
  }
}
