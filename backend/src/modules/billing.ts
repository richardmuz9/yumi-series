import express from 'express'
// @ts-ignore - alipay-sdk doesn't have official types
import AlipaySdk from 'alipay-sdk'
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
  if (process.env.ALIPAY_APP_ID && process.env.ALIPAY_PRIVATE_KEY && process.env.ALIPAY_PUBLIC_KEY) {
    alipaySdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
      gateway: 'https://openapi.alipaydev.com/gateway.do', // sandbox endpoint
    })
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
  openrouter: {
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

// Updated credit packages reflecting higher costs but better value
const creditPackages = [
  { 
    id: 'credits-20', 
    name: 'Starter Credits', 
    credits: 20, 
    price: 2000, // $20
    description: '$20 - Approximately 800K GPT-4o-mini tokens or 350K GPT-4o tokens',
    recommended: false
  },
  { 
    id: 'credits-50', 
    name: 'Popular Credits', 
    credits: 50, 
    price: 4500, // $45 (10% discount)
    description: '$50 - Approximately 2M GPT-4o-mini tokens or 850K GPT-4o tokens',
    recommended: true
  },
  { 
    id: 'credits-100', 
    name: 'Power User Credits', 
    credits: 100, 
    price: 8000, // $80 (20% discount)
    description: '$100 - Approximately 4M GPT-4o-mini tokens or 1.7M GPT-4o tokens',
    recommended: false
  },
  { 
    id: 'credits-200', 
    name: 'Professional Credits', 
    credits: 200, 
    price: 14000, // $140 (30% discount)
    description: '$200 - Approximately 8M GPT-4o-mini tokens or 3.4M GPT-4o tokens',
    recommended: false
  }
]

// Monthly subscription plan
const subscriptionPlans = [
  {
    id: 'monthly-pro',
    name: 'Monthly Pro',
    price: 1000, // $10/month
    tokensPerDay: 35000,
    tokensPerMonth: 1050000, // 35K * 30 days
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

// In-memory user data (replace with database)
let userBillingData: any = {
  1: {
    creditsBalance: 5.00, // $5 free credits (reduced but still generous)
    totalSpent: 0,
    qwenTokensUsedMonth: 0,
    openrouterRequestsUsedToday: 0,
    subscriptionStatus: 'inactive',
    subscriptionPlan: 'free',
    monthlyTokensUsed: 0,
    dailyTokensUsed: 0,
    lastDailyReset: new Date().toISOString().split('T')[0] // Today's date
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

// Routes
router.get('/user', async (req, res) => {
  try {
    const userId = 1 // Default user for demo
    resetDailyTokensIfNeeded(userId)
    
    const billing = userBillingData[userId] || {
      creditsBalance: 5.00,
      totalSpent: 0,
      qwenTokensUsedMonth: 0,
      openrouterRequestsUsedToday: 0,
      subscriptionStatus: 'inactive',
      subscriptionPlan: 'free',
      monthlyTokensUsed: 0,
      dailyTokensUsed: 0
    }
    
    res.json({
      id: userId,
      email: 'demo@yumi.ai',
      ...billing
    })
  } catch (error) {
    console.error('Error fetching user billing:', error)
    res.status(500).json({ error: 'Failed to fetch billing information' })
  }
})

router.get('/packages', async (req, res) => {
  try {
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
        const remainingDaily = 35000 - billing.dailyTokensUsed
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
    const cost = calculateTokenCost(provider, modelId, inputTokens || 0, outputTokens || 0)
    const totalTokens = (inputTokens || 0) + (outputTokens || 0)
    
    if (!userBillingData[userId]) {
      userBillingData[userId] = {
        creditsBalance: 5.00,
        totalSpent: 0,
        qwenTokensUsedMonth: 0,
        openrouterRequestsUsedToday: 0,
        subscriptionStatus: 'inactive',
        subscriptionPlan: 'free',
        monthlyTokensUsed: 0,
        dailyTokensUsed: 0,
        lastDailyReset: new Date().toISOString().split('T')[0]
      }
    }
    
    if (isModelFree(provider, modelId)) {
      // Update free tier usage counters
      if (provider === 'qwen') {
        userBillingData[userId].qwenTokensUsedMonth += totalTokens
      } else if (provider === 'openrouter') {
        userBillingData[userId].openrouterRequestsUsedToday += 1
      }
    } else {
      // For paid models, use subscription tokens first, then credits
      if (userBillingData[userId].subscriptionStatus === 'active') {
        const remainingDaily = 35000 - userBillingData[userId].dailyTokensUsed
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

router.post('/subscribe', async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body
    
    // Mock subscription session for demo
    res.json({
      sessionId: 'demo_subscription',
      url: `${successUrl}?demo=true&plan=${planId}`
    })
  } catch (error) {
    console.error('Error creating subscription session:', error)
    res.status(500).json({ error: 'Failed to create subscription session' })
  }
})

export default router 