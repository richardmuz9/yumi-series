import React, { useState, useEffect, useCallback } from 'react'
import { WebBuilderService, Template, WebsiteProject, ComponentBlock, DeploymentConfig } from '../services/webBuilderApi'
import { useStore } from '../store'
import './EnhancedWebBuilder.css'

interface EnhancedWebBuilderAppProps {
  onBackToMain?: () => void
}

type ViewMode = 'dashboard' | 'templates' | 'editor' | 'ai-chat' | 'preview' | 'deploy' | 'analytics'
type EditorMode = 'visual' | 'code' | 'split'

const EnhancedWebBuilderApp: React.FC<EnhancedWebBuilderAppProps> = ({ onBackToMain }) => {
  // Core state
  const { language } = useStore()
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const [editorMode, setEditorMode] = useState<EditorMode>('visual')
  
  // Project state
  const [currentProject, setCurrentProject] = useState<WebsiteProject | null>(null)
  const [projects, setProjects] = useState<WebsiteProject[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Editor state
  const [selectedComponent, setSelectedComponent] = useState<ComponentBlock | null>(null)
  const [componentLibrary, setComponentLibrary] = useState<ComponentBlock[]>([])
  const [htmlCode, setHtmlCode] = useState('')
  const [cssCode, setCssCode] = useState('')
  const [jsCode, setJsCode] = useState('')
  
  // AI Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Preview state
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showPreview, setShowPreview] = useState(false)
  
  // Deployment state
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    domain: '',
    platform: 'vercel',
    environment: 'production'
  })

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      const [projectsData, templatesData, componentsData] = await Promise.all([
        WebBuilderService.getProjects(),
        WebBuilderService.getTemplates(),
        WebBuilderService.getComponentLibrary()
      ])
      
      setProjects(projectsData)
      setTemplates(templatesData)
      setComponentLibrary(componentsData)
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Project management
  const createNewProject = async (templateId?: string) => {
    try {
      setIsLoading(true)
      const project = await WebBuilderService.createProject({
        name: 'New Website',
        description: 'My awesome website',
        templateId
      })
      
      setCurrentProject(project)
      setCurrentView('editor')
      
      // Load project content
      if (project.htmlContent) setHtmlCode(project.htmlContent)
      if (project.cssContent) setCssCode(project.cssContent)
      if (project.jsContent) setJsCode(project.jsContent)
      
    } catch (err) {
      setError('Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true)
      const project = await WebBuilderService.getProject(projectId)
      setCurrentProject(project)
      setCurrentView('editor')
      
      // Load project content
      if (project.htmlContent) setHtmlCode(project.htmlContent)
      if (project.cssContent) setCssCode(project.cssContent)
      if (project.jsContent) setJsCode(project.jsContent)
      
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  const saveProject = async () => {
    if (!currentProject) return

    try {
      const updatedProject = await WebBuilderService.updateProject(currentProject.id, {
        ...currentProject,
        htmlContent: htmlCode,
        cssContent: cssCode,
        jsContent: jsCode,
        lastModified: new Date().toISOString()
      })
      
      setCurrentProject(updatedProject)
      // Show success message
    } catch (err) {
      setError('Failed to save project')
    }
  }

  // AI Chat functionality
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...chatMessages, userMessage]
    setChatMessages(updatedMessages)
    setChatInput('')
    setIsGenerating(true)

    try {
      const response = await WebBuilderService.chatWithAI(updatedMessages, {
        projectContext: currentProject,
        currentCode: { html: htmlCode, css: cssCode, js: jsCode }
      })

      const aiMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions,
        codeChanges: response.codeChanges
      }

      setChatMessages([...updatedMessages, aiMessage])

      // Apply code changes if provided
      if (response.codeChanges) {
        if (response.codeChanges.html) setHtmlCode(response.codeChanges.html)
        if (response.codeChanges.css) setCssCode(response.codeChanges.css)
        if (response.codeChanges.js) setJsCode(response.codeChanges.js)
      }

    } catch (err) {
      setError('Failed to get AI response')
    } finally {
      setIsGenerating(false)
    }
  }

  // Component management
  const addComponent = useCallback((component: ComponentBlock) => {
    const componentHtml = `\n<!-- ${component.name} -->\n${component.html}\n`
    setHtmlCode(prev => prev + componentHtml)
    
    if (component.css) {
      setCssCode(prev => prev + `\n/* ${component.name} Styles */\n${component.css}\n`)
    }
    
    if (component.js) {
      setJsCode(prev => prev + `\n// ${component.name} JavaScript\n${component.js}\n`)
    }
  }, [])

  // Deploy website
  const deployWebsite = async () => {
    if (!currentProject) return

    try {
      setIsLoading(true)
      const result = await WebBuilderService.deployWebsite(currentProject.id, deploymentConfig)
      
      // Show success with deployment URL
      setError(null)
      
    } catch (err) {
      setError('Failed to deploy website')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate website with AI
  const generateWithAI = async (prompt: string) => {
    try {
      setIsGenerating(true)
      const generated = await WebBuilderService.generateWebsite(prompt)
      
      setHtmlCode(generated.html)
      setCssCode(generated.css)
      setJsCode(generated.js || '')
      
    } catch (err) {
      setError('Failed to generate website')
    } finally {
      setIsGenerating(false)
    }
  }

  // Render navigation
  const renderNavigation = () => (
    <div className="web-builder-nav">
      <div className="nav-brand">
        <h1>🌐 AI Web Builder</h1>
        <p>Build stunning websites with AI</p>
      </div>
      
      <div className="nav-tabs">
        {[
          { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
          { id: 'templates', icon: '📋', label: 'Templates' },
          { id: 'editor', icon: '✏️', label: 'Editor' },
          { id: 'ai-chat', icon: '🤖', label: 'AI Assistant' },
          { id: 'preview', icon: '👁️', label: 'Preview' },
          { id: 'deploy', icon: '🚀', label: 'Deploy' },
          { id: 'analytics', icon: '📊', label: 'Analytics' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id as ViewMode)}
            className={`nav-tab ${currentView === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="nav-actions">
        {currentProject && (
          <button onClick={saveProject} className="save-btn">
            💾 Save
          </button>
        )}
        {onBackToMain && (
          <button onClick={onBackToMain} className="back-btn">
            ← Back
          </button>
        )}
      </div>
    </div>
  )

  // Render dashboard
  const renderDashboard = () => (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h2>🚀 Welcome to AI Web Builder</h2>
        <p>Create beautiful, responsive websites with the power of AI</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{projects.length}</h3>
          <p>Projects</p>
        </div>
        <div className="stat-card">
          <h3>{templates.length}</h3>
          <p>Templates</p>
        </div>
        <div className="stat-card">
          <h3>∞</h3>
          <p>Possibilities</p>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-cards">
          <div className="action-card" onClick={() => createNewProject()}>
            <div className="action-icon">✨</div>
            <h4>Create from Scratch</h4>
            <p>Start with a blank canvas</p>
          </div>
          
          <div className="action-card" onClick={() => setCurrentView('templates')}>
            <div className="action-icon">📋</div>
            <h4>Choose Template</h4>
            <p>Start with professional designs</p>
          </div>
          
          <div className="action-card" onClick={() => setCurrentView('ai-chat')}>
            <div className="action-icon">🤖</div>
            <h4>AI Generator</h4>
            <p>Describe your vision to AI</p>
          </div>
        </div>
      </div>

      <div className="recent-projects">
        <h3>Recent Projects</h3>
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first website!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.slice(0, 6).map(project => (
              <div key={project.id} className="project-card" onClick={() => loadProject(project.id)}>
                <div className="project-preview">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} />
                  ) : (
                    <div className="placeholder">🌐</div>
                  )}
                </div>
                <div className="project-info">
                  <h4>{project.name}</h4>
                  <p>{project.description}</p>
                  <span className="project-date">
                    {new Date(project.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Render templates
  const renderTemplates = () => (
    <div className="templates-view">
      <div className="templates-header">
        <h2>🎨 Choose a Template</h2>
        <p>Professional designs ready to customize</p>
      </div>

      <div className="templates-filters">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Business</button>
        <button className="filter-btn">Portfolio</button>
        <button className="filter-btn">E-commerce</button>
        <button className="filter-btn">Blog</button>
        <button className="filter-btn">Landing Page</button>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-preview">
              <img src={template.thumbnail} alt={template.name} />
              <div className="template-overlay">
                <button 
                  className="use-template-btn"
                  onClick={() => createNewProject(template.id)}
                >
                  Use Template
                </button>
                <button className="preview-template-btn">Preview</button>
              </div>
            </div>
            <div className="template-info">
              <h4>{template.name}</h4>
              <p>{template.description}</p>
              <div className="template-tags">
                {template.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Render editor
  const renderEditor = () => (
    <div className="editor-view">
      <div className="editor-toolbar">
        <div className="editor-modes">
          <button 
            className={`mode-btn ${editorMode === 'visual' ? 'active' : ''}`}
            onClick={() => setEditorMode('visual')}
          >
            🎨 Visual
          </button>
          <button 
            className={`mode-btn ${editorMode === 'code' ? 'active' : ''}`}
            onClick={() => setEditorMode('code')}
          >
            💻 Code
          </button>
          <button 
            className={`mode-btn ${editorMode === 'split' ? 'active' : ''}`}
            onClick={() => setEditorMode('split')}
          >
            📱 Split
          </button>
        </div>
        
        <div className="editor-actions">
          <button onClick={() => setShowPreview(true)} className="preview-btn">
            👁️ Preview
          </button>
          <button onClick={saveProject} className="save-btn">
            💾 Save
          </button>
        </div>
      </div>

      <div className="editor-content">
        {editorMode === 'visual' && (
          <div className="visual-editor">
            <div className="components-panel">
              <h3>Components</h3>
              <div className="component-categories">
                <div className="category">
                  <h4>Layout</h4>
                  {componentLibrary.filter(c => c.category === 'layout').map(component => (
                    <div 
                      key={component.id} 
                      className="component-item"
                      onClick={() => addComponent(component)}
                    >
                      <span className="component-icon">{component.icon}</span>
                      <span className="component-name">{component.name}</span>
                    </div>
                  ))}
                </div>
                
                <div className="category">
                  <h4>Content</h4>
                  {componentLibrary.filter(c => c.category === 'content').map(component => (
                    <div 
                      key={component.id} 
                      className="component-item"
                      onClick={() => addComponent(component)}
                    >
                      <span className="component-icon">{component.icon}</span>
                      <span className="component-name">{component.name}</span>
                    </div>
                  ))}
                </div>
                
                <div className="category">
                  <h4>Forms</h4>
                  {componentLibrary.filter(c => c.category === 'forms').map(component => (
                    <div 
                      key={component.id} 
                      className="component-item"
                      onClick={() => addComponent(component)}
                    >
                      <span className="component-icon">{component.icon}</span>
                      <span className="component-name">{component.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="canvas-area">
              <div className="device-frame">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>${cssCode}</style>
                    </head>
                    <body>
                      ${htmlCode}
                      <script>${jsCode}</script>
                    </body>
                    </html>
                  `}
                  className="preview-frame"
                />
              </div>
            </div>
            
            <div className="properties-panel">
              <h3>Properties</h3>
              {selectedComponent ? (
                <div className="component-properties">
                  <h4>{selectedComponent.name}</h4>
                  {/* Component-specific properties would go here */}
                </div>
              ) : (
                <p>Select a component to edit properties</p>
              )}
            </div>
          </div>
        )}

        {editorMode === 'code' && (
          <div className="code-editor">
            <div className="code-tabs">
              <button className="tab-btn active">HTML</button>
              <button className="tab-btn">CSS</button>
              <button className="tab-btn">JavaScript</button>
            </div>
            
            <div className="code-panels">
              <div className="code-panel">
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="HTML code..."
                  className="code-textarea"
                />
              </div>
              
              <div className="code-panel">
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  placeholder="CSS styles..."
                  className="code-textarea"
                />
              </div>
              
              <div className="code-panel">
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  placeholder="JavaScript code..."
                  className="code-textarea"
                />
              </div>
            </div>
          </div>
        )}

        {editorMode === 'split' && (
          <div className="split-editor">
            <div className="split-left">
              <div className="code-editor">
                <div className="code-tabs">
                  <button className="tab-btn active">HTML</button>
                  <button className="tab-btn">CSS</button>
                  <button className="tab-btn">JS</button>
                </div>
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="code-textarea"
                />
              </div>
            </div>
            
            <div className="split-right">
              <div className="preview-container">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>${cssCode}</style>
                    </head>
                    <body>
                      ${htmlCode}
                      <script>${jsCode}</script>
                    </body>
                    </html>
                  `}
                  className="preview-frame"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Render AI chat
  const renderAIChat = () => (
    <div className="ai-chat-view">
      <div className="chat-header">
        <h2>🤖 AI Website Assistant</h2>
        <p>Describe what you want to build</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="chat-welcome">
              <h3>👋 Hello! I'm your AI web developer</h3>
              <p>I can help you:</p>
              <ul>
                <li>🎨 Generate complete websites from descriptions</li>
                <li>✨ Add new features and components</li>
                <li>🔧 Fix bugs and improve performance</li>
                <li>📱 Make your site responsive</li>
                <li>🎯 Optimize for SEO and accessibility</li>
              </ul>
              <div className="example-prompts">
                <h4>Try these examples:</h4>
                <div className="prompt-suggestions">
                  <button onClick={() => setChatInput("Create a modern portfolio website for a designer")}>
                    "Create a modern portfolio website for a designer"
                  </button>
                  <button onClick={() => setChatInput("Add a contact form with validation")}>
                    "Add a contact form with validation"
                  </button>
                  <button onClick={() => setChatInput("Make the header sticky and add smooth scrolling")}>
                    "Make the header sticky and add smooth scrolling"
                  </button>
                </div>
              </div>
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div key={index} className={`chat-message ${message.role}`}>
                <div className="message-content">
                  {message.content}
                </div>
                {message.suggestions && (
                  <div className="message-suggestions">
                    <h5>Suggestions:</h5>
                    {message.suggestions.map((suggestion: string, i: number) => (
                      <button 
                        key={i} 
                        className="suggestion-btn"
                        onClick={() => setChatInput(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          
          {isGenerating && (
            <div className="chat-message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <div className="quick-actions">
            <button onClick={() => generateWithAI("Create a beautiful landing page")}>
              🎨 Landing Page
            </button>
            <button onClick={() => generateWithAI("Create a portfolio website")}>
              💼 Portfolio
            </button>
            <button onClick={() => generateWithAI("Create a business website")}>
              🏢 Business Site
            </button>
          </div>
          
          <div className="chat-input-row">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder="Describe what you want to build..."
              className="chat-input"
            />
            <button 
              onClick={sendChatMessage} 
              className="send-btn"
              disabled={!chatInput.trim() || isGenerating}
            >
              {isGenerating ? '⏳' : '🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render preview
  const renderPreview = () => (
    <div className="preview-view">
      <div className="preview-toolbar">
        <h2>👁️ Live Preview</h2>
        
        <div className="device-switcher">
          <button 
            className={`device-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
            onClick={() => setPreviewDevice('desktop')}
          >
            🖥️ Desktop
          </button>
          <button 
            className={`device-btn ${previewDevice === 'tablet' ? 'active' : ''}`}
            onClick={() => setPreviewDevice('tablet')}
          >
            📱 Tablet
          </button>
          <button 
            className={`device-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
            onClick={() => setPreviewDevice('mobile')}
          >
            📱 Mobile
          </button>
        </div>
        
        <div className="preview-actions">
          <button onClick={() => window.open('data:text/html,' + encodeURIComponent(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>${cssCode}</style>
            </head>
            <body>
              ${htmlCode}
              <script>${jsCode}</script>
            </body>
            </html>
          `), '_blank')}>
            🔗 Open in New Tab
          </button>
        </div>
      </div>

      <div className={`preview-container ${previewDevice}`}>
        <div className="device-frame">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>${cssCode}</style>
              </head>
              <body>
                ${htmlCode}
                <script>${jsCode}</script>
              </body>
              </html>
            `}
            className="preview-iframe"
          />
        </div>
      </div>
    </div>
  )

  // Render deployment
  const renderDeploy = () => (
    <div className="deploy-view">
      <div className="deploy-header">
        <h2>🚀 Deploy Your Website</h2>
        <p>Publish your website to the world</p>
      </div>

      <div className="deploy-options">
        <div className="platform-selection">
          <h3>Choose Platform</h3>
          <div className="platform-cards">
            <div className={`platform-card ${deploymentConfig.platform === 'vercel' ? 'selected' : ''}`}
                 onClick={() => setDeploymentConfig({...deploymentConfig, platform: 'vercel'})}>
              <div className="platform-icon">▲</div>
              <h4>Vercel</h4>
              <p>Fast, reliable hosting</p>
            </div>
            
            <div className={`platform-card ${deploymentConfig.platform === 'netlify' ? 'selected' : ''}`}
                 onClick={() => setDeploymentConfig({...deploymentConfig, platform: 'netlify'})}>
              <div className="platform-icon">🌐</div>
              <h4>Netlify</h4>
              <p>Continuous deployment</p>
            </div>
            
            <div className={`platform-card ${deploymentConfig.platform === 'github' ? 'selected' : ''}`}
                 onClick={() => setDeploymentConfig({...deploymentConfig, platform: 'github'})}>
              <div className="platform-icon">🐙</div>
              <h4>GitHub Pages</h4>
              <p>Free hosting for static sites</p>
            </div>
          </div>
        </div>

        <div className="deploy-config">
          <h3>Configuration</h3>
          <div className="config-form">
            <div className="form-group">
              <label>Domain Name (optional)</label>
              <input
                type="text"
                value={deploymentConfig.domain}
                onChange={(e) => setDeploymentConfig({...deploymentConfig, domain: e.target.value})}
                placeholder="my-awesome-site.com"
              />
            </div>
            
            <div className="form-group">
              <label>Environment</label>
              <select
                value={deploymentConfig.environment}
                onChange={(e) => setDeploymentConfig({...deploymentConfig, environment: e.target.value as any})}
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>
        </div>

        <div className="deploy-actions">
          <button onClick={deployWebsite} className="deploy-btn" disabled={isLoading}>
            {isLoading ? '🔄 Deploying...' : '🚀 Deploy Now'}
          </button>
        </div>
      </div>

      <div className="deploy-history">
        <h3>Deployment History</h3>
        <div className="history-list">
          <div className="history-item">
            <div className="status success">✅</div>
            <div className="details">
              <h4>Production Deployment</h4>
              <p>Deployed to Vercel • 2 hours ago</p>
            </div>
            <div className="actions">
              <button>🔗 Visit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render analytics
  const renderAnalytics = () => (
    <div className="analytics-view">
      <div className="analytics-header">
        <h2>📊 Website Analytics</h2>
        <p>Track your website's performance</p>
      </div>

      <div className="analytics-cards">
        <div className="analytics-card">
          <h3>1,234</h3>
          <p>Total Visitors</p>
          <span className="trend up">+12%</span>
        </div>
        
        <div className="analytics-card">
          <h3>2.5min</h3>
          <p>Avg. Session</p>
          <span className="trend up">+5%</span>
        </div>
        
        <div className="analytics-card">
          <h3>67%</h3>
          <p>Bounce Rate</p>
          <span className="trend down">-8%</span>
        </div>
        
        <div className="analytics-card">
          <h3>98%</h3>
          <p>Performance</p>
          <span className="trend up">+2%</span>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-placeholder">
          <h3>📈 Traffic Overview</h3>
          <p>Chart visualization would go here</p>
        </div>
      </div>
    </div>
  )

  // Main render
  return (
    <div className="enhanced-web-builder">
      {renderNavigation()}
      
      <div className="web-builder-content">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">🔄</div>
            <p>Loading...</p>
          </div>
        )}
        
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'templates' && renderTemplates()}
        {currentView === 'editor' && renderEditor()}
        {currentView === 'ai-chat' && renderAIChat()}
        {currentView === 'preview' && renderPreview()}
        {currentView === 'deploy' && renderDeploy()}
        {currentView === 'analytics' && renderAnalytics()}
      </div>
      
      {showPreview && (
        <div className="preview-modal">
          <div className="modal-header">
            <h3>Live Preview</h3>
            <button onClick={() => setShowPreview(false)}>✕</button>
          </div>
          <div className="modal-content">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>${cssCode}</style>
                </head>
                <body>
                  ${htmlCode}
                  <script>${jsCode}</script>
                </body>
                </html>
              `}
              className="modal-iframe"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedWebBuilderApp 