// Billing utilities for Yumi-Series pricing (3x markup for sustainable business)
import type { UserBilling, ModelPricing } from '../services/billingApi'

export interface ModelUsageEstimate {
  model: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
  canAfford: boolean
}

export interface TokenEstimate {
  inputTokens: number
  outputTokens: number
  estimatedCost: number
}

// Updated pricing calculations for 3x markup
export function calculateTokenCost(
  provider: string,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  pricing: ModelPricing
): number {
  const providerPricing = pricing[provider]
  if (!providerPricing) return 0
  
  const modelPricing = providerPricing[modelId]
  if (!modelPricing || (modelPricing.inputCost === 0 && modelPricing.outputCost === 0)) return 0
  
  // Calculate cost per 1K tokens with 3x markup
  const inputCost = (inputTokens / 1000) * modelPricing.inputCost
  const outputCost = (outputTokens / 1000) * modelPricing.outputCost
  
  return Number((inputCost + outputCost).toFixed(6))
}

export function estimateUsageCosts(
  models: Array<{ provider: string; modelId: string; inputTokens: number; outputTokens: number }>,
  pricing: ModelPricing,
  billing: UserBilling
): ModelUsageEstimate[] {
  return models.map(({ provider, modelId, inputTokens, outputTokens }) => {
    const estimatedCost = calculateTokenCost(provider, modelId, inputTokens, outputTokens, pricing)
    
    // Check if user can afford this usage
    let canAfford = true
    
    // If user has active subscription, check daily tokens
    if (billing.subscriptionStatus === 'active') {
      const remainingDaily = 35000 - (billing.dailyTokensUsed || 0)
      const totalTokens = inputTokens + outputTokens
      canAfford = remainingDaily >= totalTokens || billing.creditsBalance >= estimatedCost
    } else {
      canAfford = billing.creditsBalance >= estimatedCost
    }
    
    return {
      model: `${provider}/${modelId}`,
      inputTokens,
      outputTokens,
      estimatedCost,
      canAfford
    }
  })
}

// Helper to format cost with 3x pricing in mind
export function formatCost(cost: number): string {
  if (cost === 0) return 'Free'
  if (cost < 0.001) return '<$0.001'
  return `$${cost.toFixed(3)}`
}

// Helper to format token counts
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}

// Helper to format credits
export function formatCredits(credits: number | undefined): string {
  if (!credits && credits !== 0) return '$0.00'
  return `$${credits.toFixed(2)}`
}

// Estimate tokens from text length (rough approximation)
export function estimateTokens(text: string): number {
  // Rough approximation: 4 characters per token
  return Math.ceil(text.length / 4)
}

// Estimate conversation cost
export function estimateConversationCost(
  provider: string,
  modelId: string,
  inputText: string,
  expectedOutputLength = 500, // characters
  pricing: ModelPricing
): TokenEstimate {
  const inputTokens = estimateTokens(inputText)
  const outputTokens = estimateTokens('x'.repeat(expectedOutputLength))
  const estimatedCost = calculateTokenCost(provider, modelId, inputTokens, outputTokens, pricing)
  
  return {
    inputTokens,
    outputTokens,
    estimatedCost
  }
}

// Updated to reflect subscription plan value
export function getFreeTierSummary(billing: UserBilling): {
  qwenTokensLeft: number
  creditsBalance: number
  subscriptionStatus: string
  dailyTokensLeft?: number
  totalValue: string
} {
  return {
    qwenTokensLeft: Math.max(0, 1000000 - billing.qwenTokensUsedMonth),
    creditsBalance: billing.creditsBalance,
    subscriptionStatus: billing.subscriptionStatus,
    dailyTokensLeft: billing.subscriptionStatus === 'active' ? 
      Math.max(0, 35000 - (billing.dailyTokensUsed || 0)) : undefined,
    totalValue: billing.subscriptionStatus === 'active' ? 
      '$40+/month value' : '$35+/month value' // Higher value with new pricing
  }
}

// Updated recommendations for higher pricing
export function getUsageRecommendations(billing: UserBilling, pricing: ModelPricing): Array<{
  type: 'warning' | 'info' | 'success'
  message: string
  action?: string
}> {
  const recommendations: Array<{
    type: 'warning' | 'info' | 'success'
    message: string
    action?: string
  }> = []

  // Subscription recommendations
  if (billing.subscriptionStatus === 'inactive' && billing.creditsBalance < 5) {
    recommendations.push({
      type: 'warning',
      message: 'Low credits! Consider Monthly Pro ($10/month) for 35K tokens daily and unlimited access.',
      action: 'upgrade-subscription'
    })
  }

  if (billing.subscriptionStatus === 'active') {
    const dailyUsed = billing.dailyTokensUsed || 0
    const dailyRemaining = 35000 - dailyUsed
    
    if (dailyRemaining < 5000) {
      recommendations.push({
        type: 'warning',
        message: `Only ${formatTokenCount(dailyRemaining)} subscription tokens left today. Purchases may use credits.`,
        action: 'monitor-usage'
      })
    } else {
      recommendations.push({
        type: 'success',
        message: `Subscription active! ${formatTokenCount(dailyRemaining)} tokens remaining today.`
      })
    }
  }

  // Free tier usage
  const qwenLeft = Math.max(0, 1000000 - billing.qwenTokensUsedMonth)

  if (qwenLeft < 100000) {
    recommendations.push({
      type: 'info',
      message: `${formatTokenCount(qwenLeft)} Qwen tokens left this month. Consider premium models for unlimited access.`
    })
  }

  // Model efficiency tips for higher pricing
  if (billing.creditsBalance < 10 && billing.subscriptionStatus === 'inactive') {
    recommendations.push({
      type: 'info',
      message: 'Pro tip: Use GPT-4o-mini for most tasks (3x cheaper than GPT-4o) and save premium models for complex work.'
    })
  }

  return recommendations
}

