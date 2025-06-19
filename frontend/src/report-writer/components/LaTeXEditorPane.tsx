import React, { useState, useRef, useEffect } from 'react';

interface LaTeXEditorPaneProps {
  content: string;
  onChange: (content: string) => void;
}

export const LaTeXEditorPane: React.FC<LaTeXEditorPaneProps> = ({ content, onChange }) => {
  const [showPreview, setShowPreview] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Auto-compile LaTeX on content change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim() && showPreview) {
        compileLaTeX();
      }
    }, 2000); // 2 second delay after typing stops

    return () => clearTimeout(timer);
  }, [content, showPreview]);

  const compileLaTeX = async () => {
    if (!content.trim()) return;

    setIsCompiling(true);
    setCompilationError(null);

    try {
      const response = await fetch('/api/report-writer/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ latex: content })
      });

      if (!response.ok) {
        throw new Error(`Compilation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPdfUrl(result.pdfUrl);
        setCompilationError(null);
      } else {
        setCompilationError(result.error || 'Compilation failed');
        setPdfUrl(null);
      }
    } catch (error) {
      console.error('LaTeX compilation error:', error);
      setCompilationError(error instanceof Error ? error.message : 'Unknown compilation error');
      setPdfUrl(null);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'html' | 'xlsx') => {
    setIsCompiling(true);

    try {
      const response = await fetch('/api/report-writer/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          latex: content, 
          format,
          filename: `research_report.${format}`
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename || `document.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const insertAtCursor = (text: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    
    onChange(newContent);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      editor.selectionStart = editor.selectionEnd = start + text.length;
      editor.focus();
    }, 0);
  };

  const insertTemplate = (template: string) => {
    const templates = {
      section: '\\section{Section Title}\nContent here...\n\n',
      subsection: '\\subsection{Subsection Title}\nContent here...\n\n',
      figure: '\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{image.png}\n\\caption{Figure caption}\n\\label{fig:label}\n\\end{figure}\n\n',
      table: '\\begin{table}[h]\n\\centering\n\\begin{tabular}{|l|l|l|}\n\\hline\nHeader 1 & Header 2 & Header 3 \\\\\n\\hline\nRow 1 Col 1 & Row 1 Col 2 & Row 1 Col 3 \\\\\nRow 2 Col 1 & Row 2 Col 2 & Row 2 Col 3 \\\\\n\\hline\n\\end{tabular}\n\\caption{Table caption}\n\\label{tab:label}\n\\end{table}\n\n',
      equation: '\\begin{equation}\nE = mc^2\n\\label{eq:einstein}\n\\end{equation}\n\n',
      citation: '\\cite{author2024}',
      reference: '\\ref{fig:label}',
      bibliography: '\\bibliography{references}\n\\bibliographystyle{plain}\n'
    };

    insertAtCursor(templates[template as keyof typeof templates] || '');
  };

  const formatCode = () => {
    // Basic LaTeX formatting
    let formatted = content
      .replace(/\\section\{/g, '\n\\section{')
      .replace(/\\subsection\{/g, '\n\\subsection{')
      .replace(/\\begin\{/g, '\n\\begin{')
      .replace(/\\end\{/g, '\n\\end{')
      .replace(/\n\n\n+/g, '\n\n'); // Remove excessive line breaks

    onChange(formatted);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="latex-editor-pane">
      <div className="latex-editor-header">
        <div className="header-top">
          <h3 className="latex-editor-title">
            📝 LaTeX Editor
          </h3>
          <div className="status-indicators">
            {isCompiling && <span className="status-indicator compiling">⏳ Compiling</span>}
            {compilationError && <span className="status-indicator error">❌ Error</span>}
            {pdfUrl && !isCompiling && <span className="status-indicator success">✅ Ready</span>}
          </div>
        </div>
        
        <div className="editor-toolbar-extended">
          <div className="toolbar-row">
            <div className="template-dropdown">
              <select onChange={(e) => e.target.value && insertTemplate(e.target.value)} value="">
                <option value="">Insert Template</option>
                <option value="section">Section</option>
                <option value="subsection">Subsection</option>
                <option value="figure">Figure</option>
                <option value="table">Table</option>
                <option value="equation">Equation</option>
                <option value="citation">Citation</option>
                <option value="reference">Reference</option>
                <option value="bibliography">Bibliography</option>
              </select>
            </div>
            
            <button 
              className="editor-action-button format-btn"
              onClick={formatCode}
              title="Format LaTeX code"
            >
              🎨 Format
            </button>
            
            <button 
              className="editor-action-button compile-btn"
              onClick={() => compileLaTeX()}
              disabled={isCompiling}
              title="Compile LaTeX"
            >
              {isCompiling ? '⏳ Compiling...' : '🔨 Compile'}
            </button>
            
            <div className="export-controls">
              <button 
                className="editor-action-button export-btn"
                onClick={() => handleExport('pdf')}
                disabled={isCompiling}
                title="Export as PDF"
              >
                📄 PDF
              </button>
              <button 
                className="editor-action-button export-btn"
                onClick={() => handleExport('docx')}
                disabled={isCompiling}
                title="Export as Word"
              >
                📝 Word
              </button>
              <button 
                className="editor-action-button export-btn"
                onClick={() => handleExport('html')}
                disabled={isCompiling}
                title="Export as HTML"
              >
                🌐 HTML
              </button>
            </div>
          </div>
          
          <div className="toolbar-row">
            <button 
              className={`editor-action-button toggle-btn ${!showPreview ? 'active' : ''}`}
              onClick={togglePreview}
              title="Toggle preview mode"
            >
              {showPreview ? '📝 Code Only' : '👁️ Show Preview'}
            </button>
            
            <div className="editor-info">
              Lines: {content.split('\n').length} | 
              Words: {content.split(/\s+/).filter(word => word.length > 0).length} |
              Characters: {content.length}
            </div>
          </div>
        </div>
      </div>

      <div className="editor-content" style={{ flexDirection: showPreview ? 'row' : 'column' }}>
        {/* Code Editor */}
        <div className="code-editor-container" style={{ width: showPreview ? '50%' : '100%' }}>
          <textarea
            ref={editorRef}
            className="code-editor"
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your LaTeX content here..."
            spellCheck={false}
            style={{ 
              height: '100%',
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              tabSize: 2,
              border: 'none',
              outline: 'none',
              padding: '16px',
              resize: 'none',
              backgroundColor: '#fafafa'
            }}
          />
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="preview-container" style={{ width: '50%' }}>
            <div className="preview-header">
              <span className="preview-title">📄 Live Preview</span>
              {isCompiling && <span className="compilation-status">⏳ Compiling...</span>}
              {compilationError && <span className="compilation-error">❌ Error</span>}
              {pdfUrl && !isCompiling && <span className="compilation-success">✅ Ready</span>}
            </div>
            
            <div className="preview-content">
              {compilationError ? (
                <div className="preview-error">
                  <h4>Compilation Error:</h4>
                  <pre>{compilationError}</pre>
                  <p>Please check your LaTeX syntax and try again.</p>
                </div>
              ) : pdfUrl ? (
                <iframe
                  ref={previewRef}
                  src={pdfUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="LaTeX PDF Preview"
                />
              ) : isCompiling ? (
                <div className="preview-loading">
                  <div className="loading-spinner"></div>
                  <p>Compiling your LaTeX document...</p>
                </div>
              ) : (
                <div className="preview-placeholder">
                  <div className="placeholder-content">
                    <h3>📝 LaTeX Preview</h3>
                    <p>Your compiled document will appear here.</p>
                    <p>Start typing LaTeX code to see the live preview!</p>
                    <div className="sample-commands">
                      <h4>Quick Start:</h4>
                      <ul>
                        <li><code>\section{'{'}Title{'}'}</code> - Add a section</li>
                        <li><code>\textbf{'{'}text{'}'}</code> - Bold text</li>
                        <li><code>\cite{'{'}reference{'}'}</code> - Add citation</li>
                        <li><code>\ref{'{'}label{'}'}</code> - Add reference</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="editor-status-bar">
        <span className="status-info">
          LaTeX Document | 
          {isCompiling ? ' Compiling...' : pdfUrl ? ' Ready' : ' Edit mode'} |
          Auto-compile: {showPreview ? 'On' : 'Off'}
        </span>
      </div>
    </div>
  );
}; 