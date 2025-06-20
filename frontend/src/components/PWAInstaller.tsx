import React, { useState, useEffect } from 'react'
import useGlobalLanguage from '../hooks/useGlobalLanguage'
import './PWAInstaller.css'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAInstallerProps {
  onClose: () => void
}

const PWAInstaller: React.FC<PWAInstallerProps> = ({ onClose }) => {
  const { translations: t } = useGlobalLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [platform, setPlatform] = useState<string>('')
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('android')) {
      setPlatform('android')
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      setPlatform('ios')
    } else if (userAgent.includes('windows')) {
      setPlatform('windows')
    } else if (userAgent.includes('mac')) {
      setPlatform('macos')
    } else {
      setPlatform('desktop')
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setIsInstallable(false)
      
      // Show success notification
      if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Yumi Series Installed! 🎉', {
            body: 'App installed successfully. You can now access it from your home screen.',
            icon: '/pwa-192.svg',
            badge: '/pwa-192.svg'
          })
        })
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstructions(true)
      return
    }

    try {
      console.log('🔄 Starting PWA installation...')
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log('📱 Install prompt result:', outcome)
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt')
        // Close the installer on successful installation
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        console.log('❌ User dismissed the install prompt')
        // Show feedback that installation was cancelled
        alert('Installation cancelled. You can install later from your browser menu.')
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('❌ Install prompt failed:', error)
      alert('Installation failed. Please try installing manually from your browser menu.')
      setShowInstructions(true)
    }
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case 'android': return '🤖'
      case 'ios': return '🍎'
      case 'windows': return '🪟'
      case 'macos': return '🍎'
      default: return '💻'
    }
  }

  const getPlatformName = () => {
    switch (platform) {
      case 'android': return 'Android'
      case 'ios': return 'iOS'
      case 'windows': return 'Windows'
      case 'macos': return 'macOS'
      default: return 'Desktop'
    }
  }

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          title: 'Install on iPhone/iPad',
          steps: [
            '1. Tap the Share button in Safari',
            '2. Scroll down and tap "Add to Home Screen"',
            '3. Tap "Add" to confirm installation',
            '4. Find Yumi Series on your home screen'
          ]
        }
      case 'android':
        return {
          title: 'Install on Android',
          steps: [
            '1. Tap the menu (⋮) in Chrome',
            '2. Select "Add to Home screen"',
            '3. Tap "Add" to confirm',
            '4. Launch from your home screen'
          ]
        }
      default:
        return {
          title: 'Install on Desktop',
          steps: [
            '1. Look for the install icon in your browser address bar',
            '2. Click the install button when prompted',
            '3. Or use browser menu > "Install Yumi Series"',
            '4. Access from your desktop or start menu'
          ]
        }
    }
  }

  if (isInstalled) {
    return (
      <div className="pwa-installer">
        <div className="pwa-overlay" onClick={onClose} />
        <div className="pwa-content installed">
          <div className="pwa-header">
            <h2>✅ App Installed!</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="pwa-body">
            <div className="install-success">
              <div className="success-icon">🎉</div>
              <h3>Yumi Series is now installed!</h3>
              <p>You can access the app directly from your {getPlatformName()} home screen or desktop.</p>
              
              <div className="installed-features">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>Faster loading</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span>Native app experience</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔔</span>
                  <span>Push notifications</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌐</span>
                  <span>Offline capabilities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pwa-installer">
      <div className="pwa-overlay" onClick={onClose} />
      <div className="pwa-content">
        <div className="pwa-header">
          <h2>
            {getPlatformIcon()} Install Yumi Series
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="pwa-body">
          {!showInstructions ? (
            <>
              <div className="install-hero">
                <div className="app-preview">
                  <img src="/yumi-tusr.png" alt="Yumi Series" className="app-icon" />
                  <div className="app-info">
                    <h3>Yumi Series</h3>
                    <p>AI-Powered Creative Suite</p>
                    <div className="app-rating">
                      <span className="stars">⭐⭐⭐⭐⭐</span>
                      <span className="rating-text">Excellent</span>
                    </div>
                  </div>
                </div>

                <div className="install-benefits">
                  <h4>Get the app for the best experience</h4>
                  <div className="benefits-grid">
                    <div className="benefit-item">
                      <span className="benefit-icon">🚀</span>
                      <div>
                        <strong>Faster loading and performance</strong>
                        <p>Optimized for speed with advanced caching</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">📱</span>
                      <div>
                        <strong>Works offline with cached content</strong>
                        <p>Continue working even without internet</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">🔔</span>
                      <div>
                        <strong>Get notifications for updates</strong>
                        <p>Stay informed about new features</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">🎯</span>
                      <div>
                        <strong>Quick access from home screen</strong>
                        <p>Launch instantly like a native app</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="install-actions">
                <button 
                  className="install-btn primary"
                  onClick={handleInstallClick}
                  disabled={!isInstallable && platform !== 'ios'}
                >
                  <span className="btn-icon">💻</span>
                  Install App
                </button>
                
                {platform === 'ios' && (
                  <button 
                    className="install-btn secondary"
                    onClick={() => setShowInstructions(true)}
                  >
                    <span className="btn-icon">📖</span>
                    Show Instructions
                  </button>
                )}
              </div>

              <div className="install-note">
                <p>
                  <strong>Native Apps Coming Soon!</strong> 📱
                  <br />
                  We're working on dedicated iOS and Android apps with enhanced features.
                </p>
              </div>
            </>
          ) : (
            <div className="install-instructions">
              <button 
                className="back-btn"
                onClick={() => setShowInstructions(false)}
              >
                ← Back
              </button>
              
              <h3>{getInstallInstructions().title}</h3>
              <div className="instructions-list">
                {getInstallInstructions().steps.map((step, index) => (
                  <div key={index} className="instruction-step">
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{step}</span>
                  </div>
                ))}
              </div>

              <div className="visual-guide">
                <p>Having trouble? Here's a visual guide:</p>
                <div className="guide-images">
                  {platform === 'ios' && (
                    <div className="guide-image">
                      <div className="mock-safari">
                        <div className="safari-bar">
                          <span>📱 Safari</span>
                          <span>📤</span>
                        </div>
                        <div className="safari-content">
                          <p>Tap the share button (📤) then "Add to Home Screen"</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {platform === 'android' && (
                    <div className="guide-image">
                      <div className="mock-chrome">
                        <div className="chrome-bar">
                          <span>🤖 Chrome</span>
                          <span>⋮</span>
                        </div>
                        <div className="chrome-content">
                          <p>Tap menu (⋮) then "Add to Home screen"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PWAInstaller 