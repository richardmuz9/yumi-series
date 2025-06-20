import React, { useState } from 'react';

interface OutlineGeneratorProps {
  sessionId: string | null;
  template: any;
  designBrief: any;
  onComplete: (data: any) => void;
}

const OutlineGenerator: React.FC<OutlineGeneratorProps> = ({ 
  sessionId, 
  template, 
  designBrief, 
  onComplete 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedOutline, setGeneratedOutline] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');

  const handleGenerateOutline = async () => {
    if (!sessionId || !template || !designBrief) {
      setError('Missing required data for outline generation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to use AI features');
      }

      console.log('Sending outline generation request with:', {
        sessionId,
        templateId: template.id,
        hasBrief: !!designBrief
      });

      const response = await fetch('/api/anime-chara/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          designBrief,
          templateId: template.id
        })
      });

      console.log('Outline generation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Outline generation failed:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 400) {
          throw new Error('Invalid request data. Please check your design brief.');
        } else if (response.status === 500) {
          throw new Error('AI service temporarily unavailable. Please try again in a moment.');
        } else {
          throw new Error(`Server error (${response.status}). Please try again.`);
        }
      }

      const data = await response.json();
      console.log('Outline generation successful:', data);

      if (!data.outlineUrl) {
        throw new Error('No outline URL received from server');
      }

      setGeneratedOutline(data.outlineUrl);
      setPrompt(data.prompt || 'Outline generated successfully');
      
    } catch (err) {
      console.error('Outline generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate outline');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (generatedOutline) {
      onComplete({ outlineUrl: generatedOutline });
    }
  };

  return (
    <div className="outline-generator">
      <div className="generator-header">
        <h2>✏️ Generate Character Outline</h2>
        <p>Create a clean line art outline based on your design using AI</p>
      </div>

      <div className="generation-info">
        <div className="design-summary">
          <h3>📋 Design Summary</h3>
          {designBrief && (
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Character:</strong> {designBrief.character.personality} {designBrief.character.gender}
              </div>
              <div className="summary-item">
                <strong>Style:</strong> {template?.name} - {template?.description}
              </div>
              <div className="summary-item">
                <strong>Hair:</strong> {designBrief.appearance.hair.color} {designBrief.appearance.hair.style}
              </div>
              <div className="summary-item">
                <strong>Eyes:</strong> {designBrief.appearance.eyes.color} {designBrief.appearance.eyes.shape}
              </div>
              <div className="summary-item">
                <strong>Outfit:</strong> {designBrief.appearance.outfit.style}
              </div>
              <div className="summary-item">
                <strong>Mood:</strong> {designBrief.mood}
              </div>
            </div>
          )}
        </div>

        {template && (
          <div className="template-info">
            <h3>🎭 Selected Style: {template.name}</h3>
            <p>{template.description}</p>
            <div className="style-features">
              <strong>Style Features:</strong>
              <ul>
                {template.characteristics?.map((char: string, index: number) => (
                  <li key={index}>{char}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {!generatedOutline && (
        <div className="generation-controls">
          <button 
            onClick={handleGenerateOutline}
            disabled={loading || !sessionId || !template || !designBrief}
            className={`generate-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? '🎨 Generating Outline...' : '✨ Generate Character Outline'}
          </button>
          
          {loading && (
            <div className="generation-progress">
              <div className="progress-text">
                Creating your anime character outline using AI...
              </div>
              <div className="progress-steps">
                <div className="progress-step">🤖 Analyzing character design</div>
                <div className="progress-step">🎨 Applying {template?.name} style</div>
                <div className="progress-step">✏️ Drawing clean line art</div>
                <div className="progress-step">🎯 Finalizing details</div>
              </div>
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            </div>
          )}

          {(!sessionId || !template || !designBrief) && (
            <div className="requirement-warning">
              ⚠️ Please complete the previous steps to generate an outline:
              <ul>
                {!sessionId && <li>Create character idea</li>}
                {!template && <li>Select template style</li>}
                {!designBrief && <li>Complete design brief</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h4>Generation Failed</h4>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleGenerateOutline} className="retry-btn">
                🔄 Try Again
              </button>
              <button onClick={() => setError(null)} className="dismiss-btn">
                ✕ Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {generatedOutline && (
        <div className="generated-result">
          <div className="outline-preview">
            <h3>✨ Your Character Outline</h3>
            <div className="image-container">
              <img 
                src={generatedOutline} 
                alt="Generated character outline" 
                className="outline-image"
                onError={(e) => {
                  console.error('Failed to load outline image');
                  setError('Failed to load generated outline image');
                }}
              />
            </div>
            
            <div className="outline-actions">
              <a 
                href={generatedOutline} 
                download="character-outline.png" 
                className="download-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                📥 Download Outline
              </a>
              <button 
                onClick={handleGenerateOutline} 
                className="regenerate-btn"
                disabled={loading}
              >
                🔄 Generate New Version
              </button>
            </div>
          </div>
          
          {prompt && (
            <div className="generation-details">
              <h4>🎨 Generation Prompt:</h4>
              <p className="prompt-text">{prompt}</p>
            </div>
          )}
          
          <div className="next-steps">
            <h3>🎨 Next Steps:</h3>
            <ol>
              <li>📥 Download the outline image</li>
              <li>🎨 Import into your favorite drawing app</li>
              <li>📋 Use as a guide layer for your artwork</li>
              <li>🌈 Add colors, details, and your creative touch</li>
              <li>🎭 Share your finished character!</li>
            </ol>
            
            <button 
              onClick={handleContinue}
              className="continue-btn"
            >
              Continue to Drawing Canvas ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlineGenerator; 