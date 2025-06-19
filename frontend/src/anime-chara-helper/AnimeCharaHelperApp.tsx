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

  // Set GPT-4o as default for Anime Character Designer
  useEffect(() => {
    setProvider('openai')
    setModel('gpt-4o')
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

  return (
    <div className="anime-chara-helper">
      <div className="acha-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Back to Main
          </button>
        </div>
        <div className="header-center">
          <h1 className="acha-title">🎨 Anime Character Designer</h1>
          <div className="acha-subtitle">
            AI-powered character creation with guided design assistance
          </div>
        </div>
        <div className="header-right">
          <button 
            className="customize-btn" 
            onClick={() => setLocalShowCustomizer(true)}
          >
            🎨 Customize
          </button>
        </div>
      </div>

      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`step ${currentStep === step.key ? 'active' : ''} ${getCurrentStepIndex() > index ? 'completed' : ''}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Model Switcher */}
      <div className="mb-6">
        <ModelSwitcher compact={true} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-4" />
      </div>

      <div className="acha-content">
        <div className="step-navigation">
          {getCurrentStepIndex() > 0 && (
            <button className="nav-btn prev-btn" onClick={handleStepBack}>
              ← Previous
            </button>
          )}
          <div className="step-indicator">
            Step {getCurrentStepIndex() + 1} of {steps.length}
          </div>
        </div>

        <div className="step-content">
          {renderCurrentStep()}
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
