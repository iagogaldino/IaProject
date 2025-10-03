import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Metadata {
  id: string;
  fileId: string;
  agentId: string;
  theme: string;
  improvedContent: string;
  tags: string[];
  analysis: {
    summary?: string;
    keyTopics?: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
    confidence?: number;
    language?: string;
  };
  aiAnalysis: {
    processedAt: string;
    agentId: string;
    version: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMetadataRequest {
  fileId: string;
  agentId: string;
  theme: string;
  improvedContent: string;
  tags: string[];
  analysis: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface MetadataStats {
  totalMetadata: number;
  byTheme: Record<string, number>;
  bySentiment: Record<string, number>;
  byAgent: Record<string, number>;
  recentActivity: number;
}

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:3000/api';
  private metadataCache = new Map<string, Metadata>();
  private metadataStatusCache = new Map<string, boolean>();
  
  // BehaviorSubject para notificar mudanças no status dos metadados
  private metadataStatusSubject = new BehaviorSubject<Map<string, boolean>>(new Map());
  public metadataStatus$ = this.metadataStatusSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Verificar se um arquivo tem metadados anexados
   */
  async hasMetadata(fileId: string): Promise<boolean> {
    // Verificar cache primeiro
    if (this.metadataStatusCache.has(fileId)) {
      return this.metadataStatusCache.get(fileId)!;
    }

    try {
      const response = await this.getMetadataByFile(fileId).toPromise();
      const hasMetadata = response?.success && response.data !== null;
      
      // Atualizar cache
      this.metadataStatusCache.set(fileId, hasMetadata || false);
      this.notifyMetadataStatusChange();
      
      return hasMetadata || false;
    } catch (error) {
      console.error('Erro ao verificar metadados:', error);
      return false;
    }
  }

  /**
   * Obter metadados de um arquivo
   */
  getMetadataByFile(fileId: string): Observable<ApiResponse<Metadata | null>> {
    const headers = new HttpHeaders({
      'x-api-key': environment.apiKey
    });
    
    return this.http.get<ApiResponse<Metadata>>(`${this.baseUrl}/files/${fileId}/metadata`, { headers })
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Erro ao buscar metadados:', error);
          return [{ success: false, data: null, error: { message: 'Erro ao buscar metadados', code: 'FETCH_ERROR' } }];
        })
      );
  }

  /**
   * Obter metadados por agente
   */
  getMetadataByAgent(agentId: string): Observable<ApiResponse<Metadata[]>> {
    const headers = new HttpHeaders({
      'x-api-key': environment.apiKey
    });
    
    return this.http.get<ApiResponse<Metadata[]>>(`${this.baseUrl}/agents/${agentId}/metadata`, { headers })
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Erro ao buscar metadados do agente:', error);
          return [{ success: false, data: [], error: { message: 'Erro ao buscar metadados do agente', code: 'FETCH_ERROR' } }];
        })
      );
  }

  /**
   * Buscar metadados com filtros
   */
  searchMetadata(filters: {
    theme?: string;
    tags?: string[];
    sentiment?: string;
    agentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<ApiResponse<Metadata[]>> {
    const headers = new HttpHeaders({
      'x-api-key': environment.apiKey
    });
    
    const params = new URLSearchParams();
    
    if (filters.theme) params.append('theme', filters.theme);
    if (filters.tags?.length) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters.sentiment) params.append('sentiment', filters.sentiment);
    if (filters.agentId) params.append('agentId', filters.agentId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    return this.http.get<ApiResponse<Metadata[]>>(`${this.baseUrl}/metadata/search?${params.toString()}`, { headers })
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Erro ao buscar metadados:', error);
          return [{ success: false, data: [], error: { message: 'Erro ao buscar metadados', code: 'SEARCH_ERROR' } }];
        })
      );
  }

  /**
   * Obter estatísticas dos metadados
   */
  getMetadataStats(): Observable<ApiResponse<MetadataStats>> {
    const headers = new HttpHeaders({
      'x-api-key': environment.apiKey
    });
    
    return this.http.get<ApiResponse<MetadataStats>>(`${this.baseUrl}/metadata/stats`, { headers })
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Erro ao buscar estatísticas:', error);
          return [{ success: false, data: { totalMetadata: 0, byTheme: {}, bySentiment: {}, byAgent: {}, recentActivity: 0 }, error: { message: 'Erro ao buscar estatísticas', code: 'STATS_ERROR' } }];
        })
      );
  }

  /**
   * Atualizar metadados
   */
  updateMetadata(metadataId: string, updateData: Partial<CreateMetadataRequest>): Observable<ApiResponse<Metadata>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': environment.apiKey
    });
    
    return this.http.put<ApiResponse<Metadata>>(`${this.baseUrl}/metadata/${metadataId}`, updateData, { headers })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Atualizar cache
            this.metadataCache.set(response.data.id, response.data);
            this.notifyMetadataStatusChange();
          }
          return response;
        }),
        catchError(error => {
          console.error('Erro ao atualizar metadados:', error);
          return [{ success: false, data: null as any, error: { message: 'Erro ao atualizar metadados', code: 'UPDATE_ERROR' } }];
        })
      );
  }

  /**
   * Deletar metadados
   */
  deleteMetadata(metadataId: string): Observable<ApiResponse<{ message: string }>> {
    const headers = new HttpHeaders({
      'x-api-key': environment.apiKey
    });
    
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/metadata/${metadataId}`, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            // Remover do cache
            this.metadataCache.delete(metadataId);
            this.notifyMetadataStatusChange();
          }
          return response;
        }),
        catchError(error => {
          console.error('Erro ao deletar metadados:', error);
          return [{ success: false, data: { message: 'Erro ao deletar metadados' }, error: { message: 'Erro ao deletar metadados', code: 'DELETE_ERROR' } }];
        })
      );
  }

  /**
   * Deletar metadados por arquivo
   */
  deleteMetadataByFile(fileId: string): Observable<ApiResponse<{ message: string }>> {
    const headers = new HttpHeaders({
      'x-api-key': environment.apiKey
    });
    
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/files/${fileId}/metadata`, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            // Atualizar cache de status
            this.metadataStatusCache.set(fileId, false);
            this.notifyMetadataStatusChange();
          }
          return response;
        }),
        catchError(error => {
          console.error('Erro ao deletar metadados do arquivo:', error);
          return [{ success: false, data: { message: 'Erro ao deletar metadados do arquivo' }, error: { message: 'Erro ao deletar metadados do arquivo', code: 'DELETE_ERROR' } }];
        })
      );
  }

  /**
   * Anexar metadados a um arquivo (chama análise de IA)
   */
  attachMetadata(fileId: string, agentId: string, content: string, options?: any): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': environment.apiKey
    });

    const requestBody = {
      content,
      options: options || {}
    };

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/agents/${agentId}/files/${fileId}/analyze`, requestBody, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            // Atualizar cache de status
            this.metadataStatusCache.set(fileId, true);
            this.notifyMetadataStatusChange();
          }
          return response;
        }),
        catchError(error => {
          console.error('Erro ao anexar metadados:', error);
          return [{ success: false, data: null, error: { message: 'Erro ao anexar metadados', code: 'ATTACH_ERROR' } }];
        })
      );
  }

  /**
   * Desanexar metadados de um arquivo
   */
  detachMetadata(fileId: string): Observable<ApiResponse<{ message: string }>> {
    return this.deleteMetadataByFile(fileId);
  }

  /**
   * Obter status de metadados de um arquivo (do cache)
   */
  getMetadataStatus(fileId: string): boolean {
    return this.metadataStatusCache.get(fileId) || false;
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.metadataCache.clear();
    this.metadataStatusCache.clear();
    this.notifyMetadataStatusChange();
  }

  /**
   * Notificar mudanças no status dos metadados
   */
  private notifyMetadataStatusChange(): void {
    this.metadataStatusSubject.next(new Map(this.metadataStatusCache));
  }

  /**
   * Obter metadados do cache
   */
  getCachedMetadata(metadataId: string): Metadata | undefined {
    return this.metadataCache.get(metadataId);
  }

  /**
   * Verificar se metadados estão em cache
   */
  isMetadataCached(metadataId: string): boolean {
    return this.metadataCache.has(metadataId);
  }
}
