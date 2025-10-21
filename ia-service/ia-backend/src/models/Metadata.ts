import mongoose, { Schema, Document } from 'mongoose';

export interface IMetadata extends Document {
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
  embedding?: {
    vector: number[];
    model: string;
    generatedAt: Date;
    version: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MetadataSchema = new Schema<IMetadata>({
  fileId: {
    type: String,
    required: true,
    index: true
  },
  agentId: {
    type: String,
    required: true,
    index: true
  },
  theme: {
    type: String,
    required: true,
    trim: true
  },
  improvedContent: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  analysis: {
    summary: {
      type: String,
      required: true
    },
    keyTopics: [{
      type: String,
      trim: true
    }],
    sentiment: {
      type: String,
      required: true,
      enum: ['positivo', 'negativo', 'neutro', 'positive', 'negative', 'neutral']
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    language: {
      type: String,
      required: true
    }
  },
  aiAnalysis: {
    processedAt: {
      type: Date,
      default: Date.now
    },
    agentId: {
      type: String,
      required: true
    },
    version: {
      type: String,
      default: '1.0'
    }
  },
  embedding: {
    vector: [{
      type: Number
    }],
    model: {
      type: String,
      default: 'text-embedding-3-small'
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: String,
      default: '1.0'
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para otimização
MetadataSchema.index({ fileId: 1, agentId: 1 });
MetadataSchema.index({ theme: 1 });
MetadataSchema.index({ tags: 1 });
MetadataSchema.index({ 'analysis.sentiment': 1 });
MetadataSchema.index({ createdAt: -1 });
MetadataSchema.index({ 'embedding.vector': '2dsphere' }); // Para busca vetorial

// Middleware para validação antes de salvar
MetadataSchema.pre<IMetadata>('save', function(next: any) {
  // Garantir que o ID seja único
  if (!this.id) {
    this.id = (this as any)._id.toString();
  }
  next();
});

export const Metadata = mongoose.model<IMetadata>('Metadata', MetadataSchema);
