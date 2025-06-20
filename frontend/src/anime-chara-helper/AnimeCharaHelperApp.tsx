import React, { useState, useEffect, useRef } from 'react'
import { ModelSwitcher } from '../components/ModelSwitcher'
import { useStore } from '../store';
import LayoutCustomizer from '../components/LayoutCustomizer';
import { getTranslation } from '../translations';
import CharacterChat from './components/CharacterChat';
import TemplateLibrary from './components/TemplateLibrary';
import OutlineGenerator from './components/OutlineGenerator';
import ProgressAnalyzer from './components/ProgressAnalyzer';
import CanvasArea, { CanvasAreaRef } from './components/CanvasArea';
import StepNavigation from './components/StepNavigation';
import TopToolbar from './components/TopToolbar';
import ColorPaletteEngine from './components/ColorPaletteEngine';
import PoseLibrary from './components/PoseLibrary';
import Playbook from './components/Playbook';
import MasterclassModule from './components/MasterclassModule';
import CaseStudies from './components/CaseStudies';
import OutlineUploadModal from './components/OutlineUploadModal';
import DraggableResizableImage from './components/DraggableResizableImage';
import './AnimeCharaHelper.css';

interface AnimeCharaHelperAppProps {
  onBack: () => void;
}

type Step = 'idea' | 'template' | 'outline' | 'drawing' | 'complete';

