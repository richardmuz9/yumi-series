import React, { useState, useEffect } from 'react'
import { billingApi, type UserBilling } from '../services/billingApi'

interface BillingStatusProps {
  compact?: boolean
}

const BillingStatus: React.FC<BillingStatusProps> = ({ compact = false }) => {
  const [userBilling, setUserBilling] = useState<UserBilling | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const billing = await billingApi.getUserBilling()
      setUserBilling(billing)
    } catch (error) {
      console.error('Failed to load billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTokens = (tokens: number | undefined) => {
    if (!tokens && tokens !== 0) return '0'
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`
    }
    return tokens.toString()
  }

  const calculateResetDays = () => {
    if (!userBilling?.nextReset) return null
    const resetDate = new Date(userBilling.nextReset)
    const now = new Date()
    const diffTime = resetDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="billing-status loading">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="billing-status compact">
        <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="text-xs text-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">🎉 Free Models</span>
              <span className="text-green-600 font-medium">Unlimited</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">⚡ Premium</span>
              <span className="text-blue-600 font-medium">
                {userBilling ? formatTokens(userBilling.premiumTokens) : '10K'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const resetDays = calculateResetDays()

  return (
    <div className="billing-status full">
      <div className="space-y-3">
        {/* Free Models Section */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              🎉 Free Models Available
            </h4>
            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
              Unlimited
            </span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <div>• Qwen Turbo, Plus, Max (1M tokens/month each)</div>
            <div>• Gemini 2.5 Pro, Llama 3, Mistral (50 requests/day each)</div>
            <div>• No premium tokens required</div>
          </div>
        </div>

        {/* Premium Tokens Section */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
              ⚡ Premium Model Tokens
            </h4>
            <span className="text-lg font-bold text-blue-600">
              {userBilling ? formatTokens(userBilling.premiumTokens) : '10K'}
            </span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• GPT-4, Claude Opus, advanced models</div>
            <div>• Free tier: 10,000 tokens/month</div>
            {resetDays && resetDays > 0 && (
              <div>• Resets in {resetDays} day{resetDays !== 1 ? 's' : ''}</div>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        {userBilling && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-700 mb-2">Current Usage</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Qwen Usage</div>
                <div className="font-medium">
                  {formatTokens(userBilling.qwenTokensUsed)} / 1M
                </div>
              </div>
              <div>
                <div className="text-gray-600">OpenRouter</div>
                <div className="font-medium">
                  {userBilling.openrouterRequestsUsed} / 50 req
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BillingStatus 