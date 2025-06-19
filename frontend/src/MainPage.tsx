import React, { useState, useEffect } from 'react';
import ChargePage from './components/ChargePage';
import ModelIntroduction from './components/ModelIntroduction';
import LayoutCustomizer from './components/LayoutCustomizer';
import { AuthModal } from './components/AuthModal';
import { billingApi } from './services/billingApi';
import { getTranslation, type Translation } from './translations';
import { useStore } from './store';
import { modeManager } from './utils/modeManager';
import { authService, User } from './services/api';
import './main.css';

interface ModeCardProps {
  icon: string;
  title: string;
  description: string;
  modeKey: string;
  installed: boolean;
  installing: boolean;
  onClick: () => void;
  onInstallToggle: (modeKey: string, install: boolean) => void;
}

const ModeCard: React.FC<ModeCardProps & { comingSoonText: string }> = ({ 
  icon, 
  title, 
  description, 
  modeKey, 
  installed, 
  installing,
  onClick, 
  onInstallToggle,
  comingSoonText 
}) => (
  <div className={`mode-card ${installed ? 'available' : 'unavailable'}`}>
    <div className="mode-icon">{icon}</div>
    <h3 className="mode-title">{title}</h3>
    <p className="mode-description">{description}</p>
    
    <div className="mode-actions">
      {installing ? (
        <div className="mode-installing">
          <div className="installing-spinner"></div>
          <span>Installing...</span>
        </div>
      ) : installed ? (
        <>
          <button 
            className="mode-enter-btn"
            onClick={onClick}
          >
            Enter Mode
          </button>
          <button 
            className="mode-uninstall-btn"
            onClick={() => onInstallToggle(modeKey, false)}
          >
            Uninstall
          </button>
        </>
      ) : (
        <button 
          className="mode-install-btn"
          onClick={() => onInstallToggle(modeKey, true)}
        >
          📦 Install Mode
        </button>
      )}
    </div>
  </div>
);

interface MainPageProps {
  onModeSelect: (mode: string) => void;
}

type Language = 'en' | 'cn' | 'jp' | 'kr';

const MainPage: React.FC<MainPageProps> = ({ onModeSelect }) => {
  const { language, setLanguage, showLayoutCustomizer, setShowLayoutCustomizer, installedModes, setInstalledModes } = useStore();
  const [showChargePage, setShowChargePage] = useState(false);
  const [showModelGuide, setShowModelGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userTokens, setUserTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [installingModes, setInstallingModes] = useState<Set<string>>(new Set());

  const t = getTranslation(language);

  useEffect(() => {
    checkAuthStatus();
    loadUserBilling();
    loadInstalledModes();
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
                className="model-guide-btn"
                onClick={() => setShowModelGuide(true)}
                title="AI Model Guide - Learn about available models"
              >
                <span className="model-guide-icon">🤖</span>
                <span className="model-guide-text">{t.modelGuide}</span>
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
        
        <div className="modes-grid">
          {allModes.map((mode) => (
            <ModeCard
              key={mode.key}
              icon={mode.icon}
              title={mode.title}
              description={mode.description}
              modeKey={mode.key}
              installed={installedModes.includes(mode.key)}
              installing={installingModes.has(mode.key)}
              onClick={() => handleModeSelect(mode.key)}
              onInstallToggle={handleInstallToggle}
              comingSoonText={t.comingSoon}
            />
          ))}
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
                  onChange={(e) => setLanguage(e.target.value as Language)}
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

      {/* Layout Customizer Modal */}
      <LayoutCustomizer 
        isOpen={showLayoutCustomizer}
        onClose={() => setShowLayoutCustomizer(false)}
        t={t}
      />
    </div>
  );
};

export default MainPage; 