const AnimeCharaHelperApp: React.FC<AnimeCharaHelperAppProps> = ({ onBack }) => {
  const { language, showLayoutCustomizer, setShowLayoutCustomizer } = useStore();
  const t = getTranslation(language);
  const canvasRef = useRef<CanvasAreaRef>(null);

  // Core state
  const [currentStep, setCurrentStep] = useState<Step>('idea');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localShowCustomizer, setLocalShowCustomizer] = useState(false);

  // Data state
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [designBrief, setDesignBrief] = useState<any>(null);
  const [outlineUrl, setOutlineUrl] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // UI state
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [selectedLeftTab, setSelectedLeftTab] = useState<'selection' | 'ai-help' | 'history'>('selection');
  const [selectedRightTab, setSelectedRightTab] = useState<'actions' | 'export' | 'settings'>('actions');

  // Modal state
  const [showPaletteEngine, setShowPaletteEngine] = useState(false);
  const [showPoseLibrary, setShowPoseLibrary] = useState(false);
  const [showMasterclass, setShowMasterclass] = useState(false);
  const [showCaseStudies, setShowCaseStudies] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingOutline, setPendingOutline] = useState<string | null>(null);
  const [showOutlineOverlay, setShowOutlineOverlay] = useState(false);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);

  useEffect(() => {
    if (showLayoutCustomizer !== localShowCustomizer) {
      setLocalShowCustomizer(showLayoutCustomizer);
    }
  }, [showLayoutCustomizer]);

  // Step management
  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    const steps: Step[] = ['idea', 'template', 'outline', 'drawing', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: Step[] = ['idea', 'template', 'outline', 'drawing', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const canProgressFromCurrentStep = () => {
    switch (currentStep) {
      case 'idea': return designBrief !== null;
      case 'template': return selectedTemplate !== null;
      case 'outline': return outlineUrl !== null;
      case 'drawing': return true;
      case 'complete': return false;
      default: return false;
    }
  };

  // Event handlers
  const handleCharacterChatComplete = (data: any) => {
    setDesignBrief(data.designBrief);
          setSessionId(data.sessionId);
    if (canProgressFromCurrentStep()) {
      handleNext();
        }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    if (canProgressFromCurrentStep()) {
      handleNext();
        }
  };

  const handleOutlineComplete = (data: any) => {
          setOutlineUrl(data.outlineUrl);
    if (canvasRef.current && data.outlineUrl) {
      canvasRef.current.loadOutline(data.outlineUrl);
    }
    if (canProgressFromCurrentStep()) {
      handleNext();
    }
  };

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const drawingData = canvasRef.current.saveDrawing();
      const layers = canvasRef.current.exportLayers();
      
      console.log('Exporting artwork:', {
        drawing: drawingData,
        layers: layers,
        template: selectedTemplate,
        designBrief: designBrief,
        outline: outlineUrl
      });
      
      alert('Export feature coming soon! Your artwork has been logged to console.');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'idea':
        return (
          <CharacterChat
            onComplete={handleCharacterChatComplete}
            existingBrief={designBrief}
          />
        );
      
      case 'template':
        return (
          <TemplateLibrary
            onComplete={handleTemplateSelect}
            designBrief={designBrief}
          />
        );
      
      case 'outline':
        return (
          <OutlineGenerator
            sessionId={sessionId}
            template={selectedTemplate}
            designBrief={designBrief}
            onComplete={handleOutlineComplete}
          />
        );
      
      case 'drawing':
        return (
          <div className="drawing-workspace">
            <CanvasArea ref={canvasRef} />
            <ProgressAnalyzer
              sessionId={sessionId}
              onComplete={handleAnalysisComplete}
            />
          </div>
        );
      
      case 'complete':
        return (
          <div className="completion-screen">
            <h2>🎉 Character Complete!</h2>
            <p>Your anime character design is ready!</p>
            <div className="final-actions">
              <button onClick={handleExport} className="export-final-btn">
                📤 Export Artwork
                </button>
              <button onClick={() => setCurrentStep('idea')} className="restart-btn">
                🔄 Create New Character
                </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`anime-chara-helper enhanced ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Top Toolbar */}
      <TopToolbar
        isFullscreen={isFullscreen}
        currentStep={currentStep}
        onToggleFullscreen={toggleFullscreen}
        onTogglePalette={() => setShowPaletteEngine(true)}
        onTogglePoseLibrary={() => setShowPoseLibrary(true)}
        onTogglePersonality={() => setSelectedLeftTab('ai-help')}
        onExport={handleExport}
        onBack={onBack}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoNext={canProgressFromCurrentStep()}
        t={t}
        onShowUploadModal={() => setShowUploadModal(true)}
          />

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Playbook Sidebar */}
        <Playbook />
        {/* Left Panel */}
        <div className={`left-panel ${leftPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
              <div className="panel-tabs">
                <button
                className={`tab-btn ${selectedLeftTab === 'selection' ? 'active' : ''}`}
                onClick={() => setSelectedLeftTab('selection')}
                >
                🎯 Selection
                </button>
                <button
                className={`tab-btn ${selectedLeftTab === 'ai-help' ? 'active' : ''}`}
                onClick={() => setSelectedLeftTab('ai-help')}
                >
                🤖 AI Help
                </button>
                <button
                className={`tab-btn ${selectedLeftTab === 'history' ? 'active' : ''}`}
                onClick={() => setSelectedLeftTab('history')}
              >
                📚 History
              </button>
            </div>
            <button
              className="collapse-btn"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            >
              {leftPanelCollapsed ? '→' : '←'}
                </button>
              </div>

          {!leftPanelCollapsed && (
              <div className="panel-content">
              {selectedLeftTab === 'selection' && (
                <StepNavigation
                  currentStep={currentStep}
                  onStepChange={handleStepChange}
                  canProgress={canProgressFromCurrentStep()}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  t={t}
                />
                )}
              {selectedLeftTab === 'ai-help' && (
                <div className="ai-help-panel">
                  <h3>🤖 AI Assistant</h3>
                  <p>AI help content for current step: {currentStep}</p>
                  </div>
                )}
              {selectedLeftTab === 'history' && (
                  <div className="history-panel">
                  <h3>📚 Design History</h3>
                  <p>Previous designs and sessions</p>
                  </div>
                )}
              </div>
          )}
        </div>

        {/* Center Content */}
        <div className="center-content">
          <div className="step-content">
            {renderStepContent()}
          </div>
        </div>

        {/* Right Panel */}
        <div className={`right-panel ${rightPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <button
              className="collapse-btn"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            >
              {rightPanelCollapsed ? '←' : '→'}
            </button>
              <div className="panel-tabs">
                <button
                className={`tab-btn ${selectedRightTab === 'actions' ? 'active' : ''}`}
                onClick={() => setSelectedRightTab('actions')}
                >
                ⚡ Actions
                </button>
                <button
                className={`tab-btn ${selectedRightTab === 'export' ? 'active' : ''}`}
                onClick={() => setSelectedRightTab('export')}
                >
                📤 Export
                </button>
                <button
                className={`tab-btn ${selectedRightTab === 'settings' ? 'active' : ''}`}
                onClick={() => setSelectedRightTab('settings')}
                >
                ⚙️ Settings
                </button>
            </div>
              </div>

          {!rightPanelCollapsed && (
              <div className="panel-content">
              {selectedRightTab === 'actions' && (
                  <div className="actions-panel">
                    <h3>⚡ Quick Actions</h3>
                  <button onClick={() => setShowPaletteEngine(true)}>🎨 Color Palette</button>
                  <button onClick={() => setShowPoseLibrary(true)}>🎭 Pose Library</button>
                  <button onClick={handleExport}>📤 Export</button>
                  <button onClick={() => setShowMasterclass(true)}>🌟 Masterclass</button>
                  <button onClick={() => setShowCaseStudies(true)}>🧑‍🎨 Case Studies</button>
                  </div>
                )}
              {selectedRightTab === 'export' && (
                  <div className="export-panel">
                  <h3>📤 Export Options</h3>
                  <button onClick={handleExport}>Export Current</button>
                  </div>
                )}
              {selectedRightTab === 'settings' && (
                  <div className="settings-panel">
                    <h3>⚙️ Settings</h3>
                  <ModelSwitcher />
                  <button onClick={() => setLocalShowCustomizer(true)}>Customize Layout</button>
                  </div>
                )}
              </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {localShowCustomizer && (
        <LayoutCustomizer 
          isOpen={localShowCustomizer}
          onClose={() => setLocalShowCustomizer(false)}
          t={t}
        />
      )}

      {showPaletteEngine && (
        <ColorPaletteEngine
          selectedPalette={designBrief?.palette || { id: 'default', name: 'Default' }}
          onPaletteSelect={(palette) => {
            setDesignBrief((prev: any) => ({ ...prev, palette }));
            setShowPaletteEngine(false);
          }}
          onClose={() => setShowPaletteEngine(false)}
        />
      )}

      {showPoseLibrary && (
        <PoseLibrary
          selectedPose={designBrief?.pose || { id: 'default', name: 'Default' }}
          onPoseSelect={(pose) => {
            setDesignBrief((prev: any) => ({ ...prev, pose }));
            setShowPoseLibrary(false);
          }}
          onClose={() => setShowPoseLibrary(false)}
        />
      )}

      {showMasterclass && (
        <MasterclassModule />
      )}

      {showCaseStudies && (
        <CaseStudies />
      )}

      {/* Upload Outline Modal */}
      {showUploadModal && (
        <OutlineUploadModal
          onClose={() => setShowUploadModal(false)}
          onOutlineProcessed={(outlineData: string) => {
            setPendingOutline(outlineData);
            setOverlayImage(outlineData);
            setShowOutlineOverlay(true);
            setShowUploadModal(false);
          }}
        />
      )}
      {showOutlineOverlay && overlayImage && (
        <DraggableResizableImage
          src={overlayImage}
          onConfirm={(x, y, scale) => {
            // Draw the outline onto the canvas at (x, y) with scale
            if (canvasRef.current) {
              const canvas = canvasRef.current;
              const mainCanvas = (canvas as any).canvasRef?.current as HTMLCanvasElement;
              const ctx = mainCanvas?.getContext('2d');
              if (mainCanvas && ctx) {
                const img = new window.Image();
                img.onload = () => {
                  ctx.save();
                  ctx.globalAlpha = 0.5;
                  ctx.drawImage(
                    img,
                    x,
                    y,
                    img.width * scale,
                    img.height * scale
                  );
                  ctx.restore();
                };
                img.src = overlayImage;
              }
            }
            setShowOutlineOverlay(false);
            setOverlayImage(null);
            setPendingOutline(null);
          }}
          onCancel={() => {
            setShowOutlineOverlay(false);
            setOverlayImage(null);
            setPendingOutline(null);
          }}
        />
      )}
    </div>
  );
};

export default AnimeCharaHelperApp;
