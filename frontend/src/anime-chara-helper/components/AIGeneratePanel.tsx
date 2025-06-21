import React, { useState, useRef } from 'react';
import { generateAnimeCharacter } from '../../services/api';
import { AIGenerationSettings, GeneratedImage } from '../types';

interface AIGeneratePanelProps {
  onDone: (imageUrl: string) => void;
}

export default function AIGeneratePanel({ onDone }: AIGeneratePanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced settings
  const [settings, setSettings] = useState<AIGenerationSettings>({
    iterations: 4,
    useCustomModel: false,
    postProcessing: {
      upscale: true,
      denoise: true,
      lineArtCleanup: false,
      colorCorrection: {
        contrast: 0,
        saturation: 0,
        bloom: 0
      }
    }
  });

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    // Update cost estimate based on settings
    const baseTokens = Math.ceil(value.length / 4);
    let cost = (baseTokens * 3.5 + 35) * settings.iterations;
    if (settings.useCustomModel) cost += 15;
    if (settings.postProcessing.upscale) cost += 5;
    if (settings.postProcessing.denoise) cost += 5;
    if (settings.postProcessing.lineArtCleanup) cost += 10;
    setEstimatedCost(cost);
  };

  const handleReferenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          referenceImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const results = await generateAnimeCharacter(prompt, settings);
      setGeneratedImages(results);
    } catch (error) {
      const err = error as Error;
      alert(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image: GeneratedImage) => {
    onDone(image.url);
  };

  return (
    <div className="ai-generate-panel">
      {/* Reference Image Upload */}
      <div className="reference-upload">
        <label htmlFor="reference-image">Reference Image (optional)</label>
        <input
          type="file"
          id="reference-image"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleReferenceUpload}
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current?.click()}>
          Upload Reference
        </button>
        {settings.referenceImage && (
          <img 
            src={settings.referenceImage} 
            alt="Reference" 
            className="reference-preview"
          />
        )}
      </div>

      {/* Character Description */}
      <div className="prompt-section">
        <label htmlFor="character-prompt">Character Description</label>
        <textarea
          id="character-prompt"
          placeholder="Describe your character (e.g. 'young cyberpunk hacker with neon hair and holographic accessories')..."
          value={prompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          disabled={loading}
          rows={4}
        />
      </div>

      {/* Advanced Settings */}
      <div className="advanced-settings">
        <h3>Advanced Settings</h3>
        
        <div className="setting-group">
          <label>
            Number of Variations:
            <select
              value={settings.iterations}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                iterations: parseInt(e.target.value)
              }))}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="6">6</option>
            </select>
          </label>
        </div>

        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.useCustomModel}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                useCustomModel: e.target.checked
              }))}
            />
            Use Custom Anime Model
          </label>
        </div>

        <div className="setting-group">
          <h4>Post-Processing</h4>
          <label>
            <input
              type="checkbox"
              checked={settings.postProcessing.upscale}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                postProcessing: {
                  ...prev.postProcessing,
                  upscale: e.target.checked
                }
              }))}
            />
            Upscale
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.postProcessing.denoise}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                postProcessing: {
                  ...prev.postProcessing,
                  denoise: e.target.checked
                }
              }))}
            />
            Denoise
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.postProcessing.lineArtCleanup}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                postProcessing: {
                  ...prev.postProcessing,
                  lineArtCleanup: e.target.checked
                }
              }))}
            />
            Line Art Cleanup
          </label>
        </div>

        <div className="setting-group">
          <h4>Color Correction</h4>
          <label>
            Contrast:
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.postProcessing.colorCorrection.contrast}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                postProcessing: {
                  ...prev.postProcessing,
                  colorCorrection: {
                    ...prev.postProcessing.colorCorrection,
                    contrast: parseInt(e.target.value)
                  }
                }
              }))}
            />
          </label>
          <label>
            Saturation:
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.postProcessing.colorCorrection.saturation}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                postProcessing: {
                  ...prev.postProcessing,
                  colorCorrection: {
                    ...prev.postProcessing.colorCorrection,
                    saturation: parseInt(e.target.value)
                  }
                }
              }))}
            />
          </label>
          <label>
            Bloom:
            <input
              type="range"
              min="0"
              max="100"
              value={settings.postProcessing.colorCorrection.bloom}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                postProcessing: {
                  ...prev.postProcessing,
                  colorCorrection: {
                    ...prev.postProcessing.colorCorrection,
                    bloom: parseInt(e.target.value)
                  }
                }
              }))}
            />
          </label>
        </div>
      </div>

      {estimatedCost !== null && prompt.trim() && (
        <div className="cost-estimate">
          Estimated cost: {estimatedCost} Yumi-Credits
        </div>
      )}

      <button 
        className="generate-button"
        onClick={handleGenerate} 
        disabled={!prompt.trim() || loading}
      >
        {loading ? 'Generating...' : 'Generate with AI'}
      </button>

      {/* Generated Images Grid */}
      {generatedImages.length > 0 && (
        <div className="generated-images-grid">
          {generatedImages.map((image, index) => (
            <div key={index} className="generated-image-item">
              <img src={image.url} alt={`Generated ${index + 1}`} />
              <button onClick={() => handleImageSelect(image)}>
                Use This
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 