import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconButton } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import TokenUsageDisplay from './TokenUsageDisplay'
import { getBillingInfo, createPaymentSession } from '../services/billingApi'
import type { BillingInfo } from '../types/billing'
import './ChargePage.css'

interface TokenPackage {
  id: string;
  label: string;
  price: number;
  tokens: number;
  description: string;
  recommended?: boolean;
  popular?: boolean;
}

// Define token packages with correct amounts
const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'basic',
    label: 'Basic',
    price: 5,
    tokens: 100000, // 100k
    description: 'Perfect for getting started'
  },
  {
    id: 'starter',
    label: 'Starter',
    price: 10,
    tokens: 300000, // 300k
    description: 'Most popular for regular users'
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 15,
    tokens: 700000, // 700k
    description: 'Great value for power users',
    recommended: true
  },
  {
    id: 'premium',
    label: 'Premium',
    price: 20,
    tokens: 1500000, // 1.5m
    description: 'Best value for serious users'
  },
  {
    id: 'ultra',
    label: 'Ultra',
    price: 50,
    tokens: 5000000, // 5.0m
    description: 'For professional use'
  },
  {
    id: 'max',
    label: 'Max',
    price: 100,
    tokens: 11000000, // 11m
    description: 'Maximum power and value',
    popular: true
  }
]

// Yumi Blessing subscription package
const BLESSING_PACKAGE = {
  id: 'blessing',
  label: 'Yumi Blessing',
  price: 10,
  dailyTokens: 35000,
  durationDays: 30,
  description: 'Daily login rewards and special benefits',
  recommended: true
}

interface ChargePageProps {
  onClose?: () => void
}

interface TokenUsageDisplayProps {
  currentTokens: number;
  dailyTokensRemaining: number;
  hasBlessing: boolean;
}

