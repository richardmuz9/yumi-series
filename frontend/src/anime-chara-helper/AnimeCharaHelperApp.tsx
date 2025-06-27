import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'
import AIAssistant from '../components/AIAssistant'
import { IconButton } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { CreationMode } from './modes/CreationMode'
import { ImageGenerationMode } from './modes/ImageGenerationMode'
import { ModeToggle, YumiMode } from '../shared/components/ModeToggle'

import './AnimeCharaHelper.css'
import { Mode } from './types'

interface AnimeCharaHelperAppProps {
  onBack?: () => void
}

const AnimeCharaHelperApp: React.FC<AnimeCharaHelperAppProps> = ({ onBack }) => {
  const { language } = useStore()
  const navigate = useNavigate()

  // Mode state - defaults to creation mode
  const [mode, setMode] = useState<Mode>('creative')

  // Shared state between modes
  const [showAI, setShowAI] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedReferenceUrl, setSelectedReferenceUrl] = useState<string | null>(null)
  const [showYumiReferences, setShowYumiReferences] = useState(false)
  const [yumiMode, setYumiMode] = useState<YumiMode>('戦おう一緒に')

  // Background settings (mainly for creation mode)
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'solid' as 'solid' | 'gradient' | 'image',
    color: '#2a2a3e',
    gradient: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
    image: '',
    opacity: 0.95
  })

  // File upload handler
  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    
    // Handle background image upload for creation mode
    if (files[0] && backgroundSettings.type === 'image') {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundSettings(prev => ({
          ...prev,
          image: reader.result as string
        }))
      }
      reader.readAsDataURL(files[0])
    }
    
    console.log('Files uploaded:', files.map(f => f.name))
  }

  // Yumi reference handlers
  const handleYumiReferenceSelect = (url: string) => {
    setSelectedReferenceUrl(url)
    console.log('Yumi reference selected:', url)
  }

  // Mode switching
  const switchToCreationMode = () => {
    setMode('creative')
  }

  const switchToAIMode = () => {
    setMode('ai-generate')
  }

  // Background style helper (for creation mode)
  const getBackgroundStyle = () => {
    switch (backgroundSettings.type) {
      case 'solid':
        return { backgroundColor: backgroundSettings.color }
      case 'gradient':
        return { background: backgroundSettings.gradient }
      case 'image':
        return {
          backgroundImage: backgroundSettings.image ? `url(${backgroundSettings.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      default:
        return {}
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const handleGenerate = async (mode: YumiMode) => {
    const strategy = mode === '戦おう一緒に' ? '３デザイン提案' :
                    mode === '面倒いけどすごい' ? '詳細バリエーション' : '５キャラプロンプト＋配色';

    try {
      // TODO: Call the appropriate API endpoint with the strategy
      console.log(`Generating with strategy: ${strategy}`);
      // const result = await api.generateAnime(content, strategy);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  // Render the current mode
  const renderCurrentMode = () => {
    if (mode === 'ai-generate') {
      return (
        <ImageGenerationMode
          onBack={handleBack}
          onSwitchToCreation={switchToCreationMode}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleFileUpload}
          selectedReferenceUrl={selectedReferenceUrl}
          showCustomization={showCustomization}
          onCustomizeToggle={() => setShowCustomization(!showCustomization)}
          showYumiReferences={showYumiReferences}
          setShowYumiReferences={setShowYumiReferences}
          onYumiReferenceSelect={handleYumiReferenceSelect}
        />
      )
    }

    // Default to creation mode
    return (
      <CreationMode
        onBack={handleBack}
        uploadedFiles={uploadedFiles}
        onFileUpload={handleFileUpload}
        selectedReferenceUrl={selectedReferenceUrl}
        backgroundSettings={backgroundSettings}
        showCustomization={showCustomization}
        onCustomizeToggle={() => setShowCustomization(!showCustomization)}
        showYumiReferences={showYumiReferences}
        setShowYumiReferences={setShowYumiReferences}
        onYumiReferenceSelect={handleYumiReferenceSelect}
      />
    )
  }

  return (
    <div 
      className="anime-chara-helper-app"
      style={{
        // Only apply background for creation mode
        ...(mode === 'creative' ? {
        ...getBackgroundStyle(),
        opacity: backgroundSettings.opacity
        } : {})
      }}
    >
      {onBack && (
        <IconButton 
          className="back-button"
          onClick={handleBack}
          sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}
        >
          <ArrowBack />
        </IconButton>
      )}

      {/* Mode Switch Buttons (floating) */}
      <div className="mode-switcher">
        <button
          onClick={switchToCreationMode}
          className={`mode-btn ${mode === 'creative' ? 'active' : ''}`}
          title="Creation Mode v1.2"
        >
          🎨 Create
        </button>
        <button
          onClick={switchToAIMode}
          className={`mode-btn ${mode === 'ai-generate' ? 'active' : ''}`}
          title="AI Generation Mode"
        >
          🤖 AI Generate
        </button>
      </div>

      {/* Render Current Mode */}
      {renderCurrentMode()}

      {/* Shared Customization Panel for Background (Creation Mode Only) */}
      {showCustomization && mode === 'creative' && (
        <div className="shared-customization-panel">
          <h3>🌈 Background Settings</h3>
          
          <div className="customization-section">
            <h4>Background Type</h4>
            <div className="bg-type-selector">
              <button 
                className={backgroundSettings.type === 'solid' ? 'active' : ''}
                onClick={() => setBackgroundSettings(prev => ({ ...prev, type: 'solid' }))}
              >
                🎨 Solid
              </button>
              <button 
                className={backgroundSettings.type === 'gradient' ? 'active' : ''}
                onClick={() => setBackgroundSettings(prev => ({ ...prev, type: 'gradient' }))}
              >
                🌈 Gradient
              </button>
              <button
                className={backgroundSettings.type === 'image' ? 'active' : ''}
                onClick={() => setBackgroundSettings(prev => ({ ...prev, type: 'image' }))}
              >
                🖼️ Image
              </button>
            </div>

            {backgroundSettings.type === 'solid' && (
              <div className="color-picker">
                <input 
                  type="color" 
                  value={backgroundSettings.color}
                  onChange={(e) => setBackgroundSettings(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            )}

            {backgroundSettings.type === 'gradient' && (
              <div className="gradient-presets">
                <button onClick={() => setBackgroundSettings(prev => ({ ...prev, gradient: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)' }))}>
                  Dark Purple
                </button>
                <button onClick={() => setBackgroundSettings(prev => ({ ...prev, gradient: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)' }))}>
                  Pink
                </button>
                <button onClick={() => setBackgroundSettings(prev => ({ ...prev, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }))}>
                  Blue
                </button>
              </div>
            )}

            <div className="opacity-slider">
              <label>Opacity: {Math.round(backgroundSettings.opacity * 100)}%</label>
              <input 
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={backgroundSettings.opacity}
                onChange={(e) => setBackgroundSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        mode="anime-chara-helper"
        floatingMode={!showAI}
      />

      <div className="content-area">
        <ModeToggle
          mode={yumiMode}
          onChange={setYumiMode}
          domain="anime"
        />
        <textarea
          className="prompt-input"
          placeholder={
            yumiMode === '戦おう一緒に' ? 'アイデアとあらすじを入力…' :
            yumiMode === '面倒いけどすごい' ? 'できるだけ詳細に説明してください…' :
            'アイデアだけを入力してください…'
          }
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '16px',
            lineHeight: '1.6',
            resize: 'vertical',
            marginBottom: '16px'
          }}
        />
        <button 
          className="generate-button"
          onClick={() => handleGenerate(yumiMode)}
          style={{
            background: '#ff69b4',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease'
          }}
        >
          アウトラインを生成
        </button>
      </div>
    </div>
  )
}

export default AnimeCharaHelperApp;
