import React, { useState, useEffect } from 'react';
import ChargePage from './components/ChargePage';
import ModelIntroduction from './components/ModelIntroduction';
import LayoutCustomizer from './components/LayoutCustomizer';
import AppDownloadSection from './components/AppDownloadSection';
import AIAssistant from './components/AIAssistant';
import { AuthModal } from './components/AuthModal';
import ModeLauncher from './components/ModeLauncher';
import { billingApi } from './services/billingApi';
import { getTranslation, type Translation } from './translations';
import { useStore } from './store';
import useGlobalLanguage from './hooks/useGlobalLanguage';
import { modeManager } from './utils/modeManager';
import { authService, User } from './services/api';
import './main.css';
import './components/ModeLauncher.css';

// Mode card component removed - using ModeLauncher instead

interface MainPageProps {
  onModeSelect: (mode: string) => void;
}

type Language = 'en' | 'cn' | 'jp' | 'kr';

const MainPage: React.FC<MainPageProps> = ({ onModeSelect }) => {
  const { showLayoutCustomizer, setShowLayoutCustomizer, installedModes, setInstalledModes } = useStore();
  const { language, translations: t, switchLanguage, availableLanguages } = useGlobalLanguage();
  const [showChargePage, setShowChargePage] = useState(false);
  const [showModelGuide, setShowModelGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAIWelcome, setShowAIWelcome] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userTokens, setUserTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [installingModes, setInstallingModes] = useState<Set<string>>(new Set());

  useEffect(() => {
    // PWA debugging at app startup
    console.log('[PWA][MainPage] App initialization - PWA checks:')
    console.log('  - Service Worker support:', 'serviceWorker' in navigator)
    console.log('  - Current protocol:', window.location.protocol)
    console.log('  - Is HTTPS:', window.location.protocol === 'https:')
    console.log('  - Is standalone mode:', window.matchMedia('(display-mode: standalone)').matches)
    console.log('  - Has navigator.standalone:', !!(navigator as any).standalone)
    console.log('  - Window.deferredPrompt exists:', !!(window as any).deferredPrompt)
    
    // Listen for beforeinstallprompt globally 
    const globalInstallHandler = (e: Event) => {
      console.log('[PWA][MainPage] Global beforeinstallprompt captured!')
      e.preventDefault()
      ;(window as any).deferredPrompt = e
    }
    
    window.addEventListener('beforeinstallprompt', globalInstallHandler)
    
    checkAuthStatus();
    loadUserBilling();
    loadInstalledModes();
    
    // Hide AI welcome tooltip after 8 seconds
    const timer = setTimeout(() => {
      setShowAIWelcome(false);
    }, 8000);
    
    // Listen for language change events to update the interface
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('[UI][MainPage] Received language change event:', customEvent.detail)
      console.log('[UI][MainPage] Current language state:', language)
      console.log('[UI][MainPage] Current translations sample:', {
        title: t.title,
        subtitle: t.subtitle,
        charge: t.charge
      })
      // Force component re-render by updating state
      setUser(prev => prev) // Trigger state update
    }
    
    const handleForceRerender = (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('[UI][MainPage] Received force rerender event:', customEvent.detail)
      setUser(prev => prev) // Trigger state update
    }
    
    window.addEventListener('languageChanged', handleLanguageChange)
    window.addEventListener('forceRerender', handleForceRerender)
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('languageChanged', handleLanguageChange)
      window.removeEventListener('forceRerender', handleForceRerender)
      window.removeEventListener('beforeinstallprompt', globalInstallHandler)
    }
  }, []);

  const checkAuthStatus = async () => {
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      // Refresh user profile to get latest data
      try {
        const profile = await authService.getProfile();
        if (profile.success && profile.user) {
          setUser(profile.user);
        }
      } catch (error) {
        console.error('Failed to refresh profile:', error);
      }
    }
  };

  const loadInstalledModes = async () => {
    try {
      const installed = await modeManager.getInstalledModes();
      setInstalledModes(installed);
    } catch (error) {
      console.error('Failed to load installed modes:', error);
      // Default to core mode only
      setInstalledModes(['web-builder']);
    }
  };

  const loadUserBilling = async () => {
    try {
      const billing = await billingApi.getUserBilling();
      setUserTokens(billing.creditsBalance || 0);
    } catch (error) {
      console.error('Failed to load user billing:', error);
      // Set default credits if API fails
      setUserTokens(5.00);
    } finally {
      setLoading(false);
    }
  };

  const formatTokens = (credits: number | null | undefined) => {
    if (!credits && credits !== 0) return '$0.00';
    return `$${credits.toFixed(2)}`;
  };

  const handleModeSelect = async (modeKey: string) => {
    // Check if user is authenticated for premium features
    if (!user && ['report-writer', 'writing-helper'].includes(modeKey)) {
      setShowAuthModal(true);
      return;
    }
    
    // Log mode usage when user enters mode
    await modeManager.logModeUsage(modeKey);
    onModeSelect(modeKey);
  };

  const handleAuthSuccess = () => {
    checkAuthStatus();
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setUserTokens(null);
  };

  const handleInstallToggle = async (modeKey: string, install: boolean) => {
    setInstallingModes(prev => new Set(prev).add(modeKey));
    
    try {
      if (install) {
        // Install mode
        await modeManager.installMode(modeKey);
        setInstalledModes([...installedModes, modeKey]);
      } else {
        // Uninstall mode  
        await modeManager.uninstallMode(modeKey);
        setInstalledModes(installedModes.filter(mode => mode !== modeKey));
      }
    } catch (error) {
      console.error(`Failed to ${install ? 'install' : 'uninstall'} mode:`, error);
      // You could show a toast notification here
    } finally {
      setInstallingModes(prev => {
        const newSet = new Set(prev);
        newSet.delete(modeKey);
        return newSet;
      });
    }
  };

  const allModes = [
    {
      icon: '🌐',
      title: t.webBuilder,
      description: t.webBuilderDesc,
      key: 'web-builder'
    },
    {
      icon: '✒️',
      title: 'Writing Helper',
      description: 'AI-powered writing assistant for scripts, blogs, posts & creative content',
      key: 'writing-helper'
    },
    {
      icon: '📊',
      title: t.reportWriter,
      description: t.reportWriterDesc,
      key: 'report-writer'
    },
    {
      icon: '🎨',
      title: t.animeCharaHelper,
      description: t.animeCharaHelperDesc,
      key: 'anime-chara-helper'
    },
    {
      icon: '🎓',
      title: t.studyAdvisor,
      description: t.studyAdvisorDesc,
      key: 'study-advisor'
    }
  ];

  // Filter modes based on what's installed
  const availableModes = allModes.filter(mode => installedModes.includes(mode.key));

  return (
    <div className="main-container">
      <div className="main-background" />
      
      {/* Charge Button - Left Side */}
      <div className="charge-sidebar">
        <div className="charge-button" onClick={() => setShowChargePage(true)}>
          <div className="charge-icon">💎</div>
          <div className="charge-label">{t.charge}</div>
          {userTokens !== null && !loading && (
            <div className="token-count">
              <span className="token-amount">{formatTokens(userTokens)}</span>
              <span className="token-unit">credits</span>
            </div>
          )}
          {loading && (
            <div className="token-loading">
              <div className="loading-dot"></div>
            </div>
          )}
        </div>
      </div>

      <div className="main-content">
        <header className="main-header">
          <div className="header-top">
            <div className="header-buttons">
              {user ? (
                <div className="user-menu">
                  <span className="user-welcome">👋 {user.username}</span>
                  <button 
                    className="logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <span className="logout-icon">🚪</span>
                    <span className="logout-text">Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  className="auth-btn"
                  onClick={() => setShowAuthModal(true)}
                  title="Sign In / Sign Up"
                >
                  <span className="auth-icon">👤</span>
                  <span className="auth-text">Sign In</span>
                </button>
              )}
              <button 
                className="settings-btn"
                onClick={() => setShowSettings(true)}
                title={t.settings}
              >
                <span className="settings-icon">⚙️</span>
                <span className="settings-text">{t.settings}</span>
              </button>

              <button 
                className="download-btn"
                onClick={() => setShowDownloads(true)}
                title="Download mobile and desktop apps"
              >
                <span className="download-icon">📱</span>
                <span className="download-text">Download</span>
              </button>
            </div>
          </div>
          
          <h1 className="main-title">
            <span className="yumi-text">Yumi</span>
            <span className="series-text">Series</span>
          </h1>
          <p className="main-subtitle">
            {t.subtitle}
          </p>
        </header>
        
        {/* Simplified main content area - ModeLauncher will handle mode selection */}
        <div className="main-welcome-section">
          <div className="welcome-content">
            <h2 className="welcome-heading">🚀 Ready to Create?</h2>
            <p className="welcome-description">
              Use the mode launcher on the right to access your AI tools.
              Customize which modes appear in your favorites for quick access.
            </p>
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-number">{installedModes.length}</span>
                <span className="stat-label">Installed Modes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{formatTokens(userTokens)}</span>
                <span className="stat-label">Available Credits</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{Object.keys(getTranslation('en')).length}+</span>
                <span className="stat-label">Features</span>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="main-footer">
          <p>{t.footer}</p>
        </footer>
      </div>

      {/* Charge Page Modal */}
      {showChargePage && (
        <ChargePage 
          onClose={() => {
            setShowChargePage(false);
            loadUserBilling(); // Refresh token count after charge page closes
          }} 
        />
      )}

      {/* Model Guide Modal */}
      {showModelGuide && (
        <ModelIntroduction 
          onClose={() => setShowModelGuide(false)} 
        />
      )}

      {/* App Download Modal */}
      {showDownloads && (
        <AppDownloadSection 
          onClose={() => setShowDownloads(false)} 
        />
      )}

      {/* Layout Customizer Modal */}
      {showLayoutCustomizer && (
        <LayoutCustomizer 
          isOpen={showLayoutCustomizer}
          onClose={() => setShowLayoutCustomizer(false)}
          t={t}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>{t.settings}</h2>
              <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <label className="setting-label">{t.language}</label>
                <select 
                  className="language-selector"
                  value={language}
                  onChange={(e) => switchLanguage(e.target.value as 'en' | 'zh' | 'ja' | 'ko')}
                >
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="ja">日본語</option>
                  <option value="ko">한국어</option>
                </select>
              </div>
              
              <div className="setting-item">
                <button 
                  className="customize-layout-btn"
                  onClick={() => {
                    setShowSettings(false);
                    setShowLayoutCustomizer(true);
                  }}
                >
                  🎨 {t.customizeLayout}
                </button>
                <p className="setting-description">
                  {t.customizeLayoutDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <AIAssistant 
          onClose={() => setShowAIAssistant(false)} 
        />
      )}

      {/* Floating AI Assistant Button */}
      <div className="floating-ai-assistant">
        <button 
          className="ai-assistant-btn"
          onClick={() => {
            setShowAIAssistant(true);
            setShowAIWelcome(false);
          }}
          title="Yumi AI Assistant - Get help with models, features, and billing"
        >
          <div className="ai-assistant-icon">🤖</div>
          <div className="ai-assistant-pulse"></div>
        </button>
        
        {/* Welcome Tooltip */}
        {showAIWelcome && (
          <div className="ai-welcome-tooltip">
            <div className="ai-welcome-content">
              <div className="ai-welcome-header">
                <span className="ai-welcome-icon">🤖</span>
                <strong>New: AI Assistant!</strong>
              </div>
              <p>Get help with models, features, billing & feedback!</p>
              <button 
                className="ai-welcome-close"
                onClick={() => setShowAIWelcome(false)}
              >
                ×
              </button>
            </div>
            <div className="ai-welcome-arrow"></div>
          </div>
        )}
      </div>

      {/* Layout Customizer Modal */}
      <LayoutCustomizer 
        isOpen={showLayoutCustomizer}
        onClose={() => setShowLayoutCustomizer(false)}
        t={t}
      />

      {/* Control Center-style Mode Launcher */}
      <ModeLauncher
        onModeSelect={handleModeSelect}
        installedModes={installedModes}
        installingModes={installingModes}
        onInstallToggle={handleInstallToggle}
      />
    </div>
  );
};

export default MainPage; 