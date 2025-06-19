import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AIAssistantPane } from './components/AIAssistantPane';
import { LaTeXEditorPane } from './components/LaTeXEditorPane';
import DataConnector from './components/DataConnector';
import CollaborationPanel from './components/CollaborationPanel';
import { ModelSwitcher } from '../components/ModelSwitcher';
import { useStore } from '../store';
import LayoutCustomizer from '../components/LayoutCustomizer';
import { getTranslation } from '../translations';
import './ReportWriter.css';

// Import types and constants
import { 
  ReportWriterAppProps, 
  ReportVersion, 
  DataConnection, 
  DataInsight, 
  ChartConfig,
  CollaborationUser,
  Comment 
} from './types/ReportTypes';
import { 
  REPORT_TYPES, 
  CITATION_STYLES, 
  DEFAULT_LATEX_TEMPLATE 
} from './constants/ReportConstants';

const ReportWriterApp: React.FC<ReportWriterAppProps> = ({ onBackToMain }) => {
  const { language } = useStore();
  const [localShowCustomizer, setLocalShowCustomizer] = useState(false);
  const t = getTranslation(language);
  
  // Layout state
  const [leftPaneWidth, setLeftPaneWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);
  
  // Document state
  const [latexContent, setLatexContent] = useState(DEFAULT_LATEX_TEMPLATE);
  const [documentTitle, setDocumentTitle] = useState('Untitled Report');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [selectedCitationStyle, setSelectedCitationStyle] = useState<string>('apa');
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  
  // Data and insights state
  const [dataConnections, setDataConnections] = useState<DataConnection[]>([]);
  const [insights, setInsights] = useState<DataInsight[]>([]);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  
  // Collaboration state
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const currentUserId = 'current-user'; // Would come from auth
  
  // UI state
  const [showScaffoldModal, setShowScaffoldModal] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [showCitationManager, setShowCitationManager] = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState<'ai' | 'data' | 'collaboration'>('ai');

  const containerRef = useRef<HTMLDivElement>(null);

  // Real-time collaboration simulation
  useEffect(() => {
    // Simulate some collaborators
    setCollaborators([
      {
        id: 'user1',
        name: 'John Smith',
        email: 'john@company.com',
        status: 'online',
        cursor: { line: 25, column: 10 }
      },
      {
        id: 'user2',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        status: 'online'
      }
    ]);

    // Simulate some sample data connections and insights
    const sampleConnection: DataConnection = {
      id: 'sample_data',
      name: 'Sample Sales Data',
      type: 'csv',
      status: 'connected',
      lastSync: Date.now() - 300000, // 5 minutes ago
      config: {
        fileName: 'sales_data.csv',
        rowCount: 1250,
        headers: ['Date', 'Revenue', 'Region', 'Product']
      }
    };

    const sampleInsight: DataInsight = {
      id: 'insight_1',
      title: 'Revenue Trend Analysis',
      description: 'Revenue has increased by 23% over the last quarter, with particularly strong performance in the North American region.',
      type: 'trend',
      significance: 'high',
      data: { percentage: 23, timeframe: 'quarter', region: 'North America' },
      timestamp: Date.now() - 600000 // 10 minutes ago
    };

    setDataConnections([sampleConnection]);
    setInsights([sampleInsight]);
  }, []);

  // Resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    const clampedWidth = Math.max(20, Math.min(80, newLeftWidth));
    setLeftPaneWidth(clampedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Document operations
  const generateScaffold = (reportTypeId: string) => {
    const reportType = REPORT_TYPES.find(rt => rt.id === reportTypeId);
    if (!reportType) return;

    const citationStyle = CITATION_STYLES.find(cs => cs.id === selectedCitationStyle);
    let template = reportType.template;

    // Update citation style in template
    if (citationStyle) {
      template = template.replace(/\\usepackage{cite}/, citationStyle.package);
      template = template.replace(/\\bibliographystyle{plain}/, `\\bibliographystyle{${citationStyle.style}}`);
    }

    // Update title
    template = template.replace(/Research Paper Title|Solution Title|Market Analysis|System Analysis/, documentTitle);

    setLatexContent(template);
    setSelectedReportType(reportTypeId);
    setShowScaffoldModal(false);

    // Create initial version
    createVersion('Initial Scaffold', 'Auto-generated scaffold from template');
  };

  const createVersion = (name: string, description: string) => {
    const newVersion: ReportVersion = {
      id: Date.now().toString(),
      name,
      timestamp: Date.now(),
      content: latexContent,
      description
    };
    setVersions(prev => [newVersion, ...prev]);
  };

  const loadVersion = (version: ReportVersion) => {
    setLatexContent(version.content);
    setShowVersions(false);
  };

  const changeCitationStyle = (newStyleId: string) => {
    const newStyle = CITATION_STYLES.find(cs => cs.id === newStyleId);
    const currentStyle = CITATION_STYLES.find(cs => cs.id === selectedCitationStyle);
    
    if (!newStyle || !currentStyle) return;

    // Replace citation style in LaTeX content
    let updatedContent = latexContent;
    updatedContent = updatedContent.replace(currentStyle.package, newStyle.package);
    updatedContent = updatedContent.replace(
      `\\\\bibliographystyle{${currentStyle.style}}`,
      `\\\\bibliographystyle{${newStyle.style}}`
    );

    setLatexContent(updatedContent);
    setSelectedCitationStyle(newStyleId);
    setShowCitationManager(false);
  };

  // Data operations
  const handleConnectionAdd = (connection: DataConnection) => {
    setDataConnections(prev => [...prev, connection]);
  };

  const handleConnectionRemove = (connectionId: string) => {
    setDataConnections(prev => prev.filter(c => c.id !== connectionId));
  };

  const handleInsightGenerate = (newInsights: DataInsight[]) => {
    setInsights(prev => [...newInsights, ...prev]);
  };

  const handleChartCreate = (chart: ChartConfig) => {
    setCharts(prev => [...prev, chart]);
  };

  const handleInsertData = (latexCode: string) => {
    // Insert at cursor position or end of document
    const insertPosition = latexContent.lastIndexOf('\\end{document}');
    if (insertPosition !== -1) {
      const newContent = 
        latexContent.slice(0, insertPosition) + 
        latexCode + 
        '\\n\\n' + 
        latexContent.slice(insertPosition);
      setLatexContent(newContent);
    } else {
      setLatexContent(latexContent + '\\n\\n' + latexCode);
    }
  };

  // Collaboration operations
  const handleCommentAdd = (comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}`,
      timestamp: Date.now()
    };
    setComments(prev => [...prev, newComment]);
  };

  const handleCommentResolve = (commentId: string) => {
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, resolved: true } : c
    ));
  };

  const handleCommentReply = (commentId: string, reply: string) => {
    const newReply: Comment = {
      id: `reply_${Date.now()}`,
      userId: currentUserId,
      line: 0,
      content: reply,
      timestamp: Date.now(),
      resolved: false
    };

    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, replies: [...(c.replies || []), newReply] }
        : c
    ));
  };

  const handleLatexChange = (newContent: string) => {
    setLatexContent(newContent);
  };

  const handleResearchResult = (result: any) => {
    // Handle research results from AI Assistant
    console.log('Research result:', result);
  };

  const handleFileUpload = (fileData: any) => {
    // Handle file uploads
    console.log('File upload:', fileData);
  };

  const generateExecutiveSummary = async () => {
    // Generate executive summary based on current content and data insights
    console.log('Generating executive summary...');
  };

  const renderRightPanel = () => {
    switch (activeRightPanel) {
      case 'data':
        return (
          <DataConnector
            connections={dataConnections}
            insights={insights}
            charts={charts}
            onConnectionAdd={handleConnectionAdd}
            onConnectionRemove={handleConnectionRemove}
            onInsightGenerate={handleInsightGenerate}
            onChartCreate={handleChartCreate}
            onInsertData={handleInsertData}
          />
        );
      case 'collaboration':
        return (
          <CollaborationPanel
            collaborators={collaborators}
            comments={comments}
            currentUserId={currentUserId}
            onCommentAdd={handleCommentAdd}
            onCommentResolve={handleCommentResolve}
            onCommentReply={handleCommentReply}
          />
        );
      default:
        return (
          <AIAssistantPane
            onResearchResult={handleResearchResult}
            onFileUpload={handleFileUpload}
            currentLatex={latexContent}
          />
        );
    }
  };

  return (
    <div className={`report-writer enhanced ${isResizing ? 'resizing' : ''}`}>
      {/* Enhanced Header */}
      <header className="report-writer-header">
        <div className="header-left">
          <button onClick={onBackToMain} className="back-btn">← Back</button>
          <div className="document-info">
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="document-title-input"
              placeholder="Document Title"
            />
            <div className="document-meta">
              <span>Last saved: {new Date().toLocaleTimeString()}</span>
              <span>•</span>
              <span>{latexContent.split('\\n').length} lines</span>
            </div>
          </div>
        </div>
        
        <div className="header-center">
          <div className="panel-switcher">
            <button 
              className={`panel-btn ${activeRightPanel === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveRightPanel('ai')}
            >
              🤖 AI Assistant
            </button>
            <button 
              className={`panel-btn ${activeRightPanel === 'data' ? 'active' : ''}`}
              onClick={() => setActiveRightPanel('data')}
            >
              📊 Data ({dataConnections.length})
            </button>
            <button 
              className={`panel-btn ${activeRightPanel === 'collaboration' ? 'active' : ''}`}
              onClick={() => setActiveRightPanel('collaboration')}
            >
              👥 Collaborate ({collaborators.filter(c => c.status === 'online').length})
            </button>
          </div>
        </div>

        <div className="header-right">
          <ModelSwitcher />
          <button onClick={() => setShowVersions(!showVersions)} className="versions-btn">
            📝 Versions ({versions.length})
          </button>
          <button 
            onClick={() => setLocalShowCustomizer(!localShowCustomizer)} 
            className="customize-btn"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <div ref={containerRef} className="report-writer-content">
        {/* Left Pane - LaTeX Editor */}
        <div className="left-pane" style={{ width: `${leftPaneWidth}%` }}>
          <LaTeXEditorPane
            content={latexContent}
            onChange={handleLatexChange}
          />
        </div>

        {/* Resizer */}
        <div className="pane-resizer" onMouseDown={handleMouseDown}>
          <div className="resizer-handle"></div>
        </div>

        {/* Right Pane - Dynamic Panel */}
        <div className="right-pane" style={{ width: `${100 - leftPaneWidth}%` }}>
          {renderRightPanel()}
        </div>
      </div>

      {/* Enhanced Modals */}
      {showScaffoldModal && (
        <div className="modal-overlay">
          <div className="scaffold-modal enhanced">
            <div className="modal-header">
              <h2>🚀 Create Enhanced Report</h2>
              <p>Choose a template to get started with AI-powered insights</p>
            </div>
            
            <div className="modal-content">
              <div className="report-types-grid">
                {REPORT_TYPES.map(type => (
                  <div 
                    key={type.id}
                    className={`report-type-card ${selectedReportType === type.id ? 'selected' : ''}`}
                    onClick={() => setSelectedReportType(type.id)}
                  >
                    <h3>{type.name}</h3>
                    <div className="sections-preview">
                      {type.sections.slice(0, 3).map(section => (
                        <span key={section} className="section-tag">{section}</span>
                      ))}
                      {type.sections.length > 3 && (
                        <span className="section-more">+{type.sections.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="citation-style-selector">
                <h4>Citation Style</h4>
                <select 
                  value={selectedCitationStyle}
                  onChange={(e) => setSelectedCitationStyle(e.target.value)}
                  className="citation-select"
                >
                  {CITATION_STYLES.map(style => (
                    <option key={style.id} value={style.id}>{style.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowScaffoldModal(false)} className="cancel-btn">
                Skip Template
              </button>
              <button 
                onClick={() => generateScaffold(selectedReportType)}
                disabled={!selectedReportType}
                className="create-btn"
              >
                Create Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersions && (
        <div className="modal-overlay">
          <div className="versions-modal">
            <div className="modal-header">
              <h3>📝 Version History</h3>
              <button onClick={() => setShowVersions(false)} className="close-btn">×</button>
            </div>
            
            <div className="versions-list">
              {versions.map(version => (
                <div key={version.id} className="version-item">
                  <div className="version-info">
                    <h4>{version.name}</h4>
                    <p>{version.description}</p>
                    <small>{new Date(version.timestamp).toLocaleString()}</small>
                  </div>
                  <button onClick={() => loadVersion(version)} className="load-btn">
                    Load
                  </button>
                </div>
              ))}
              
              {versions.length === 0 && (
                <div className="empty-state">
                  <p>No versions saved yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Layout Customizer */}
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

export default ReportWriterApp; 