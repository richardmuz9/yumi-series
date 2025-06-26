import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import { IconBar } from '../components/IconBar'
import CanvasArea from '../components/CanvasArea'
import { ContextPanel } from '../components/ContextPanel'
import { LayersPanel } from '../components/LayersPanel'
import { PalettePanel } from '../components/PalettePanel'
import { HistoryPanel } from '../components/HistoryPanel'
import { ExportPanel } from '../components/ExportPanel'
import ReferenceSearch from '../components/ReferenceSearch'
import TemplateLibrary from '../components/TemplateLibrary'
import PoseLibrary, { CharacterPose, CHARACTER_POSES } from '../components/PoseLibrary'
import { YumiReferenceModal } from '../components/YumiReferenceModal'

// v1.2 Components
import { CharacterLibrary } from '../components/CharacterLibrary'
import { AIColorAssistant } from '../components/AIColorAssistant'
import { SmartBrushPanel } from '../components/SmartBrushPanel'
import { VersionHistory } from '../components/VersionHistory'

// Creative Control System
import { CreativeControlPanel } from '../../shared/components/CreativeControlPanel'
import { IterativeFeedbackPanel } from '../../shared/components/IterativeFeedbackPanel'
import { CreativeControlSettings, CreativeSession, CreativeVersion, CreativeFeedback } from '../../shared/types/creativeModes'
import { smartPromptEngine, createCreativeSession, updateUserHistory } from '../../shared/services/smartPromptEngine'
import { getAvailablePersonalities } from '../../shared/services/yumiPersonalityService'

import { 
  CharacterData, 
  CanvasState, 
  LayerData, 
  DrawingTool,
  CreationModeState,
  CharacterLibraryItem,
  CharacterVersion,
  ImageAnalysisResult,
  BrushSettings
} from '../types'
import { IoSettings, IoCloudUpload, IoImage, IoColorPalette, IoLibrary, IoTime, IoBrush, IoArrowBack } from 'react-icons/io5'
import { FaFeatherAlt } from 'react-icons/fa'
import { PEN_CONFIGURATIONS, getPenConfig, EYELASH_PRESET, HAIR_STRAND_PRESET } from '../config/penConfigs'

interface CreationModeProps {
  onBack: () => void
  uploadedFiles: File[]
  onFileUpload: (files: File[]) => void
  selectedReferenceUrl: string | null
  backgroundSettings: {
    type: 'solid' | 'gradient' | 'image'
    color: string
    gradient: string
    image: string
    opacity: number
  }
  showCustomization: boolean
  onCustomizeToggle: () => void
  showYumiReferences: boolean
  setShowYumiReferences: (show: boolean) => void
  onYumiReferenceSelect: (url: string) => void
}

