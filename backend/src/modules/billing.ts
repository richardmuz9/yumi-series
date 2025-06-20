import express from 'express'
// @ts-ignore - alipay-sdk doesn't have official types
let AlipaySdk: any = null
try {
  if (process.env.NODE_ENV !== 'production') {
    AlipaySdk = require('alipay-sdk').default || require('alipay-sdk')
  }
} catch (error) {
  console.log('ℹ️  Alipay SDK not available (production mode or package not installed)')
}
import {
  authenticateUser,
  AuthRequest,
  TOKEN_PACKAGES,
  SUBSCRIPTION_PLANS,
  createCheckoutSession,
  createSubscriptionSession,
  createPortalSession,
  TokenPackageId,
  db
} from './shared'

// Initialize Alipay SDK if available
let alipaySdk: any = null
try {
  // Only initialize Alipay in production with proper credentials
  if (process.env.NODE_ENV === 'production' && 
      process.env.ALIPAY_APP_ID && 
      process.env.ALIPAY_PRIVATE_KEY && 
      process.env.ALIPAY_PUBLIC_KEY &&
      AlipaySdk) {
    alipaySdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
      gateway: 'https://openapi.alipaydev.com/gateway.do', // sandbox endpoint
    })
    console.log('✅ Alipay SDK initialized successfully')
  } else {
    console.log('ℹ️  Alipay SDK not initialized (missing credentials or development mode)')
  }
} catch (error) {
  console.warn('Alipay SDK initialization failed - payments will be limited:', error)
}

const router = express.Router()

// Yumi-Series pricing - 3x markup over original API costs for sustainable business
const modelPricing = {
  openai: {
    'gpt-4': { inputCost: 0.09, outputCost: 0.18, unit: '1K tokens' }, // 3x of $30/$60 per 1M tokens
    'gpt-4-turbo': { inputCost: 0.03, outputCost: 0.09, unit: '1K tokens' }, // 3x of $10/$30 per 1M tokens
    'gpt-4o': { inputCost: 0.015, outputCost: 0.045, unit: '1K tokens' }, // 3x of $5/$15 per 1M tokens  
    'gpt-4o-mini': { inputCost: 0.00045, outputCost: 0.0018, unit: '1K tokens' }, // 3x of $0.15/$0.60 per 1M tokens
    'gpt-3.5-turbo': { inputCost: 0.0015, outputCost: 0.0045, unit: '1K tokens' } // 3x of $0.50/$1.50 per 1M tokens
  },
  claude: {
    'claude-3-opus-20240229': { inputCost: 0.045, outputCost: 0.225, unit: '1K tokens' }, // 3x of $15/$75 per 1M tokens
    'claude-3-5-sonnet-20240620': { inputCost: 0.009, outputCost: 0.045, unit: '1K tokens' }, // 3x of $3/$15 per 1M tokens
    'claude-3-sonnet-20240229': { inputCost: 0.009, outputCost: 0.045, unit: '1K tokens' }, // 3x of $3/$15 per 1M tokens
    'claude-3-haiku-20240307': { inputCost: 0.00075, outputCost: 0.00375, unit: '1K tokens' }, // 3x of $0.25/$1.25 per 1M tokens
    'claude-sonnet-4-20250514': { inputCost: 0.009, outputCost: 0.045, unit: '1K tokens' }, // 3x of $3/$15 per 1M tokens
    'claude-opus-4-20250514': { inputCost: 0.045, outputCost: 0.225, unit: '1K tokens' } // 3x of $15/$75 per 1M tokens
  },
        // openrouter: { // REMOVED
    // Free models with daily limits (still free to provide value)
    'google/gemini-2.5-pro': { inputCost: 0, outputCost: 0, unit: 'free', dailyLimit: 50 },
    'google/gemini-2.5-pro-vision': { inputCost: 0, outputCost: 0, unit: 'free', dailyLimit: 50 },
    'google/gemini-2.5-pro-preview': { inputCost: 0, outputCost: 0, unit: 'free', dailyLimit: 50 },
    'meta-llama/llama-3-70b-instruct': { inputCost: 0, outputCost: 0, unit: 'free', dailyLimit: 50 },
    'meta-llama/llama-3-8b-instruct': { inputCost: 0, outputCost: 0, unit: 'free', dailyLimit: 50 },
    'mistralai/mistral-7b-instruct': { inputCost: 0, outputCost: 0, unit: 'free', dailyLimit: 50 },
    'mistralai/mixtral-8x7b-instruct': { inputCost: 0, outputCost: 0, unit: 'free', dailyLimit: 50 },
    'microsoft/wizardlm-2-8x22b': { inputCost: 0, outputCost: 0, unit: 'free', dailyLimit: 50 }
  },
  qwen: {
    // Free models with monthly token limits (still free to provide value)
    'qwen-turbo': { inputCost: 0, outputCost: 0, unit: 'free', monthlyLimit: 1000000 },
    'qwen-plus': { inputCost: 0, outputCost: 0, unit: 'free', monthlyLimit: 1000000 },
    'qwen-max': { inputCost: 0, outputCost: 0, unit: 'free', monthlyLimit: 1000000 },
    'qwen-vl-plus': { inputCost: 0, outputCost: 0, unit: 'free', monthlyLimit: 1000000 },
    'qwen-vl-max': { inputCost: 0, outputCost: 0, unit: 'free', monthlyLimit: 1000000 },
    // Paid models with 3x markup
    'deepseek/deepseek-chat': { inputCost: 0.0003, outputCost: 0.0006, unit: '1K tokens' },
    'deepseek/deepseek-coder': { inputCost: 0.0003, outputCost: 0.0006, unit: '1K tokens' }
  }
}

