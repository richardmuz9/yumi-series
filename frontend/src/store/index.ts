import { create } from 'zustand'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  provider?: string
  model?: string
}

interface AppState {
  mode: 'agent' | 'assistant'
  messages: Message[]
  previewCode: string
  provider: 'openai' | 'openrouter' | 'qwen' | 'claude'
  model: string
  availableModels: Record<string, string[]>
  isLoading: boolean
  currentView: 'chat' | 'archive' | 'writing-helper'
  language: 'en' | 'cn' | 'jp' | 'kr'
  showLayoutCustomizer: boolean
  installedModes: string[]
  setMode: (mode: 'agent' | 'assistant') => void
  setProvider: (provider: 'openai' | 'openrouter' | 'qwen' | 'claude') => void
  setModel: (model: string) => void
  setAvailableModels: (models: Record<string, string[]>) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  archiveMessages: () => void
  setCurrentView: (view: 'chat' | 'archive' | 'writing-helper') => void
  setPreviewCode: (code: string) => void
  setLoading: (loading: boolean) => void
  setLanguage: (language: 'en' | 'cn' | 'jp' | 'kr') => void
  setShowLayoutCustomizer: (show: boolean) => void
  setInstalledModes: (modes: string[]) => void
}

export const useStore = create<AppState>((set, get) => ({
  mode: 'agent',
  messages: [],
  previewCode: '',
  provider: 'qwen',
  model: 'qwen-turbo',
  availableModels: {
    openai: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ],
    anthropic: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022', 
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ],
    openrouter: [
      'google/gemini-2.5-pro',
      'google/gemini-2.5-pro-vision', 
      'google/gemini-2.5-pro-preview',
      'meta-llama/llama-3-70b-instruct',
      'meta-llama/llama-3-8b-instruct',
      'mistralai/mistral-7b-instruct',
      'mistralai/mixtral-8x7b-instruct',
      'microsoft/wizardlm-2-8x22b'
    ],
    qwen: [
      'qwen-turbo',
      'qwen-plus',
      'qwen-max',
      'qwen-vl-plus',
      'qwen-vl-max',
      'deepseek/deepseek-chat',
      'deepseek/deepseek-coder'
    ],
    claude: [
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-opus-20240229',
      'claude-3-5-sonnet-20240620',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ]
  },
  isLoading: false,
  currentView: 'chat',
  language: (localStorage.getItem('yumiLanguage') as 'en' | 'cn' | 'jp' | 'kr') || 'en',
  showLayoutCustomizer: false,
  installedModes: ['web-builder'], // Default to core mode only
  setMode: (mode) => set({ mode }),
  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),
  setAvailableModels: (models) => set({ availableModels: models }),
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
  archiveMessages: () => {
    const state = get()
    const archive = {
      messages: state.messages,
      timestamp: new Date().toISOString(),
      provider: state.provider,
      model: state.model,
      mode: state.mode
    }
    
    // Save to localStorage with error handling
    try {
      const existingArchives = JSON.parse(localStorage.getItem('yumi-chat-archives') || '[]')
      existingArchives.push(archive)
      localStorage.setItem('yumi-chat-archives', JSON.stringify(existingArchives))
      console.log('🗄️ Chat archived successfully!', archive)
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
      // Fallback: just log the archive
      console.log('🗄️ Chat archived (localStorage unavailable):', archive)
    }
    
    // Optionally clear messages after archiving
    // set({ messages: [] })
  },
  setCurrentView: (view) => set({ currentView: view }),
  setPreviewCode: (code) => set({ previewCode: code }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLanguage: (language) => {
    set({ language })
    // Persist language choice to localStorage
    localStorage.setItem('yumiLanguage', language)
  },
  setShowLayoutCustomizer: (show) => set({ showLayoutCustomizer: show }),
  setInstalledModes: (modes) => set({ installedModes: modes }),
})) 