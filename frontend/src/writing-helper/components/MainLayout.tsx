import React, { useState, useCallback } from 'react';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { aiService } from '../services/aiService';
import { socialPostService } from '../services/socialPostService';
import { themes, createThemeVariables, ThemeMode } from '../styles/theme';
import { PostTo } from './PostTo';
import '../styles/MainLayout.css';
import '../styles/PostTo.css';

interface MainLayoutProps {
  children: React.ReactNode;
  content: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, content }) => {
  const [leftPanelExpanded, setLeftPanelExpanded] = useState(true);
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [postStatus, setPostStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Panel toggle handlers
  const toggleLeftPanel = useCallback(() => {
    setLeftPanelExpanded(prev => !prev);
  }, []);

  const toggleRightPanel = useCallback(() => {
    setRightPanelExpanded(prev => !prev);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
    if (!focusMode) {
      setLeftPanelExpanded(false);
      setRightPanelExpanded(false);
    }
  }, [focusMode]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Handle social media posting
  const handlePost = useCallback(async (platform: string, postContent: string) => {
    const result = await socialPostService.post(platform, postContent);
    
    setPostStatus({
      message: result.message || (result.success ? 'Posted successfully!' : 'Failed to post'),
      type: result.success ? 'success' : 'error'
    });

    // Clear status after 3 seconds
    setTimeout(() => setPostStatus(null), 3000);
  }, []);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onToggleLeftPanel: toggleLeftPanel,
    onToggleRightPanel: toggleRightPanel,
    onFocusMode: toggleFocusMode,
  });

  // Apply theme variables
  React.useEffect(() => {
    const variables = createThemeVariables(themes[theme]);
    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <div 
      className={`writing-layout ${theme} ${focusMode ? 'focus-mode' : ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `
          ${leftPanelExpanded ? '240px' : '48px'} 
          1fr 
          ${rightPanelExpanded ? '240px' : '48px'}
        `,
        height: '100vh',
        transition: 'grid-template-columns 0.3s ease'
      }}
    >
      {/* Left Panel */}
      <aside className={`left-panel ${leftPanelExpanded ? 'expanded' : ''}`}>
        <div className="panel-header">
          <button onClick={toggleLeftPanel} title={KEYBOARD_SHORTCUTS.TOGGLE_LEFT}>
            {leftPanelExpanded ? '◀' : '▶'}
          </button>
        </div>
        <div className="panel-content">
          {/* Template selector */}
          <div className="tool-section">
            <h3>Templates</h3>
            {leftPanelExpanded && (
              <div className="templates-list">
                {/* Template items */}
              </div>
            )}
          </div>

          {/* Style guide */}
          <div className="tool-section">
            <h3>Style Guide</h3>
            {leftPanelExpanded && (
              <div className="style-guide">
                {/* Style guide content */}
              </div>
            )}
          </div>

          {/* Export options */}
          <div className="tool-section">
            <h3>Export</h3>
            {leftPanelExpanded && (
              <div className="export-options">
                {/* Export options */}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content-area">
        <div className="toolbar">
          <PostTo content={content} onPost={handlePost} />
          <button onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={toggleFocusMode} title={KEYBOARD_SHORTCUTS.FOCUS_MODE}>
            {focusMode ? '📝' : '✨'}
          </button>
        </div>
        {postStatus && (
          <div className={`post-status ${postStatus.type}`}>
            {postStatus.message}
          </div>
        )}
        {children}
      </main>

      {/* Right Panel */}
      <aside className={`right-panel ${rightPanelExpanded ? 'expanded' : ''}`}>
        <div className="panel-header">
          <button onClick={toggleRightPanel} title={KEYBOARD_SHORTCUTS.TOGGLE_RIGHT}>
            {rightPanelExpanded ? '▶' : '◀'}
          </button>
        </div>
        <div className="panel-content">
          {/* AI Assistant */}
          <div className="tool-section">
            <h3>AI Assistant</h3>
            {rightPanelExpanded && (
              <div className="ai-tools">
                {/* AI tools */}
              </div>
            )}
          </div>

          {/* Enhancements */}
          <div className="tool-section">
            <h3>Enhancements</h3>
            {rightPanelExpanded && (
              <div className="enhancement-tools">
                {/* Enhancement tools */}
              </div>
            )}
          </div>

          {/* Research */}
          <div className="tool-section">
            <h3>Research</h3>
            {rightPanelExpanded && (
              <div className="research-tools">
                {/* Research tools */}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}; 