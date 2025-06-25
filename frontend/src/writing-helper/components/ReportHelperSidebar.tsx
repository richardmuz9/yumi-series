import React, { useState, useRef, useEffect } from 'react';
import { IconType } from 'react-icons';
import { 
  IoSearch, 
  IoDocument,
  IoBarChart,
  IoDownload,
  IoShield,
  IoChevronForward,
  IoChevronBack,
  IoLibrary,
  IoCalculator,
  IoFlask,
  IoLeaf,
  IoAt,
  IoEarth
} from 'react-icons/io5';
import { 
  RiRobot2Line,
  RiFileTextLine,
  RiEqualizerLine
} from 'react-icons/ri';

export type SidebarPosition = 'left' | 'right';

interface ReportHelperSidebarProps {
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
  category: 'research' | 'editing' | 'analysis' | 'export';
  action: () => void;
}

const ReportHelperSidebar: React.FC<ReportHelperSidebarProps> = ({
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
    // Research
    { key: 'scientific-search', icon: IoSearch, label: 'Scientific Search', category: 'research', action: () => setActiveContext('scientific-search') },
    { key: 'nature-physics', icon: IoAt, label: 'Nature/Physics', category: 'research', action: () => setActiveContext('nature-physics') },
    { key: 'research-platforms', icon: IoLibrary, label: 'Research Platforms', category: 'research', action: () => setActiveContext('research-platforms') },
    
    // Editing
    { key: 'latex-editor', icon: RiFileTextLine, label: 'LaTeX Editor', category: 'editing', action: () => setActiveContext('latex-editor') },
    { key: 'equation-builder', icon: IoCalculator, label: 'Equation Builder', category: 'editing', action: () => setActiveContext('equation-builder') },
    
    // Analysis
    { key: 'plagiarism-check', icon: IoShield, label: 'Plagiarism Check', category: 'analysis', action: () => setActiveContext('plagiarism-check') },
    { key: 'chart-generation', icon: IoBarChart, label: 'Chart Generation', category: 'analysis', action: () => setActiveContext('chart-generation') },
    { key: 'ai-report-writer', icon: RiRobot2Line, label: 'AI Report Writer', category: 'analysis', action: () => setActiveContext('ai-report-writer') },
    
    // Export
    { key: 'pdf-export', icon: IoDownload, label: 'Export as PDF', category: 'export', action: () => setActiveContext('pdf-export') },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'research': return '#4a90e2';
      case 'editing': return '#f39c12';
      case 'analysis': return '#e74c3c';
      case 'export': return '#27ae60';
      default: return '#fff';
    }
  };

  const renderContextPanel = () => {
    switch (activeContext) {
      case 'scientific-search':
        return (
          <div className="context-panel">
            <h3>🔬 Scientific Search</h3>
            <div className="search-input-container">
              <input type="text" placeholder="Search scientific papers..." className="search-input" />
              <button className="search-btn">Search</button>
            </div>
            <div className="search-filters">
              <label><input type="checkbox" /> Peer-reviewed only</label>
              <label><input type="checkbox" /> Open access</label>
              <label><input type="checkbox" /> Recent (last 5 years)</label>
            </div>
          </div>
        );
      
      case 'nature-physics':
        return (
          <div className="context-panel">
            <h3>⚛️ Nature/Physics Platforms</h3>
            <div className="platform-links">
              <button className="platform-btn nature">Nature</button>
              <button className="platform-btn science">Science</button>
              <button className="platform-btn aps">APS Physics</button>
              <button className="platform-btn arxiv">arXiv</button>
              <button className="platform-btn pubmed">PubMed</button>
              <button className="platform-btn ieee">IEEE Xplore</button>
            </div>
          </div>
        );
      
      case 'research-platforms':
        return (
          <div className="context-panel">
            <h3>📚 Research Platforms</h3>
            <div className="platform-links">
              <button className="platform-btn scholar">Google Scholar</button>
              <button className="platform-btn researchgate">ResearchGate</button>
              <button className="platform-btn academia">Academia.edu</button>
              <button className="platform-btn jstor">JSTOR</button>
              <button className="platform-btn springer">Springer</button>
            </div>
          </div>
        );
      
      case 'latex-editor':
        return (
          <div className="context-panel">
            <h3>📄 LaTeX Editor</h3>
            <textarea 
              className="latex-editor" 
              placeholder="Enter LaTeX code here..."
              rows={10}
            />
            <div className="latex-controls">
              <button className="latex-btn">Preview</button>
              <button className="latex-btn">Insert Equation</button>
              <button className="latex-btn">Insert Table</button>
              <button className="latex-btn">Insert Figure</button>
            </div>
          </div>
        );
      
      case 'equation-builder':
        return (
          <div className="context-panel">
            <h3>🧮 Equation Builder</h3>
            <div className="equation-toolbar">
              <button className="eq-btn">∑</button>
              <button className="eq-btn">∫</button>
              <button className="eq-btn">√</button>
              <button className="eq-btn">x²</button>
              <button className="eq-btn">α</button>
              <button className="eq-btn">β</button>
              <button className="eq-btn">∞</button>
              <button className="eq-btn">≈</button>
            </div>
            <textarea className="equation-preview" placeholder="Equation preview..."/>
          </div>
        );
      
      case 'plagiarism-check':
        return (
          <div className="context-panel">
            <h3>🛡️ Plagiarism Check</h3>
            <div className="plagiarism-status">
              <div className="status-indicator green">✓ No plagiarism detected</div>
              <div className="similarity-score">Similarity: 12%</div>
            </div>
            <button className="check-btn">Run Full Check</button>
            <div className="check-options">
              <label><input type="checkbox" /> Check against web sources</label>
              <label><input type="checkbox" /> Check against academic papers</label>
              <label><input type="checkbox" /> Check against student papers</label>
            </div>
          </div>
        );
      
      case 'chart-generation':
        return (
          <div className="context-panel">
            <h3>📊 Chart Generation</h3>
            <div className="chart-types">
              <button className="chart-btn">Line Chart</button>
              <button className="chart-btn">Bar Chart</button>
              <button className="chart-btn">Scatter Plot</button>
              <button className="chart-btn">Pie Chart</button>
              <button className="chart-btn">Histogram</button>
              <button className="chart-btn">Box Plot</button>
            </div>
            <textarea className="data-input" placeholder="Enter data (CSV format)..."/>
            <button className="generate-chart-btn">Generate Chart</button>
          </div>
        );
      
      case 'ai-report-writer':
        return (
          <div className="context-panel">
            <h3>🤖 AI Report Writer</h3>
            <div className="report-templates">
              <button className="template-btn">Research Paper</button>
              <button className="template-btn">Lab Report</button>
              <button className="template-btn">Literature Review</button>
              <button className="template-btn">Case Study</button>
            </div>
            <textarea className="ai-prompt" placeholder="Describe your report requirements..."/>
            <button className="generate-report-btn">Generate Report</button>
          </div>
        );
      
      case 'pdf-export':
        return (
          <div className="context-panel">
            <h3>📄 PDF Export</h3>
            <div className="export-options">
              <label><input type="checkbox" defaultChecked /> Include table of contents</label>
              <label><input type="checkbox" defaultChecked /> Include bibliography</label>
              <label><input type="checkbox" /> Include appendices</label>
              <label><input type="checkbox" /> Include page numbers</label>
            </div>
            <div className="export-format">
              <select className="format-select">
                <option>Academic Paper</option>
                <option>Lab Report</option>
                <option>Thesis</option>
                <option>Custom</option>
              </select>
            </div>
            <button className="export-btn">Export to PDF</button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      ref={sidebarRef}
      className={`report-helper-sidebar ${isCollapsed ? 'collapsed' : ''} ${position} ${isDragging ? 'dragging' : ''}`}
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
        <h3>📊 Report Helper</h3>
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

export default ReportHelperSidebar; 