// Updated credit packages reflecting the new token structure
const creditPackages = [
  { 
    id: 'credits-1', 
    name: 'Micro Pack', 
    credits: 1, 
    price: 100, // $1
    tokens: 50000,
    description: '$1 - 50K tokens for basic testing',
    recommended: false
  },
  { 
    id: 'credits-5', 
    name: 'Starter Pack', 
    credits: 5, 
    price: 500, // $5
    tokens: 300000,
    description: '$5 - 300K tokens for light usage',
    recommended: false
  },
  { 
    id: 'credits-10', 
    name: 'Popular Pack', 
    credits: 10, 
    price: 1000, // $10
    tokens: 700000,
    description: '$10 - 700K tokens for regular use',
    recommended: true
  },
  { 
    id: 'credits-15', 
    name: 'Professional Pack', 
    credits: 15, 
    price: 1500, // $15
    tokens: 1200000,
    description: '$15 - 1.2M tokens for power users',
    recommended: false
  },
  { 
    id: 'credits-20', 
    name: 'Power Pack', 
    credits: 20, 
    price: 2000, // $20
    tokens: 1800000,
    description: '$20 - 1.8M tokens for heavy usage',
    recommended: false
  },
  { 
    id: 'credits-50', 
    name: 'Enterprise Pack', 
    credits: 50, 
    price: 5000, // $50
    tokens: 4500000,
    description: '$50 - 4.5M tokens for teams',
    recommended: false
  },
  { 
    id: 'credits-100', 
    name: 'Ultimate Pack', 
    credits: 100, 
    price: 10000, // $100
    tokens: 10000000,
    description: '$100 - 10M tokens for enterprise',
    recommended: false
  }
]

// Monthly subscription plan with polish writing and study advisor access
const subscriptionPlans = [
  {
    id: 'monthly-pro',
    name: 'Monthly Pro',
    price: 1000, // $10/month
    tokensPerDay: 33000, // ~1M tokens per month (33K * 30 days)
    tokensPerMonth: 1000000,
    description: '33K tokens daily + Polish Writing + Study Advisor access',
    benefits: [
      '33,000 tokens every day',
      'Polish Writing & Study Advisor',
      'Priority processing',
      'Premium model access',
      'Advanced features',
      'Email support',
      'Usage analytics'
    ]
  }
]

// In-memory user data (replace with database)
let userBillingData: any = {
  1: {
    creditsBalance: 5.00, // $5 free credits for paid models
    totalSpent: 0,
    qwenTokensUsedMonth: 0, // Track free Qwen usage (1M/month limit)
    premiumTokensUsedMonth: 0, // Track paid model usage (10K/month free)
    subscriptionStatus: 'inactive',
    subscriptionPlan: 'free',
    monthlyTokensUsed: 0,
    dailyTokensUsed: 0,
    lastDailyReset: new Date().toISOString().split('T')[0], // Today's date
    lastMonthlyReset: new Date().toISOString().substring(0, 7) // Current month (YYYY-MM)
  }
}

// Helper functions
function isModelFree(provider: string, modelId: string): boolean {
  const providerModels = modelPricing[provider as keyof typeof modelPricing] as any
  if (!providerModels) return false
  
  const model = providerModels[modelId]
  return model?.inputCost === 0 && model?.outputCost === 0
}

