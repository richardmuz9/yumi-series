import React, { useState, useEffect } from 'react'
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
  className?: string
}

const PWAInstaller: React.FC<PWAInstallerProps> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown')
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed/running as PWA
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      
      setIsStandalone(isStandaloneMode)
      setIsInstalled(isStandaloneMode)
    }

    // Detect platform
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)
      const isDesktop = !isIOS && !isAndroid

      if (isIOS) setPlatform('ios')
      else if (isAndroid) setPlatform('android')
      else if (isDesktop) setPlatform('desktop')
      else setPlatform('unknown')
    }

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const event = e as BeforeInstallPromptEvent
      setDeferredPrompt(event)
      setIsInstallable(true)
      
      // Show prompt after a delay for better UX
      setTimeout(() => setShowPrompt(true), 3000)
    }

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setIsInstallable(false)
      setDeferredPrompt(null)
      
      // Show success message
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          data: {
            title: 'Yumi Series Installed!',
            body: 'The app is now available on your home screen',
            icon: '/pwa-192.svg'
          }
        })
      }
    }

    checkStandalone()
    detectPlatform()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          title: 'Install Yumi Series',
          steps: [
            'Tap the Share button in Safari',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" to install the app'
          ],
          icon: '📱'
        }
      case 'android':
        return {
          title: 'Install Yumi Series',
          steps: [
            'Tap the menu (⋮) in Chrome',
            'Select "Add to Home screen"',
            'Tap "Add" to install'
          ],
          icon: '🤖'
        }
      case 'desktop':
        return {
          title: 'Install Yumi Series',
          steps: [
            'Click the install button in the address bar',
            'Or use the button below to install',
            'Access the app from your desktop'
          ],
          icon: '💻'
        }
      default:
        return {
          title: 'Install Yumi Series',
          steps: ['Use your browser\'s install option'],
          icon: '📦'
        }
    }
  }

  if (isInstalled) {
    return (
      <div className={`pwa-installer installed ${className}`}>
        <div className="install-status">
          <div className="install-icon">✅</div>
          <div className="install-content">
            <h3>App Installed!</h3>
            <p>Yumi Series is now available on your home screen</p>
          </div>
        </div>
      </div>
    )
  }

  const instructions = getInstallInstructions()

  return (
    <div className={`pwa-installer ${className}`}>
      {/* Installation Card */}
      <div className="install-card">
        <div className="install-header">
          <div className="install-icon">{instructions.icon}</div>
          <div className="install-info">
            <h3>{instructions.title}</h3>
            <p>Get the app for the best experience</p>
          </div>
          {isInstallable && platform === 'desktop' && (
            <button 
              className="install-btn-primary"
              onClick={handleInstallClick}
            >
              Install
            </button>
          )}
        </div>

        <div className="install-benefits">
          <h4>Benefits of Installing:</h4>
          <ul>
            <li>🚀 Faster loading and performance</li>
            <li>📱 Works offline with cached content</li>
            <li>🔔 Get notifications for updates</li>
            <li>🎯 Quick access from home screen</li>
            <li>💾 Auto-save your work locally</li>
          </ul>
        </div>

        {!isInstallable && (
          <div className="install-instructions">
            <h4>Installation Steps:</h4>
            <ol>
              {instructions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            
            {platform === 'ios' && (
              <div className="ios-note">
                <p><strong>Note:</strong> Make sure you're using Safari browser for installation.</p>
              </div>
            )}
            
            {platform === 'android' && (
              <div className="android-note">
                <p><strong>Note:</strong> Chrome browser is recommended for the best experience.</p>
              </div>
            )}
          </div>
        )}

        <div className="install-features">
          <h4>App Features:</h4>
          <div className="feature-grid">
            <div className="feature-item">
              <span className="feature-icon">✍️</span>
              <span className="feature-name">Writing Helper</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <span className="feature-name">Web Builder</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-name">Report Writer</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎓</span>
              <span className="feature-name">Study Advisor</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span className="feature-name">Anime Designer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Install Prompt */}
      {showPrompt && isInstallable && !sessionStorage.getItem('pwa-install-dismissed') && (
        <div className="pwa-install-prompt show">
          <div className="pwa-install-icon">📱</div>
          <div className="pwa-install-content">
            <div className="pwa-install-title">Install Yumi Series</div>
            <div className="pwa-install-description">
              Get the app for faster access and offline features
            </div>
          </div>
          <div className="pwa-install-actions">
            <button 
              className="pwa-install-btn"
              onClick={handleDismiss}
            >
              Later
            </button>
            <button 
              className="pwa-install-btn pwa-install-btn-primary"
              onClick={handleInstallClick}
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* Browser Support Info */}
      <div className="browser-support">
        <h4>Browser Compatibility:</h4>
        <div className="browser-list">
          <div className="browser-item">
            <span className="browser-icon">🌐</span>
            <span>Chrome (Desktop & Mobile)</span>
            <span className="support-status supported">✅</span>
          </div>
          <div className="browser-item">
            <span className="browser-icon">🦊</span>
            <span>Firefox (Desktop)</span>
            <span className="support-status partial">⚠️</span>
          </div>
          <div className="browser-item">
            <span className="browser-icon">🌍</span>
            <span>Edge (Desktop)</span>
            <span className="support-status supported">✅</span>
          </div>
          <div className="browser-item">
            <span className="browser-icon">🧭</span>
            <span>Safari (iOS)</span>
            <span className="support-status manual">📱</span>
          </div>
        </div>
        <p className="support-note">
          ✅ Full support | ⚠️ Limited support | 📱 Manual installation
        </p>
      </div>

      {/* Troubleshooting */}
      <div className="troubleshooting">
        <details>
          <summary>Installation Issues?</summary>
          <div className="troubleshooting-content">
            <h5>Common Solutions:</h5>
            <ul>
              <li><strong>Can't see install option:</strong> Make sure you're using a supported browser and the site is served over HTTPS</li>
              <li><strong>Install button not working:</strong> Refresh the page and try again</li>
              <li><strong>iOS Safari:</strong> The install option is in the Share menu, not the address bar</li>
              <li><strong>Desktop:</strong> Look for the install icon in your browser's address bar</li>
            </ul>
            
            <h5>Still having issues?</h5>
            <p>Try these steps:</p>
            <ol>
              <li>Clear your browser cache and cookies</li>
              <li>Make sure you're on the latest browser version</li>
              <li>Try using an incognito/private window</li>
              <li>Contact support if the problem persists</li>
            </ol>
          </div>
        </details>
      </div>
    </div>
  )
}

export default PWAInstaller 