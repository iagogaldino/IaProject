// Agent Types
export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  canCommunicateWith: string[];
  databaseAccess?: {
    enabled: boolean;
    allowedCollections: string[];
    allowedOperations: ('read' | 'write' | 'update' | 'delete')[];
    queryLimits?: {
      maxResults: number;
      timeout: number;
    };
  };
  fileAccess?: {
    enabled: boolean;
    allowedFileTypes: string[];
    maxFileSize: number; // in bytes
    allowedOperations: ('read' | 'upload' | 'delete')[];
    storagePath?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  status?: 'active' | 'inactive';
  canCommunicateWith?: string[];
  databaseAccess?: {
    enabled: boolean;
    allowedCollections: string[];
    allowedOperations: ('read' | 'write' | 'update' | 'delete')[];
    queryLimits?: {
      maxResults: number;
      timeout: number;
    };
  };
  fileAccess?: {
    enabled: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
    allowedOperations: ('read' | 'upload' | 'delete')[];
    storagePath?: string;
  };
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  canCommunicateWith?: string[];
  databaseAccess?: {
    enabled: boolean;
    allowedCollections: string[];
    allowedOperations: ('read' | 'write' | 'update' | 'delete')[];
    queryLimits?: {
      maxResults: number;
      timeout: number;
    };
  };
  fileAccess?: {
    enabled: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
    allowedOperations: ('read' | 'upload' | 'delete')[];
    storagePath?: string;
  };
}

// Message Types
export interface Message {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  createdAt: Date;
}

export interface CreateMessageRequest {
  fromAgentId: string;
  toAgentId: string;
  content: string;
}

// Chat Types
export interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  agentId: string;
  response: {
    role: 'agent';
    content: string;
  };
}

// AI Processing Types
export interface AIProcessRequest {
  prompt?: string;
  conversationHistory?: Array<{
    sender: string;
    text: string;
    timestamp: string;
  }>;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface AIProcessResponse {
  success: boolean;
  data: string;
  metadata?: {
    agentUsed?: string;
    requiresDatabase?: boolean;
    processingTime?: number;
    confidence?: number;
    databaseData?: any[];
    sqlQuery?: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    openai: boolean;
    apiKey: boolean;
    jwtSecret: boolean;
    database: boolean;
  };
  metrics?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageProcessingTime: number;
    agentUsage: Record<string, number>;
    errorRate: number;
  };
}

// Error Types
export interface AppError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

// MongoDB Types
export interface MongoAgent {
  _id: string;
  name: string;
  description: string;
  status: string;
  canCommunicateWith: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoMessage {
  _id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  createdAt: Date;
}

// File Types
export interface FileUpload {
  id: string;
  agentId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  processedAt?: Date;
  content?: string;
  screenshotPaths?: string[];
  metadata?: Record<string, any>;
  enrichedMetadata?: {
    theme?: string;
    improvedContent?: string;
    tags?: string[];
    analysis?: {
      summary?: string;
      keyTopics?: string[];
      sentiment?: string;
      confidence?: number;
      language?: string;
    };
    aiAnalysis?: {
      processedAt: Date;
      agentId: string;
      version: string;
    };
  };
}

export interface FileUploadRequest {
  agentId: string;
  file: any; // Express.Multer.File
  metadata?: Record<string, any>;
}

export interface FileProcessRequest {
  agentId: string;
  fileId: string;
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
      language?: string;
      fileType: string;
    };
  };
  error?: string;
}

// AI Analysis Types
export interface ContentAnalysisRequest {
  fileId: string;
  agentId: string;
  content: string;
  options?: {
    language?: string;
    analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
    includeImprovements?: boolean;
  };
}

export interface ContentAnalysisResponse {
  success: boolean;
  data: {
    theme: string;
    improvedContent?: string;
    tags: string[];
    analysis: {
      summary: string;
      keyTopics: string[];
      sentiment: string;
      confidence: number;
      language: string;
    };
    aiAnalysis: {
      processedAt: Date;
      agentId: string;
      version: string;
    };
  };
  error?: string;
}

// Metadata Types
export interface Metadata {
  id: string;
  fileId: string;
  agentId: string;
  theme: string;
  improvedContent?: string;
  tags: string[];
  analysis: {
    summary: string;
    keyTopics: string[];
    sentiment: string;
    confidence: number;
    language: string;
  };
  aiAnalysis: {
    processedAt: Date;
    agentId: string;
    version: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMetadataRequest {
  fileId: string;
  agentId: string;
  theme: string;
  improvedContent?: string;
  tags: string[];
  analysis: {
    summary: string;
    keyTopics: string[];
    sentiment: string;
    confidence: number;
    language: string;
  };
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
