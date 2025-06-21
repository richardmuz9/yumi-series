import React from 'react';

// AI Assist Panel
export const AIAssistPanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>AI Assistant</h3>
      <div className="ai-suggestions">
        <div className="suggestion-item">
          <span className="suggestion-icon">💡</span>
          <div className="suggestion-content">
            <p>Consider using more active voice in this paragraph.</p>
            <button className="apply-suggestion">Apply</button>
          </div>
        </div>
        <div className="suggestion-item">
          <span className="suggestion-icon">📝</span>
          <div className="suggestion-content">
            <p>This sentence could be more concise.</p>
            <button className="apply-suggestion">Apply</button>
          </div>
        </div>
      </div>
      <div className="ai-actions">
        <button className="ai-action-button">
          <span>🔄</span>
          Rephrase
        </button>
        <button className="ai-action-button">
          <span>✨</span>
          Polish
        </button>
      </div>
    </div>
  );
};

// Enhancement Panel
export const EnhancePanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>Enhancements</h3>
      <div className="enhancement-options">
        <button className="enhance-button">
          <span>📈</span>
          Make More Engaging
        </button>
        <button className="enhance-button">
          <span>🎯</span>
          Improve Clarity
        </button>
        <button className="enhance-button">
          <span>💫</span>
          Add Examples
        </button>
        <button className="enhance-button">
          <span>🎭</span>
          Change Tone
        </button>
      </div>
    </div>
  );
};

// Continue Panel
export const ContinuePanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>Continue Writing</h3>
      <div className="continue-options">
        <button className="continue-button">
          <span>📝</span>
          Next Paragraph
        </button>
        <button className="continue-button">
          <span>💭</span>
          Alternative Version
        </button>
        <button className="continue-button">
          <span>🎬</span>
          Next Scene
        </button>
      </div>
      <div className="continue-settings">
        <label>
          <span>Creativity Level</span>
          <input type="range" min="0" max="100" defaultValue="50" />
        </label>
      </div>
    </div>
  );
};

// Research Panel
export const ResearchPanel: React.FC = () => {
  return (
    <div className="panel-content">
      <h3>Research</h3>
      <div className="research-tools">
        <div className="search-box">
          <input type="text" placeholder="Search related topics..." />
          <button>🔍</button>
        </div>
        <div className="research-results">
          <div className="result-item">
            <h4>Related Articles</h4>
            <ul>
              <li>
                <a href="#">Understanding AI Writing</a>
                <span className="source">Medium</span>
              </li>
              <li>
                <a href="#">Creative Writing Tips</a>
                <span className="source">Writer's Digest</span>
              </li>
            </ul>
          </div>
          <div className="result-item">
            <h4>Key Facts</h4>
            <ul>
              <li>75% of readers prefer shorter paragraphs</li>
              <li>Active voice improves readability by 30%</li>
            </ul>
          </div>
        </div>
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

/* AI Assist */
.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.suggestion-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.suggestion-icon {
  font-size: 1.2rem;
}

.suggestion-content {
  flex: 1;
}

.suggestion-content p {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.apply-suggestion {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: #4dabf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.ai-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-action-button:hover {
  background: #f8f9fa;
  transform: translateX(2px);
}

/* Enhancement */
.enhancement-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.enhance-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.enhance-button:hover {
  background: #f8f9fa;
  transform: translateX(2px);
}

/* Continue */
.continue-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.continue-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-button:hover {
  background: #f8f9fa;
  transform: translateX(2px);
}

.continue-settings {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.continue-settings label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

/* Research */
.research-tools {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  display: flex;
  gap: 0.5rem;
}

.search-box input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.search-box button {
  padding: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
}

.research-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
}

.result-item h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.result-item ul {
  margin: 0;
  padding-left: 1.5rem;
  font-size: 0.9rem;
}

.result-item li {
  margin-bottom: 0.25rem;
}

.source {
  font-size: 0.8rem;
  color: #666;
  margin-left: 0.5rem;
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet); 