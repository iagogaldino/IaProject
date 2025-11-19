export interface Message {
  text: string;
  sender: 'user' | 'assistant' | 'error';
  hour?: string;
  image?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface AskRequest {
  prompt: string;
  userId?: string;
  sessionId?: string;
  conversationHistory?: Message[];
  metadata?: Record<string, any>;
}

export interface AskResponse {
  data: string;
  userPrompt: string;
  dbData: string;
  promtptToSend: string;
}

