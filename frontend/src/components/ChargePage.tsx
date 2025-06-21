import React, { useState, useEffect } from 'react'
import { billingApi, TokenPackage, SubscriptionPlan, UserBilling } from '../services/billingApi'
import './ChargePage.css'

interface ChargePageProps {
  onClose: () => void
}

const ChargePage: React.FC<ChargePageProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true)
  const [userBilling, setUserBilling] = useState<UserBilling | null>(null)
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [activeTab, setActiveTab] = useState<'tokens' | 'subscription'>('tokens')
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'alipay'>('card')
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, setRetryCount] = useState(0)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[Billing] Loading user billing data...')
      // Load user billing (already has fallback)
      const billing = await billingApi.getUserBilling()
      setUserBilling(billing)
      console.log('[Billing] User billing loaded:', billing)
      
      // Load packages with fallback
      try {
        const packages = await billingApi.getTokenPackages()
        setTokenPackages(packages)
        console.log('[Billing] Token packages loaded:', packages)
      } catch (err) {
        console.warn('[Billing] Using demo token packages:', err)
        setTokenPackages([
          {
            id: 'starter',
            name: 'Starter Pack',
            tokens: 300000,
            price: 500,
            description: '300K tokens for basic writing and character design'
          },
          {
            id: 'creative',
            name: 'Creative Pack',
            tokens: 700000,
            price: 1000,
            description: '700K tokens for regular content creation',
            recommended: true
          },
          {
            id: 'pro',
            name: 'Professional Pack',
            tokens: 1800000,
            price: 2000,
            description: '1.8M tokens for serious writers and artists'
          },
          {
            id: 'studio',
            name: 'Studio Pack',
            tokens: 4500000,
            price: 5000,
            description: '4.5M tokens for professional studios'
          }
        ])
      }
      
      // Load subscription plans with fallback
      try {
        const plans = await billingApi.getSubscriptionPlans()
        setSubscriptionPlans(plans)
        console.log('[Billing] Subscription plans loaded:', plans)
      } catch (err) {
        console.warn('[Billing] Using demo subscription plans:', err)
        setSubscriptionPlans([
          {
            id: 'monthly',
            name: 'Monthly Pro',
            tokensPerDay: 200,
            tokensPerMonth: 6000,
            price: 1999,
            description: '200 tokens per day, unlimited generations',
            benefits: ['Daily token allowance', 'Priority support'],
            interval: 'month'
          },
          {
            id: 'unlimited',
            name: 'Unlimited Pro',
            tokensPerDay: 1000,
            tokensPerMonth: 30000,
            price: 4999,
            description: '1000 tokens per day, priority support',
            benefits: ['High daily limits', 'Premium support', 'Advanced features'],
            interval: 'month'
          }
        ])
      }
    } catch (err) {
      console.error('[Billing] Billing data error:', err)
      setError('Failed to load billing data. Please check your connection or try again later.')
      // Don't show error, just use demo data
      setUserBilling({
        id: 1,
        email: 'demo@yumi.ai',
        creditsBalance: 5.00,
        totalSpent: 0,
        qwenTokensUsedMonth: 0,
        subscriptionStatus: 'inactive',
        subscriptionPlan: 'free',
        monthlyTokensUsed: 0,
        dailyTokensUsed: 0,
        premiumTokens: 10000,
        credits: 500,
        qwenTokensUsed: 0,
        nextReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
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

  const handleTokenPurchase = async (packageId: string) => {
    if (processingPayment) return
    
    try {
      setProcessingPayment(packageId)
      setError(null)
      console.log('[Payment] Initiating token purchase for package:', packageId, 'with method:', selectedPayment)
      
      const successUrl = `${window.location.origin}/charge?success=true&demo=true&plan=monthly-pro`
      const cancelUrl = `${window.location.origin}/charge?canceled=true`
      
      if (selectedPayment === 'alipay') {
        const result = await billingApi.createAlipayPayment(packageId, successUrl)
        // Open Alipay in a new window to prevent main window refresh
        const paymentWindow = window.open(result.paymentUrl, '_blank')
        if (!paymentWindow) {
          throw new Error('Popup blocked. Please allow popups and try again.')
        }
        console.log('[Payment] Alipay payment URL opened:', result.paymentUrl)
      } else {
        const result = await billingApi.createCheckoutSession({
          packageId,
          paymentMethod: selectedPayment,
          successUrl,
          cancelUrl
        })
        // Use window.location.assign to prevent form submission
        window.location.assign(result.url)
        console.log('[Payment] Stripe checkout session started:', result.url)
      }
    } catch (err) {
      console.error('[Payment] Payment error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to initiate payment: ${errorMessage}. Please check your internet connection and try again.`)
    } finally {
      setProcessingPayment(null)
    }
  }

  const handleSubscription = async (planId: string) => {
    if (processingPayment) return
    
    try {
      setProcessingPayment(planId)
      setError(null)
      console.log('[Payment] Initiating subscription for plan:', planId)
      
      const successUrl = `${window.location.origin}/charge?success=true`
      const cancelUrl = `${window.location.origin}/charge?canceled=true`
      
      const result = await billingApi.createSubscriptionSession(planId, successUrl, cancelUrl)
      window.location.href = result.url
      console.log('[Payment] Subscription session started:', result.url)
    } catch (err) {
      console.error('[Payment] Subscription error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to initiate subscription: ${errorMessage}`)
    } finally {
      setProcessingPayment(null)
    }
  }

  const handleRetry = () => {
    setError(null)
    setRetryCount(prev => prev + 1)
    loadBillingData()
  }

  const handleManageSubscription = async () => {
    try {
      const returnUrl = window.location.origin + '/charge'
      console.log('[Billing] Opening billing portal with returnUrl:', returnUrl)
      const result = await billingApi.createPortalSession(returnUrl)
      window.open(result.url, '_blank')
      console.log('[Billing] Billing portal opened:', result.url)
    } catch (err) {
      setError('Failed to open billing portal')
      console.error('[Billing] Portal error:', err)
    }
  }

  if (loading) {
    return (
      <div className="charge-page">
        <div className="charge-overlay" onClick={onClose} />
        <div className="charge-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="charge-page">
      <div className="charge-overlay" onClick={onClose} />
      <div className="charge-content">
        <div className="charge-header">
          <h2>💎 Charge Tokens</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error}</span>
            </div>
            <button 
              className="retry-btn"
              onClick={handleRetry}
              disabled={loading}
            >
              🔄 Retry
            </button>
          </div>
        )}

        {userBilling && (
          <div className="billing-summary-enhanced">
            <div className="token-balance-card">
              <span className="token-icon">🎫</span>
              <div className="balance-info">
                <div className="balance-amount">{formatTokens(userBilling.premiumTokens || userBilling.creditsBalance * 50000)}</div>
                <div className="balance-label">Available Tokens</div>
              </div>
              {userBilling.qwenTokensLeft !== undefined && (
                <div className="free-tokens-info">
                  <div className="free-qwen">
                    <span className="free-icon">🆓</span>
                    <div>
                      <div className="free-amount">{formatTokens(userBilling.qwenTokensLeft)}</div>
                      <div className="free-label">Qwen Free/Month</div>
                    </div>
                  </div>
                  {userBilling.premiumTokensLeft !== undefined && (
                    <div className="free-premium">
                      <span className="premium-icon">⭐</span>
                      <div>
                        <div className="premium-amount">{formatTokens(userBilling.premiumTokensLeft)}</div>
                        <div className="premium-label">Premium Free/Month</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {userBilling.subscriptionStatus === 'active' && (
              <div className="subscription-status-enhanced">
                <div className="status-header">
                  <span className="status-icon">⭐</span>
                  <div>
                    <div className="status-text">Premium Active</div>
                    {userBilling.nextBillingDate && (
                      <div className="billing-date">Next: {new Date(userBilling.nextBillingDate).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
                <button 
                  className="manage-btn"
                  onClick={handleManageSubscription}
                >
                  Manage
                </button>
              </div>
            )}
          </div>
        )}

        <div className="purchase-options">
          <div className="tab-selector-enhanced">
            <button 
              className={`tab-option ${activeTab === 'tokens' ? 'active' : ''}`}
              onClick={() => setActiveTab('tokens')}
            >
              <span className="tab-icon">🎫</span>
              <span className="tab-label">Token Packages</span>
            </button>
            <button 
              className={`tab-option ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              <span className="tab-icon">⭐</span>
              <span className="tab-label">Subscription</span>
            </button>
          </div>

          <div className="token-packages">
            <h3>Token Packages</h3>
            <div className="package-grid">
              {tokenPackages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handleTokenPurchase(pkg.id)}
                  disabled={processingPayment === pkg.id}
                  className={`package-card ${pkg.recommended ? 'recommended' : ''}`}
                >
                  <div className="package-header">
                    <h4>{pkg.name}</h4>
                    {pkg.recommended && <span className="recommended-badge">Recommended</span>}
                  </div>
                  <div className="package-tokens">{formatTokens(pkg.tokens)} tokens</div>
                  <div className="package-price">{formatPrice(pkg.price)}</div>
                  <div className="package-description">{pkg.description}</div>
                  {processingPayment === pkg.id ? (
                    <div className="processing">Processing...</div>
                  ) : (
                    <div className="package-cta">Select Package →</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="payment-methods">
            <h3>Payment Method</h3>
            <div className="method-grid">
              <button
                type="button"
                onClick={() => setSelectedPayment('card')}
                className={`method-card ${selectedPayment === 'card' ? 'selected' : ''}`}
              >
                <div className="method-icon">💳</div>
                <div className="method-name">Credit Card</div>
                <div className="method-subtitle">Visa, Mastercard, Amex</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPayment('alipay')}
                className={`method-card ${selectedPayment === 'alipay' ? 'selected' : ''}`}
              >
                <div className="method-icon">🌏</div>
                <div className="method-name">Alipay</div>
                <div className="method-subtitle">支付宝</div>
              </button>
            </div>
          </div>

          <div className="secure-notice">
            <div className="notice-icon">🔒</div>
            <div className="notice-text">
              Secure payment powered by Stripe
              <div className="notice-subtext">Your payment information is encrypted and secure</div>
            </div>
          </div>

          {activeTab === 'subscription' && (
            <div className="subscription-section-enhanced">
              <div className="subscription-benefits">
                <h3 className="section-title">🚀 Premium Benefits</h3>
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <span className="benefit-icon">⚡</span>
                    <span className="benefit-text">33K daily tokens</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">✍️</span>
                    <span className="benefit-text">Polish Writing Assistant</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">📚</span>
                    <span className="benefit-text">Study Advisor Access</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🎯</span>
                    <span className="benefit-text">Priority Processing</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">📊</span>
                    <span className="benefit-text">Advanced Analytics</span>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">💬</span>
                    <span className="benefit-text">Premium Support</span>
                  </div>
                </div>
              </div>

              <div className="plans-section">
                <h3 className="section-title">Choose Your Plan</h3>
                <div className="plans-grid-enhanced">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="plan-card-enhanced">
                      <div className="plan-header-enhanced">
                        <h4 className="plan-name">{plan.name}</h4>
                        <div className="plan-price-enhanced">
                          {formatPrice(plan.price)}
                          <span className="price-period">/month</span>
                        </div>
                      </div>
                      <div className="plan-tokens-enhanced">
                        <span className="token-amount">{formatTokens(plan.tokensPerDay)}</span>
                        <span className="token-label">tokens/day</span>
                      </div>
                      <p className="plan-description">{plan.description}</p>
                      <div className="plan-total">
                        ≈ {formatTokens(plan.tokensPerMonth || plan.tokensPerDay * 30)} tokens/month
                      </div>
                      <button
                        className="subscribe-btn-enhanced"
                        onClick={() => handleSubscription(plan.id)}
                        disabled={processingPayment === plan.id}
                      >
                        {processingPayment === plan.id ? (
                          <>
                            <span className="spinner small"></span>
                            Processing...
                          </>
                        ) : (
                          'Continue to Payment'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="charge-footer-enhanced">
          <div className="security-indicator">
            <span className="security-icon">🔒</span>
            <span className="security-text">Secure payment powered by Stripe</span>
          </div>
          <p className="footer-tip">
            💡 <strong>Tip:</strong> Subscriptions offer better value for regular users!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChargePage 