// WebBuilder Module Types and Interfaces

export interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  htmlContent: string
  cssContent: string
  tags: string[]
  isPremium: boolean
  author: string
  rating: number
  downloads: number
}

export interface Component {
  id: string
  name: string
  description: string
  category: string
  icon: string
  html: string
  css: string
  js?: string
  preview: string
  tags: string[]
}

export interface WebsiteGenerationOptions {
  type?: string
  style?: string
  pages?: string[]
  features?: string[]
  colorScheme?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface WebBuilderChatRequest {
  messages: ChatMessage[]
  context?: Record<string, any>
}

export interface CodeChanges {
  html?: string
  css?: string
  js?: string
}

export interface WebBuilderChatResponse {
  message: string
  suggestions: string[]
  codeChanges?: CodeChanges | null
}

export interface GeneratedWebsite {
  html: string
  css: string
  js?: string
  metadata: {
    title: string
    description: string
    generatedAt: string
    prompt: string
  }
}

export interface WebBuilderGenerateRequest {
  prompt: string
  options?: WebsiteGenerationOptions
}

export interface WebBuilderProject {
  id: string
  name: string
  description: string
  html: string
  css: string
  js?: string
  createdAt: string
  updatedAt: string
  userId: number
} 