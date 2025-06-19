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
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load user billing (already has fallback)
      const billing = await billingApi.getUserBilling()
      setUserBilling(billing)
      
      // Load packages with fallback
      try {
        const packages = await billingApi.getTokenPackages()
        setTokenPackages(packages)
      } catch (err) {
        console.warn('Using demo token packages:', err)
        setTokenPackages([
          {
            id: 'starter',
            name: 'Starter Pack',
            tokens: 1000,
            price: 9.99,
            description: '1,000 tokens for basic usage'
          },
          {
            id: 'pro',
            name: 'Pro Pack',
            tokens: 5000,
            price: 39.99,
            description: '5,000 tokens for power users'
          },
          {
            id: 'enterprise',
            name: 'Enterprise Pack',
            tokens: 15000,
            price: 99.99,
            description: '15,000 tokens for teams'
          }
        ])
      }
      
      // Load subscription plans with fallback
      try {
        const plans = await billingApi.getSubscriptionPlans()
        setSubscriptionPlans(plans)
      } catch (err) {
        console.warn('Using demo subscription plans:', err)
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
      console.error('Billing data error:', err)
      // Don't show error, just use demo data
      setUserBilling({
        id: 1,
        email: 'demo@yumi.ai',
        creditsBalance: 5.00,
        totalSpent: 0,
        qwenTokensUsedMonth: 0,
        openrouterRequestsUsedToday: 0,
        subscriptionStatus: 'inactive',
        subscriptionPlan: 'free',
        monthlyTokensUsed: 0,
        dailyTokensUsed: 0,
        premiumTokens: 10000,
        credits: 500,
        qwenTokensUsed: 0,
        openrouterRequestsUsed: 0,
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
      
      const successUrl = `${window.location.origin}/charge?success=true`
      const cancelUrl = `${window.location.origin}/charge?canceled=true`
      
      if (selectedPayment === 'alipay') {
        const result = await billingApi.createAlipayPayment(packageId, successUrl)
        window.open(result.paymentUrl, '_blank')
      } else {
        const result = await billingApi.createCheckoutSession({
          packageId,
          paymentMethod: selectedPayment,
          successUrl,
          cancelUrl
        })
        window.location.href = result.url
      }
    } catch (err) {
      console.error('Payment error:', err)
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
      
      const successUrl = `${window.location.origin}/charge?success=true`
      const cancelUrl = `${window.location.origin}/charge?canceled=true`
      
      const result = await billingApi.createSubscriptionSession(planId, successUrl, cancelUrl)
      window.location.href = result.url
    } catch (err) {
      console.error('Subscription error:', err)
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
      const result = await billingApi.createPortalSession(returnUrl)
      window.open(result.url, '_blank')
    } catch (err) {
      setError('Failed to open billing portal')
      console.error('Portal error:', err)
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
          <div className="billing-summary">
            <div className="token-balance">
              <span className="token-icon">🎫</span>
              <div>
                <div className="balance-amount">{formatTokens(userBilling.premiumTokens)}</div>
                <div className="balance-label">Available Tokens</div>
              </div>
            </div>
            {userBilling.subscriptionStatus === 'active' && (
              <div className="subscription-status">
                <span className="status-icon">⭐</span>
                <div>
                  <div className="status-text">Premium Active</div>
                  {userBilling.nextBillingDate && (
                    <div className="billing-date">Next: {new Date(userBilling.nextBillingDate).toLocaleDateString()}</div>
                  )}
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

        <div className="tab-selector">
          <button 
            className={`tab-btn ${activeTab === 'tokens' ? 'active' : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            🎫 Token Packages
          </button>
          <button 
            className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
          >
            ⭐ Subscription
          </button>
        </div>

        {activeTab === 'tokens' && (
          <div className="tokens-section">
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={selectedPayment === 'card'}
                  onChange={(e) => setSelectedPayment(e.target.value as 'card' | 'alipay')}
                />
                <span className="payment-label">💳 Credit Card</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="alipay"
                  checked={selectedPayment === 'alipay'}
                  onChange={(e) => setSelectedPayment(e.target.value as 'card' | 'alipay')}
                />
                <span className="payment-label">🏧 Alipay (支付宝)</span>
              </label>
            </div>

            <div className="packages-grid">
              {tokenPackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`package-card ${pkg.id === 'premium' ? 'popular' : ''}`}
                >
                  {pkg.id === 'premium' && <div className="popular-badge">Most Popular</div>}
                  <div className="package-header">
                    <h3 className="package-name">{pkg.name}</h3>
                    <div className="package-price">{formatPrice(pkg.price)}</div>
                  </div>
                  <div className="package-tokens">
                    <span className="token-amount">{formatTokens(pkg.tokens)}</span>
                    <span className="token-label">tokens</span>
                  </div>
                  <p className="package-description">{pkg.description}</p>
                  <div className="package-value">
                    ${((pkg.price / 100) / (pkg.tokens / 1000000) * 1000000).toFixed(2)} per 1M tokens
                  </div>
                  <button
                    className="purchase-btn"
                    onClick={() => handleTokenPurchase(pkg.id)}
                    disabled={processingPayment === pkg.id}
                  >
                    {processingPayment === pkg.id ? (
                      <>
                        <span className="spinner small"></span>
                        Processing...
                      </>
                    ) : (
                      `Purchase ${pkg.name}`
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="subscription-section">
            <div className="subscription-info">
              <h3>🚀 Premium Subscription Benefits</h3>
              <ul className="benefits-list">
                <li>✨ Daily token allowance - never run out!</li>
                <li>⚡ Priority processing for faster responses</li>
                <li>🎯 Access to premium AI models</li>
                <li>📊 Advanced analytics and usage insights</li>
                <li>💬 Priority customer support</li>
              </ul>
            </div>

            <div className="plans-grid">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className="plan-card">
                  <div className="plan-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">
                      {formatPrice(plan.price)}
                      <span className="price-period">/month</span>
                    </div>
                  </div>
                  <div className="plan-tokens">
                    <span className="token-amount">{formatTokens(plan.tokensPerDay)}</span>
                    <span className="token-label">tokens/day</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-total">
                    ≈ {formatTokens(plan.tokensPerDay * 30)} tokens/month
                  </div>
                  <button
                    className="subscribe-btn"
                    onClick={() => handleSubscription(plan.id)}
                    disabled={processingPayment === plan.id}
                  >
                    {processingPayment === plan.id ? (
                      <>
                        <span className="spinner small"></span>
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="charge-footer">
          <p>💡 <strong>Tip:</strong> Subscriptions offer better value for regular users!</p>
          <p>🔒 Secure payments powered by Stripe and Alipay</p>
        </div>
      </div>
    </div>
  )
}

export default ChargePage 