function calculateTokenCost(provider: string, modelId: string, inputTokens: number, outputTokens: number): number {
  const providerModels = modelPricing[provider as keyof typeof modelPricing] as any
  if (!providerModels) return 0
  
  const model = providerModels[modelId]
  if (!model || (model.inputCost === 0 && model.outputCost === 0)) return 0
  
  // Calculate cost based on actual input/output tokens with 3x markup
  const inputCost = (inputTokens / 1000) * model.inputCost
  const outputCost = (outputTokens / 1000) * model.outputCost
  
  return Number((inputCost + outputCost).toFixed(6)) // Return cost in dollars
}

function resetDailyTokensIfNeeded(userId: number) {
  const user = userBillingData[userId]
  if (!user) return
  
  const today = new Date().toISOString().split('T')[0]
  if (user.lastDailyReset !== today) {
    user.dailyTokensUsed = 0
    user.lastDailyReset = today
  }
}

function resetMonthlyTokensIfNeeded(userId: number) {
  const user = userBillingData[userId]
  if (!user) return
  
  const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
  if (user.lastMonthlyReset !== currentMonth) {
    user.qwenTokensUsedMonth = 0
    user.premiumTokensUsedMonth = 0
    user.lastMonthlyReset = currentMonth
  }
}

// Routes
router.get('/user', async (req, res) => {
  try {
    const userId = 1 // Default user for demo
    resetDailyTokensIfNeeded(userId)
    resetMonthlyTokensIfNeeded(userId)
    
    const billing = userBillingData[userId] || {
      creditsBalance: 5.00,
      totalSpent: 0,
      qwenTokensUsedMonth: 0,
      premiumTokensUsedMonth: 0,
      subscriptionStatus: 'inactive',
      subscriptionPlan: 'free',
      monthlyTokensUsed: 0,
      dailyTokensUsed: 0,
      lastDailyReset: new Date().toISOString().split('T')[0],
      lastMonthlyReset: new Date().toISOString().substring(0, 7)
    }
    
    // Calculate remaining tokens for free tiers
    const qwenTokensLeft = Math.max(0, 1000000 - billing.qwenTokensUsedMonth)
    const premiumTokensLeft = Math.max(0, 10000 - billing.premiumTokensUsedMonth)
    
    res.json({
      id: userId,
      email: 'demo@yumi.ai',
      qwenTokensLeft,
      premiumTokensLeft,
      ...billing
    })
  } catch (error) {
    console.error('Error fetching user billing:', error)
    res.status(500).json({ error: 'Failed to fetch billing information' })
  }
})

router.get('/packages', async (req, res) => {
  try {
    console.log('📦 Fetching credit packages, count:', creditPackages.length)
    res.json(creditPackages)
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    res.status(500).json({ error: 'Failed to fetch credit packages' })
  }
})

router.get('/subscriptions', async (req, res) => {
  try {
    res.json(subscriptionPlans)
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    res.status(500).json({ error: 'Failed to fetch subscription plans' })
  }
})

router.get('/model-pricing', async (req, res) => {
  try {
    res.json(modelPricing)
  } catch (error) {
    console.error('Error fetching model pricing:', error)
    res.status(500).json({ error: 'Failed to fetch model pricing' })
  }
})

router.post('/model-check', async (req, res) => {
  try {
    const { provider, modelId } = req.body
    const userId = 1
    
    resetDailyTokensIfNeeded(userId)
    const billing = userBillingData[userId]
    const isFree = isModelFree(provider, modelId)
    
    if (isFree) {
      const providerModels = modelPricing[provider as keyof typeof modelPricing] as any
      const model = providerModels?.[modelId]
      
      res.json({
        available: true,
        isFree: true,
        reason: `Free model - ${model?.dailyLimit ? `within daily limit (${model.dailyLimit} requests/day)` : 'within provider limits'}`
      })
    } else {
      // Check subscription tokens first
      if (billing.subscriptionStatus === 'active') {
        const remainingDaily = 33000 - billing.dailyTokensUsed
        if (remainingDaily > 0) {
          res.json({
            available: true,
            isFree: false,
            reason: `Subscription active - ${remainingDaily} tokens remaining today`
          })
          return
        }
      }
      
      // Check credit balance
      if (billing.creditsBalance <= 0) {
        res.json({
          available: false,
          isFree: false,
          reason: 'No credits available',
          suggestion: 'Purchase credits or upgrade to Monthly Pro subscription'
        })
      } else {
        res.json({
          available: true,
          isFree: false,
          reason: `Credits available - $${billing.creditsBalance.toFixed(2)} balance`
        })
      }
    }
  } catch (error) {
    console.error('Error checking model availability:', error)
    res.status(500).json({ error: 'Failed to check model availability' })
  }
})

router.post('/usage', async (req, res) => {
  try {
    const { provider, modelId, inputTokens, outputTokens } = req.body
    const userId = 1
    
    resetDailyTokensIfNeeded(userId)
    resetMonthlyTokensIfNeeded(userId)
    const cost = calculateTokenCost(provider, modelId, inputTokens || 0, outputTokens || 0)
    const totalTokens = (inputTokens || 0) + (outputTokens || 0)
    
    if (!userBillingData[userId]) {
      userBillingData[userId] = {
        creditsBalance: 5.00,
        totalSpent: 0,
        qwenTokensUsedMonth: 0,
        premiumTokensUsedMonth: 0,
        subscriptionStatus: 'inactive',
        subscriptionPlan: 'free',
        monthlyTokensUsed: 0,
        dailyTokensUsed: 0,
        lastDailyReset: new Date().toISOString().split('T')[0],
        lastMonthlyReset: new Date().toISOString().substring(0, 7)
      }
    }
    
    if (isModelFree(provider, modelId)) {
      // Update free tier usage counters
      if (provider === 'qwen') {
        // Check monthly limit for Qwen (1M tokens)
        if (userBillingData[userId].qwenTokensUsedMonth + totalTokens > 1000000) {
          return res.status(429).json({ 
            error: 'Monthly limit exceeded for Qwen models',
            limit: 1000000,
            used: userBillingData[userId].qwenTokensUsedMonth,
            remaining: Math.max(0, 1000000 - userBillingData[userId].qwenTokensUsedMonth)
          })
        }
        userBillingData[userId].qwenTokensUsedMonth += totalTokens
      } else {
        // For other paid models, check the 10K monthly free limit
        if (userBillingData[userId].premiumTokensUsedMonth + totalTokens > 10000) {
          return res.status(429).json({ 
            error: 'Monthly free limit exceeded for premium models',
            limit: 10000,
            used: userBillingData[userId].premiumTokensUsedMonth,
            remaining: Math.max(0, 10000 - userBillingData[userId].premiumTokensUsedMonth)
          })
        }
        userBillingData[userId].premiumTokensUsedMonth += totalTokens
      }
    } else {
      // For paid models, use subscription tokens first, then credits
      if (userBillingData[userId].subscriptionStatus === 'active') {
        const remainingDaily = 33000 - userBillingData[userId].dailyTokensUsed
        if (remainingDaily >= totalTokens) {
          // Use subscription tokens
          userBillingData[userId].dailyTokensUsed += totalTokens
          userBillingData[userId].monthlyTokensUsed += totalTokens
          res.json({ 
            success: true, 
            cost: 0, 
            usedSubscription: true,
            remainingDaily: remainingDaily - totalTokens,
            remainingCredits: userBillingData[userId].creditsBalance 
          })
          return
        }
      }
      
      // Deduct credits for paid models
      userBillingData[userId].creditsBalance = Math.max(0, userBillingData[userId].creditsBalance - cost)
      userBillingData[userId].totalSpent += cost
    }
    
    res.json({ 
      success: true, 
      cost, 
      usedSubscription: false,
      remainingCredits: userBillingData[userId].creditsBalance 
    })
  } catch (error) {
    console.error('Error logging token usage:', error)
    res.status(500).json({ error: 'Failed to log token usage' })
  }
})

// Mock payment endpoints
router.post('/checkout', async (req, res) => {
  try {
    const { packageId, successUrl, cancelUrl } = req.body
    
    // Mock checkout session for demo
    res.json({
      sessionId: 'demo_session',
      url: `${successUrl}?demo=true&package=${packageId}`
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

router.post('/subscription', async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body
    
    console.log('🔄 Creating subscription session:', { planId, successUrl, cancelUrl })
    
    // Mock subscription session for demo
    const response = {
      sessionId: 'demo_subscription',
      url: `${successUrl}?demo=true&plan=${planId}`
    }
    
    console.log('✅ Subscription session created:', response)
    res.json(response)
  } catch (error) {
    console.error('Error creating subscription session:', error)
    res.status(500).json({ error: 'Failed to create subscription session' })
  }
})

export default router 