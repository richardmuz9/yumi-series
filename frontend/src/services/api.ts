const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message?: string // Keep for backward compatibility
  messages?: ChatMessage[] // New messages array support
  mode: 'agent' | 'assistant'
  provider?: 'openai' | 'openrouter' | 'qwen' | 'claude'
  model?: string
}

export interface ChatResponse {
  response: string
  provider: string
  model: string
}

export interface ModelsResponse extends Record<string, string[]> {
  openai: string[]
  openrouter: string[]
  qwen: string[]
  claude: string[]
}

export interface AuthResponse {
  success: boolean
  user?: {
    id: number
    email: string
    username: string
    tokensRemaining: number
    subscriptionStatus: string
  }
  token?: string
  error?: string
}

export interface User {
  id: number
  email: string
  username: string
  tokensRemaining: number
  totalTokensUsed: number
  freeTokensUsedThisMonth: number
  subscriptionStatus: string
  createdAt: string
}

class AuthService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, username, password })
      })

      const data = await response.json()
      
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error('Signup error:', error)
      return {
        success: false,
        error: 'Network error during signup'
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Network error during login'
      }
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })

      localStorage.removeItem('authToken')
      localStorage.removeItem('user')

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      return { success: true }
    }
  }

  async getProfile(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const token = this.getToken()
      if (!token) {
        return { success: false, error: 'No authentication token' }
      }

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      const data = await response.json()
      
      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error('Profile error:', error)
      return {
        success: false,
        error: 'Network error fetching profile'
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken')
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser()
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }
}

export const authService = new AuthService()

export const apiService = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send message')
    }

    return response.json()
  },

  async getModels(): Promise<ModelsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/models`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch models')
    }

    const data = await response.json()
    
    console.log('Raw models data from backend:', data)
    
    // Handle the backend's complex model structure and extract just the IDs
    const validatedData: ModelsResponse = {
      openai: data.openai?.models && Array.isArray(data.openai.models) 
        ? data.openai.models.map((m: any) => m.id || m.name || m).filter(Boolean) 
        : [],
      openrouter: data.openrouter?.models && Array.isArray(data.openrouter.models) 
        ? data.openrouter.models.map((m: any) => m.id || m.name || m).filter(Boolean) 
        : [],
      qwen: data.qwen?.models && Array.isArray(data.qwen.models) 
        ? data.qwen.models.map((m: any) => m.id || m.name || m).filter(Boolean) 
        : [],
      claude: data.claude?.models && Array.isArray(data.claude.models) 
        ? data.claude.models.map((m: any) => m.id || m.name || m).filter(Boolean) 
        : []
    }
    
    console.log('Processed models data:', validatedData)
    
    return validatedData
  },

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`)
    
    if (!response.ok) {
      throw new Error('Health check failed')
    }

    return response.json()
  },

  async editWebsite(instructions: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/edit-website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instructions }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to process website editing instructions')
    }

    const result = await response.json()
    return result.response
  }
} 