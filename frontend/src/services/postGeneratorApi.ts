import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://137.184.89.215:3001');

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Always include cookies
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Check for demo mode
  const urlParams = new URLSearchParams(window.location.search)
  const isDemo = urlParams.get('demo') === 'true'
  if (isDemo) {
    config.headers['X-Demo-Mode'] = 'true'
  }
  
  console.log('[PostGeneratorAPI] Request:', {
    url: config.url,
    hasToken: !!token,
    isDemo,
    hasCredentials: config.withCredentials
  })
  
  return config
})

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[PostGeneratorAPI] Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    })
    
    // If 401, clear stored auth data
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
    
    return Promise.reject(error)
  }
)

export interface PostGenerateRequest {
  platform: string
  audience: string
  objective: string
  tone: string
  stylePack?: string
  animePersona?: string
  topic: string
  keyPoints: string[]
  pastPost?: string
  trendingHashtags?: string[]
  customInstructions?: string
  generateVariations?: boolean
  variationCount?: number
  model?: string
  provider?: string
}

export interface PostVariation {
  id: string
  content: string
  changes: string[]
  confidence: number
}

export interface PostGenerateResponse {
  post: string
  platform: string
  characterCount: number
  maxLength: number
  withinLimit: boolean
  provider: string
  model: string
  tokensUsed?: number
  tokensRemaining?: number
  variations?: PostVariation[]
  variationCount?: number
}

export interface TrendingResponse {
  trends: Array<{
    tag: string
    count: number
  }>
  platform: string
}

export interface TemplatesResponse {
  platforms: {
    [key: string]: {
      name: string
      maxLength: number
      templates: Array<{
        id: string
        name: string
        objective: string
        tone: string
        template: string
        example: string
      }>
    }
  }
  stylePacks: {
    [key: string]: {
      name: string
      description: string
      prompt: string
    }
  }
  audiences: {
    [key: string]: string
  }
}

export const postGeneratorService = {
  // Get post templates and configuration
  async getTemplates(): Promise<TemplatesResponse> {
    const response = await apiClient.get('/api/post-generator/templates')
    return response.data
  },

  // Get anime personas
  async getAnimePersonas(): Promise<any> {
    const response = await apiClient.get('/api/post-generator/anime-personas')
    return response.data
  },

  // Get content blocks
  async getContentBlocks(): Promise<any> {
    const response = await apiClient.get('/api/post-generator/content-blocks')
    return response.data
  },

  // Get user preferences configuration
  async getPreferences(): Promise<any> {
    const response = await apiClient.get('/api/post-generator/preferences')
    return response.data
  },

  // Get personalized recommendations
  async getRecommendations(): Promise<any> {
    const response = await apiClient.get('/api/post-generator/recommendations')
    return response.data
  },

  // Submit user feedback
  async submitFeedback(feedback: any): Promise<any> {
    const response = await apiClient.post('/api/post-generator/feedback', feedback)
    return response.data
  },

  // Get trending hashtags for a platform
  async getTrends(platform: string): Promise<TrendingResponse> {
    const response = await apiClient.get(`/api/trends/${platform}`)
    return response.data
  },

  // Generate a post
  async generatePost(request: PostGenerateRequest): Promise<PostGenerateResponse> {
    const response = await apiClient.post('/api/generate-post', request)
    return response.data
  },

  // Generate content (enhanced writing helper)
  async generateContent(request: any): Promise<any> {
    const response = await apiClient.post('/api/generate-content', request)
    return response.data
  },

  // Get writing helper templates
  async getWritingTemplates(): Promise<any> {
    const response = await apiClient.get('/api/writing-helper/templates')
    return response.data
  },

  // Get content suggestions
  async getContentSuggestions(contentType: string, topic?: string): Promise<any> {
    const response = await apiClient.get('/api/writing-helper/suggestions', {
      params: { contentType, topic }
    })
    return response.data
  }
} 