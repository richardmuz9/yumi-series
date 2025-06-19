import React, { useState } from 'react';

interface ProgressAnalyzerProps {
  sessionId: string | null;
  onComplete: (data: any) => void;
}

interface Analysis {
  overallScore: number;
  strengths: string[];
  improvements: Array<{
    area: string;
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  nextSteps: string[];
  encouragement: string;
}

const ProgressAnalyzer: React.FC<ProgressAnalyzerProps> = ({ sessionId, onComplete }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState('progress');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage || !sessionId) {
      setError('Missing required data for analysis');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/anime-chara/analyze-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId,
          imageUrl: uploadedImage,
          stage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze drawing progress');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze progress');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleContinue = () => {
    onComplete({ analysis });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#2ed573';
    if (score >= 6) return '#ffa502';
    return '#ff4757';
  };

  return (
    <div className="progress-analyzer">
      <div className="analyzer-header">
        <h2>🔍 Progress Analysis</h2>
        <p>Upload your artwork for AI-powered feedback and suggestions</p>
      </div>

      <div className="stage-selector">
        <label>Drawing Stage:</label>
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="stage-select">
          <option value="sketch">Initial Sketch</option>
          <option value="lineart">Line Art</option>
          <option value="colors">Base Colors</option>
          <option value="shading">Shading & Details</option>
          <option value="final">Final Artwork</option>
          <option value="progress">General Progress</option>
        </select>
      </div>

      {!uploadedImage && (
        <div className="upload-area">
          <div className="upload-instructions">
            <h3>📸 Upload Your Drawing</h3>
            <p>Take a photo or screenshot of your current progress</p>
            <ul>
              <li>Supported formats: JPG, PNG, GIF</li>
              <li>Maximum size: 10MB</li>
              <li>Make sure the image is clear and well-lit</li>
            </ul>
          </div>
          
          <label className="upload-btn">
            {uploading ? '📤 Uploading...' : '📁 Choose Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {uploadedImage && !analysis && (
        <div className="uploaded-preview">
          <div className="preview-container">
            <img src={uploadedImage} alt="Uploaded artwork" className="uploaded-image" />
            <div className="preview-actions">
              <button 
                onClick={() => setUploadedImage(null)}
                className="change-image-btn"
              >
                🔄 Change Image
              </button>
              <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="analyze-btn"
              >
                {analyzing ? '🤖 Analyzing...' : '🔍 Analyze Progress'}
              </button>
            </div>
          </div>
          
          {analyzing && (
            <div className="analysis-progress">
              <div className="progress-text">
                AI is analyzing your artwork...
              </div>
              <div className="progress-steps">
                <div>👁️ Examining composition and proportions</div>
                <div>🎨 Evaluating line quality and style</div>
                <div>💭 Generating personalized feedback</div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <div className="analysis-header">
            <h3>📊 Analysis Results</h3>
            <div className="overall-score">
              <span>Overall Score:</span>
              <div 
                className="score-badge"
                style={{ backgroundColor: getScoreColor(analysis.overallScore) }}
              >
                {analysis.overallScore}/10
              </div>
            </div>
          </div>

          <div className="analysis-sections">
            <div className="strengths-section">
              <h4>✨ Strengths</h4>
              <ul>
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="strength-item">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="improvements-section">
              <h4>🎯 Areas for Improvement</h4>
              {analysis.improvements.map((improvement, index) => (
                <div key={index} className="improvement-item">
                  <div className="improvement-header">
                    <span className="improvement-area">{improvement.area}</span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(improvement.priority) }}
                    >
                      {improvement.priority}
                    </span>
                  </div>
                  <div className="improvement-issue">{improvement.issue}</div>
                  <div className="improvement-suggestion">
                    <strong>Suggestion:</strong> {improvement.suggestion}
                  </div>
                </div>
              ))}
            </div>

            <div className="next-steps-section">
              <h4>📝 Next Steps</h4>
              <ol>
                {analysis.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="encouragement-section">
              <h4>💪 Encouragement</h4>
              <p className="encouragement-text">{analysis.encouragement}</p>
            </div>
          </div>

          <div className="analysis-actions">
            <button 
              onClick={() => {
                setAnalysis(null);
                setUploadedImage(null);
              }}
              className="analyze-again-btn"
            >
              🔄 Analyze Another Image
            </button>
            <button 
              onClick={handleContinue}
              className="continue-btn"
            >
              Complete Design ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressAnalyzer; 