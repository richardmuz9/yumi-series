import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
    const response = await axios.get(`${API_BASE_URL}/api/post-generator/templates`)
    return response.data
  },

  // Get anime personas
  async getAnimePersonas(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/api/post-generator/anime-personas`)
    return response.data
  },

  // Get content blocks
  async getContentBlocks(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/api/post-generator/content-blocks`)
    return response.data
  },

  // Get user preferences configuration
  async getPreferences(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/api/post-generator/preferences`)
    return response.data
  },

  // Get personalized recommendations
  async getRecommendations(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/api/post-generator/recommendations`, {
      withCredentials: true
    })
    return response.data
  },

  // Submit user feedback
  async submitFeedback(feedback: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/api/post-generator/feedback`, feedback, {
      withCredentials: true
    })
    return response.data
  },

  // Get trending hashtags for a platform
  async getTrends(platform: string): Promise<TrendingResponse> {
    const response = await axios.get(`${API_BASE_URL}/api/trends/${platform}`)
    return response.data
  },

  // Generate a post
  async generatePost(request: PostGenerateRequest): Promise<PostGenerateResponse> {
    const response = await axios.post(`${API_BASE_URL}/api/generate-post`, request, {
      withCredentials: true // Include cookies for authentication
    })
    return response.data
  },

  // Generate content (enhanced writing helper)
  async generateContent(request: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/api/generate-content`, request, {
      withCredentials: true // Include cookies for authentication
    })
    return response.data
  },

  // Get writing helper templates
  async getWritingTemplates(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/api/writing-helper/templates`)
    return response.data
  },

  // Get content suggestions
  async getContentSuggestions(contentType: string, topic?: string): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/api/writing-helper/suggestions`, {
      params: { contentType, topic }
    })
    return response.data
  }
} 