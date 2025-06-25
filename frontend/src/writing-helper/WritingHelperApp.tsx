import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import WritingScreen from './WritingScreen';
import WritingHelperScreen from './WritingHelperScreen';
import ReportHelperScreen from './ReportHelperScreen';
import './WritingHelper.css';

export interface WritingHelperAppProps {
  onBack?: () => void;
}

export type ActiveScreen = 'main' | 'writing' | 'report';

const WritingHelperApp: React.FC<WritingHelperAppProps> = ({ onBack }) => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('main');
  const [content, setContent] = useState('');
  
  // Background customization for main screen
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'gradient' as 'solid' | 'gradient' | 'image',
    color: '#1a1a2e',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    image: '',
    opacity: 1
  });

  // Icon positioning for main screen
  const [iconPositions, setIconPositions] = useState({
    writing: { x: 50, y: 100 },
    report: { x: window.innerWidth - 200, y: 100 }
  });

  const handleScreenChange = (screen: ActiveScreen) => {
    setActiveScreen(screen);
  };

  const handleBackToMain = () => {
    setActiveScreen('main');
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleBackgroundChange = (settings: typeof backgroundSettings) => {
    setBackgroundSettings(settings);
  };

  const handleIconPositionChange = (section: 'writing' | 'report', position: { x: number; y: number }) => {
    setIconPositions(prev => ({
      ...prev,
      [section]: position
    }));
  };

  // Render based on active screen
  switch (activeScreen) {
    case 'writing':
      return (
        <div className="writing-helper-app">
          {onBack && (
            <IconButton 
              className="back-button"
              onClick={onBack}
              sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <WritingHelperScreen
            content={content}
            onContentChange={handleContentChange}
            onBack={handleBackToMain}
          />
        </div>
      );
      
    case 'report':
      return (
        <div className="writing-helper-app">
          {onBack && (
            <IconButton 
              className="back-button"
              onClick={onBack}
              sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <ReportHelperScreen
            content={content}
            onContentChange={handleContentChange}
            onBack={handleBackToMain}
          />
        </div>
      );
      
    default:
      return (
        <div className="writing-helper-app">
          {onBack && (
            <IconButton 
              className="back-button"
              onClick={onBack}
              sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <WritingScreen
            backgroundSettings={backgroundSettings}
            onBackgroundChange={handleBackgroundChange}
            iconPositions={iconPositions}
            onIconPositionChange={handleIconPositionChange}
            onScreenChange={handleScreenChange}
            onBack={onBack}
          />
        </div>
      );
  }
};

export default WritingHelperApp; 