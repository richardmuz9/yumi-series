import React, { useState, useRef, useEffect } from 'react';
import { IconType } from 'react-icons';
import { 
  IoArrowBack, 
  IoShare, 
  IoRocket,
  IoSearch,
  IoDocument,
  IoColorPalette,
  IoChevronForward,
  IoChevronBack,
  IoGameController,
  IoPeople,
  IoBook,
  IoNewspaper,
  IoTrendingUp
} from 'react-icons/io5';
import { 
  RiRobot2Line,
  RiTestTubeLine
} from 'react-icons/ri';

export type SidebarPosition = 'left' | 'right';

interface WritingHelperSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  position: SidebarPosition;
  onPositionChange: (position: SidebarPosition) => void;
  sidePosition: { x: number; y: number };
  onSidePositionChange: (position: { x: number; y: number }) => void;
  content: string;
  onContentChange: (content: string) => void;
}

interface ToolConfig {
  key: string;
  icon: IconType;
  label: string;
  category: 'social' | 'ai' | 'collaboration' | 'tools';
  action: () => void;
}

const WritingHelperSidebar: React.FC<WritingHelperSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  position,
  onPositionChange,
  sidePosition,
  onSidePositionChange,
  content,
  onContentChange
}) => {
  const [activeContext, setActiveContext] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Dragging functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === sidebarRef.current || (e.target as Element).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = sidebarRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onSidePositionChange({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Tool configurations
  const tools: ToolConfig[] = [
    // Social & Publishing
    { key: 'post-platforms', icon: IoShare, label: 'Post to Platforms', category: 'social', action: () => setActiveContext('post-platforms') },
    { key: 'trending-search', icon: IoTrendingUp, label: 'Trending Search', category: 'social', action: () => setActiveContext('trending-search') },
    
    // AI Tools
    { key: 'ai-continuation', icon: RiRobot2Line, label: 'AI Continuation', category: 'ai', action: () => setActiveContext('ai-continuation') },
    { key: 'instruction-input', icon: IoDocument, label: 'Instruction Input', category: 'ai', action: () => setActiveContext('instruction-input') },
    
    // Collaboration
    { key: 'anime-collab', icon: IoGameController, label: 'Anime Collaboration', category: 'collaboration', action: () => setActiveContext('anime-collab') },
    { key: 'galgame-blog', icon: IoBook, label: 'Galgame Blog', category: 'collaboration', action: () => setActiveContext('galgame-blog') },
    { key: 'novel-writing', icon: IoNewspaper, label: 'Novel Writing', category: 'collaboration', action: () => setActiveContext('novel-writing') },
    
    // Tools
    { key: 'test-writing', icon: RiTestTubeLine, label: 'Test Writing', category: 'tools', action: () => setActiveContext('test-writing') },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return '#ff69b4';
      case 'ai': return '#ba55d3';
      case 'collaboration': return '#32cd32';
      case 'tools': return '#ffa500';
      default: return '#fff';
    }
  };

  const renderContextPanel = () => {
    switch (activeContext) {
      case 'post-platforms':
        return (
          <div className="context-panel">
            <h3>📱 Post to Platforms</h3>
            <div className="platform-buttons">
              <button className="platform-btn twitter">Twitter/X</button>
              <button className="platform-btn instagram">Instagram</button>
              <button className="platform-btn facebook">Facebook</button>
              <button className="platform-btn linkedin">LinkedIn</button>
              <button className="platform-btn medium">Medium</button>
              <button className="platform-btn wordpress">WordPress</button>
            </div>
          </div>
        );
      
      case 'trending-search':
        return (
          <div className="context-panel">
            <h3>📈 Trending Search</h3>
            <div className="search-input-container">
              <input type="text" placeholder="Search trending topics..." className="search-input" />
              <button className="search-btn">Search</button>
            </div>
            <div className="trending-topics">
              <span className="trending-tag">#AI</span>
              <span className="trending-tag">#WebDev</span>
              <span className="trending-tag">#React</span>
              <span className="trending-tag">#TypeScript</span>
            </div>
          </div>
        );
      
      case 'ai-continuation':
        return (
          <div className="context-panel">
            <h3>🤖 AI Continuation</h3>
            <textarea 
              className="ai-prompt" 
              placeholder="Current content will be analyzed for AI continuation..."
              value={content}
              readOnly
            />
            <button className="ai-generate-btn">Generate Continuation</button>
          </div>
        );
      
      case 'instruction-input':
        return (
          <div className="context-panel">
            <h3>📝 Instruction Input</h3>
            <textarea 
              className="instruction-input" 
              placeholder="Enter writing instructions for AI..."
            />
            <button className="apply-instruction-btn">Apply Instructions</button>
          </div>
        );
      
      case 'anime-collab':
        return (
          <div className="context-panel">
            <h3>🎮 Anime Collaboration</h3>
            <p>Collaborate with anime character helper for character-driven content.</p>
            <button className="collab-btn">Open Character Helper</button>
          </div>
        );
      
      case 'test-writing':
        return (
          <div className="context-panel">
            <h3>🧪 Test Writing</h3>
            <div className="test-options">
              <button className="test-btn">Grammar Check</button>
              <button className="test-btn">Readability Test</button>
              <button className="test-btn">Style Analysis</button>
              <button className="test-btn">Tone Assessment</button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      ref={sidebarRef}
      className={`writing-helper-sidebar ${isCollapsed ? 'collapsed' : ''} ${position} ${isDragging ? 'dragging' : ''}`}
      style={{
        transform: `translate(${sidePosition.x}px, ${sidePosition.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle */}
      <div className="drag-handle">
        <div className="drag-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Header */}
      <div className="sidebar-header">
        <h3>✍️ Writing Helper</h3>
        <div className="header-controls">
          <button
            className="position-toggle"
            onClick={() => onPositionChange(position === 'left' ? 'right' : 'left')}
            title="Switch side"
          >
            {position === 'left' ? '→' : '←'}
          </button>
          <button
            className="collapse-toggle"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <IoChevronForward size={16} /> : <IoChevronBack size={16} />}
          </button>
        </div>
      </div>

      {/* Tools */}
      {!isCollapsed && (
        <div className="tools-container">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isActive = activeContext === tool.key;
            
            return (
              <button
                key={tool.key}
                className={`tool-button ${isActive ? 'active' : ''}`}
                onClick={tool.action}
                style={{
                  borderColor: isActive ? getCategoryColor(tool.category) : 'transparent',
                  color: isActive ? getCategoryColor(tool.category) : '#fff'
                }}
                title={tool.label}
              >
                <Icon size={20} />
                <span className="tool-label">{tool.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Context Panel */}
      {!isCollapsed && activeContext && (
        <div className="context-panel-container">
          {renderContextPanel()}
          <button 
            className="close-context"
            onClick={() => setActiveContext(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default WritingHelperSidebar; 