import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModeLauncher from './components/ModeLauncher';
import AIAssistant from './components/AIAssistant';
import { AuthModal } from './components/AuthModal';
import { DownloadSection } from './components/DownloadSection';
import LayoutCustomizer from './components/LayoutCustomizer';
import { getBillingInfo } from './services/billingApi';
import type { BillingInfo } from './types/billing';
import WritingHelperScreen from './writing-helper/WritingHelperScreen';
import AnimeCharaHelperApp from './anime-chara-helper/AnimeCharaHelperApp';
import './main.css';
import './components/ModeLauncher.css';
import { useLanguagePersistence } from './hooks/useLanguagePersistence';
import { useTranslation } from 'react-i18next';
import ChargePage from './components/ChargePage';

const convertToBillingInfo = (info: any): BillingInfo => {
  return {
    tokens: info.tokens || 0,
    dailyTokensRemaining: info.dailyTokensRemaining || 0,
    blessingActive: info.blessingActive || false,
    stripeCustomerId: info.stripeCustomerId,
    subscription: info.subscription,
    freeTokensRemaining: info.freeTokensRemaining || {
      openai: 0,
      claude: 0,
      qwen: 0
    }
  };
};

const formatTokenCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [installingModes] = useState<Set<string>>(new Set(['writing', 'anime']));
  const { t } = useTranslation('main');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userBillingInfo, setUserBillingInfo] = useState<BillingInfo | null>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showModeLauncher, setShowModeLauncher] = useState(false);
  const [currentMode, setCurrentMode] = useState<'main' | 'writing' | 'anime'>('main');
  const [content, setContent] = useState('');

  useLanguagePersistence();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const info = await getBillingInfo();
        setUserBillingInfo(convertToBillingInfo(info));
      } catch (error) {
        console.error('Failed to fetch billing info:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleModeSelect = async (mode: string) => {
    if (mode === 'writing' || mode === 'anime') {
      setCurrentMode(mode);
      setShowModeLauncher(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (currentMode === 'writing') {
    return (
      <WritingHelperScreen
        content={content}
        onContentChange={setContent}
        onBack={() => setCurrentMode('main')}
      />
    );
  }

  if (currentMode === 'anime') {
    return (
      <AnimeCharaHelperApp
        onBack={() => setCurrentMode('main')}
      />
    );
  }

  return (
    <div className="main-page" style={{ backgroundImage: "url('/yumi-tusr.png')" }}>
      <div className="top-nav-icons">
        <div className="nav-left">
          <button 
            className="nav-icon-btn sign-in-btn"
            onClick={() => setShowAuthModal(true)}
            title="Sign In"
          >
            👤
          </button>
        </div>

        <div className="nav-right">
          <button 
            className="nav-icon-btn settings-btn"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            ⚙️
          </button>
          <button 
            className="nav-icon-btn download-btn"
            onClick={() => setShowDownload(true)}
            title="Download App"
          >
            📱
          </button>
          <button 
            className="nav-icon-btn mode-list-btn"
            onClick={() => setShowModeLauncher(true)}
            title="Mode List"
          >
            <div className="mode-list-icon">
              <span className="mode-icon-writing">✍️</span>
              <span className="mode-icon-anime">🎨</span>
            </div>
          </button>
        </div>
      </div>

      <main className="main-content">
        <div className="hero-overlay">
          <section className="hero-section">
            <div className="yumi-series-title">
              <h1 className="yumi-text">Yumi</h1>
              <h1 className="series-text">Series</h1>
            </div>
            <p className="yumi-description">
              Your AI-powered creative companion for writing, art, and more.
            </p>
          </section>
        </div>
      </main>

      <div className="ai-assistant-container">
        <button 
          className="ai-assistant-btn"
          onClick={() => setShowAI(true)}
          title="AI Assistant"
        >
          🤖
        </button>
        {!showAI && (
          <div className="ai-chat-hint">
            Click to chat with Yumi!
          </div>
        )}
      </div>

      <div className="charge-sidebar">
        <button 
          className="charge-button"
          onClick={() => alert('Charging feature is currently unavailable.')}
        >
          <div className="charge-icon">💎</div>
          <div className="charge-label">Charge</div>
          <div className="token-amount">
            {userBillingInfo ? formatTokenCount(userBillingInfo.tokens) : '0'} TS
          </div>
        </button>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(info) => {
            setUserBillingInfo(convertToBillingInfo(info));
            setShowAuthModal(false);
          }}
        />
      )}

      {showDownload && (
        <DownloadSection />
      )}

      {showSettings && (
        <LayoutCustomizer 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          t={t}
        />
      )}

      {showAI && (
        <AIAssistant 
          onClose={() => setShowAI(false)}
        />
      )}

      {showModeLauncher && (
        <ModeLauncher
          modes={Array.from(installingModes)}
          onSelect={handleModeSelect}
          userInfo={userBillingInfo}
          onClose={() => setShowModeLauncher(false)}
        />
      )}
    </div>
  );
};

export default MainPage; 