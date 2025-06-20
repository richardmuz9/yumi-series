import React from 'react';

type Step = 'idea' | 'template' | 'outline' | 'drawing' | 'complete';

interface TopToolbarProps {
  isFullscreen: boolean;
  currentStep: Step;
  onToggleFullscreen: () => void;
  onTogglePalette: () => void;
  onTogglePoseLibrary: () => void;
  onTogglePersonality: () => void;
  onExport: () => void;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
  t: any; // Translation object
  onShowUploadModal: () => void;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  isFullscreen,
  currentStep,
  onToggleFullscreen,
  onTogglePalette,
  onTogglePoseLibrary,
  onTogglePersonality,
  onExport,
  onBack,
  onPrevious,
  onNext,
  canGoNext,
  t,
  onShowUploadModal
}) => {
  const getStepIndicator = () => {
    const stepMap = {
      'idea': 'I',
      'template': 'T', 
      'outline': 'O',
      'drawing': 'D',
      'complete': 'C'
    };
    return stepMap[currentStep] || 'I';
  };

  const getStepColor = () => {
    const colorMap = {
      'idea': '#8b5cf6',
      'template': '#06b6d4',
      'outline': '#10b981',
      'drawing': '#f59e0b',
      'complete': '#ef4444'
    };
    return colorMap[currentStep] || '#8b5cf6';
  };

  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div className="top-toolbar">
      {/* Left Section - Back and Title */}
      <div className="toolbar-left">
        <button 
          className="back-btn" 
          onClick={onBack}
          title="Back to Main"
        >
          ← Back
        </button>
        
        <div className="app-title">
          <span className="title-text">Anime Character Designer</span>
          <div 
            className="step-indicator"
            style={{ backgroundColor: getStepColor() }}
          >
            {getStepIndicator()}
          </div>
        </div>
      </div>

      {/* Center Section - Tools */}
      <div className="toolbar-center">
        <div className="tool-group">
          <button
            className="tool-btn fullscreen-btn"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? '🗗' : '🗖'}
          </button>
          
          <button
            className="tool-btn palette-btn"
            onClick={onTogglePalette}
            title="Adaptive Palette"
          >
            🎨
          </button>
          
          <button
            className="tool-btn pose-btn"
            onClick={onTogglePoseLibrary}
            title="Pose Library"
          >
            🎭
          </button>
          
          <button
            className="tool-btn personality-btn"
            onClick={onTogglePersonality}
            title="Personality Builder"
          >
            👤
          </button>
          
          <button
            className="tool-btn export-btn"
            onClick={onExport}
            title="Export Sprites"
          >
            📤
          </button>
          
          {isMobile() && (
            <button
              className="tool-btn upload-outline-btn"
              onClick={onShowUploadModal}
              title="Upload Outline (Mobile Only)"
            >
              📷 Upload Outline
            </button>
          )}
        </div>
      </div>

      {/* Right Section - Navigation */}
      <div className="toolbar-right">
        <div className="nav-controls">
          <button
            className="nav-btn prev-btn"
            onClick={onPrevious}
            disabled={currentStep === 'idea'}
            title="Previous Step"
          >
            ←
          </button>
          
          <button
            className="nav-btn next-btn"
            onClick={onNext}
            disabled={currentStep === 'complete' || !canGoNext}
            title="Next Step"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopToolbar; 