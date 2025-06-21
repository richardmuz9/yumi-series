import { AIGenerationSettings } from '../anime-chara-helper/types';
import { ApiErrors, classifyError, calculateRetryDelay, shouldRetry, getErrorMessage } from '../utils/errorHandling';
import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ModelsResponse,
  AuthResponse,
  User,
  APIError
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Enhanced fetch with retry logic and better error handling
async function fetchWithRetry(
  input: RequestInfo,
  init?: RequestInit,
  retries = 3,
  backoff = 500
): Promise<Response> {
  let attempt = 0;
  let lastError: ApiErrors.EnhancedError | null = null;

  while (attempt <= retries) {
    try {
      const response = await fetch(input, {
        ...init,
        credentials: 'include',
        headers: {
          ...init?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        };
      }

      return response;
    } catch (error) {
      lastError = classifyError(error, attempt);
      console.error(`[API] Request failed (attempt ${attempt + 1}/${retries + 1}):`, {
        error: lastError.error,
        type: lastError.type,
        isRetryable: lastError.isRetryable
      });

      if (shouldRetry(lastError, retries)) {
        const delay = calculateRetryDelay(lastError, backoff);
        console.log(`[API] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }

      throw lastError;
    }
  }

  throw lastError!;
}

// Centralized API client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    // Automatically include auth headers if available
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    
    console.log(`[API][Request] ${options.method || 'GET'} ${endpoint}`);
    console.log(`[API][Request] URL:`, url);
    console.log(`[API][Request] Headers:`, {
      'Content-Type': headers['Content-Type'],
      'Authorization': headers['Authorization'] ? `Bearer ${headers['Authorization'].substring(7, 20)}...` : 'none',
      'Has-Cookie-Credentials': 'include'
    });
    
    try {
      const response = await fetchWithRetry(url, {
        ...options,
        headers,
        credentials: 'include'
      });
      
      console.log(`[API][Response] ${options.method || 'GET'} ${endpoint} - Status:`, response.status);
      
      const result = await response.json();
      console.log(`[API][Response] ${options.method || 'GET'} ${endpoint} - Data:`, {
        success: result.success,
        hasUser: !!result.user,
        error: result.error
      });
      
      return result;
    } catch (error) {
      console.error(`[API][Error] ${options.method || 'GET'} ${endpoint} failed:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // API methods
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return this.post<ChatResponse>('/api/chat', request);
  }

  async getModels(): Promise<ModelsResponse> {
    return this.get<ModelsResponse>('/api/models');
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.get<{ status: string }>('/api/health');
  }

  async editWebsite(instructions: string): Promise<string> {
    return this.post<string>('/api/edit', { instructions });
  }

  async generateAnimeCharacter(prompt: string, settings: AIGenerationSettings) {
    return this.post('/api/anime-chara-helper/generate', { prompt, settings });
  }
}

// Global API client instance
export const apiClient = new ApiClient();
export const apiService = apiClient;
export const generateAnimeCharacter = (prompt: string, settings: AIGenerationSettings) => 
  apiClient.generateAnimeCharacter(prompt, settings);

class AuthService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('[Auth][Frontend] Starting signup process for:', { email, username });
      console.log('[Auth][Frontend] API URL:', `${this.baseUrl}/api/auth/signup`);
      
      const requestBody = { email, username, password };
      console.log('[Auth][Frontend] Request body (password hidden):', { 
        email, 
        username, 
        passwordLength: password.length 
      });

      const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      console.log('[Auth][Frontend] Response status:', response.status);
      console.log('[Auth][Frontend] Response headers:', {
        'content-type': response.headers.get('content-type'),
        'set-cookie': response.headers.get('set-cookie')
      });

      const data = await response.json();
      console.log('[Auth][Frontend] Response data:', {
        success: data.success,
        hasUser: !!data.user,
        hasToken: !!data.token,
        tokenLength: data.token?.length,
        error: data.error
      });
      
      return data;
    } catch (error) {
      console.error('[Auth][Frontend] Signup error:', error);
      throw error;
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
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data;
    } catch (error) {
      console.error('[Auth][Frontend] Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      localStorage.removeItem('authToken');
      return { success: true };
    } catch (error) {
      console.error('[Auth][Frontend] Logout error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });
      return response.json();
    } catch (error) {
      console.error('[Auth][Frontend] Get profile error:', error);
      throw error;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }
}

export const authService = new AuthService(); 