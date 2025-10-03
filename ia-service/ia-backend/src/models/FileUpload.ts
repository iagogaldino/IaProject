import mongoose, { Schema, Document } from 'mongoose';

export interface IFileUpload extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const FileUploadSchema = new Schema<IFileUpload>({
  agentId: {
    type: String,
    required: true,
    index: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  filePath: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  mimeType: {
    type: String,
    required: true,
    trim: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  content: {
    type: String
  },
  screenshotPaths: [{
    type: String
  }],
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  enrichedMetadata: {
    theme: {
      type: String
    },
    improvedContent: {
      type: String
    },
    tags: [{
      type: String
    }],
    analysis: {
      summary: {
        type: String
      },
      keyTopics: [{
        type: String
      }],
      sentiment: {
        type: String
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      language: {
        type: String
      }
    },
    aiAnalysis: {
      processedAt: {
        type: Date,
        default: Date.now
      },
      agentId: {
        type: String
      },
      version: {
        type: String,
        default: '1.0'
      }
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para otimização
FileUploadSchema.index({ agentId: 1, uploadedAt: -1 });
FileUploadSchema.index({ fileName: 1 });
FileUploadSchema.index({ mimeType: 1 });
FileUploadSchema.index({ uploadedAt: -1 });

// Middleware para validação antes de salvar
FileUploadSchema.pre<IFileUpload>('save', function(next: any) {
  // Garantir que o ID seja único
  if (!this.id) {
    this.id = (this as any)._id.toString();
  }
  next();
});

export const FileUpload = mongoose.model<IFileUpload>('FileUpload', FileUploadSchema);
