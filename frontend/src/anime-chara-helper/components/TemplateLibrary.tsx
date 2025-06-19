import React, { useState, useEffect } from 'react';

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

interface TemplateLibraryProps {
  onComplete: (data: any) => void;
  designBrief: any;
}

// Style categories for better organization
const STYLE_CATEGORIES: { [key: string]: string[] } = {
  'Popular': ['gorgeous-anime', 'manga-sketch', 'semi-realistic', 'kawaii-moe'],
  'Classic': ['chibi', 'bishojo', 'shonen', 'magical-girl', 'shoujo-sparkle'],
  'Modern': ['cyberpunk-neon', 'minimalist-clean', 'pixel-art', 'watercolor-soft'],
  'Atmospheric': ['gothic-lolita', 'dark-fantasy', 'horror-creepy', 'vintage-retro'],
  'Lifestyle': ['sports-dynamic', 'slice-of-life', 'mecha-girl']
};

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onComplete, designBrief }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Popular');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/anime-chara/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    if (previewMode) {
      // In preview mode, immediately apply the style
      onComplete({ template: template });
    }
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onComplete({ template: selectedTemplate });
    }
  };

  // Filter templates based on category and search
  const getFilteredTemplates = () => {
    let filtered = templates;

    // Filter by category
    if (activeCategory && STYLE_CATEGORIES[activeCategory]) {
      filtered = filtered.filter(template => 
        STYLE_CATEGORIES[activeCategory].includes(template.id)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.characteristics.some(char => 
          char.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  };

  const getStyleIcon = (templateId: string) => {
    const iconMap: { [key: string]: string } = {
      'gorgeous-anime': '✨',
      'manga-sketch': '🖤',
      'semi-realistic': '🎨',
      'kawaii-moe': '💖',
      'cyberpunk-neon': '🌆',
      'gothic-lolita': '🖤',
      'shoujo-sparkle': '🌸',
      'pixel-art': '🎮',
      'watercolor-soft': '🎨',
      'minimalist-clean': '⚪',
      'vintage-retro': '📻',
      'dark-fantasy': '🌙',
      'sports-dynamic': '⚡',
      'slice-of-life': '☀️',
      'horror-creepy': '👻',
      'chibi': '🥰',
      'bishojo': '🌺',
      'shonen': '💪',
      'mecha-girl': '🤖',
      'magical-girl': '🪄'
    };
    return iconMap[templateId] || '🎭';
  };

  if (loading) {
    return (
      <div className="template-library loading">
        <div className="loading-spinner">
          <div className="spinner-icon">🎭</div>
          <p>Loading enhanced art styles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-library error">
        <div className="error-message">⚠️ {error}</div>
        <button onClick={fetchTemplates} className="retry-btn">Try Again</button>
      </div>
    );
  }

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="template-library enhanced">
      <div className="library-header">
        <h2>🎭 Enhanced Style Presets</h2>
        <p>Choose from {templates.length} professional anime styles with one-click switching</p>
        
        {/* Preview Mode Toggle */}
        <div className="preview-controls">
          <label className="preview-toggle">
            <input
              type="checkbox"
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Live Preview Mode
          </label>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="library-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search styles... (e.g., 'realistic', 'cute', 'dark')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-tabs">
                     {Object.keys(STYLE_CATEGORIES).map((category) => (
             <button
               key={category}
               className={`category-tab ${activeCategory === category ? 'active' : ''}`}
               onClick={() => setActiveCategory(category)}
             >
               {category}
               <span className="category-count">
                 ({STYLE_CATEGORIES[category].filter((id: string) => 
                   templates.some(t => t.id === id)
                 ).length})
               </span>
             </button>
           ))}
          <button
            className={`category-tab ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => setActiveCategory('All')}
          >
            All ({templates.length})
          </button>
        </div>
      </div>

      {designBrief && (
        <div className="character-preview">
          <h3>Your Character: {designBrief.character.name || 'Unnamed'}</h3>
          <div className="character-info">
            <span><strong>Personality:</strong> {designBrief.character.personality}</span>
            <span><strong>Mood:</strong> {designBrief.mood}</span>
          </div>
        </div>
      )}

      <div className="templates-grid enhanced">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`template-card enhanced ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="template-preview">
              <div className="template-icon">{getStyleIcon(template.id)}</div>
              <div className="template-overlay">
                <span className="preview-text">
                  {previewMode ? 'Click to Apply' : 'Click to Select'}
                </span>
              </div>
            </div>
            
            <div className="template-info">
              <div className="template-header">
                <h3>{template.name}</h3>
                <div className="style-badge">{template.style}</div>
              </div>
              
              <p className="template-description">{template.description}</p>
              
              <div className="template-features">
                <div className="features-list">
                  {template.characteristics.slice(0, 3).map((char, index) => (
                    <span key={index} className="feature-tag">
                      {char}
                    </span>
                  ))}
                  {template.characteristics.length > 3 && (
                    <span className="feature-more">
                      +{template.characteristics.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="template-proportions compact">
                <div className="proportion-indicator">
                  <span>Head: {Math.round(template.proportions.headRatio * 100)}%</span>
                  <span>Body: {Math.round(template.proportions.bodyRatio * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Quick Apply Button for Preview Mode */}
            {previewMode && (
              <div className="quick-apply">
                <button className="apply-btn">✨ Apply Style</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🎭</div>
          <h3>No styles found</h3>
          <p>Try adjusting your search or selecting a different category</p>
        </div>
      )}

      {selectedTemplate && !previewMode && (
        <div className="template-selection enhanced">
          <div className="selected-template-info">
            <div className="selection-header">
              <span className="selection-icon">{getStyleIcon(selectedTemplate.id)}</span>
              <div>
                <h3>Selected: {selectedTemplate.name}</h3>
                <p>{selectedTemplate.description}</p>
              </div>
            </div>
            
            <div className="style-characteristics">
              <h4>Style Features:</h4>
              <div className="characteristics-grid">
                {selectedTemplate.characteristics.map((char, index) => (
                  <span key={index} className="characteristic-pill">
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleContinue}
            className="continue-btn enhanced"
          >
            Continue with {selectedTemplate.name} ➡️
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary; 