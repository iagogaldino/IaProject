
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AskRequest {
  prompt: string;
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

  askQuestion(prompt: string): Observable<AskResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body: AskRequest = {
      prompt: prompt
    };

    return this.http.post<AskResponse>(`${this.baseUrl}/ask`, body, { headers });
  }
}
