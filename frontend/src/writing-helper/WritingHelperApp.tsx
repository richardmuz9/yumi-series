import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { getTranslation } from '../translations';
import './WritingHelper.css';

// Import components
import IconButton from '../components/IconButton';
import SpeechToText from '../components/SpeechToText';
import ImageUpload from '../components/ImageUpload';
import { postGeneratorService } from '../services/postGeneratorApi';

// Import panel components
import {
  TemplatesPanel,
  StyleGuidePanel,
  TrendingPanel,
  ExportPanel
} from './components/LeftPanelTools';

import {
  AIAssistPanel,
  EnhancePanel,
  ContinuePanel,
  ResearchPanel
} from './components/RightPanelTools';

import { MainLayout } from './components/MainLayout';
import StoryboardMode from './components/StoryboardMode';
import { Asset } from '../shared/components/AssetLibrary';

type WritingMode = 'standard' | 'manga' | 'galgame';

const WritingHelperApp: React.FC = () => {
  const { language } = useStore();
  const [mode, setMode] = useState<WritingMode>('standard');
  const [isVisible, setIsVisible] = useState(false);
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(true);
  const [rightSidebarExpanded, setRightSidebarExpanded] = useState(true);
  const [activeLeftTool, setActiveLeftTool] = useState<string>('templates');
  const [activeRightTool, setActiveRightTool] = useState<string>('ai-assist');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Left sidebar tools
  const leftTools = [
    { id: 'templates', icon: '📝', label: 'Templates' },
    { id: 'style', icon: '🎨', label: 'Style Guide' },
    { id: 'trending', icon: '📊', label: 'Trending' },
    { id: 'export', icon: '⚙️', label: 'Export' }
  ];

  // Right sidebar tools
  const rightTools = [
    { id: 'ai-assist', icon: '🤖', label: 'AI Assist' },
    { id: 'enhance', icon: '✨', label: 'Enhance' },
    { id: 'continue', icon: '▶️', label: 'Continue' },
    { id: 'research', icon: '🔍', label: 'Research' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => setMode('standard'), 300);
  };

  const handleMainContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Trigger debounced AI analysis here
  };

  const handleAIAssist = async () => {
    if (!content.trim()) return;
    setIsGenerating(true);
    try {
      // Call your AI service here
      const result = await postGeneratorService.generateContent({
        content: content,
        type: 'enhance'
      });
      setContent(result.content);
    } catch (error) {
      console.error('AI assist error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Render active left panel content
  const renderLeftPanelContent = () => {
    switch (activeLeftTool) {
      case 'templates':
        return <TemplatesPanel />;
      case 'style':
        return <StyleGuidePanel />;
      case 'trending':
        return <TrendingPanel />;
      case 'export':
        return <ExportPanel />;
      default:
        return null;
    }
  };

  // Render active right panel content
  const renderRightPanelContent = () => {
    switch (activeRightTool) {
      case 'ai-assist':
        return <AIAssistPanel />;
      case 'enhance':
        return <EnhancePanel />;
      case 'continue':
        return <ContinuePanel />;
      case 'research':
        return <ResearchPanel />;
      default:
        return null;
    }
  };

  const handleExport = async (scenes: any[]) => {
    if (mode === 'manga') {
      // Export as comic strip
      // TODO: Implement comic strip export
    } else if (mode === 'galgame') {
      // Export as visual novel script
      const vnScript = {
        scenes: scenes.map(scene => ({
          background: scene.background?.url,
          character: {
            name: scene.character,
            image: scene.image?.url,
            position: scene.position
          },
          dialogue: scene.text,
          type: scene.type
        }))
      }
      
      const blob = new Blob([JSON.stringify(vnScript, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'visual-novel-script.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className={`writing-helper-app-v2 ${isVisible ? 'visible' : ''}`}>
      {/* Top Navigation */}
      <div className="top-nav">
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
        <h1>Writing Helper</h1>
        <div className="top-actions">
          <IconButton icon="💾" tooltip="Save Draft" onClick={() => {}} />
          <IconButton icon="🔄" tooltip="Reset" onClick={() => setContent('')} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Left Sidebar */}
        <div className={`sidebar left ${leftSidebarExpanded ? 'expanded' : ''}`}>
          <div className="sidebar-tools">
            {leftTools.map(tool => (
              <button
                key={tool.id}
                className={`tool-button ${activeLeftTool === tool.id ? 'active' : ''}`}
                onClick={() => setActiveLeftTool(tool.id)}
                title={tool.label}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-label">{tool.label}</span>
              </button>
            ))}
          </div>
          {leftSidebarExpanded && renderLeftPanelContent()}
          <button 
            className="collapse-button"
            onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
          >
            {leftSidebarExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          <textarea
            className="content-editor"
            value={content}
            onChange={handleMainContentChange}
            placeholder="Start writing here... Use the sidebars for AI assistance, templates, and enhancements."
          />
        </div>

        {/* Right Sidebar */}
        <div className={`sidebar right ${rightSidebarExpanded ? 'expanded' : ''}`}>
          <div className="sidebar-tools">
            {rightTools.map(tool => (
              <button
                key={tool.id}
                className={`tool-button ${activeRightTool === tool.id ? 'active' : ''}`}
                onClick={() => setActiveRightTool(tool.id)}
                title={tool.label}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-label">{tool.label}</span>
              </button>
            ))}
          </div>
          {rightSidebarExpanded && renderRightPanelContent()}
          <button 
            className="collapse-button"
            onClick={() => setRightSidebarExpanded(!rightSidebarExpanded)}
          >
            {rightSidebarExpanded ? '▶' : '◀'}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="loading-overlay">
          <div className="loading-spinner">✨</div>
          <p>AI is working its magic...</p>
        </div>
      )}

      <div className="mode-selector">
        <select value={mode} onChange={e => setMode(e.target.value as WritingMode)}>
          <option value="standard">Standard Writing</option>
          <option value="manga">Manga Creator</option>
          <option value="galgame">Visual Novel</option>
        </select>
      </div>

      {mode === 'standard' ? (
        <MainLayout content={content}>
          <textarea
            value={content}
            onChange={handleMainContentChange}
            placeholder="Start writing..."
            className="main-editor"
          />
        </MainLayout>
      ) : (
        <StoryboardMode
          mode={mode}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default WritingHelperApp; 