export const CreationMode: React.FC<CreationModeProps> = ({
  onBack,
  uploadedFiles,
  onFileUpload,
  selectedReferenceUrl,
  backgroundSettings,
  showCustomization,
  onCustomizeToggle,
  showYumiReferences,
  setShowYumiReferences,
  onYumiReferenceSelect
}) => {
  const { user } = useAuth()
  
  // Core state
  const [context, setContext] = useState<string | null>('layers')
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('brush')
  const [currentBrushSettings, setCurrentBrushSettings] = useState<BrushSettings>(
    getPenConfig('basic-brush')?.defaultSettings || {
      size: 5,
      opacity: 100,
      hardness: 80,
      tipShape: 'round',
      pressureSensitivity: false,
      spacing: 25,
      scattering: 0,
      rotation: 0,
      flowRate: 100,
      smoothing: 0,
      tapering: { enabled: false, startTaper: 0, endTaper: 0 }
    }
  )

  // Template and Pose state
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [selectedPose, setSelectedPose] = useState<CharacterPose>(CHARACTER_POSES[0])

  // v1.2: Creation Mode State
  const [creationMode, setCreationMode] = useState<CreationModeState>({
    characterLibrary: [],
    versionHistory: {
      versions: [],
      currentIndex: -1,
      maxVersions: 20
    },
    showSmallWindow: false,
    aiColorSuggestions: [],
    recommendedCombinations: [],
    smartBrushSettings: {
      mode: 'auto_fill',
      sensitivity: 75,
      blendStrength: 85,
      preserveDetails: true,
      detailLevel: 'medium',
      edgeDetection: true,
      colorBlending: 'smooth'
    }
  })

  // v1.2: Panel visibility states
  const [showCharacterLibrary, setShowCharacterLibrary] = useState(false)
  const [showAIColorAssistant, setShowAIColorAssistant] = useState(false)
  const [showSmartBrush, setShowSmartBrush] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [smartBrushActive, setSmartBrushActive] = useState(false)

  // Creative Control System state
  const [creativeSession, setCreativeSession] = useState<CreativeSession>(
    createCreativeSession('image', {
      level: 'balanced',
      yumiPersonality: 'otaku',
      allowSuggestions: true,
      memoryNudges: true,
      iterativeMode: true
    })
  )
  const [showIterativeFeedback, setShowIterativeFeedback] = useState(false)
  const [currentVersions, setCurrentVersions] = useState<CreativeVersion[]>([])
  const [availablePersonalities] = useState<string[]>(getAvailablePersonalities())

  // Character and canvas state
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    age: '',
    background: '',
    catchphrase: '',
    personalityTraits: [],
    visualMotifs: [],
    designElements: []
  })

  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    position: { x: 0, y: 0 },
    tool: 'brush',
    color: '#000000',
    size: 5,
    opacity: 100,
    blendMode: 'normal',
    layers: [],
    activeLayerId: 'base',
    hasDrawing: false
  })

  const [layers, setLayers] = useState<LayerData[]>([{
    id: 'base',
    name: 'Base Layer',
    canvas: document.createElement('canvas'),
    visible: true,
    opacity: 100,
    blendMode: 'normal',
    locked: false
  }])
  const [activeLayerId, setActiveLayerId] = useState('base')

  // Sidebar state
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (sidebarRef.current) {
      setIsDragging(true);
      const rect = sidebarRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Enhanced sidebar dragging with viewport bounds
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && sidebarRef.current) {
      const rect = sidebarRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate new position with bounds checking
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Enforce viewport bounds
      newX = Math.max(0, Math.min(newX, viewportWidth - rect.width));
      newY = Math.max(0, Math.min(newY, viewportHeight - rect.height));
      
      // Update sidebar position
      if (sidebarRef.current) {
        sidebarRef.current.style.left = `${newX}px`;
        sidebarRef.current.style.top = `${newY}px`;
      }
    }
  };

  // Fixed header with back button
  const renderHeader = () => (
    <div className="creation-mode-header" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#1a1a2e',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <button 
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        <IoArrowBack /> Back to Modes
      </button>
    </div>
  );

  useEffect(() => {
    if (user) {
      loadCharacterLibrary()
    }
  }, [user])

  // Tool change handler with brush settings
  const handleToolChange = (tool: string) => {
    const penConfig = getPenConfig(tool) || getPenConfig('basic-brush')
    if (penConfig) {
      setSelectedTool(tool as DrawingTool)
      setCurrentBrushSettings(penConfig.defaultSettings)
      setCanvasState(prev => ({ 
        ...prev, 
        tool: tool as DrawingTool,
        size: penConfig.defaultSettings.size,
        opacity: penConfig.defaultSettings.opacity
      }))
    }
  }

  // Quick preset handlers
  const applyEyelashPreset = () => {
    setSelectedTool('fine-liner')
    setCurrentBrushSettings(EYELASH_PRESET.settings)
    setCanvasState(prev => ({ 
      ...prev, 
      tool: 'fine-liner',
      size: EYELASH_PRESET.settings.size,
      opacity: EYELASH_PRESET.settings.opacity
    }))
  }

  const applyHairStrandPreset = () => {
    setSelectedTool('texture-brush')
    setCurrentBrushSettings(HAIR_STRAND_PRESET.settings)
    setCanvasState(prev => ({ 
      ...prev, 
      tool: 'texture-brush',
      size: HAIR_STRAND_PRESET.settings.size,
      opacity: HAIR_STRAND_PRESET.settings.opacity
    }))
  }

  // Creative Control System handlers
  const handleCreativeSettingsChange = (settings: CreativeControlSettings) => {
    const previousSettings = creativeSession.controlSettings
    
    setCreativeSession(prev => ({
      ...prev,
      controlSettings: settings
    }))
    
    // Update user history if personality changed
    if (settings.yumiPersonality !== previousSettings.yumiPersonality) {
      setCreativeSession(prev => updateUserHistory(prev, {
        lastUsedPersonality: settings.yumiPersonality
      }))
    }
  }

  const handleVersionSelect = (versionId: string) => {
    const version = currentVersions.find(v => v.id === versionId)
    if (version) {
      // Apply the selected version to canvas
      if (typeof version.content === 'string' && version.content.startsWith('data:image')) {
        // Load image data to canvas
        const img = new Image()
        img.onload = () => {
          const activeLayer = layers.find(l => l.id === activeLayerId)
          if (activeLayer) {
            const ctx = activeLayer.canvas.getContext('2d')
            if (ctx) {
              ctx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height)
              ctx.drawImage(img, 0, 0)
              handleLayerChange(activeLayerId, activeLayer.canvas)
            }
          }
        }
        img.src = version.content
      }
    }
  }

  const handleRequestRefinement = (feedback: CreativeFeedback) => {
    if (creativeSession.controlSettings.level === 'balanced' || creativeSession.controlSettings.allowSuggestions) {
      // Generate smart prompt based on feedback
      const currentCanvasData = generateCanvasThumbnail()
      const prompt = smartPromptEngine.generateBasePrompt(
        `Refine this image based on feedback: ${feedback.question}`,
        creativeSession.controlSettings
      )
      
      // Show AI generation or apply smart brush suggestions
      if (feedback.type === 'style' || feedback.type === 'mood') {
        setShowAIColorAssistant(true)
      } else if (feedback.type === 'detail') {
        setShowSmartBrush(true)
      }

      // Update session context
      setCreativeSession(prev => ({
        ...prev,
        currentContext: { feedback, canvasData: currentCanvasData }
      }))
    }
  }

  const generateImageVersions = async () => {
    if (creativeSession.controlSettings.iterativeMode) {
      const canvasData = generateCanvasThumbnail()
      
      // Create versions: main, alternative, and user-edited
      const versions: CreativeVersion[] = [
        {
          id: `version_${Date.now()}_main`,
          type: 'main',
          content: canvasData,
          metadata: {
            aiConfidence: 0.8,
            refinementsSuggested: ['Add more detail', 'Adjust colors', 'Refine pose'],
            personalityInfluence: [creativeSession.controlSettings.yumiPersonality]
          }
        }
      ]

      // Generate alternative version if AI suggestions are enabled
      if (creativeSession.controlSettings.allowSuggestions) {
        versions.push({
          id: `version_${Date.now()}_alt`,
          type: 'alternative',
          content: canvasData, // In real implementation, this would be AI-generated
          metadata: {
            aiConfidence: 0.7,
            refinementsSuggested: ['Different style approach', 'Color variation'],
            personalityInfluence: [creativeSession.controlSettings.yumiPersonality]
          }
        })
      }

      setCurrentVersions(versions)
      setShowIterativeFeedback(true)
    }
  }

  // v1.2: Character Library Functions
  const loadCharacterLibrary = async () => {
    try {
      const response = await api.get('/api/anime-helper/characters')
      setCreationMode(prev => ({
        ...prev,
        characterLibrary: response.data
      }))
    } catch (error) {
      console.error('Failed to load character library:', error)
    }
  }

  const saveCharacterToLibrary = async (name: string, description: string) => {
    try {
      const canvasDataURL = generateCanvasThumbnail()
      const newCharacter: Partial<CharacterLibraryItem> = {
        name,
        thumbnail: canvasDataURL,
        tags: extractTagsFromCharacterData(),
        createdAt: Date.now(),
        lastModified: Date.now(),
        versions: [{
          id: generateId(),
          name: 'Initial Version',
          thumbnail: canvasDataURL,
          timestamp: Date.now(),
          description,
          canvasData: serializeCanvasState(),
          metadata: {
            pose: selectedPose.name,
            colors: [canvasState.color]
          }
        }],
        activeVersionId: ''
      }
      
      const response = await api.post('/api/anime-helper/characters', newCharacter)
      setCreationMode(prev => ({
        ...prev,
        characterLibrary: [...prev.characterLibrary, response.data]
      }))
    } catch (error) {
      console.error('Failed to save character:', error)
    }
  }

  const loadCharacterFromLibrary = (character: CharacterLibraryItem) => {
    const activeVersion = character.versions.find(v => v.id === character.activeVersionId) || character.versions[0]
    if (activeVersion) {
      deserializeCanvasState(activeVersion.canvasData)
      setCreationMode(prev => ({
        ...prev,
        currentCharacter: character
      }))
    }
  }

  // v1.2: Version History Functions
  const saveCurrentVersion = (name: string, description: string) => {
    const thumbnail = generateCanvasThumbnail()
    const newVersion: CharacterVersion = {
      id: generateId(),
      name: name || `Version ${creationMode.versionHistory.versions.length + 1}`,
      thumbnail,
      timestamp: Date.now(),
      description,
      canvasData: serializeCanvasState(),
      metadata: {
        pose: selectedPose.name,
        colors: [canvasState.color]
      }
    }

    setCreationMode(prev => ({
      ...prev,
      versionHistory: {
        ...prev.versionHistory,
        versions: [...prev.versionHistory.versions, newVersion],
        currentIndex: prev.versionHistory.versions.length
      }
    }))
  }

  const revertToVersion = (versionId: string) => {
    const version = creationMode.versionHistory.versions.find(v => v.id === versionId)
    if (version) {
      deserializeCanvasState(version.canvasData)
      const versionIndex = creationMode.versionHistory.versions.findIndex(v => v.id === versionId)
      setCreationMode(prev => ({
        ...prev,
        versionHistory: {
          ...prev.versionHistory,
          currentIndex: versionIndex
        }
      }))
    }
  }

  // v1.2: AI Color Analysis
  const analyzeImageColors = async (imageData: string): Promise<ImageAnalysisResult> => {
    try {
      const response = await api.post('/api/anime-helper/analyze-colors', { imageData })
      return response.data
    } catch (error) {
      console.error('Failed to analyze colors:', error)
      return {
        dominantColors: ['#ff6b9d', '#667eea', '#4facfe'],
        colorHarmony: 'complementary',
        suggestedPalettes: [],
        styleCategory: 'anime',
        recommendations: {
          hairColor: ['#8b4513', '#ff69b4'],
          accentColors: ['#ffd700', '#32cd32'],
          backgroundSuggestions: ['#e6f3ff', '#fff0f5']
        }
      }
    }
  }

  // v1.2: Smart Brush Functions
  const handleSmartBrushAutoFill = (region: any) => {
    console.log('Smart brush auto-fill:', region)
  }

  const handleContextChange = (newContext: string | null) => {
    setShowCharacterLibrary(false)
    setShowAIColorAssistant(false)
    setShowSmartBrush(false)
    setShowVersionHistory(false)
    
    if (newContext === 'character-library') {
      setShowCharacterLibrary(true)
      setContext(null)
      return
    } else if (newContext === 'ai-color-assistant') {
      setShowAIColorAssistant(true)
      setContext(null)
      return
    } else if (newContext === 'smart-brush') {
      setShowSmartBrush(true)
      setContext(null)
      return
    } else if (newContext === 'version-history') {
      setShowVersionHistory(true)
      setContext(null)
      return
    }
    
    setContext(newContext)
  }

  // Utility Functions
  const generateCanvasThumbnail = (): string => {
    const canvas = document.createElement('canvas')
    canvas.width = 150
    canvas.height = 150
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.fillStyle = canvasState.color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    return canvas.toDataURL()
  }

  const serializeCanvasState = (): string => {
    return JSON.stringify({
      canvasState,
      layers: layers.map(layer => ({
        ...layer,
        canvas: layer.canvas.toDataURL()
      })),
      characterData,
      selectedPose,
      currentBrushSettings
    })
  }

  const deserializeCanvasState = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      setCanvasState(parsed.canvasState)
      setCharacterData(parsed.characterData)
      setSelectedPose(parsed.selectedPose)
      if (parsed.currentBrushSettings) {
        setCurrentBrushSettings(parsed.currentBrushSettings)
      }
    } catch (error) {
      console.error('Failed to deserialize canvas state:', error)
    }
  }

  const extractTagsFromCharacterData = (): string[] => {
    const tags = []
    if (characterData.personalityTraits.length > 0) tags.push('personality')
    if (selectedPose.name) tags.push('posed')
    if (canvasState.hasDrawing) tags.push('custom')
    return tags
  }

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9)
  }

  // Layer management
  const addLayer = () => {
    const newLayer: LayerData = {
      id: `layer-${layers.length + 1}`,
      name: `Layer ${layers.length + 1}`,
      canvas: document.createElement('canvas'),
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false
    }
    setLayers(prev => [...prev, newLayer])
  }

  const updateLayer = (layerId: string, updates: Partial<LayerData>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ))
  }

  const deleteLayer = (layerId: string) => {
    if (layerId === activeLayerId && layers.length > 1) {
      setActiveLayerId(layers[0].id)
    }
    setLayers(prev => prev.filter(layer => layer.id !== layerId))
  }

  const handleLayerChange = (layerId: string, canvas: HTMLCanvasElement) => {
    updateLayer(layerId, { canvas })
  }

  const handleCanvasStateChange = (updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({ ...prev, ...updates }))
  }

  // Template and Pose handlers
  const handleTemplateComplete = (data: any) => {
    setSelectedTemplate(data.template)
    setCharacterData(prev => ({
      ...prev,
      designElements: [...prev.designElements, `Template: ${data.template.name}`]
    }))
  }

  const handlePoseSelect = (pose: CharacterPose) => {
    setSelectedPose(pose)
    setCharacterData(prev => ({
      ...prev,
      designElements: [...prev.designElements, `Pose: ${pose.name}`]
    }))
  }

  const renderContextPanel = () => {
    switch (context) {
      case 'layers':
        return (
          <LayersPanel
            layers={layers}
            activeLayerId={activeLayerId}
            onAddLayer={addLayer}
            onUpdateLayer={updateLayer}
            onDeleteLayer={deleteLayer}
            onSelectLayer={setActiveLayerId}
          />
        )
      case 'palette':
        return (
          <PalettePanel
            color={canvasState.color}
            onColorChange={(color) => setCanvasState(prev => ({ ...prev, color }))}
          />
        )
      case 'history':
        return <HistoryPanel />
      case 'export':
        return <ExportPanel />
      case 'search':
        return (
          <ReferenceSearch
            onSelect={(imageUrl) => {
              console.log('Reference image selected:', imageUrl)
            }}
            onClose={() => setContext(null)}
          />
        )
      case 'templates':
        return (
          <TemplateLibrary
            onComplete={handleTemplateComplete}
            designBrief={characterData}
          />
        )
      case 'poses':
        return (
          <PoseLibrary
            selectedPose={selectedPose}
            onPoseSelect={handlePoseSelect}
            onClose={() => setContext(null)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="creation-mode" style={{ paddingTop: '60px' }}>
      {renderHeader()}
      {/* Icon Bar */}
      <IconBar
        mode="creative"
        context={context}
        setMode={() => {}} // Mode is fixed to creative in creation mode
        setContext={handleContextChange}
        onBack={onBack}
        onToolChange={handleToolChange}
        selectedTool={selectedTool}
        onCustomizeToggle={onCustomizeToggle}
        onFileUpload={onFileUpload}
        onYumiRefsToggle={() => setShowYumiReferences(true)}
        onCharacterLibraryToggle={() => setShowCharacterLibrary(!showCharacterLibrary)}
        onAIColorAssistantToggle={() => setShowAIColorAssistant(!showAIColorAssistant)}
        onSmartBrushToggle={() => setShowSmartBrush(!showSmartBrush)}
        onVersionHistoryToggle={() => setShowVersionHistory(!showVersionHistory)}
      />

      {/* v1.2: Character Library Panel */}
      {showCharacterLibrary && (
        <CharacterLibrary
          library={creationMode.characterLibrary}
          onSelect={loadCharacterFromLibrary}
          onSave={saveCharacterToLibrary}
          onDelete={(id) => {
            setCreationMode(prev => ({
              ...prev,
              characterLibrary: prev.characterLibrary.filter(c => c.id !== id)
            }))
          }}
          onDuplicate={(item) => {
            const duplicate = { ...item, id: generateId(), name: `${item.name} Copy` }
            setCreationMode(prev => ({
              ...prev,
              characterLibrary: [...prev.characterLibrary, duplicate]
            }))
          }}
          onVersionSelect={(itemId, versionId) => {
            const character = creationMode.characterLibrary.find(c => c.id === itemId)
            if (character) {
              const version = character.versions.find(v => v.id === versionId)
              if (version) {
                deserializeCanvasState(version.canvasData)
              }
            }
          }}
          onClose={() => setShowCharacterLibrary(false)}
          currentCharacter={creationMode.currentCharacter}
        />
      )}

      {/* v1.2: AI Color Assistant Panel */}
      {showAIColorAssistant && (
        <div className="ai-color-assistant-container" style={{ position: 'fixed', top: '60px', right: '20px', zIndex: 1000 }}>
          <AIColorAssistant
            onColorSelect={(color) => setCanvasState(prev => ({ ...prev, color }))}
            onPaletteSelect={(palette) => {
              console.log('Palette selected:', palette)
            }}
            onAnalyze={analyzeImageColors}
          />
        </div>
      )}

      {/* v1.2: Smart Brush Panel */}
      {showSmartBrush && (
        <div className="smart-brush-container" style={{ position: 'fixed', top: '60px', left: '20px', zIndex: 1000 }}>
          <SmartBrushPanel
            settings={creationMode.smartBrushSettings}
            onSettingsChange={(settings) => setCreationMode(prev => ({ ...prev, smartBrushSettings: settings }))}
            currentColor={canvasState.color}
            onAutoFill={handleSmartBrushAutoFill}
            isActive={smartBrushActive}
            onToggle={() => setSmartBrushActive(!smartBrushActive)}
          />
        </div>
      )}

      {/* v1.2: Version History Panel */}
      {showVersionHistory && (
        <div className="version-history-container" style={{ position: 'fixed', top: '60px', left: '380px', zIndex: 1000 }}>
          <VersionHistory
            history={creationMode.versionHistory}
            onRevert={revertToVersion}
            onSaveVersion={saveCurrentVersion}
            onDeleteVersion={(versionId) => {
              setCreationMode(prev => ({
                ...prev,
                versionHistory: {
                  ...prev.versionHistory,
                  versions: prev.versionHistory.versions.filter(v => v.id !== versionId)
                }
              }))
            }}
            onCompareVersions={(v1, v2) => {
              console.log('Compare versions:', v1, v2)
            }}
            currentCanvasData={serializeCanvasState()}
          />
        </div>
      )}

      {/* Brush Preset Quick Actions */}
      {showCustomization && (
        <div className="customization-panel anime-customization">
          <h3>🎨 Creation Mode v1.2</h3>
          
          {/* Quick Brush Presets */}
          <div className="customization-section">
            <h4>✨ Quick Brush Presets</h4>
            <div className="quick-tools">
              <button onClick={applyEyelashPreset} className="preset-btn">
                <FaFeatherAlt /> Eyelashes
              </button>
              <button onClick={applyHairStrandPreset} className="preset-btn">
                <IoBrush /> Hair Strands
              </button>
            </div>
          </div>

          {/* Current Brush Settings */}
          <div className="customization-section">
            <h4>🖌️ Current Brush: {selectedTool}</h4>
            <div className="brush-settings">
              <div className="setting-item">
                <label>Size: {currentBrushSettings.size}</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="100" 
                  step="0.1"
                  value={currentBrushSettings.size} 
                  onChange={(e) => {
                    const newSize = parseFloat(e.target.value)
                    setCurrentBrushSettings(prev => ({ ...prev, size: newSize }))
                    setCanvasState(prev => ({ ...prev, size: newSize }))
                  }}
                />
              </div>
              <div className="setting-item">
                <label>Opacity: {currentBrushSettings.opacity}%</label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={currentBrushSettings.opacity} 
                  onChange={(e) => {
                    const newOpacity = parseInt(e.target.value)
                    setCurrentBrushSettings(prev => ({ ...prev, opacity: newOpacity }))
                    setCanvasState(prev => ({ ...prev, opacity: newOpacity }))
                  }}
                />
              </div>
              <div className="setting-item">
                <label>Hardness: {currentBrushSettings.hardness}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={currentBrushSettings.hardness} 
                  onChange={(e) => {
                    const newHardness = parseInt(e.target.value)
                    setCurrentBrushSettings(prev => ({ ...prev, hardness: newHardness }))
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tool Categories */}
          <div className="customization-section">
            <h4>🛠️ Tool Categories</h4>
            <div className="tool-categories">
              <div className="category">
                <h5>Detail Tools</h5>
                <div className="tool-grid">
                  {PEN_CONFIGURATIONS.filter(config => config.category === 'detail').map(config => (
                    <button 
                      key={config.id}
                      onClick={() => handleToolChange(config.id)}
                      className={selectedTool === config.tool ? 'active' : ''}
                      title={config.description}
                    >
                      {config.icon} {config.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Other customization sections... */}
          <div className="customization-section">
            <h4>v1.2 Creation Tools</h4>
            <div className="quick-tools">
              <button 
                onClick={() => setShowCharacterLibrary(!showCharacterLibrary)}
                className={showCharacterLibrary ? 'active' : ''}
              >
                <IoLibrary /> Library
              </button>
              <button 
                onClick={() => setShowAIColorAssistant(!showAIColorAssistant)}
                className={showAIColorAssistant ? 'active' : ''}
              >
                <IoColorPalette /> AI Colors
              </button>
              <button 
                onClick={() => setShowSmartBrush(!showSmartBrush)}
                className={showSmartBrush ? 'active' : ''}
              >
                <IoBrush /> Smart Brush
              </button>
              <button 
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className={showVersionHistory ? 'active' : ''}
              >
                <IoTime /> History
              </button>
              <button 
                onClick={generateImageVersions}
                className="generate-versions-btn"
              >
                ✨ Generate Versions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <CanvasArea
        mode="creative"
        tool={selectedTool}
        color={canvasState.color}
        size={canvasState.size}
        opacity={canvasState.opacity}
        blendMode={canvasState.blendMode}
        zoom={canvasState.zoom}
        position={canvasState.position}
        layers={layers}
        activeLayerId={activeLayerId}
        onLayerChange={handleLayerChange}
        onStateChange={handleCanvasStateChange}
        smartBrushActive={smartBrushActive}
        smartBrushSettings={creationMode.smartBrushSettings}
        brushSettings={currentBrushSettings}
      />

      {/* Context Panel */}
      {context && (
        <div className="context-panel">
          {renderContextPanel()}
        </div>
      )}

      {/* Yumi Reference Modal */}
      {showYumiReferences && (
        <YumiReferenceModal
          onClose={() => setShowYumiReferences(false)}
          onSelect={onYumiReferenceSelect}
        />
      )}

      {/* Creative Control Panel */}
      <CreativeControlPanel
        currentSettings={creativeSession.controlSettings}
        onSettingsChange={handleCreativeSettingsChange}
        userHistory={creativeSession.userHistory}
        availablePersonalities={availablePersonalities}
        mode="image"
      />

      {/* Iterative Feedback Panel */}
      {showIterativeFeedback && currentVersions.length > 0 && (
        <IterativeFeedbackPanel
          versions={currentVersions}
          onVersionSelect={handleVersionSelect}
          onRequestRefinement={handleRequestRefinement}
          currentPersonality={creativeSession.controlSettings.yumiPersonality}
          refinementSuggestions={[
            'Softer expressions',
            'Brighter colors',
            'Add more detail',
            'Simplify composition',
            'Change pose',
            'Adjust lighting'
          ]}
        />
      )}
    </div>
  )
} 