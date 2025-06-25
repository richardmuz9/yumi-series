import React, { useState, Suspense, useEffect, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CircularProgress } from '@mui/material'
import { LanguageProvider } from './contexts/LanguageContext'
import { dynamicLoader } from './utils/dynamicLoader'

// Lazy load components
const MainPage = lazy(() => import('./MainPage'))
const AIAssistant = lazy(() => import('./components/AIAssistant'))
const ChargePage = lazy(() => import('./components/ChargePage'))
const WritingHelperApp = lazy(() => import('./writing-helper/WritingHelperApp'))
const AnimeCharaHelperApp = lazy(() => import('./anime-chara-helper/AnimeCharaHelperApp'))

// Loading component for suspense
const LoadingComponent = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <span>Loading...</span>
  </div>
);

const App: React.FC = () => {
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  // Preload installed components on app start
  useEffect(() => {
    dynamicLoader.preloadInstalledComponents();
  }, []);

  const handleModeSelect = (mode: string) => {
    // Handle mode selection
  };

  const handleBack = () => {
    // Handle back navigation
  };

  return (
    <Suspense fallback={<CircularProgress />}>
      <LanguageProvider>
        <Router>
          <div className="app-container">
            <Suspense fallback={<LoadingComponent />}>
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/writing" element={<WritingHelperApp />} />
                <Route path="/writing-helper" element={<WritingHelperApp />} />
                <Route path="/anime-chara" element={<AnimeCharaHelperApp onBack={handleBack} />} />
                <Route path="/charge" element={<ChargePage onClose={() => {}} />} />
              </Routes>
            </Suspense>

            {isAssistantOpen && (
              <div className="ai-assistant-container">
                <Suspense fallback={<LoadingComponent />}>
                  <AIAssistant onClose={() => setAssistantOpen(false)} />
                </Suspense>
              </div>
            )}
          </div>
        </Router>
      </LanguageProvider>
    </Suspense>
  )
}

export default App 