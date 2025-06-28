import React, { useState, Suspense, useEffect, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { CircularProgress } from '@mui/material'
import './App.css'
import AIAssistant from './components/AIAssistant'
import AuthModal from './components/AuthModal'
import { LanguageProvider } from './contexts/LanguageContext'
import { dynamicLoader } from './utils/dynamicLoader'
import { unregister } from './serviceWorkerUnregister'

// Lazy load components
const MainPage = lazy(() => import('./MainPage'))
const ChargePage = lazy(() => import('./components/ChargePage'))
const AnimeCharaHelperApp = lazy(() => import('./anime-chara-helper/AnimeCharaHelperApp'))
const MangaApp = lazy(() => import('./manga/MangaApp'))
const WritingHelperScreen = lazy(() => import('./writing-helper/WritingHelperScreen'))

// Loading component for suspense
const LoadingComponent = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <span>Loading...</span>
  </div>
);

const AppContent: React.FC = () => {
  const [isAssistantOpen, setAssistantOpen] = useState(false)
  const [content, setContent] = useState('')
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const navigate = useNavigate()

  // Unregister service worker and preload components on app start
  useEffect(() => {
    // Unregister service worker
    unregister();

    // Preload components with error handling
    const preload = async () => {
    try {
        await dynamicLoader.preloadInstalledComponents();
    } catch (e) {
      console.warn('dynamicLoader.preload failed:', e);
    }
    };
    preload();
  }, []);

  const handleModeSelect = (mode: string) => {
    // Handle mode selection
  };

  const handleBack = () => {
    navigate('/')
  }

  const handleAuthSuccess = () => {
    setAuthModalOpen(false)
    // Additional success handling if needed
  }

  return (
      <div className="App">
          <Suspense fallback={<CircularProgress />}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/writing/*" element={
                <WritingHelperScreen 
                  content={content}
                  onContentChange={setContent}
                  onBack={handleBack}
                />
              } />
              <Route path="/writing-helper/*" element={
                <WritingHelperScreen 
                  content={content}
                  onContentChange={setContent}
                  onBack={handleBack}
                />
              } />
              <Route path="/anime-chara/*" element={<AnimeCharaHelperApp onBack={handleBack} />} />
              <Route path="/manga/*" element={<MangaApp />} />
              <Route path="/charge" element={<ChargePage />} />
          <Route path="*" element={<MainPage />} />
            </Routes>
          </Suspense>
          <AIAssistant />
          <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
        </Router>
    </LanguageProvider>
  )
}

export default App 