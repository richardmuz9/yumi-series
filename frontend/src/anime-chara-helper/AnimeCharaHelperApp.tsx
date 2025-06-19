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
import './AnimeCharaHelper.css';

interface AnimeCharaHelperAppProps {
  onBack: () => void;
}

type Step = 'idea' | 'template' | 'outline' | 'drawing' | 'analysis' | 'refinement';

interface DesignBrief {
  character: {
    name?: string;
    personality: string;
    age: string;
    gender: string;
  };
  appearance: {
    hair: {
      color: string;
      style: string;
      length: string;
    };
    eyes: {
      color: string;
      shape: string;
      expression: string;
    };
    outfit: {
      style: string;
      colors: string[];
      accessories: string[];
    };
    body: {
      height: string;
      build: string;
    };
  };
  mood: string;
  colorPalette: string[];
  specialFeatures: string[];
  pose: string;
  background?: string;
}

interface Template {
  id: string;
  name: string;
  style: string;
  description: string;
  thumbnail: string;
  proportions: {
    headRatio: number;
    bodyRatio: number;
    limbRatio: number;
  };
  characteristics: string[];
}

const AnimeCharaHelperApp: React.FC<AnimeCharaHelperAppProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<Step>('drawing');
  const { setProvider, setModel, language } = useStore()
  const [localShowCustomizer, setLocalShowCustomizer] = useState(false);
  const t = getTranslation(language);
  const canvasRef = useRef<CanvasAreaRef>(null);

  // Enhanced UI state for compact layout
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<'selection' | 'ai' | 'history'>('selection');
  const [activeRightTab, setActiveRightTab] = useState<'actions' | 'export' | 'settings'>('actions');
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);

  // Use free Qwen provider for Anime Character Designer
  useEffect(() => {
    setProvider('qwen')
    setModel('qwen-turbo')
  }, [setProvider, setModel])
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [designBrief, setDesignBrief] = useState<DesignBrief | null>(null);
  const [outlineUrl, setOutlineUrl] = useState<string | null>(null);
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  const [currentSelection] = useState({
    style: 'Neon Cyberpunk',
    colors: ['#ff0080', '#00ffff', '#ffff00'],
    pose: 'Confident Stand',
    poseDescription: 'Standing with hands on hips, confident pose'
  });
  const [aiSuggestions] = useState([
    'Clean up line art and remove guides',
    'Add final highlights and shadows',
    'Consider background elements'
  ]);
  const [progressStage, setProgressStage] = useState<'Outline' | 'Coloring' | 'Details' | 'Final'>('Final');

  const steps = [
    { key: 'idea', title: 'Idea & Feedback', icon: '💭' },
    { key: 'template', title: 'Template Selection', icon: '🎭' },
    { key: 'outline', title: 'Outline Generation', icon: '✏️' },
    { key: 'drawing', title: 'Drawing Canvas', icon: '🎨' },
    { key: 'analysis', title: 'Progress Analysis', icon: '🔍' },
    { key: 'refinement', title: 'Final Refinement', icon: '✨' }
  ] as const;

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const handleStepComplete = (data: any) => {
    switch (currentStep) {
      case 'idea':
        if (data.sessionId && data.designBrief) {
          setSessionId(data.sessionId);
          setDesignBrief(data.designBrief);
          setClarificationQuestions(data.clarificationQuestions || []);
          setCurrentStep('template');
        }
        break;
      case 'template':
        if (data.template) {
          setSelectedTemplate(data.template);
          setCurrentStep('outline');
        }
        break;
      case 'outline':
        if (data.outlineUrl) {
          setOutlineUrl(data.outlineUrl);
          setCurrentStep('drawing');
        }
        break;
      case 'drawing':
        setCurrentStep('analysis');
        break;
      case 'analysis':
        setCurrentStep('refinement');
        break;
      case 'refinement':
        // Character design complete
        break;
    }
  };

  const handleStepBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key as Step);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'idea':
        return (
          <CharacterChat
            onComplete={handleStepComplete}
            clarificationQuestions={clarificationQuestions}
            existingBrief={designBrief}
          />
        );
      case 'template':
        return (
          <TemplateLibrary
            onComplete={handleStepComplete}
            designBrief={designBrief}
          />
        );
      case 'outline':
        return (
          <OutlineGenerator
            sessionId={sessionId}
            template={selectedTemplate}
            designBrief={designBrief}
            onComplete={handleStepComplete}
          />
        );
      case 'drawing':
        return (
          <div className="character-designer-interface">
            <div className="designer-header">
              <div className="progress-stages">
                <span>Progress Stage:</span>
                {['Outline', 'Coloring', 'Details', 'Final'].map((stage) => (
                  <button
                    key={stage}
                    className={`stage-btn ${progressStage === stage ? 'active' : ''}`}
                    onClick={() => setProgressStage(stage as any)}
                  >
                    {stage}
                  </button>
                ))}
              </div>
              
              <div className="designer-actions">
                <button className="action-btn adaptive-palette">🎨 Adaptive Palette</button>
                <button className="action-btn pose-library">🤸 Pose Library</button>
                <button className="action-btn personality">🧠 Personality</button>
                <button className="action-btn export-sprites">📦 Export Sprites</button>
              </div>
            </div>

            <div className="designer-content">
              <div className="left-panel">
                <div className="current-selection">
                  <h3>🎯 Current Selection</h3>
                  
                  <div className="selection-item">
                    <div className="selection-header">
                      <div className="style-icon">🌈</div>
                      <span className="style-name">{currentSelection.style}</span>
                    </div>
                    <div className="color-palette">
                      {currentSelection.colors.map((color, index) => (
                        <div
                          key={index}
                          className="color-swatch"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="selection-item">
                    <div className="selection-header">
                      <div className="pose-icon">🤸</div>
                      <span className="pose-name">{currentSelection.pose}</span>
                    </div>
                    <p className="pose-description">{currentSelection.poseDescription}</p>
                  </div>
                </div>

                <div className="ai-suggestions">
                  <h3>🤖 AI Suggestions</h3>
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item">
                      <span className="suggestion-icon">💡</span>
                      <span className="suggestion-text">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="center-panel">
                <CanvasArea 
                  ref={canvasRef}
                  className="main-canvas"
                  onDrawingChange={(_hasDrawing) => {
                    // Update UI based on drawing state
                  }}
                />
              </div>

              <div className="right-panel">
                <div className="quick-actions">
                  <h4>Quick Actions</h4>
                  <button 
                    className="quick-action-btn start-drawing"
                    onClick={() => {
                      canvasRef.current?.setDrawingMode(true);
                      canvasRef.current?.clearCanvas();
                    }}
                  >
                    🎨 Start Drawing
                  </button>
                  <button 
                    className="quick-action-btn load-template"
                    onClick={() => {
                      // Load a sample template/outline
                      const sampleOutline = '/yumi-tusr.png'; // Use existing image as placeholder
                      canvasRef.current?.loadOutline(sampleOutline);
                    }}
                  >
                    📄 Load Template
                  </button>
                  <button 
                    className="quick-action-btn save-progress"
                    onClick={() => {
                      const imageData = canvasRef.current?.saveDrawing();
                      if (imageData) {
                        // Create download link
                        const link = document.createElement('a');
                        link.href = imageData;
                        link.download = 'character-progress.png';
                        link.click();
                      }
                    }}
                  >
                    💾 Save Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analysis':
        return (
          <ProgressAnalyzer
            sessionId={sessionId}
            onComplete={handleStepComplete}
          />
        );
      case 'refinement':
        return (
          <div className="refinement-pane">
            <div className="refinement-header">
              <h2>✨ Final Refinement</h2>
              <p>Your anime character design is complete!</p>
            </div>
            
            <div className="completion-summary">
              <div className="character-showcase">
                {outlineUrl && (
                  <img src={outlineUrl} alt="Final character" className="final-character" />
                )}
                
                <div className="character-details">
                  {designBrief && (
                    <>
                      <h3>{designBrief.character.name || 'Your Character'}</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <strong>Personality:</strong> {designBrief.character.personality}
                        </div>
                        <div className="detail-item">
                          <strong>Style:</strong> {selectedTemplate?.name}
                        </div>
                        <div className="detail-item">
                          <strong>Mood:</strong> {designBrief.mood}
                        </div>
                        <div className="detail-item">
                          <strong>Hair:</strong> {designBrief.appearance.hair.color} {designBrief.appearance.hair.style}
                        </div>
                        <div className="detail-item">
                          <strong>Eyes:</strong> {designBrief.appearance.eyes.color} {designBrief.appearance.eyes.shape}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="completion-actions">
                <button 
                  className="new-character-btn"
                  onClick={() => {
                    setCurrentStep('idea');
                    setSessionId(null);
                    setDesignBrief(null);
                    setSelectedTemplate(null);
                    setOutlineUrl(null);
                  }}
                >
                  🎨 Create New Character
                </button>
                <button 
                  className="export-btn"
                  onClick={() => {
                    const characterData = {
                      sessionId,
                      template: selectedTemplate,
                      designBrief,
                      outlineUrl,
                      timestamp: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(characterData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `character-${designBrief?.character.name || 'design'}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  📤 Export Character Data
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Icon button component for consistent styling
  const IconButton: React.FC<{
    icon: string;
    tooltip: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
  }> = ({ icon, tooltip, onClick, active = false, disabled = false }) => (
    <button
      className={`icon-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
    >
      <span className="icon">{icon}</span>
    </button>
  );

  return (
    <div className={`anime-chara-helper enhanced ${isFullScreenMode ? 'fullscreen' : ''}`}>
      {/* Icon-only Top Toolbar */}
      <div className="top-toolbar">
        {/* Navigation */}
        <div className="toolbar-section">
          <IconButton
            icon="←"
            tooltip="Back to Main"
            onClick={onBack}
          />
          <div className="toolbar-divider" />
          <IconButton
            icon="🏠"
            tooltip="Home"
            onClick={() => setCurrentStep('idea')}
          />
        </div>

        {/* Step Navigation - Compact Icons */}
        <div className="toolbar-section step-nav">
          {steps.map((step, index) => (
            <IconButton
              key={step.key}
              icon={step.icon}
              tooltip={`${step.title} (Step ${index + 1})`}
              onClick={() => setCurrentStep(step.key)}
              active={currentStep === step.key}
            />
          ))}
        </div>

        {/* Tools & Actions */}
        <div className="toolbar-section">
          <IconButton
            icon="⚡"
            tooltip="AI Model Settings"
            onClick={() => {/* Show model selector in flyout */}}
          />
          <div className="toolbar-divider" />
          <IconButton
            icon="🔍"
            tooltip="Full Screen Mode"
            onClick={() => setIsFullScreenMode(!isFullScreenMode)}
            active={isFullScreenMode}
          />
          <IconButton
            icon="⚙️"
            tooltip="Layout Customizer"
            onClick={() => setLocalShowCustomizer(true)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-layout">
        {/* Left Panel - Selection & AI */}
        <div className={`side-panel left-panel ${isLeftPanelCollapsed ? 'collapsed' : ''}`}>
          {!isLeftPanelCollapsed && (
            <>
              {/* Tab Headers */}
              <div className="panel-tabs">
                <button
                  className={`tab ${activeLeftTab === 'selection' ? 'active' : ''}`}
                  onClick={() => setActiveLeftTab('selection')}
                  title="Current Selection"
                >
                  <span className="tab-icon">🎯</span>
                  <span className="tab-label">Selection</span>
                </button>
                <button
                  className={`tab ${activeLeftTab === 'ai' ? 'active' : ''}`}
                  onClick={() => setActiveLeftTab('ai')}
                  title="AI Suggestions"
                >
                  <span className="tab-icon">🤖</span>
                  <span className="tab-label">AI Help</span>
                </button>
                <button
                  className={`tab ${activeLeftTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveLeftTab('history')}
                  title="History & Versions"
                >
                  <span className="tab-icon">📚</span>
                  <span className="tab-label">History</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="panel-content">
                {activeLeftTab === 'selection' && (
                  <div className="selection-panel">
                    <h3>🎯 Current Selection</h3>
                    <div className="selection-items">
                      <div className="selection-item">
                        <div className="item-header">
                          <span className="item-icon">🌈</span>
                          <span className="item-name">{currentSelection.style}</span>
                        </div>
                        <div className="color-palette">
                          {currentSelection.colors.map((color, index) => (
                            <div
                              key={index}
                              className="color-swatch"
                              style={{ backgroundColor: color }}
                              title={`Color ${index + 1}: ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="selection-item">
                        <div className="item-header">
                          <span className="item-icon">🤸</span>
                          <span className="item-name">{currentSelection.pose}</span>
                        </div>
                        <p className="item-description">{currentSelection.poseDescription}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeLeftTab === 'ai' && (
                  <div className="ai-panel">
                    <h3>🤖 AI Suggestions</h3>
                    <div className="suggestions-list">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-item">
                          <span className="suggestion-icon">💡</span>
                          <span className="suggestion-text">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'history' && (
                  <div className="history-panel">
                    <h3>📚 History</h3>
                    <div className="history-items">
                      <div className="history-item">
                        <span className="history-icon">💾</span>
                        <div className="history-info">
                          <div className="history-name">Previous Design</div>
                          <div className="history-time">2 hours ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Collapse Toggle */}
          <button
            className="panel-toggle left"
            onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
            title={isLeftPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            <span className={`toggle-icon ${isLeftPanelCollapsed ? 'collapsed' : ''}`}>
              {isLeftPanelCollapsed ? '→' : '←'}
            </span>
          </button>
        </div>

        {/* Center Canvas Area - Maximized for drawing */}
        <div className="canvas-area">
          <div className="canvas-header">
            {!isFullScreenMode && (
              <div className="progress-indicator">
                <span className="stage-text">Progress: {progressStage}</span>
                <div className="mini-steps">
                  {['Outline', 'Coloring', 'Details', 'Final'].map((stage) => (
                    <button
                      key={stage}
                      className={`mini-stage ${progressStage === stage ? 'active' : ''}`}
                      onClick={() => setProgressStage(stage as any)}
                      title={stage}
                    >
                      {stage.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="canvas-container">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Right Panel - Actions & Export */}
        <div className={`side-panel right-panel ${isRightPanelCollapsed ? 'collapsed' : ''}`}>
          {!isRightPanelCollapsed && (
            <>
              {/* Tab Headers */}
              <div className="panel-tabs">
                <button
                  className={`tab ${activeRightTab === 'actions' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('actions')}
                  title="Quick Actions"
                >
                  <span className="tab-icon">⚡</span>
                  <span className="tab-label">Actions</span>
                </button>
                <button
                  className={`tab ${activeRightTab === 'export' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('export')}
                  title="Export & Share"
                >
                  <span className="tab-icon">📤</span>
                  <span className="tab-label">Export</span>
                </button>
                <button
                  className={`tab ${activeRightTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('settings')}
                  title="Settings"
                >
                  <span className="tab-icon">⚙️</span>
                  <span className="tab-label">Settings</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="panel-content">
                {activeRightTab === 'actions' && (
                  <div className="actions-panel">
                    <h3>⚡ Quick Actions</h3>
                    <div className="action-buttons">
                      <button 
                        className="action-btn primary"
                        onClick={() => {
                          canvasRef.current?.setDrawingMode(true);
                          canvasRef.current?.clearCanvas();
                        }}
                        title="Start Drawing"
                      >
                        <span className="btn-icon">🎨</span>
                        <span className="btn-label">Start Drawing</span>
                      </button>
                      
                      <button 
                        className="action-btn secondary"
                        onClick={() => {
                          const sampleOutline = '/yumi-tusr.png';
                          canvasRef.current?.loadOutline(sampleOutline);
                        }}
                        title="Load Template"
                      >
                        <span className="btn-icon">📄</span>
                        <span className="btn-label">Load Template</span>
                      </button>
                      
                      <button 
                        className="action-btn secondary"
                        onClick={() => {
                          const imageData = canvasRef.current?.saveDrawing();
                          if (imageData) {
                            const link = document.createElement('a');
                            link.href = imageData;
                            link.download = 'character-progress.png';
                            link.click();
                          }
                        }}
                        title="Save Progress"
                      >
                        <span className="btn-icon">💾</span>
                        <span className="btn-label">Save Progress</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeRightTab === 'export' && (
                  <div className="export-panel">
                    <h3>📤 Export & Share</h3>
                    <div className="export-options">
                      <button className="export-option">
                        <span className="option-icon">🖼️</span>
                        <span className="option-label">Export as PNG</span>
                      </button>
                      <button className="export-option">
                        <span className="option-icon">📄</span>
                        <span className="option-label">Export as PDF</span>
                      </button>
                      <button className="export-option">
                        <span className="option-icon">📊</span>
                        <span className="option-label">Export Data</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeRightTab === 'settings' && (
                  <div className="settings-panel">
                    <h3>⚙️ Settings</h3>
                    <div className="setting-items">
                      <div className="setting-item">
                        <span className="setting-label">Auto-save</span>
                        <label className="toggle-switch">
                          <input type="checkbox" defaultChecked />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="setting-item">
                        <span className="setting-label">Grid lines</span>
                        <label className="toggle-switch">
                          <input type="checkbox" />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Collapse Toggle */}
          <button
            className="panel-toggle right"
            onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
            title={isRightPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            <span className={`toggle-icon ${isRightPanelCollapsed ? 'collapsed' : ''}`}>
              {isRightPanelCollapsed ? '←' : '→'}
            </span>
          </button>
        </div>
      </div>

      {/* Layout Customizer Modal */}
      {localShowCustomizer && (
        <LayoutCustomizer 
          isOpen={localShowCustomizer}
          onClose={() => setLocalShowCustomizer(false)}
          t={t}
        />
      )}
    </div>
  );
};

export default AnimeCharaHelperApp;