// Updated cost breakdown for new pricing
export function getCostBreakdown(provider: string, modelId: string, pricing: ModelPricing): {
  inputCostPer1K: number
  outputCostPer1K: number
  averageCostPer1K: number
  costPer1M: number
  isAffordable: 'budget' | 'moderate' | 'premium'
} | null {
  const providerPricing = pricing[provider]
  if (!providerPricing) return null
  
  const modelPricing = providerPricing[modelId]
  if (!modelPricing) return null
  
  const inputCostPer1K = modelPricing.inputCost
  const outputCostPer1K = modelPricing.outputCost
  const averageCostPer1K = (inputCostPer1K + outputCostPer1K) / 2
  const costPer1M = averageCostPer1K * 1000
  
  // Categorize affordability based on 3x pricing
  let isAffordable: 'budget' | 'moderate' | 'premium'
  if (costPer1M < 3) {
    isAffordable = 'budget'
  } else if (costPer1M < 30) {
    isAffordable = 'moderate'  
  } else {
    isAffordable = 'premium'
  }
  
  return {
    inputCostPer1K,
    outputCostPer1K,
    averageCostPer1K,
    costPer1M,
    isAffordable
  }
}

// Check if model is free
export function isModelFree(provider: string, modelId: string, pricing: ModelPricing): boolean {
  const providerPricing = pricing[provider]
  if (!providerPricing) return false
  
  const modelPricing = providerPricing[modelId]
  return modelPricing?.inputCost === 0 && modelPricing?.outputCost === 0
}

// Get cost color for UI
export function getCostColor(cost: number): string {
  if (cost === 0) return 'text-green-600'
  if (cost < 0.01) return 'text-blue-600'
  if (cost < 0.1) return 'text-yellow-600'
  return 'text-red-600'
}

// Get model efficiency rating
export function getModelEfficiency(provider: string, modelId: string, pricing: ModelPricing): 'free' | 'budget' | 'moderate' | 'premium' {
  if (isModelFree(provider, modelId, pricing)) return 'free'
  
  const breakdown = getCostBreakdown(provider, modelId, pricing)
  if (!breakdown) return 'moderate'
  
  return breakdown.isAffordable
}

// Calculate estimated tokens for credits (updated for 3x pricing)
export function calculateEstimatedTokens(credits: number, model = 'gpt-4o-mini'): number {
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

// Get model display name
export function getModelDisplayName(modelId: string): string {
  const modelNames: Record<string, string> = {
    'gpt-4': 'GPT-4',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o mini',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3-5-sonnet-20240620': 'Claude 3.5 Sonnet',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
    'claude-3-haiku-20240307': 'Claude 3 Haiku',
    'claude-sonnet-4-20250514': 'Claude 4 Sonnet',
    'claude-opus-4-20250514': 'Claude 4 Opus',
    'google/gemini-2.5-pro': 'Gemini 2.5 Pro',
    'google/gemini-2.5-pro-vision': 'Gemini 2.5 Pro Vision',
    'google/gemini-2.5-pro-preview': 'Gemini 2.5 Pro Preview',
    'meta-llama/llama-3-70b-instruct': 'Llama 3 70B',
    'meta-llama/llama-3-8b-instruct': 'Llama 3 8B',
    'mistralai/mistral-7b-instruct': 'Mistral 7B',
    'mistralai/mixtral-8x7b-instruct': 'Mixtral 8x7B',
    'microsoft/wizardlm-2-8x22b': 'WizardLM 2 8x22B',
    'qwen-turbo': 'Qwen Turbo',
    'qwen-plus': 'Qwen Plus',
    'qwen-max': 'Qwen Max',
    'qwen-vl-plus': 'Qwen VL Plus',
    'qwen-vl-max': 'Qwen VL Max',
    'deepseek/deepseek-chat': 'DeepSeek Chat',
    'deepseek/deepseek-coder': 'DeepSeek Coder'
  }
  
  return modelNames[modelId] || modelId
}

// Get provider info
export function getProviderInfo(provider: string): { name: string; icon: string; color: string } {
  const providers: Record<string, { name: string; icon: string; color: string }> = {
    openai: { name: 'OpenAI', icon: '🤖', color: 'purple' },
    claude: { name: 'Claude', icon: '🧠', color: 'orange' },
    qwen: { name: 'Qwen', icon: '🚀', color: 'blue' },
  }
  
  return providers[provider as keyof typeof providers] || { name: provider, icon: '⚡', color: 'gray' }
}

export interface UsageStatistics {
  totalRequests: number
  openaiRequestsLeft: number
  claudeRequestsLeft: number
  qwenRequestsLeft: number
  providerLimits: {
    openai: number
    claude: number
    qwen: number
  }
}

export const PROVIDER_METADATA = {
  openai: { name: 'OpenAI', icon: '🤖', color: 'purple' },
  claude: { name: 'Claude', icon: '🧠', color: 'orange' },
  qwen: { name: 'Qwen', icon: '🚀', color: 'blue' },
} as const
