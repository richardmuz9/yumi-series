import React, { useState, useRef, useEffect } from 'react';
import { 
  IoArrowBack, 
  IoMenu, 
  IoClose, 
  IoSwapHorizontal,
  IoSettings,
  IoCloudUpload,
  IoImage,
  IoColorPalette,
  IoPencil,
  IoDocument
} from 'react-icons/io5';
import AIAssistant from '../components/AIAssistant';

// Creative Control System
import { CreativeControlPanel } from '../shared/components/CreativeControlPanel';
import { IterativeFeedbackPanel } from '../shared/components/IterativeFeedbackPanel';
import { CreativeControlSettings, CreativeSession, CreativeVersion, CreativeFeedback } from '../shared/types/creativeModes';
import { smartPromptEngine, createCreativeSession, updateUserHistory } from '../shared/services/smartPromptEngine';
import { getAvailablePersonalities } from '../shared/services/yumiPersonalityService';

interface WritingHelperScreenProps {
  content: string;
  onContentChange: (content: string) => void;
  onBack: () => void;
  mode?: 'writing' | 'report';
  onModeChange?: (mode: 'writing' | 'report') => void;
}

type SidebarPosition = 'left' | 'right';

const WritingHelperScreen: React.FC<WritingHelperScreenProps> = ({
  content,
  onContentChange,
  onBack,
  mode = 'writing',
  onModeChange
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>('left');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAI, setShowAI] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'solid' as 'solid' | 'gradient' | 'image',
    color: '#1a1a2e',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    image: '',
    opacity: 0.9
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Creative Control System state
  const [creativeSession, setCreativeSession] = useState<CreativeSession>(
    createCreativeSession('writing', {
      level: 'balanced',
      yumiPersonality: 'teacher',
      allowSuggestions: true,
      memoryNudges: true,
      iterativeMode: true
    })
  );
  const [showIterativeFeedback, setShowIterativeFeedback] = useState(false);
  const [currentVersions, setCurrentVersions] = useState<CreativeVersion[]>([]);
  const [availablePersonalities] = useState<string[]>(getAvailablePersonalities());

  // Theme handling
  const getTheme = () => {
    return mode === 'writing' 
      ? {
          primary: '#ff69b4',
          secondary: '#ffb6c1',
          background: '#fff0f5',
          text: '#4a4a4a'
        }
      : {
          primary: '#2c5282',
          secondary: '#4299e1',
          background: '#ebf8ff',
          text: '#2d3748'
        };
  };

  const theme = getTheme();

  // Mode switching
  const handleModeSwitch = () => {
    const newMode = mode === 'writing' ? 'report' : 'writing';
    onModeChange?.(newMode);
    
    // Update creative session personality based on mode
    setCreativeSession(prev => ({
      ...prev,
      controlSettings: {
        ...prev.controlSettings,
        yumiPersonality: newMode === 'writing' ? 'creative' : 'professional'
      }
    }));
  };

  // Sidebar dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (sidebarRef.current) {
      setIsDragging(true);
      const rect = sidebarRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && sidebarRef.current) {
      const newX = e.clientX - dragOffset.x;
      const screenWidth = window.innerWidth;
      
      // Switch sides based on position
      if (newX < screenWidth / 2 && sidebarPosition === 'right') {
        setSidebarPosition('left');
      } else if (newX > screenWidth / 2 && sidebarPosition === 'left') {
        setSidebarPosition('right');
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const togglePosition = () => {
    setSidebarPosition(prev => prev === 'left' ? 'right' : 'left');
  };

  const handleToolClick = (tool: string) => {
    setActiveTool(activeTool === tool ? null : tool);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Handle background image upload
    if (files[0] && backgroundSettings.type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundSettings(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Creative Control System handlers
  const handleCreativeSettingsChange = (settings: CreativeControlSettings) => {
    const previousSettings = creativeSession.controlSettings;
    
    setCreativeSession(prev => ({
      ...prev,
      controlSettings: settings
    }));
    
    // Update user history if personality changed
    if (settings.yumiPersonality !== previousSettings.yumiPersonality) {
      setCreativeSession(prev => updateUserHistory(prev, {
        lastUsedPersonality: settings.yumiPersonality
      }));
    }
  };

  const handleVersionSelect = (versionId: string) => {
    const version = currentVersions.find(v => v.id === versionId);
    if (version && typeof version.content === 'string') {
      onContentChange(version.content);
    }
  };

  const handleRequestRefinement = (feedback: CreativeFeedback) => {
    if (creativeSession.controlSettings.level === 'balanced' || creativeSession.controlSettings.allowSuggestions) {
      // Generate enhanced prompt with personality influence
      const enhancedPrompt = smartPromptEngine.generateBasePrompt(
        `${content}\n\nRefinement request: ${feedback.question}`,
        creativeSession.controlSettings
      );
      
      // Apply refinement based on feedback type
      if (feedback.type === 'mood') {
        setShowAI(true); // Show AI assistant for mood adjustments
      } else if (feedback.type === 'style') {
        // Trigger style refinement
        const selectedOption = feedback.options[0];
        if (selectedOption) {
          generateWritingVariation(selectedOption.label);
        }
      }

      // Update session context
      setCreativeSession(prev => ({
        ...prev,
        currentContext: { feedback, originalContent: content }
      }));
    }
  };

  const generateWritingVariation = (variation: string) => {
    // This would integrate with the AI system to generate variations
    const variations = {
      'formal': content.replace(/\b(awesome|cool|great)\b/gi, 'excellent'),
      'casual': content.replace(/\b(excellent|outstanding)\b/gi, 'awesome'),
      'emotional': content + '\n\nThis deeply resonates with the human experience.',
      'humorous': content + '\n\n(Just kidding! 😄)'
    };
    
    const variationKey = variation.toLowerCase();
    if (variationKey in variations) {
      onContentChange(variations[variationKey as keyof typeof variations]);
    }
  };

  const generateWritingVersions = () => {
    if (creativeSession.controlSettings.iterativeMode && content.trim()) {
      const versions: CreativeVersion[] = [
        {
          id: `version_${Date.now()}_main`,
          type: 'main',
          content: content,
          metadata: {
            aiConfidence: 0.8,
            refinementsSuggested: ['Improve clarity', 'Add examples', 'Enhance flow'],
            personalityInfluence: [creativeSession.controlSettings.yumiPersonality]
          }
        }
      ];

      // Generate personality-influenced alternative
      if (creativeSession.controlSettings.allowSuggestions) {
        const personalityPrompt = smartPromptEngine.generateBasePrompt(
          `Rewrite this with ${creativeSession.controlSettings.yumiPersonality} personality: ${content}`,
          { ...creativeSession.controlSettings, level: 'freestyle' }
        );
        
        versions.push({
          id: `version_${Date.now()}_alt`,
          type: 'alternative',
          content: content + '\n\n[AI-enhanced version would appear here]',
          metadata: {
            aiConfidence: 0.7,
            refinementsSuggested: ['Different tone', 'Personality variation'],
            personalityInfluence: [creativeSession.controlSettings.yumiPersonality]
          }
        });
      }

      setCurrentVersions(versions);
      setShowIterativeFeedback(true);
    }
  };

  const getBackgroundStyle = () => {
    switch (backgroundSettings.type) {
      case 'solid':
        return { backgroundColor: backgroundSettings.color };
      case 'gradient':
        return { background: backgroundSettings.gradient };
      case 'image':
        return {
          backgroundImage: backgroundSettings.image ? `url(${backgroundSettings.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return {};
    }
  };

  const writingTools = [
    { id: 'social', icon: '📱', label: 'Post to Platforms', category: 'social' },
    { id: 'trending', icon: '📈', label: 'Trending Search', category: 'social' },
    { id: 'ai-continue', icon: '🤖', label: 'AI Continuation', category: 'ai' },
    { id: 'instructions', icon: '📝', label: 'Instructions', category: 'ai' },
    { id: 'generate-versions', icon: '✨', label: 'Generate Versions', category: 'ai' },
    { id: 'anime-collab', icon: '🎮', label: 'Anime Collaboration', category: 'collaboration' },
    { id: 'galgame-blog', icon: '💖', label: 'Galgame Blog', category: 'collaboration' },
    { id: 'novel-writing', icon: '📚', label: 'Novel Writing', category: 'collaboration' },
    { id: 'test-writing', icon: '✅', label: 'Test Writing', category: 'tools' },
    { id: 'upload', icon: '📤', label: 'Upload Files', category: 'tools' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return '#ff6b9d';
      case 'ai': return '#8b5cf6';
      case 'collaboration': return '#10b981';
      case 'tools': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderToolPanel = () => {
    if (!activeTool) return null;

    const tool = writingTools.find(t => t.id === activeTool);
    if (!tool) return null;

    return (
      <div className="tool-panel">
        <h3>{tool.icon} {tool.label}</h3>
        
        {activeTool === 'upload' && (
          <div className="upload-panel">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,text/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <IoCloudUpload size={20} />
              Upload Files
            </button>
            {uploadedFiles.length > 0 && (
              <div className="uploaded-files">
                <h4>Uploaded Files:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>{file.name}</span>
                    <small>({(file.size / 1024).toFixed(1)} KB)</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTool === 'social' && (
          <div className="social-platforms">
            <button className="platform-btn twitter" onClick={() => window.open('https://twitter.com/compose/tweet', '_blank')}>🐦 Twitter</button>
            <button className="platform-btn instagram" onClick={() => window.open('https://www.instagram.com/', '_blank')}>📷 Instagram</button>
            <button className="platform-btn facebook" onClick={() => window.open('https://www.facebook.com/', '_blank')}>👥 Facebook</button>
            <button className="platform-btn linkedin" onClick={() => window.open('https://www.linkedin.com/feed/', '_blank')}>💼 LinkedIn</button>
            <button className="platform-btn medium" onClick={() => window.open('https://medium.com/new-story', '_blank')}>📖 Medium</button>
            <button className="platform-btn wordpress" onClick={() => window.open('https://wordpress.com/post', '_blank')}>📝 WordPress</button>
            <div className="copy-helper">
              <textarea 
                value={content} 
                readOnly 
                placeholder="Your content will appear here for easy copying"
                rows={4}
              />
              <button 
                onClick={() => navigator.clipboard.writeText(content)}
                className="copy-btn"
              >
                📋 Copy Content
              </button>
            </div>
          </div>
        )}

        {activeTool === 'trending' && (
          <div className="trending-search">
            <input type="text" placeholder="Search trending topics..." />
            <div className="platform-filters">
              <label><input type="checkbox" /> Twitter</label>
              <label><input type="checkbox" /> Instagram</label>
              <label><input type="checkbox" /> TikTok</label>
              <label><input type="checkbox" /> YouTube</label>
            </div>
          </div>
        )}

        {activeTool === 'ai-continue' && (
          <div className="ai-continuation">
            <textarea placeholder="Select text to continue or leave empty for auto-continuation..." />
            <div className="ai-options">
              <label>
                <input type="radio" name="tone" value="creative" />
                Creative
              </label>
              <label>
                <input type="radio" name="tone" value="professional" />
                Professional
              </label>
              <label>
                <input type="radio" name="tone" value="casual" />
                Casual
              </label>
            </div>
            <button className="generate-btn">✨ Continue Writing</button>
          </div>
        )}

        {activeTool === 'instructions' && (
          <div className="instructions-panel">
            <textarea placeholder="Enter specific instructions for AI writing assistance..." />
            <div className="instruction-types">
              <button>📝 Style Guide</button>
              <button>🎯 Target Audience</button>
              <button>📏 Length Control</button>
              <button>🔍 Keywords</button>
            </div>
          </div>
        )}

        {activeTool === 'generate-versions' && (
          <div className="generate-versions-panel">
            <h4>✨ Creative Versions</h4>
            <p>Generate multiple versions of your content with different styles and personalities!</p>
            
            <div className="version-controls">
              <div className="control-info">
                <strong>Current Mode:</strong> {creativeSession.controlSettings.level}
                <br />
                <strong>Personality Guide:</strong> {creativeSession.controlSettings.yumiPersonality}
              </div>
              
              <button 
                className="generate-btn primary"
                onClick={generateWritingVersions}
                disabled={!content.trim()}
              >
                ✨ Generate Versions
              </button>
              
              <div className="quick-variations">
                <h5>Quick Style Variations:</h5>
                <button onClick={() => generateWritingVariation('formal')}>🎩 Formal</button>
                <button onClick={() => generateWritingVariation('casual')}>😊 Casual</button>
                <button onClick={() => generateWritingVariation('emotional')}>💫 Emotional</button>
                <button onClick={() => generateWritingVariation('humorous')}>😄 Humorous</button>
              </div>
            </div>
          </div>
        )}

        {activeTool === 'anime-collab' && (
          <div className="anime-collaboration">
            <select>
              <option>Choose Character...</option>
              <option>Yumi (Cheerful)</option>
              <option>Sakura (Mysterious)</option>
              <option>Hana (Energetic)</option>
            </select>
            <div className="collab-options">
              <button>💬 Character Dialogue</button>
              <button>🎭 Role Play</button>
              <button>📖 Story Collaboration</button>
            </div>
          </div>
        )}

        {activeTool === 'galgame-blog' && (
          <div className="galgame-blog">
            <div className="blog-templates">
              <button>💖 Romance Review</button>
              <button>🎮 Game Analysis</button>
              <button>👥 Character Guide</button>
              <button>📊 Rating System</button>
            </div>
          </div>
        )}

        {activeTool === 'novel-writing' && (
          <div className="novel-writing">
            <div className="novel-tools">
              <button>📚 Chapter Planning</button>
              <button>👥 Character Development</button>
              <button>🗺️ World Building</button>
              <button>📝 Plot Outline</button>
            </div>
          </div>
        )}

        {activeTool === 'test-writing' && (
          <div className="test-writing">
            <div className="test-options">
              <button>📝 Grammar Check</button>
              <button>📊 Readability Score</button>
              <button>🎯 SEO Analysis</button>
              <button>💡 Improvement Suggestions</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Header with mode indicator and back button
  const renderHeader = () => (
    <div className="writing-header" style={{ 
      backgroundColor: theme.primary,
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <button onClick={onBack} className="back-button" style={{
        background: 'transparent',
        border: 'none',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        fontSize: '1rem'
      }}>
        <IoArrowBack /> Back to Modes
      </button>
      <div className="mode-indicator" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {mode === 'writing' ? <IoPencil /> : <IoDocument />}
        <span>{mode === 'writing' ? 'Writing Helper' : 'Report Writer'}</span>
      </div>
      <button onClick={handleModeSwitch} style={{
        background: theme.secondary,
        border: 'none',
        borderRadius: '4px',
        padding: '0.5rem 1rem',
        color: 'white',
        cursor: 'pointer'
      }}>
        Switch to {mode === 'writing' ? 'Report' : 'Writing'} Mode
      </button>
    </div>
  );

  return (
    <div className="writing-helper-screen" style={{
      backgroundColor: theme.background,
      color: theme.text,
      minHeight: '100vh'
    }}>
      {renderHeader()}
      <div 
        className="writing-helper-screen"
        style={{
          ...getBackgroundStyle(),
          opacity: backgroundSettings.opacity
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Customization Panel */}
        {showCustomization && (
          <div className="customization-panel">
            <h3>🎨 Customize Writing Helper</h3>
            
            <div className="customization-section">
              <h4>Background</h4>
              <div className="bg-type-selector">
                <button 
                  className={backgroundSettings.type === 'solid' ? 'active' : ''}
                  onClick={() => setBackgroundSettings(prev => ({ ...prev, type: 'solid' }))}
                >
                  <IoColorPalette size={16} />
                  Solid
                </button>
                <button 
                  className={backgroundSettings.type === 'gradient' ? 'active' : ''}
                  onClick={() => setBackgroundSettings(prev => ({ ...prev, type: 'gradient' }))}
                >
                  🌈 Gradient
                </button>
                <button
                  className={backgroundSettings.type === 'image' ? 'active' : ''}
                  onClick={() => setBackgroundSettings(prev => ({ ...prev, type: 'image' }))}
                >
                  <IoImage size={16} />
                  Image
                </button>
              </div>

              {backgroundSettings.type === 'solid' && (
                <div className="color-picker">
                  <input 
                    type="color" 
                    value={backgroundSettings.color}
                    onChange={(e) => setBackgroundSettings(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              )}

              {backgroundSettings.type === 'gradient' && (
                <div className="gradient-presets">
                  <button onClick={() => setBackgroundSettings(prev => ({ ...prev, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }))}>
                    Dark Blue
                  </button>
                  <button onClick={() => setBackgroundSettings(prev => ({ ...prev, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }))}>
                    Purple
                  </button>
                  <button onClick={() => setBackgroundSettings(prev => ({ ...prev, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }))}>
                    Pink
                  </button>
                </div>
              )}

              {backgroundSettings.type === 'image' && (
                <div className="image-upload">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-btn"
                  >
                    <IoCloudUpload size={16} />
                    Upload Background
                  </button>
                </div>
              )}

              <div className="opacity-slider">
                <label>Opacity: {Math.round(backgroundSettings.opacity * 100)}%</label>
                <input 
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={backgroundSettings.opacity}
                  onChange={(e) => setBackgroundSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="customization-section">
              <h4>Sidebar Settings</h4>
              <div className="sidebar-options">
                <button onClick={togglePosition}>
                  <IoSwapHorizontal size={16} />
                  Switch to {sidebarPosition === 'left' ? 'Right' : 'Left'}
                </button>
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                  {sidebarCollapsed ? <IoMenu size={16} /> : <IoClose size={16} />}
                  {sidebarCollapsed ? 'Expand' : 'Collapse'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Editor */}
        <div className={`content-area ${sidebarCollapsed ? 'sidebar-collapsed' : ''} sidebar-${sidebarPosition}`}>
          <textarea
            className="main-editor"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Start writing your creative content..."
          />
        </div>

        {/* Draggable Sidebar */}
        <div 
          ref={sidebarRef}
          className={`writing-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarPosition}`}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Sidebar Header */}
          <div className="sidebar-header" onMouseDown={handleMouseDown}>
            <div className="sidebar-controls">
              <button 
                className="collapse-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <IoMenu size={20} /> : <IoClose size={20} />}
              </button>
              <button className="position-btn" onClick={togglePosition}>
                <IoSwapHorizontal size={20} />
              </button>
            </div>
            {!sidebarCollapsed && <h3>Writing Tools</h3>}
          </div>

          {/* Tools */}
          {!sidebarCollapsed && (
            <div className="sidebar-content">
              <div className="tools-grid">
                {writingTools.map(tool => (
                  <button
                    key={tool.id}
                    className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                    style={{ '--category-color': getCategoryColor(tool.category) } as React.CSSProperties}
                    onClick={() => handleToolClick(tool.id)}
                  >
                    <span className="tool-icon">{tool.icon}</span>
                    <span className="tool-label">{tool.label}</span>
                  </button>
                ))}
              </div>

              {/* Tool Panel */}
              {renderToolPanel()}
            </div>
          )}

          {/* Collapsed Icons */}
          {sidebarCollapsed && (
            <div className="collapsed-icons">
              {writingTools.map(tool => (
                <button
                  key={tool.id}
                  className="collapsed-tool-btn"
                  onClick={() => {
                    setSidebarCollapsed(false);
                    handleToolClick(tool.id);
                  }}
                  title={tool.label}
                >
                  {tool.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant */}
        <AIAssistant 
          isOpen={showAI}
          onClose={() => setShowAI(false)}
          mode="writing-helper"
          floatingMode={!showAI}
        />

        {/* Creative Control Panel */}
        <CreativeControlPanel
          currentSettings={creativeSession.controlSettings}
          onSettingsChange={handleCreativeSettingsChange}
          userHistory={creativeSession.userHistory}
          availablePersonalities={availablePersonalities}
          mode="writing"
        />

        {/* Iterative Feedback Panel */}
        {showIterativeFeedback && currentVersions.length > 0 && (
          <IterativeFeedbackPanel
            versions={currentVersions}
            onVersionSelect={handleVersionSelect}
            onRequestRefinement={handleRequestRefinement}
            currentPersonality={creativeSession.controlSettings.yumiPersonality}
            refinementSuggestions={[
              'Improve clarity',
              'Add examples',
              'Enhance flow',
              'Adjust tone',
              'Simplify language',
              'Add emotion'
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default WritingHelperScreen; 