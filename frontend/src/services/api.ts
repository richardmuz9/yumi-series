import { AIGenerationSettings, GeneratedImage } from '../anime-chara-helper/types';
import { ApiErrors, classifyError, calculateRetryDelay, shouldRetry, getErrorMessage } from '../utils/errorHandling';
import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ModelsResponse,
  AuthResponse,
  User,
  APIError,
  UserBillingInfo
} from './types';
import axios from 'axios';
import { getAuthToken } from '../hooks/useAuth';

// Get the environment
const isDev = import.meta.env.DEV;
const API_BASE = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:3000' : 'http://137.184.89.215:3001');

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Has-Cookie-Credentials': 'include'
  }
});

// Add request interceptor for retries
api.interceptors.request.use(
  config => {
    // Log request details in development
    if (isDev) {
      console.log('[API][Request]', config.method?.toUpperCase(), config.url);
      console.log('[API][Request] URL:', `${API_BASE}${config.url}`);
      console.log('[API][Request] Headers:', config.headers);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for retries
api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    
    // Only retry on network errors or 5xx server errors
    const shouldRetry = (
      !config.retryCount || 
      config.retryCount < 3
    ) && (
      !error.response || 
      (error.response.status >= 500 && error.response.status <= 599)
    );

    if (shouldRetry) {
      config.retryCount = (config.retryCount || 0) + 1;
      const delay = Math.pow(2, config.retryCount - 1) * 500; // Exponential backoff
      
      if (isDev) {
        console.log('[API] Request failed (attempt ' + config.retryCount + '/4):', {
          error: error.message,
          type: error.response ? 'HTTP' : 'NETWORK',
          isRetryable: true
        });
        console.log('[API] Retrying in ' + delay + 'ms...');
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

    if (isDev) {
      console.log('[API][Error]', config.method?.toUpperCase(), config.url, 'failed:', {
        error: error.message,
        type: error.response ? 'HTTP' : 'NETWORK',
        isRetryable: shouldRetry,
        retryCount: config.retryCount
      });
    }

    return Promise.reject(error);
  }
);

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
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
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

  async generateAnimeCharacter(prompt: string, settings: AIGenerationSettings): Promise<GeneratedImage[]> {
    return this.post<GeneratedImage[]>('/api/anime-chara-helper/generate', { prompt, settings });
  }

  async getBillingInfo(): Promise<UserBillingInfo> {
    return this.get<UserBillingInfo>('/api/billing/info');
  }

  async getTokenUsage(): Promise<{
    total: number;
    remaining: number;
    history: Array<{
      date: string;
      amount: number;
      service: string;
    }>;
  }> {
    return this.get('/api/billing/token-usage');
  }
}

// Global API client instance
export const apiClient = new ApiClient();
export const apiService = apiClient;
export const generateAnimeCharacter = (prompt: string, settings: AIGenerationSettings): Promise<GeneratedImage[]> => 
  apiClient.generateAnimeCharacter(prompt, settings);

class AuthService {
  private baseUrl = API_BASE;

  async signup(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('[Auth][Frontend] Starting signup process for:', { email, username });
      
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('[Auth][Frontend] Signup error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('[Auth][Frontend] Starting login process for:', { email });
      
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('[Auth][Frontend] Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('[Auth][Frontend] Logout error:', error);
      return { success: false };
    }
  }

  async getProfile(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No auth token found' };
      }

      const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      return { success: true, user: data.user };
    } catch (error) {
      console.error('[Auth][Frontend] Get profile error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService(); 

export default api; 