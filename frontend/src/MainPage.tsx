import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModeLauncher from './components/ModeLauncher';
import AIAssistant from './components/AIAssistant';
import { AuthModal } from './components/AuthModal';
import { DownloadSection } from './components/DownloadSection';
import LayoutCustomizer from './components/LayoutCustomizer';
import { billingApi } from './services/billingApi';
import type { BillingInfo } from './services/billingApi';
import WritingHelperScreen from './writing-helper/WritingHelperScreen';
import AnimeCharaHelperApp from './anime-chara-helper/AnimeCharaHelperApp';
import './main.css';
import './components/ModeLauncher.css';
import { useLanguagePersistence } from './hooks/useLanguagePersistence';
import { useTranslation } from 'react-i18next';
import ChargePage from './components/ChargePage';

interface BillingInfoWithUser extends BillingInfo {
  stripeCustomerId?: string;
  subscription?: {
    status: 'active' | 'inactive' | 'cancelled';
    plan: 'free' | 'pro';
    nextBillingDate: string;
  };
}

// Helper function to convert UserBillingInfo to BillingInfoWithUser
const convertToBillingInfo = (info: any): BillingInfoWithUser => {
  return {
    tokens: info.credits || 0,
    dailyTokensRemaining: info.subscription?.plan === 'pro' ? 1000 : 100,
    blessingActive: info.subscription?.status === 'active' && info.subscription?.plan === 'pro',
    stripeCustomerId: info.stripeCustomerId,
    subscription: info.subscription
  };
};

// Helper function to format token counts
const formatTokenCount = (count: number) => {
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
  const [userBillingInfo, setUserBillingInfo] = useState<BillingInfoWithUser | null>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showModeLauncher, setShowModeLauncher] = useState(false);
  const [currentMode, setCurrentMode] = useState<'main' | 'writing' | 'anime'>('main');
  const [content, setContent] = useState(''); // For writing mode

  // Use language persistence hook
  useLanguagePersistence();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const info = await billingApi.getBillingInfo();
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
    // only gate if user has literally zero tokens
    if (!userBillingInfo || userBillingInfo.tokens < 1) {
      navigate('/charge');
      return;
    }
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

  // Render the selected mode
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
      {/* Top Navigation Icons */}
      <div className="top-nav-icons">
        {/* Left side - Sign In */}
        <div className="nav-left">
          <button 
            className="nav-icon-btn sign-in-btn"
            onClick={() => setShowAuthModal(true)}
            title="Sign In"
          >
            👤
          </button>
        </div>

        {/* Right side - Settings, Download and Mode List */}
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

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
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

      {/* Floating AI Assistant */}
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

      {/* Charge Button */}
      <div className="charge-sidebar">
        <button 
          className="charge-button"
          onClick={() => navigate('/charge')}
        >
          <div className="charge-icon">💎</div>
          <div className="charge-label">Charge</div>
          <div className="token-amount">
            {userBillingInfo ? formatTokenCount(userBillingInfo.tokens) : '0'} TS
          </div>
        </button>
      </div>

      {/* Modals */}
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