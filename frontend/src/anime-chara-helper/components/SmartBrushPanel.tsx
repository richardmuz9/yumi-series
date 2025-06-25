import React, { useState } from 'react'
import { SmartBrushSettings } from '../types'
import { IoBrush, IoSparkles, IoSettings, IoColorFill, IoGrid } from 'react-icons/io5'
import './SmartBrushPanel.css'

interface SmartBrushPanelProps {
  settings: SmartBrushSettings
  onSettingsChange: (settings: SmartBrushSettings) => void
  currentColor: string
  onAutoFill: (region: any) => void
  isActive: boolean
  onToggle: () => void
}

export const SmartBrushPanel: React.FC<SmartBrushPanelProps> = ({
  settings,
  onSettingsChange,
  currentColor,
  onAutoFill,
  isActive,
  onToggle
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleModeChange = (mode: SmartBrushSettings['mode']) => {
    onSettingsChange({ ...settings, mode })
  }

  const handleSensitivityChange = (sensitivity: number) => {
    onSettingsChange({ ...settings, sensitivity })
  }

  const handleBlendStrengthChange = (blendStrength: number) => {
    onSettingsChange({ ...settings, blendStrength })
  }

  const handlePreserveDetailsToggle = () => {
    onSettingsChange({ ...settings, preserveDetails: !settings.preserveDetails })
  }

  const brushModes = [
    {
      id: 'auto_fill' as const,
      name: 'Auto Fill',
      icon: <IoColorFill />,
      description: 'Automatically fills detected regions with color',
      features: ['Region detection', 'Smart boundaries', 'Color preservation']
    },
    {
      id: 'gradient_fill' as const,
      name: 'Gradient Fill',
      icon: <IoSparkles />,
      description: 'Creates intelligent gradients based on lighting and form',
      features: ['Light analysis', 'Form following', 'Natural transitions']
    },
    {
      id: 'pattern_recognition' as const,
      name: 'Pattern Recognition',
      icon: <IoGrid />,
      description: 'Detects and fills patterns like clothes folds, hair strands',
      features: ['Pattern recognition', 'Texture matching', 'Detail enhancement']
    }
  ]

  const presetConfigs = [
    {
      name: 'Clothing',
      config: { 
        mode: 'auto_fill' as const, 
        sensitivity: 75, 
        blendStrength: 85, 
        preserveDetails: true,
        detailLevel: 'medium' as const,
        edgeDetection: true,
        colorBlending: 'smooth' as const
      },
      description: 'Optimized for coloring clothes and fabric'
    },
    {
      name: 'Hair',
      config: { 
        mode: 'pattern_recognition' as const, 
        sensitivity: 60, 
        blendStrength: 70, 
        preserveDetails: true,
        detailLevel: 'fine' as const,
        edgeDetection: true,
        colorBlending: 'textured' as const
      },
      description: 'Perfect for hair strands and texture'
    },
    {
      name: 'Skin',
      config: { 
        mode: 'gradient_fill' as const, 
        sensitivity: 85, 
        blendStrength: 90, 
        preserveDetails: true,
        detailLevel: 'ultra-fine' as const,
        edgeDetection: true,
        colorBlending: 'smooth' as const
      },
      description: 'Natural skin tones and shading'
    },
    {
      name: 'Accessories',
      config: { 
        mode: 'auto_fill' as const, 
        sensitivity: 90, 
        blendStrength: 95, 
        preserveDetails: false,
        detailLevel: 'coarse' as const,
        edgeDetection: false,
        colorBlending: 'crisp' as const
      },
      description: 'Clean fills for jewelry and accessories'
    }
  ]

  return (
    <div className="smart-brush-panel">
      <div className="panel-header">
        <div className="header-left">
          <h3>🎨 Smart Brush</h3>
          <button
            className={`toggle-btn ${isActive ? 'active' : ''}`}
            onClick={onToggle}
            title={isActive ? 'Disable Smart Brush' : 'Enable Smart Brush'}
          >
            <IoBrush />
            {isActive ? 'ON' : 'OFF'}
          </button>
        </div>
        <button
          className="settings-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="Advanced Settings"
        >
          <IoSettings />
        </button>
      </div>

      {isActive && (
        <>
          {/* Brush Mode Selection */}
          <div className="mode-selection">
            <h4>Brush Mode</h4>
            <div className="mode-grid">
              {brushModes.map(mode => (
                <div
                  key={mode.id}
                  className={`mode-card ${settings.mode === mode.id ? 'active' : ''}`}
                  onClick={() => handleModeChange(mode.id)}
                >
                  <div className="mode-icon">{mode.icon}</div>
                  <div className="mode-info">
                    <div className="mode-name">{mode.name}</div>
                    <div className="mode-description">{mode.description}</div>
                    <div className="mode-features">
                      {mode.features.map(feature => (
                        <span key={feature} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="preset-section">
            <h4>Quick Presets</h4>
            <div className="preset-grid">
              {presetConfigs.map(preset => (
                <button
                  key={preset.name}
                  className="preset-btn"
                  onClick={() => onSettingsChange(preset.config)}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Controls */}
          <div className="main-controls">
            <div className="control-group">
              <label>
                Sensitivity: {settings.sensitivity}%
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sensitivity}
                    onChange={(e) => handleSensitivityChange(parseInt(e.target.value))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Loose</span>
                    <span>Precise</span>
                  </div>
                </div>
              </label>
            </div>

            <div className="control-group">
              <label>
                Blend Strength: {settings.blendStrength}%
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.blendStrength}
                    onChange={(e) => handleBlendStrengthChange(parseInt(e.target.value))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Subtle</span>
                    <span>Strong</span>
                  </div>
                </div>
              </label>
            </div>

            <div className="control-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.preserveDetails}
                  onChange={handlePreserveDetailsToggle}
                />
                <span className="checkmark"></span>
                Preserve Fine Details
              </label>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="advanced-settings">
              <h4>Advanced Settings</h4>
              
              <div className="advanced-grid">
                <div className="setting-item">
                  <label>Edge Detection</label>
                  <select defaultValue="canny">
                    <option value="canny">Canny</option>
                    <option value="sobel">Sobel</option>
                    <option value="prewitt">Prewitt</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>Color Space</label>
                  <select defaultValue="lab">
                    <option value="rgb">RGB</option>
                    <option value="lab">LAB</option>
                    <option value="hsv">HSV</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>Smoothing</label>
                  <input type="range" min="0" max="10" defaultValue="3" />
                </div>

                <div className="setting-item">
                  <label>Threshold</label>
                  <input type="range" min="0" max="255" defaultValue="128" />
                </div>
              </div>
            </div>
          )}

          {/* Current Color Preview */}
          <div className="color-preview">
            <div className="preview-header">
              <span>Current Color</span>
              <button
                className={`preview-toggle ${previewMode ? 'active' : ''}`}
                onClick={() => setPreviewMode(!previewMode)}
              >
                Preview Mode
              </button>
            </div>
            <div 
              className="color-display"
              style={{ backgroundColor: currentColor }}
            >
              <span className="color-value">{currentColor}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={() => onAutoFill({ mode: settings.mode, color: currentColor })}
            >
              <IoSparkles />
              Apply Smart Fill
            </button>
            <button className="action-btn secondary">
              <IoGrid />
              Analyze Region
            </button>
          </div>

          {/* Tips */}
          <div className="tips-section">
            <h5>💡 Tips</h5>
            <ul>
              <li>Use <strong>Auto Fill</strong> for large, uniform areas</li>
              <li>Try <strong>Pattern Recognition</strong> for textured surfaces</li>
              <li>Enable <strong>Preview Mode</strong> to see changes before applying</li>
              <li>Lower sensitivity for more precise edge detection</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
} 