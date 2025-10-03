import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface FileUpload {
  id: string;
  agentId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  processedAt?: string;
  content?: string;
  metadata: {
    originalName: string;
    mimeType: string;
    size: number;
  };
  enrichedMetadata?: {
    theme?: string;
    tags?: string[];
    analysis?: {
      summary?: string;
      keyTopics?: string[];
      sentiment?: string;
      confidence?: number;
      language?: string;
    };
  };
}

export interface FileProcessRequest {
  operation: 'read' | 'analyze' | 'summarize' | 'extract';
  options?: {
    language?: string;
    format?: string;
    maxLength?: number;
  };
}

export interface FileProcessResponse {
  success: boolean;
  data: {
    content: string;
    summary?: string;
    metadata: {
      wordCount: number;
      characterCount: number;
      language: string;
      fileType: string;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
  };
  error?: {
    message: string;
    code: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly apiKey = environment.apiKey;

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.apiKey
    });
  }

  constructor(private http: HttpClient) {}

  /**
   * Upload de arquivo para um agente específico
   */
  uploadFile(agentId: string, file: File): Observable<ApiResponse<FileUpload>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<FileUpload>>(
      `${this.apiUrl}/agents/${agentId}/files/upload`,
      formData,
      { headers: this.headers }
    );
  }

  /**
   * Listar arquivos de um agente
   */
  getAgentFiles(agentId: string): Observable<ApiResponse<FileUpload[]>> {
    return this.http.get<ApiResponse<FileUpload[]>>(
      `${this.apiUrl}/agents/${agentId}/files`,
      { headers: this.headers }
    );
  }

  /**
   * Listar todos os arquivos do sistema (sem filtro por agente)
   */
  getAllFiles(): Observable<ApiResponse<FileUpload[]>> {
    return this.http.get<ApiResponse<FileUpload[]>>(
      `${this.apiUrl}/files`,
      { headers: this.headers }
    );
  }

  /**
   * Obter informações detalhadas de um arquivo
   */
  getFileInfo(fileId: string): Observable<ApiResponse<FileUpload>> {
    return this.http.get<ApiResponse<FileUpload>>(
      `${this.apiUrl}/files/${fileId}`,
      { headers: this.headers }
    );
  }

  /**
   * Processar arquivo com IA
   */
  processFile(agentId: string, fileId: string, request: FileProcessRequest): Observable<FileProcessResponse> {
    return this.http.post<FileProcessResponse>(
      `${this.apiUrl}/agents/${agentId}/files/${fileId}/process`,
      request,
      { headers: this.headers }
    );
  }

  /**
   * Deletar arquivo
   */
  deleteFile(agentId: string, fileId: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(
      `${this.apiUrl}/agents/${agentId}/files/${fileId}`,
      { headers: this.headers }
    );
  }

  /**
   * Formatar tamanho do arquivo para exibição
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obter ícone baseado no tipo de arquivo
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table_chart';
    if (mimeType.includes('csv')) return 'table_view';
    if (mimeType.includes('json')) return 'code';
    if (mimeType.includes('text')) return 'text_snippet';
    return 'insert_drive_file';
  }

  /**
   * Obter cor baseada no tipo de arquivo
   */
  getFileColor(mimeType: string): string {
    if (mimeType.includes('pdf')) return '#f44336';
    if (mimeType.includes('word') || mimeType.includes('document')) return '#2196f3';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '#4caf50';
    if (mimeType.includes('csv')) return '#ff9800';
    if (mimeType.includes('json')) return '#9c27b0';
    if (mimeType.includes('text')) return '#607d8b';
    return '#757575';
  }

  /**
   * Validar tipo de arquivo
   */
  isValidFileType(file: File): boolean {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    return allowedTypes.includes(file.type);
  }

  /**
   * Validar tamanho do arquivo (máximo 10MB)
   */
  isValidFileSize(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  }
}
