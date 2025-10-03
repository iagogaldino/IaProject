import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  fromAgentId: string;
  toAgentId: string;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  fromAgentId: {
    type: String,
    required: true,
    ref: 'Agent'
  },
  toAgentId: {
    type: String,
    required: true,
    ref: 'Agent'
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false
});

// Índices para otimização de consultas
MessageSchema.index({ fromAgentId: 1 });
MessageSchema.index({ toAgentId: 1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ fromAgentId: 1, toAgentId: 1 });
MessageSchema.index({ toAgentId: 1, fromAgentId: 1 });

// Índice composto para consultas entre agentes
MessageSchema.index({ 
  fromAgentId: 1, 
  toAgentId: 1, 
  createdAt: -1 
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
