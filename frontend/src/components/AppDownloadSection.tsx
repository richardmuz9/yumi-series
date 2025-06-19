import React, { useState, useEffect } from 'react'
import PWAInstaller from './PWAInstaller'
import './AppDownloadSection.css'

interface AppDownloadSectionProps {
  onClose: () => void
}

const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop' | 'web'>('mobile')
  const [userAgent, setUserAgent] = useState('')

  useEffect(() => {
    setUserAgent(navigator.userAgent)
  }, [])

  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
  const isAndroid = /Android/.test(userAgent)
  const isMac = /Mac/.test(userAgent)
  const isWindows = /Windows/.test(userAgent)
  const isLinux = /Linux/.test(userAgent) && !isAndroid

  const downloadLinks = {
    // Desktop Apps (using Capacitor/Electron builds)
    desktop: {
      windows: '#', // Would link to actual .exe download
      mac: '#',     // Would link to actual .dmg download  
      linux: '#'   // Would link to actual .AppImage download
    },
    // Mobile Apps (using Capacitor builds)
    mobile: {
      android: {
        playStore: '#', // Would link to Play Store
        apk: '#'       // Would link to direct APK download
      },
      ios: {
        appStore: '#'  // Would link to App Store
      }
    }
  }

  return (
    <div className="app-download-overlay">
      <div className="app-download-container">
        <div className="app-download-header">
          <h2>📱 Download Yumi Series</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="download-tabs">
          <button 
            className={`tab ${activeTab === 'mobile' ? 'active' : ''}`}
            onClick={() => setActiveTab('mobile')}
          >
            📱 Mobile Apps
          </button>
          <button 
            className={`tab ${activeTab === 'desktop' ? 'active' : ''}`}
            onClick={() => setActiveTab('desktop')}
          >
            💻 Desktop Apps
          </button>
          <button 
            className={`tab ${activeTab === 'web' ? 'active' : ''}`}
            onClick={() => setActiveTab('web')}
          >
            🌐 Web App
          </button>
        </div>

        <div className="download-content">
          {activeTab === 'mobile' && (
            <div className="mobile-downloads">
              <h3>Mobile Applications</h3>
              
              {/* Android Section */}
              <div className="platform-section">
                <div className="platform-header">
                  <h4>🤖 Android</h4>
                  {isAndroid && <span className="detected">Your device</span>}
                </div>
                <div className="download-options">
                  <div className="download-card recommended">
                    <div className="card-icon">🏪</div>
                    <div className="card-content">
                      <h5>Google Play Store</h5>
                      <p>Official release, automatic updates</p>
                      <div className="features">
                        ✓ Verified by Google • ✓ Auto updates • ✓ Safe install
                      </div>
                    </div>
                    <button className="download-btn primary" disabled>
                      <span>🔜 Coming Soon</span>
                    </button>
                  </div>
                  
                  <div className="download-card">
                    <div className="card-icon">📦</div>
                    <div className="card-content">
                      <h5>Direct APK</h5>
                      <p>Download and install manually</p>
                      <div className="features">
                        ✓ Latest version • ⚠️ Enable unknown sources
                      </div>
                    </div>
                    <button className="download-btn secondary" disabled>
                      <span>🔜 Download APK</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* iOS Section */}
              <div className="platform-section">
                <div className="platform-header">
                  <h4>📱 iOS</h4>
                  {isIOS && <span className="detected">Your device</span>}
                </div>
                <div className="download-options">
                  <div className="download-card recommended">
                    <div className="card-icon">🍎</div>
                    <div className="card-content">
                      <h5>App Store</h5>
                      <p>Official iOS app with full features</p>
                      <div className="features">
                        ✓ App Store verified • ✓ Auto updates • ✓ iOS optimized
                      </div>
                    </div>
                    <button className="download-btn primary" disabled>
                      <span>🔜 Coming Soon</span>
                    </button>
                  </div>
                </div>
                
                <div className="ios-pwa-note">
                  <h5>💡 Install Web App (Available Now)</h5>
                  <p>You can install the web version as an app on iOS:</p>
                  <ol>
                    <li>Open this website in Safari</li>
                    <li>Tap the Share button (📤)</li>
                    <li>Select "Add to Home Screen"</li>
                    <li>Tap "Add" to install</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="desktop-downloads">
              <h3>Desktop Applications</h3>
              
              {/* Windows Section */}
              <div className="platform-section">
                <div className="platform-header">
                  <h4>🪟 Windows</h4>
                  {isWindows && <span className="detected">Your system</span>}
                </div>
                <div className="download-options">
                  <div className="download-card recommended">
                    <div className="card-icon">💾</div>
                    <div className="card-content">
                      <h5>Windows Installer (.exe)</h5>
                      <p>Full Windows application with offline features</p>
                      <div className="features">
                        ✓ Offline mode • ✓ Native performance • ✓ System integration
                      </div>
                      <div className="system-requirements">
                        <small>Requires: Windows 10 or higher</small>
                      </div>
                    </div>
                    <button className="download-btn primary" disabled>
                      <span>🔜 Download for Windows</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mac Section */}
              <div className="platform-section">
                <div className="platform-header">
                  <h4>🍎 macOS</h4>
                  {isMac && <span className="detected">Your system</span>}
                </div>
                <div className="download-options">
                  <div className="download-card recommended">
                    <div className="card-icon">💿</div>
                    <div className="card-content">
                      <h5>macOS App (.dmg)</h5>
                      <p>Native macOS application with Touch Bar support</p>
                      <div className="features">
                        ✓ macOS optimized • ✓ Touch Bar • ✓ Retina display
                      </div>
                      <div className="system-requirements">
                        <small>Requires: macOS 10.15 or higher</small>
                      </div>
                    </div>
                    <button className="download-btn primary" disabled>
                      <span>🔜 Download for Mac</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Linux Section */}
              <div className="platform-section">
                <div className="platform-header">
                  <h4>🐧 Linux</h4>
                  {isLinux && <span className="detected">Your system</span>}
                </div>
                <div className="download-options">
                  <div className="download-card recommended">
                    <div className="card-icon">📋</div>
                    <div className="card-content">
                      <h5>AppImage</h5>
                      <p>Portable Linux application, works on all distributions</p>
                      <div className="features">
                        ✓ Portable • ✓ No installation needed • ✓ All distros
                      </div>
                      <div className="system-requirements">
                        <small>Compatible with most Linux distributions</small>
                      </div>
                    </div>
                    <button className="download-btn primary" disabled>
                      <span>🔜 Download AppImage</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'web' && (
            <div className="web-app-section">
              <h3>Progressive Web App</h3>
              <p>Install the web version for app-like experience with offline capabilities.</p>
              
              <PWAInstaller className="embedded-pwa-installer" />
              
              <div className="web-app-benefits">
                <h4>Why Choose the Web App?</h4>
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <span className="benefit-icon">⚡</span>
                    <div className="benefit-content">
                      <h5>Instant Access</h5>
                      <p>No download required, starts immediately</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🔄</span>
                    <div className="benefit-content">
                      <h5>Always Updated</h5>
                      <p>Automatically gets latest features</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🌐</span>
                    <div className="benefit-content">
                      <h5>Cross Platform</h5>
                      <p>Works on any device with a browser</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">💾</span>
                    <div className="benefit-content">
                      <h5>Offline Support</h5>
                      <p>Works without internet connection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="download-footer">
          <div className="coming-soon-notice">
            <h4>🚀 Native Apps Coming Soon!</h4>
            <p>We're working on native mobile and desktop applications. The web app is fully functional and provides the same features.</p>
          </div>
          
          <div className="support-links">
            <h5>Need Help?</h5>
            <div className="links">
              <a href="#" className="support-link">📖 Installation Guide</a>
              <a href="#" className="support-link">❓ FAQ</a>
              <a href="#" className="support-link">💬 Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppDownloadSection 