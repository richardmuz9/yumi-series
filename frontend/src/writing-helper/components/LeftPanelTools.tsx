import React from 'react';

// Templates Panel
export const TemplatesPanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>Templates</h3>
      <div className="template-list">
        <button className="template-item">
          <span>📝</span>
          Blog Post
        </button>
        <button className="template-item">
          <span>📱</span>
          Social Media
        </button>
        <button className="template-item">
          <span>📖</span>
          Story
        </button>
        <button className="template-item">
          <span>🎮</span>
          Galgame Script
        </button>
      </div>
    </div>
  );
};

// Style Guide Panel
export const StyleGuidePanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>Style Guide</h3>
      <div className="style-options">
        <div className="style-section">
          <h4>Tone</h4>
          <select className="style-select">
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
          </select>
        </div>
        <div className="style-section">
          <h4>Voice</h4>
          <select className="style-select">
            <option value="active">Active</option>
            <option value="passive">Passive</option>
          </select>
        </div>
        <div className="style-section">
          <h4>Length</h4>
          <select className="style-select">
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Trending Panel
export const TrendingPanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>Trending Topics</h3>
      <div className="trending-list">
        <div className="trending-item">
          <span>#AI</span>
          <span className="trend-score">↑ 25%</span>
        </div>
        <div className="trending-item">
          <span>#Writing</span>
          <span className="trend-score">↑ 15%</span>
        </div>
        <div className="trending-item">
          <span>#Creativity</span>
          <span className="trend-score">↑ 10%</span>
        </div>
      </div>
    </div>
  );
};

// Export Panel
export const ExportPanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>Export</h3>
      <div className="export-options">
        <button className="export-button">
          <span>📋</span>
          Copy to Clipboard
        </button>
        <button className="export-button">
          <span>📝</span>
          Export as Markdown
        </button>
        <button className="export-button">
          <span>📄</span>
          Export as PDF
        </button>
        <button className="export-button">
          <span>📱</span>
          Preview Social Post
        </button>
      </div>
    </div>
  );
};

// Styles
const styles = `
.panel-content {
  padding: 1rem;
}

.panel-content h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.panel-content h4 {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

/* Templates */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-item:hover {
  background: #f8f9fa;
  transform: translateX(2px);
}

/* Style Guide */
.style-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.style-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.style-select {
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
}

/* Trending */
.trending-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.trend-score {
  color: #40c057;
  font-size: 0.9rem;
}

/* Export */
.export-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.export-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-button:hover {
  background: #f8f9fa;
  transform: translateX(2px);
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet); 