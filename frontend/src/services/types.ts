export interface APIError {
  error: string;
  details?: string;
  retryAfter?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message?: string; // Keep for backward compatibility
  messages?: ChatMessage[]; // New messages array support
  mode: 'writing' | 'anime';
  provider?: 'qwen' | 'openai' | 'claude';
  model?: string;
}

export interface ChatResponse {
  response: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface ModelsResponse {
  openai: string[];
  qwen: string[];
  claude: string[];
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    username: string;
    tokensRemaining: number;
    subscriptionStatus: string;
  };
  token?: string;
  error?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  tokensRemaining: number;
  totalTokensUsed: number;
  freeTokensUsedThisMonth: number;
  subscriptionStatus: string;
  createdAt: string;
} 