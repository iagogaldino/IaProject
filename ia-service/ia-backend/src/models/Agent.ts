import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
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
    maxFileSize: number;
    allowedOperations: ('read' | 'upload' | 'delete')[];
    storagePath?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  canCommunicateWith: {
    type: [String],
    default: []
  },
  databaseAccess: {
    enabled: {
      type: Boolean,
      default: false
    },
    allowedCollections: {
      type: [String],
      default: []
    },
    allowedOperations: {
      type: [String],
      enum: ['read', 'write', 'update', 'delete'],
      default: ['read']
    },
    queryLimits: {
      maxResults: {
        type: Number,
        default: 100
      },
      timeout: {
        type: Number,
        default: 30000
      }
    }
  },
  fileAccess: {
    enabled: {
      type: Boolean,
      default: false
    },
    allowedFileTypes: {
      type: [String],
      default: ['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB in bytes
    },
    allowedOperations: {
      type: [String],
      enum: ['read', 'upload', 'delete'],
      default: ['read']
    },
    storagePath: {
      type: String,
      default: 'uploads'
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para otimização
AgentSchema.index({ name: 1 }, { unique: true });
AgentSchema.index({ status: 1 });
AgentSchema.index({ createdAt: -1 });

// Middleware para validação antes de salvar
AgentSchema.pre<IAgent>('save', function(next: any) {
  // Remover espaços em branco dos IDs de comunicação
  if (this.canCommunicateWith) {
    this.canCommunicateWith = this.canCommunicateWith
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);
  }
  next();
});

export const Agent = mongoose.model<IAgent>('Agent', AgentSchema);
