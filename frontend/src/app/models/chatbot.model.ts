export interface ChatResponse {
  message: string;
  initialMessage: string;
  data: object | null;
  action: string | null;
  actionWindow: string | null;
  actionControl: string | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}
