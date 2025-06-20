import React, { useState, Suspense, useEffect } from 'react'
import MainPage from './MainPage'
import { dynamicLoader } from './utils/dynamicLoader'
import { useAssistantStore } from './store/assistant'
import AIAssistant from './components/AIAssistant'

type AppMode = 'main' | 'web-builder' | 'writing-helper' | 'report-writer' | 'anime-chara-helper' | 'study-advisor'

// Loading component for suspense
const LoadingComponent = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid rgba(255,255,255,0.3)', 
        borderTop: '4px solid white', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      Loading Mode...
    </div>
  </div>
);

// Dynamic component wrapper
const DynamicModeComponent = ({ modeId, onBack }: { modeId: string, onBack: () => void }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        const LoadedComponent = await dynamicLoader.loadComponent(modeId);
        if (LoadedComponent) {
          setComponent(() => LoadedComponent);
        } else {
          setError(`Mode ${modeId} is not installed or failed to load`);
        }
      } catch (err) {
        setError(`Failed to load ${modeId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    loadComponent();
  }, [modeId]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2>❌ Mode Not Available</h2>
        <p>{error}</p>
        <button
          onClick={onBack}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ← Back to Main
        </button>
      </div>
    );
  }

  if (!Component) {
    return <LoadingComponent />;
  }

  // Handle different component prop patterns
  const getComponentProps = () => {
    switch (modeId) {
      case 'anime-chara-helper':
        return { onBack };
      case 'study-advisor':
        return {};
      default:
        return { onBackToMain: onBack };
    }
  };

  return <Component {...getComponentProps()} />;
};

const App: React.FC = () => {
  const { isOpen, openAssistant, closeAssistant, mode } = useAssistantStore();
  const [currentMode, setCurrentMode] = useState<AppMode>('main')

  const handleModeSelect = (mode: string) => {
    if (mode === 'web-builder' || mode === 'writing-helper' || mode === 'report-writer' || mode === 'anime-chara-helper' || mode === 'study-advisor') {
      setCurrentMode(mode as AppMode)
    }
  }

  const handleBackToMain = () => {
    setCurrentMode('main')
  }

  // Preload installed components on app start
  useEffect(() => {
    dynamicLoader.preloadInstalledComponents();
  }, []);

  return (
    <>
      <Suspense fallback={<LoadingComponent />}>
        {currentMode === 'main' && (
          <MainPage onModeSelect={handleModeSelect} />
        )}
        {currentMode !== 'main' && (
          <>
            {currentMode === 'study-advisor' ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={handleBackToMain}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000,
                    padding: '10px 20px',
                    background: 'rgba(255,255,255,0.9)',
                    border: '2px solid #667eea',
                    borderRadius: '25px',
                    color: '#667eea',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ← Back to Main
                </button>
                <DynamicModeComponent modeId={currentMode} onBack={handleBackToMain} />
              </div>
            ) : (
              <DynamicModeComponent modeId={currentMode} onBack={handleBackToMain} />
            )}
          </>
        )}
      </Suspense>
      {/* Floating AI Assistant Button */}
      <div className="floating-ai-assistant-global">
        <button
          className="ai-assistant-btn-global"
          onClick={openAssistant}
          title="Yumi AI Assistant - Get help anywhere"
        >
          <span className="ai-assistant-icon">🤖</span>
        </button>
      </div>
      {/* Global AI Assistant Modal */}
      {isOpen && (
        <AIAssistant
          mode={mode}
          onClose={closeAssistant}
        />
      )}
    </>
  )
}

export default App 