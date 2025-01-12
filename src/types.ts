export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  contentType: 'text' | 'image' | 'file' | 'audio';
  fileName?: string;
  timestamp: Date;
}

export interface ChatResponse {
  type: 'text' | 'image' | 'file' | 'audio';
  content: string;
}