const ChargePage: React.FC<ChargePageProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tokens' | 'blessing'>('tokens')
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const info = await getBillingInfo()
        setBillingInfo(info)
      } catch (error) {
        console.error('[Billing] Error loading data:', error)
        setError('Failed to load billing information. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handlePurchase = async (packageId: string) => {
    try {
      setProcessingPayment(packageId)
      const sessionId = await createPaymentSession(packageId)
      // Redirect to the payment page using the session ID
      window.location.href = `/api/billing/checkout/${sessionId}`
    } catch (error) {
      console.error('[Billing] Payment error:', error)
      setError('Failed to process payment. Please try again.')
      setProcessingPayment(null)
    }
  }

  const formatTokenCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const renderPackageCard = (pkg: typeof TOKEN_PACKAGES[0]) => {
    const isProcessing = processingPayment === pkg.id
    
    return (
      <div
        key={pkg.id}
        className={`package-card ${pkg.recommended ? 'recommended' : ''} ${pkg.popular ? 'popular' : ''}`}
      >
        {pkg.recommended && (
          <div className="badge recommended-badge">RECOMMENDED</div>
        )}
        {pkg.popular && (
          <div className="badge popular-badge">POPULAR</div>
        )}
        
        <div className="package-header">
          <h3 className="package-title">{pkg.label}</h3>
          {pkg.description && (
            <p className="package-description">{pkg.description}</p>
          )}
        </div>

        <div className="package-tokens">
          <div className="token-amount">
            {formatTokenCount(pkg.tokens)} timeshards
          </div>
        </div>

        <div className="package-pricing">
          <div className="price-display">
            <span className="currency">$</span>
            <span className="amount">{pkg.price}</span>
          </div>
          <div className="price-per-token">
            ${(pkg.price / pkg.tokens * 1000000).toFixed(2)} per 1M timeshards
          </div>
        </div>

        <button
          onClick={() => handlePurchase(pkg.id)}
          disabled={isProcessing}
          className="purchase-button"
        >
          {isProcessing ? (
            <span className="processing">
              <span className="spinner"></span>
              Processing...
            </span>
          ) : (
            <span>Purchase Package →</span>
          )}
        </button>
      </div>
    )
  }

  const renderBlessingCard = () => {
    const isProcessing = processingPayment === BLESSING_PACKAGE.id
    const totalTokens = BLESSING_PACKAGE.dailyTokens * BLESSING_PACKAGE.durationDays
    
    return (
      <div className="package-card blessing-card recommended">
        <div className="badge recommended-badge">RECOMMENDED</div>
        
        <div className="package-header">
          <h3 className="package-title">{BLESSING_PACKAGE.label}</h3>
          <p className="package-description">{BLESSING_PACKAGE.description}</p>
        </div>

        <div className="package-tokens">
          <div className="daily-tokens">
            {formatTokenCount(BLESSING_PACKAGE.dailyTokens)} timeshards/day
          </div>
          <div className="total-tokens">
            {formatTokenCount(totalTokens)} total timeshards
          </div>
          <div className="duration">
            for {BLESSING_PACKAGE.durationDays} days
          </div>
        </div>

        <div className="package-pricing">
          <div className="price-display">
            <span className="currency">$</span>
            <span className="amount">{BLESSING_PACKAGE.price}</span>
            <span className="period">/month</span>
          </div>
        </div>

        <button
          onClick={() => handlePurchase(BLESSING_PACKAGE.id)}
          disabled={isProcessing}
          className="purchase-button blessing"
        >
          {isProcessing ? (
            <span className="processing">
              <span className="spinner"></span>
              Processing...
            </span>
          ) : (
            <span>Activate Blessing →</span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="charge-page">
      <div className="charge-content">
        <div className="header">
          <IconButton onClick={() => navigate(-1)} className="back-button">
            <ArrowBack />
          </IconButton>
          <h2>Timeshard Packages & Billing</h2>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading billing information...</p>
          </div>
        ) : (
          <>
            {billingInfo && (
              <TokenUsageDisplay
                currentTokens={billingInfo.tokens}
                dailyTokensRemaining={billingInfo.dailyTokensRemaining}
                hasBlessing={billingInfo.blessingActive}
              />
            )}

            {/* Tab Selection */}
            <div className="tab-selector">
              <button 
                className={`tab-option ${activeTab === 'tokens' ? 'active' : ''}`}
                onClick={() => setActiveTab('tokens')}
              >
                <span className="tab-icon">⚡</span>
                <span className="tab-label">One-Time Packages</span>
              </button>
              <button 
                className={`tab-option ${activeTab === 'blessing' ? 'active' : ''}`}
                onClick={() => setActiveTab('blessing')}
              >
                <span className="tab-icon">🎁</span>
                <span className="tab-label">Yumi Blessing</span>
              </button>
            </div>

            {/* Package Grid */}
            <div className="packages-section">
              {activeTab === 'tokens' && (
                <div className="token-packages">
                  <div className="section-header">
                    <h3>One-Time Timeshard Packages</h3>
                    <p>Purchase timeshards once, use them anytime</p>
                  </div>
                  <div className="package-grid">
                    {TOKEN_PACKAGES.map(renderPackageCard)}
                  </div>
                </div>
              )}

              {activeTab === 'blessing' && (
                <div className="blessing-packages">
                  <div className="section-header">
                    <h3>Yumi Blessing - Daily Login Rewards</h3>
                    <p>Just like Genshin Impact! Get daily timeshards with special benefits</p>
                  </div>
                  <div className="blessing-container">
                    {renderBlessingCard()}
                    <div className="blessing-features">
                      <h4>🎁 Yumi Blessing Features:</h4>
                      <ul>
                        <li>✨ Get 35,000 timeshards every day for 30 days</li>
                        <li>🎯 Total of 1.05M timeshards per month</li>
                        <li>⚡ After 10 days, claim remaining 700K timeshards immediately</li>
                        <li>🎮 No need to login daily - timeshards accumulate automatically</li>
                        <li>💫 Special blessing effects and priority support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChargePage 