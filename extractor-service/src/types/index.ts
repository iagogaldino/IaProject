export interface ExtractedContent {
  filename: string;
  fileType: string;
  content: string | any;
  metadata?: {
    size: number;
    pages?: number;
    sheets?: string[];
    encoding?: string;
    lines?: number;
    characters?: number;
    words?: number;
    [key: string]: any;
  };
  extractedAt: string;
}

export interface ExtractionRequest {
  file: Express.Multer.File;
  fileType: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type SupportedFileType = 'pdf' | 'pdf-images' | 'excel' | 'txt' | 'image';

export interface FileMetadata {
  originalName: string;
  mimetype: string;
  size: number;
}
