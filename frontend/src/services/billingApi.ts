import axios, { AxiosResponse } from 'axios';
import { getAuthToken } from '../hooks/useAuth';
import { BillingInfo } from '../types/billing';

// Get the environment
const isDev = import.meta.env.DEV;
const BILLING_BASE = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:3001' : 'http://137.184.89.215:3001');

const billingApi = axios.create({
  baseURL: BILLING_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Has-Cookie-Credentials': 'include'
  }
});

// Add request interceptor for logging
billingApi.interceptors.request.use(
  config => {
    // Log request details in development
    if (isDev) {
      console.log('[Billing][Request]', config.method?.toUpperCase(), config.url);
      console.log('[Billing][Request] URL:', `${BILLING_BASE}${config.url}`);
      console.log('[Billing][Request] Headers:', config.headers);
  }
  return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for retries
billingApi.interceptors.response.use(
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
        console.log('[Billing] Request failed (attempt ' + config.retryCount + '/4):', {
          error: error.message,
          type: error.response ? 'HTTP' : 'NETWORK',
          isRetryable: true
        });
        console.log('[Billing] Retrying in ' + delay + 'ms...');
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return billingApi(config);
    }

    if (isDev) {
      console.log('[Billing][Error]', config.method?.toUpperCase(), config.url, 'failed:', {
        error: error.message,
        type: error.response ? 'HTTP' : 'NETWORK',
        isRetryable: shouldRetry,
        retryCount: config.retryCount
      });
    }

    return Promise.reject(error);
  }
);

// Billing API service for Yumi-Series pricing (3x markup for sustainable business)
export interface UserBilling {
  id: number
  email: string
  creditsBalance: number // Credits in USD
  totalSpent: number
  qwenTokensUsedMonth: number
  premiumTokensUsedMonth?: number

  subscriptionStatus: 'active' | 'inactive' | 'canceled' | 'past_due'
  subscriptionPlan: string
  monthlyTokensUsed?: number
  dailyTokensUsed?: number
  premiumTokens?: number
  credits: number
  qwenTokensUsed: number
  qwenTokensLeft?: number
  premiumTokensLeft?: number

  nextReset: string
  nextBillingDate?: string
}

export interface CreditPackage {
  id: string
  name: string
  credits: number // USD value
  price: number // Price in cents
  description: string
  recommended: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number // Price in cents
  tokensPerDay: number
  tokensPerMonth: number
  description: string
  benefits: string[]
  interval?: string
}

export interface ModelPricing {
  [provider: string]: {
    [modelId: string]: {
      inputCost: number // Cost per 1K tokens (3x markup)
      outputCost: number // Cost per 1K tokens (3x markup)
      unit: string
      dailyLimit?: number
      monthlyLimit?: number
    }
  }
}

export interface ModelAvailability {
  available: boolean
  isFree: boolean
  reason: string
  suggestion?: string
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  recommended?: boolean;
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  dailyTokens: number;
  features: string[];
}

export interface UserBillingInfo {
  stripeCustomerId: string;
  credits: number;
  subscription: {
    status: 'active' | 'inactive' | 'cancelled';
    plan: 'free' | 'pro';
    nextBillingDate: string;
  };
  freeTokensRemaining?: {
    openai: number;
    claude: number;
    qwen: number;
  };
  premiumPlanId?: string;
  premiumPlanExpiresAt?: string;
  dailyTokensRemaining?: number;
}

export interface PaymentResponse {
  url: string;
}

interface CheckoutResponse {
  url: string;
}

export const getBillingInfo = async (): Promise<BillingInfo> => {
    try {
    const response = await billingApi.get('/api/billing/info');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
      throw error;
    }
};

export const createPaymentSession = async (packageId: string): Promise<string> => {
    try {
    const response = await billingApi.post('/api/billing/create-session', { packageId });
    return response.data.sessionId;
    } catch (error) {
    console.error('Failed to create payment session:', error);
      throw error;
    }
};

export const checkPaymentStatus = async (sessionId: string): Promise<boolean> => {
    try {
    const response = await billingApi.get(`/api/billing/check-session/${sessionId}`);
    return response.data.paid;
    } catch (error) {
    console.error('Failed to check payment status:', error);
    throw error;
    }
};

export const getTokenBalance = async (): Promise<number> => {
    try {
    const response = await billingApi.get('/api/billing/tokens');
    return response.data.balance;
    } catch (error) {
    console.error('Failed to get token balance:', error);
    throw error;
  }
};

export const deductTokens = async (amount: number, reason: string): Promise<number> => {
    try {
    const response = await billingApi.post('/api/billing/deduct', { amount, reason });
    return response.data.newBalance;
    } catch (error) {
    console.error('Failed to deduct tokens:', error);
    throw error;
    }
};

export const addTokens = async (amount: number, reason: string): Promise<number> => {
  try {
    const response = await billingApi.post('/api/billing/add', { amount, reason });
    return response.data.newBalance;
  } catch (error) {
    console.error('Failed to add tokens:', error);
    throw error;
  }
};

export default {
  getBillingInfo,
  createPaymentSession,
  checkPaymentStatus,
  getTokenBalance,
  deductTokens,
  addTokens
}; 