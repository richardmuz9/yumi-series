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
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) {
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
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome's default mini-infobar from appearing
      e.preventDefault()
      // Save the event so we can trigger it later
      setDeferredPrompt(e)
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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstructions(true)
      return
    }

    try {
      // Hide the install button
      setIsInstallable(false)
      // Show the native install prompt
      await deferredPrompt.prompt()
      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        // Close the installer on successful installation
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        // Show instructions if user dismisses
        setShowInstructions(true)
      }
      
      // Clear the deferred prompt - it can only be used once
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Install failed:', error)
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
          <p>You can now access Yumi Series from your home screen or app launcher.</p>
          <button className="primary-btn" onClick={onClose}>Got it!</button>
        </div>
      </div>
    )
  }

  const instructions = getInstallInstructions()

  return (
    <div className="pwa-installer">
      <div className="pwa-overlay" onClick={onClose} />
      <div className="pwa-content">
        <div className="pwa-header">
          <h2>{getPlatformIcon()} Install Yumi Series on {getPlatformName()}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {showInstructions ? (
          <div className="pwa-instructions">
            <h3>{instructions.title}</h3>
            <ul>
              {instructions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="pwa-benefits">
            <h3>Why install Yumi Series?</h3>
            <ul>
              <li>✨ Instant access to Writing Helper and Anime Designer</li>
              <li>📱 Works offline - create content anywhere</li>
              <li>🚀 Faster performance and smoother animations</li>
              <li>💾 Efficient storage with smart caching</li>
              <li>🔄 Automatic updates and syncing</li>
              <li>🎨 Full-screen canvas for character design</li>
              <li>📝 Distraction-free writing environment</li>
            </ul>
          </div>
        )}

        {isInstallable && !showInstructions && (
          <button className="primary-btn" onClick={handleInstallClick}>
            Install Now
          </button>
        )}

        {!isInstallable && !showInstructions && (
          <button className="secondary-btn" onClick={() => setShowInstructions(true)}>
            Show Install Instructions
          </button>
        )}

        {showInstructions && (
          <button className="secondary-btn" onClick={() => setShowInstructions(false)}>
            Back
          </button>
        )}
      </div>
    </div>
  )
}

export default PWAInstaller 