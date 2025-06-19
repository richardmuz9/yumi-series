// Billing API service for Yumi-Series pricing (3x markup for sustainable business)
export interface UserBilling {
  id: number
  email: string
  creditsBalance: number // Credits in USD
  totalSpent: number
  qwenTokensUsedMonth: number
  openrouterRequestsUsedToday: number
  subscriptionStatus: 'active' | 'inactive' | 'canceled' | 'past_due'
  subscriptionPlan: string
  monthlyTokensUsed?: number
  dailyTokensUsed?: number
  premiumTokens?: number
  credits: number
  qwenTokensUsed: number
  openrouterRequestsUsed: number
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
  price: number; // in cents
  description: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class BillingApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}/api/billing${endpoint}`
    
    // Include authentication token if available
    const token = localStorage.getItem('authToken')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    }
    
    const response = await fetch(url, {
      headers,
      credentials: 'include',
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getUserBilling(): Promise<UserBilling> {
    try {
      return await this.request<UserBilling>('/user')
    } catch (error) {
      console.warn('Failed to get user billing, using fallback:', error)
      // Return fallback data with updated pricing
      return {
        id: 1,
        email: 'demo@yumi.ai',
        creditsBalance: 5.00, // $5 free credits
        totalSpent: 0,
        qwenTokensUsedMonth: 0,
        openrouterRequestsUsedToday: 0,
        subscriptionStatus: 'inactive',
        subscriptionPlan: 'free',
        monthlyTokensUsed: 0,
        dailyTokensUsed: 0,
        premiumTokens: 0,
        credits: 0,
        qwenTokensUsed: 0,
        openrouterRequestsUsed: 0,
        nextReset: '',
        nextBillingDate: ''
      }
    }
  }

  async getCreditPackages(): Promise<CreditPackage[]> {
    try {
      console.log('📦 Fetching credit packages from API...')
      const packages = await this.request<CreditPackage[]>('/packages')
      console.log('✅ Credit packages fetched:', packages.length, 'packages')
      return packages
    } catch (error) {
      console.warn('❌ Failed to get credit packages from API, using fallback:', error)
      const fallbackPackages = [
        { 
          id: 'credits-20', 
          name: 'Starter Credits', 
          credits: 20, 
          price: 2000,
          description: '$20 - Approximately 800K GPT-4o-mini tokens or 350K GPT-4o tokens',
          recommended: false
        },
        { 
          id: 'credits-50', 
          name: 'Popular Credits', 
          credits: 50, 
          price: 4500,
          description: '$45 - Approximately 2M GPT-4o-mini tokens or 850K GPT-4o tokens',
          recommended: true
        },
        { 
          id: 'credits-100', 
          name: 'Power User Credits', 
          credits: 100, 
          price: 8000,
          description: '$80 - Approximately 4M GPT-4o-mini tokens or 1.7M GPT-4o tokens',
          recommended: false
        },
        { 
          id: 'credits-200', 
          name: 'Professional Credits', 
          credits: 200, 
          price: 14000,
          description: '$140 - Approximately 8M GPT-4o-mini tokens or 3.4M GPT-4o tokens',
          recommended: false
        }
      ]
      console.log('📦 Using fallback packages:', fallbackPackages.length, 'packages')
      return fallbackPackages
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return await this.request<SubscriptionPlan[]>('/subscriptions')
    } catch (error) {
      console.warn('Failed to get subscription plans, using fallback:', error)
      return [
        {
          id: 'monthly-pro',
          name: 'Monthly Pro',
          price: 1000, // $10/month
          tokensPerDay: 35000,
          tokensPerMonth: 1050000,
          description: '35K tokens daily, never run out, premium support',
          benefits: [
            '35,000 tokens every day',
            'Priority processing',
            'Premium model access',
            'Advanced features',
            'Email support',
            'Usage analytics'
          ]
        }
      ]
    }
  }

  async getModelPricing(): Promise<ModelPricing> {
    try {
      return await this.request<ModelPricing>('/model-pricing')
    } catch (error) {
      console.warn('Failed to get model pricing, using fallback:', error)
      return {}
    }
  }

  async checkModelAvailability(provider: string, modelId: string): Promise<ModelAvailability> {
    try {
      return await this.request<ModelAvailability>('/model-check', {
        method: 'POST',
        body: JSON.stringify({ provider, modelId }),
      })
    } catch (error) {
      console.warn('Failed to check model availability:', error)
      return {
        available: true,
        isFree: false,
        reason: 'Unable to verify availability'
      }
    }
  }

  async logTokenUsage(provider: string, modelId: string, inputTokens: number, outputTokens: number): Promise<{
    success: boolean
    cost: number
    usedSubscription?: boolean
    remainingDaily?: number
    remainingCredits: number
  }> {
    try {
      return await this.request('/usage', {
        method: 'POST',
        body: JSON.stringify({ provider, modelId, inputTokens, outputTokens }),
      })
    } catch (error) {
      console.warn('Failed to log token usage:', error)
      return { success: false, cost: 0, remainingCredits: 0 }
    }
  }

  async getTokenPackages(): Promise<TokenPackage[]> {
    try {
      const response = await this.request('/packages') as { packages?: TokenPackage[] };
      return response.packages || [];
    } catch (error) {
      console.warn('Failed to fetch token packages, using fallback');
      return [
        {
          id: 'starter',
          name: 'Starter Credits',
          tokens: 1000000, // 1M tokens
          price: 2000, // $20
          description: '1M API tokens for basic usage'
        },
        {
          id: 'premium',
          name: 'Premium Credits',
          tokens: 5000000, // 5M tokens  
          price: 8000, // $80
          description: '5M API tokens - Best value!'
        },
        {
          id: 'enterprise',
          name: 'Enterprise Credits',
          tokens: 15000000, // 15M tokens
          price: 20000, // $200
          description: '15M API tokens for teams'
        }
      ];
    }
  }

  async createAlipayPayment(packageId: string, successUrl: string): Promise<{ paymentUrl: string }> {
    const response = await this.request('/alipay', {
      method: 'POST',
      body: JSON.stringify({
        packageId,
        successUrl,
        paymentMethod: 'alipay'
      })
    });
    return response as { paymentUrl: string };
  }

  async createCheckoutSession(params: {
    packageId: string;
    paymentMethod: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }> {
    const response = await this.request('/checkout', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return response as { url: string };
  }

  async createPortalSession(returnUrl: string): Promise<{ url: string }> {
    const response = await this.request('/portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl })
    });
    return response as { url: string };
  }

  async createSubscriptionSession(planId: string, successUrl?: string, cancelUrl?: string): Promise<{ url: string }> {
    const response = await this.request('/subscription', {
      method: 'POST',
      body: JSON.stringify({ 
        planId, 
        successUrl: successUrl || `${window.location.origin}/billing-success`,
        cancelUrl: cancelUrl || `${window.location.origin}/billing-cancel`
      })
    });
    return response as { url: string };
  }

  // Helper to calculate estimated tokens for a price (updated for 3x pricing)
  calculateEstimatedTokens(credits: number, model = 'gpt-4o-mini'): number {
    // Updated estimates based on 3x markup pricing
    const estimates: Record<string, number> = {
      'gpt-4o-mini': 1100000, // ~1.1M tokens per dollar (3x higher cost)
      'gpt-4o': 55000, // ~55K tokens per dollar (3x higher cost)
      'gpt-4': 33000, // ~33K tokens per dollar (3x higher cost)
      'claude-3-haiku': 666667, // ~667K tokens per dollar (3x higher cost)
      'claude-3-5-sonnet': 111111, // ~111K tokens per dollar (3x higher cost)
      'claude-3-opus': 33000 // ~33K tokens per dollar (3x higher cost)
    }
    
    return (estimates[model] || estimates['gpt-4o-mini']) * credits
  }

  // Helper to calculate cost for tokens (updated for 3x pricing)
  calculateTokenCost(provider: string, modelId: string, inputTokens: number, outputTokens: number, pricing: ModelPricing): number {
    const providerPricing = pricing[provider]
    if (!providerPricing) return 0
    
    const modelPricing = providerPricing[modelId]
    if (!modelPricing || (modelPricing.inputCost === 0 && modelPricing.outputCost === 0)) return 0
    
    const inputCost = (inputTokens / 1000) * modelPricing.inputCost
    const outputCost = (outputTokens / 1000) * modelPricing.outputCost
    
    return Number((inputCost + outputCost).toFixed(6))
  }
}

export const billingApi = new BillingApi() 