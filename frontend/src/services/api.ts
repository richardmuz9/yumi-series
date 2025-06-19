const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Enhanced fetch with retry logic and better error handling
async function fetchWithRetry(
  input: RequestInfo,
  init?: RequestInit,
  retries = 3,
  backoff = 500
): Promise<Response> {
  try {
    const response = await fetch(input, {
      ...init,
      credentials: 'include',
      headers: {
        ...init?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    console.error(`API request failed:`, error)
    
    if (retries > 0 && (error instanceof Error)) {
      // Retry on network errors or 5xx server errors
      const isRetryable = 
        error.message.includes('fetch') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('HTTP 5')
      
      if (isRetryable) {
        console.log(`Retrying in ${backoff}ms... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, backoff))
        return fetchWithRetry(input, init, retries - 1, backoff * 2)
      }
    }
    
    throw error
  }
}

// Centralized API client
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
    
    // Automatically include auth headers if available
    const token = localStorage.getItem('authToken')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    }
    
    try {
      const response = await fetchWithRetry(url, {
        ...options,
        headers,
        credentials: 'include'
      })
      return await response.json()
    } catch (error) {
      console.error(`API ${options.method || 'GET'} ${endpoint} failed:`, error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Global API client instance
export const apiClient = new ApiClient()

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
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
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
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
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
      await fetch(`${this.baseUrl}/api/auth/logout`, {
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

      const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
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
    try {
      return await apiClient.post<ChatResponse>('/api/chat', request)
    } catch (error) {
      console.error('Chat API error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to send message')
    }
  },

  async getModels(): Promise<ModelsResponse> {
    try {
      const data = await apiClient.get<any>('/api/models')
      
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
    } catch (error) {
      console.error('Models API error:', error)
      throw new Error('Failed to fetch models')
    }
  },

  async healthCheck(): Promise<{ status: string }> {
    try {
      return await apiClient.get<{ status: string }>('/health')
    } catch (error) {
      console.error('Health check error:', error)
      throw new Error('Health check failed')
    }
  },

  async editWebsite(instructions: string): Promise<string> {
    try {
      const result = await apiClient.post<{ response: string }>('/api/edit-website', { instructions })
      return result.response
    } catch (error) {
      console.error('Website edit API error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to process website editing instructions')
    }
  }
} 