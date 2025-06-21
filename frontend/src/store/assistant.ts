import { create } from 'zustand';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  provider?: string;
  model?: string;
}

interface AssistantState {
  mode: 'writing' | 'anime';
  messages: Message[];
  provider: 'openai' | 'qwen' | 'claude';
  model: string;
  isLoading: boolean;
  setMode: (mode: 'writing' | 'anime') => void;
  setProvider: (provider: 'openai' | 'qwen' | 'claude') => void;
  setModel: (model: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  mode: 'writing',
  messages: [],
  provider: 'qwen',
  model: 'qwen-turbo',
  isLoading: false,
  setMode: (mode) => set({ mode }),
  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  setLoading: (loading) => set({ isLoading: loading }),
})); 