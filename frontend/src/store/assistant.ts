import { create } from 'zustand';

interface AssistantState {
  isOpen: boolean;
  mode: string;
  chatHistory: any[];
  openAssistant: () => void;
  closeAssistant: () => void;
  setMode: (mode: string) => void;
  addMessage: (msg: any) => void;
  clearChat: () => void;
}

export const useAssistantStore = create<AssistantState>((set: any) => ({
  isOpen: false,
  mode: 'main',
  chatHistory: [],
  openAssistant: () => set({ isOpen: true }),
  closeAssistant: () => set({ isOpen: false }),
  setMode: (mode: string) => set({ mode }),
  addMessage: (msg: any) => set((state: AssistantState) => ({ chatHistory: [...state.chatHistory, msg] })),
  clearChat: () => set({ chatHistory: [] }),
})); 