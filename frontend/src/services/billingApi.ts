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
  tokens?: number;
  credits?: number;
  price: number; // in cents
  description: string;
  recommended?: boolean;
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

        subscriptionStatus: 'inactive',
        subscriptionPlan: 'free',
        monthlyTokensUsed: 0,
        dailyTokensUsed: 0,
        premiumTokens: 0,
        credits: 0,
        qwenTokensUsed: 0,

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
          id: 'credits-5', 
          name: 'Starter Pack', 
          credits: 5, 
          price: 500,
          description: '$5 - 300K tokens for basic writing and character design',
          recommended: false
        },
        { 
          id: 'credits-10', 
          name: 'Creative Pack', 
          credits: 10, 
          price: 1000,
          description: '$10 - 700K tokens for regular content creation',
          recommended: true
        },
        { 
          id: 'credits-20', 
          name: 'Professional Pack', 
          credits: 20, 
          price: 2000,
          description: '$20 - 1.8M tokens for serious writers and artists',
          recommended: false
        },
        { 
          id: 'credits-50', 
          name: 'Studio Pack', 
          credits: 50, 
          price: 5000,
          description: '$50 - 4.5M tokens for professional studios',
          recommended: false
        }
      ]
      console.log('📦 Using fallback packages:', fallbackPackages.length, 'packages')
      return fallbackPackages
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      console.log('[BillingApi] Fetching subscription plans...')
      return await this.request<SubscriptionPlan[]>('/subscriptions')
    } catch (error) {
      console.warn('[BillingApi] Failed to get subscription plans, using fallback:', error)
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
      console.log('[BillingApi] Fetching model pricing...')
      return await this.request<ModelPricing>('/model-pricing')
    } catch (error) {
      console.warn('[BillingApi] Failed to get model pricing, using fallback:', error)
      return {}
    }
  }

  async checkModelAvailability(provider: string, modelId: string): Promise<ModelAvailability> {
    try {
      console.log('[BillingApi] Checking model availability:', provider, modelId)
      return await this.request<ModelAvailability>('/model-check', {
        method: 'POST',
        body: JSON.stringify({ provider, modelId }),
      })
    } catch (error) {
      console.warn('[BillingApi] Failed to check model availability:', error)
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
      console.log('[BillingApi] Logging token usage:', { provider, modelId, inputTokens, outputTokens })
      return await this.request('/usage', {
        method: 'POST',
        body: JSON.stringify({ provider, modelId, inputTokens, outputTokens }),
      })
    } catch (error) {
      console.warn('[BillingApi] Failed to log token usage:', error)
      return { success: false, cost: 0, remainingCredits: 0 }
    }
  }

  async getTokenPackages(): Promise<TokenPackage[]> {
    try {
      console.log('[BillingApi] Fetching token packages...')
      const response = await this.request<TokenPackage[] | { packages?: TokenPackage[] }>('/packages')
      
      // Handle both array and object response formats
      const packages = Array.isArray(response) ? response : response.packages || []
      
      // If no packages returned, use fallback
      if (!packages || packages.length === 0) {
        console.warn('[BillingApi] No packages returned from API, using fallback')
        return [
          {
            id: 'basic',
            name: 'Basic Pack',
            tokens: 10000,
            price: 999,
            description: '10K tokens for getting started'
          },
          {
            id: 'pro',
            name: 'Pro Pack',
            tokens: 50000,
            price: 3999,
            description: '50K tokens for regular users',
            recommended: true
          },
          {
            id: 'enterprise',
            name: 'Enterprise Pack',
            tokens: 200000,
            price: 14999,
            description: '200K tokens for power users'
          }
        ]
      }
      
      return packages
    } catch (error) {
      console.warn('[BillingApi] Failed to get token packages, using fallback:', error)
      return [
        {
          id: 'basic',
          name: 'Basic Pack',
          tokens: 10000,
          price: 999,
          description: '10K tokens for getting started'
        },
        {
          id: 'pro',
          name: 'Pro Pack',
          tokens: 50000,
          price: 3999,
          description: '50K tokens for regular users',
          recommended: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise Pack',
          tokens: 200000,
          price: 14999,
          description: '200K tokens for power users'
        }
      ]
    }
  }

  async createAlipayPayment(packageId: string, successUrl: string): Promise<{ paymentUrl: string }> {
    try {
      console.log('[BillingApi] Creating Alipay payment:', { packageId, successUrl })
      const response = await this.request('/alipay', {
        method: 'POST',
        body: JSON.stringify({
          packageId,
          successUrl,
          paymentMethod: 'alipay'
        })
      });
      return response as { paymentUrl: string };
    } catch (error) {
      console.error('[BillingApi] Alipay payment error:', error)
      throw new Error('Failed to create Alipay payment')
    }
  }

  async createCheckoutSession(params: {
    packageId: string;
    paymentMethod: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }> {
    try {
      console.log('[BillingApi] Creating checkout session:', params)
      const response = await this.request('/checkout', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response as { url: string };
    } catch (error) {
      console.error('[BillingApi] Checkout session error:', error)
      throw new Error('Failed to create checkout session')
    }
  }

  async createPortalSession(returnUrl: string): Promise<{ url: string }> {
    try {
      console.log('[BillingApi] Creating portal session:', returnUrl)
      const response = await this.request('/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl })
      });
      return response as { url: string };
    } catch (error) {
      console.error('[BillingApi] Portal session error:', error)
      throw new Error('Failed to create portal session')
    }
  }

  async createSubscriptionSession(planId: string, successUrl?: string, cancelUrl?: string): Promise<{ url: string }> {
    try {
      console.log('[BillingApi] Creating subscription session:', { planId, successUrl, cancelUrl })
      const response = await this.request('/subscription', {
        method: 'POST',
        body: JSON.stringify({ 
          planId, 
          successUrl: successUrl || `${window.location.origin}/billing-success`,
          cancelUrl: cancelUrl || `${window.location.origin}/billing-cancel`
        })
      });
      return response as { url: string };
    } catch (error) {
      console.error('[BillingApi] Subscription session error:', error)
      throw new Error('Failed to create subscription session')
    }
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