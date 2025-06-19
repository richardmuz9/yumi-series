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
      const response = await fetch('/api/anime-chara/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId,
          designBrief,
          templateId: template.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate character outline');
      }

      const data = await response.json();
      setGeneratedOutline(data.outlineUrl);
      setPrompt(data.prompt);
      
    } catch (err) {
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
        <p>Create a clean line art outline based on your design</p>
      </div>

      <div className="generation-info">
        <div className="design-summary">
          <h3>Design Summary</h3>
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
            <h3>Selected Style: {template.name}</h3>
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
            disabled={loading}
            className="generate-btn"
          >
            {loading ? '🎨 Generating Outline...' : '✨ Generate Character Outline'}
          </button>
          
          {loading && (
            <div className="generation-progress">
              <div className="progress-text">
                Creating your anime character outline using AI...
              </div>
              <div className="progress-steps">
                <div>🤖 Analyzing character design</div>
                <div>🎨 Applying {template?.name} style</div>
                <div>✏️ Drawing clean line art</div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={handleGenerateOutline} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {generatedOutline && (
        <div className="generated-result">
          <div className="outline-preview">
            <h3>✨ Your Character Outline</h3>
            <img src={generatedOutline} alt="Generated character outline" className="outline-image" />
            
            <div className="outline-actions">
              <a 
                href={generatedOutline} 
                download="character-outline.png" 
                className="download-btn"
              >
                📥 Download Outline
              </a>
              <button onClick={handleGenerateOutline} className="regenerate-btn">
                🔄 Generate New Outline
              </button>
            </div>
          </div>
          
          {prompt && (
            <div className="generation-details">
              <h4>Generation Prompt:</h4>
              <p className="prompt-text">{prompt}</p>
            </div>
          )}
          
          <div className="next-steps">
            <h3>🎨 Next Steps:</h3>
            <ol>
              <li>Download the outline image</li>
              <li>Import into your favorite drawing app</li>
              <li>Use as a guide layer for your artwork</li>
              <li>Add colors, details, and your creative touch</li>
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