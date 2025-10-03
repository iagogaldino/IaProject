
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Message {
  text: string;
  sender: 'user' | 'assistant' | 'error';
  hour: string;
  image?: string;
}

export interface AskRequest {
  prompt: string;
  conversationHistory?: Message[];
}

export interface AskResponse {
  data: string;
  userPrompt: string;
  dbData: string;
  promtptToSend: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  askQuestion(prompt: string, conversationHistory?: Message[]): Observable<AskResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Converter formato do conversationHistory para o formato esperado pelo backend
    const formattedHistory = conversationHistory?.map(msg => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: new Date().toISOString(),
      metadata: {}
    }));

    const body: any = {
      prompt: prompt,
      conversationHistory: formattedHistory
    };

    return this.http.post<AskResponse>(`${this.baseUrl}/ask`, body, { headers });
  }
}
