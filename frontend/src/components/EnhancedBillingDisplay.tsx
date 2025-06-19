import React, { useState, useEffect } from 'react'
import { billingApi, type UserBilling, type CreditPackage, type ModelPricing, type SubscriptionPlan } from '../services/billingApi'
import './ChargePage.css'

interface EnhancedBillingDisplayProps {
  isOpen: boolean
  onClose: () => void
}

export function EnhancedBillingDisplay({ isOpen, onClose }: EnhancedBillingDisplayProps) {
  const [billing, setBilling] = useState<UserBilling | null>(null)
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [modelPricing, setModelPricing] = useState<ModelPricing>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'credits' | 'subscription' | 'pricing'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadBillingData()
    }
  }, [isOpen])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      const [billingData, packages, subscriptions, pricing] = await Promise.all([
        billingApi.getUserBilling(),
        billingApi.getCreditPackages(),
        billingApi.getSubscriptionPlans(),
        billingApi.getModelPricing()
      ])
      
      setBilling(billingData)
      setCreditPackages(packages)
      setSubscriptionPlans(subscriptions)
      setModelPricing(pricing)
    } catch (error) {
      console.error('Failed to load billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseCredits = async (packageId: string) => {
    try {
      const { url } = await billingApi.createCheckoutSession({
        packageId,
        paymentMethod: 'card',
        successUrl: `${window.location.origin}/billing-success`,
        cancelUrl: `${window.location.origin}/billing-cancel`
      })
      window.open(url, '_blank')
    } catch (error) {
      console.error('Failed to create checkout session:', error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      const { url } = await billingApi.createSubscriptionSession(planId)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Failed to create subscription session:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Yumi-Series Billing Center
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-4">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'credits', label: 'Buy Credits' },
              { id: 'subscription', label: 'Monthly Pro' },
              { id: 'pricing', label: 'Model Pricing' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-4 h-[calc(100%-8rem)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Current Balance */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Current Balance
                        </h3>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                          ${billing?.creditsBalance?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Credits • Real API token pricing with 3x fair markup
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {billing?.subscriptionStatus === 'active' ? (
                            <div className="space-y-1">
                              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                                Monthly Pro Active
                              </div>
                              <div className="text-xs">
                                {Math.max(0, 35000 - (billing?.dailyTokensUsed || 0)).toLocaleString()} tokens left today
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                              Free tier only
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Free Tier Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 dark:text-green-300">Qwen Models</h4>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.max(0, 1000000 - (billing?.qwenTokensUsedMonth || 0)).toLocaleString()}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">tokens left this month</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-300">OpenRouter</h4>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.max(0, 50 - (billing?.openrouterRequestsUsedToday || 0))}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">requests left today</p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 dark:text-purple-300">Total Value</h4>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {billing?.subscriptionStatus === 'active' ? '$40+' : '$35+'}
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">per month completely free</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setActiveTab('credits')}
                      className="p-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 dark:text-white">Buy Credits</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Pay-as-you-go for premium models
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          Starting from $20 • 3x markup for sustainability
                        </p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setActiveTab('subscription')}
                      className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-600 rounded-lg hover:border-green-300 dark:hover:border-green-500 transition-colors"
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 dark:text-white">Monthly Pro</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          35K tokens daily • Never run out
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Only $10/month • Best value
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Credits Tab */}
              {activeTab === 'credits' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Credit Packages
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Pay-as-you-go with 3x markup for sustainable business • Fair API token pricing
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {creditPackages.map(pkg => (
                      <div 
                        key={pkg.id}
                        className={`relative p-6 rounded-lg border-2 ${
                          pkg.recommended 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      >
                        {pkg.recommended && (
                          <div className="absolute -top-3 left-6">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Most Popular
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{pkg.name}</h4>
                          <div className="mt-2">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              ${(pkg.price / 100).toFixed(0)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {pkg.description}
                          </p>
                          <button
                            onClick={() => handlePurchaseCredits(pkg.id)}
                            className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${
                              pkg.recommended
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white'
                            }`}
                          >
                            Purchase Credits
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      <strong>Why 3x markup?</strong> As an individual developer in Japan facing high taxes (40%+) without investors, 
                      sustainable pricing ensures long-term service quality and support.
                    </p>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Monthly Pro Subscription
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Never run out of tokens • Best value for regular users
                    </p>
                  </div>

                  {subscriptionPlans.map(plan => (
                    <div key={plan.id} className="max-w-md mx-auto">
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-200 dark:border-green-600 p-8">
                        <div className="text-center">
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                          <div className="mt-4">
                            <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                              ${(plan.price / 100).toFixed(0)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">/month</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {plan.description}
                          </p>
                        </div>

                        <div className="mt-6 space-y-3">
                          {plan.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center">
                              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{benefit}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handleSubscribe(plan.id)}
                          className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                          {billing?.subscriptionStatus === 'active' ? 'Manage Subscription' : 'Subscribe Now'}
                        </button>
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Value:</strong> At 3x markup, $10/month gives you tokens worth $30+ in usage. 
                          Perfect for daily AI use without worrying about costs.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing Tab */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Model Pricing Guide
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Transparent pricing with 3x markup • Input/Output costs per 1K tokens
                    </p>
                  </div>

                  {Object.entries(modelPricing).map(([provider, models]) => (
                    <div key={provider} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                          {provider} Models
                        </h4>
                      </div>
                      <div className="p-4">
                        <div className="grid gap-3">
                          {Object.entries(models as any).map(([modelId, pricing]: [string, any]) => (
                            <div key={modelId} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                  {modelId}
                                </span>
                                {pricing.dailyLimit && (
                                  <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                                    {pricing.dailyLimit} requests/day free
                                  </span>
                                )}
                                {pricing.monthlyLimit && (
                                  <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                                    {(pricing.monthlyLimit / 1000000).toFixed(1)}M tokens/month free
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                {pricing.inputCost === 0 && pricing.outputCost === 0 ? (
                                  <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                                    Free
                                  </span>
                                ) : (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    <div>In: ${(pricing.inputCost * 1000).toFixed(2)}/1M</div>
                                    <div>Out: ${(pricing.outputCost * 1000).toFixed(2)}/1M</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Pricing Philosophy:</strong> We use transparent 3x markup over actual API costs. 
                      This covers infrastructure, support, and sustainable development while remaining fair to users.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 