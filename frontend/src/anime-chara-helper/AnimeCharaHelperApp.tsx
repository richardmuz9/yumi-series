import React, { useState, useRef } from 'react'
import { useStore } from '../store'
import { getTranslation } from '../translations'
import CanvasArea, { CanvasAreaRef } from './components/CanvasArea'
import CanvasControls from './components/CanvasControls'
import CharacterChat from './components/CharacterChat'
import TemplateLibrary from './components/TemplateLibrary'
import OutlineGenerator from './components/OutlineGenerator'
import ColorPaletteEngine from './components/ColorPaletteEngine'
import PoseLibrary from './components/PoseLibrary'
import AIAssistant from '../components/AIAssistant'
import ModeSwitcher from './components/ModeSwitcher'
import AIGeneratePanel from './components/AIGeneratePanel'
import './AnimeCharaHelper.css'
import { CharacterData, PanelState, CanvasState, LayerData, Mode } from './types'

interface AnimeCharaHelperAppProps {
  onBack: () => void
}

type LeftTabName = 'tools' | 'layers'
type RightTabName = 'character' | 'ai'

interface LeftPanelState extends PanelState {
  selectedTab: LeftTabName
}

interface RightPanelState extends PanelState {
  selectedTab: RightTabName
}

const AnimeCharaHelperApp: React.FC<AnimeCharaHelperAppProps> = ({ onBack }) => {
  const { language } = useStore()
  const t = getTranslation(language)
  const canvasRef = useRef<CanvasAreaRef>(null)

  // Mode state
  const [mode, setMode] = useState<Mode>('creative')

  // Core state
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    age: '',
    background: '',
    catchphrase: '',
    personalityTraits: [],
    visualMotifs: [],
    designElements: []
  })

  // Panel states
  const [leftPanel, setLeftPanel] = useState<LeftPanelState>({
    isCollapsed: false,
    selectedTab: 'tools'
  })

  const [rightPanel, setRightPanel] = useState<RightPanelState>({
    isCollapsed: false,
    selectedTab: 'character'
  })

  // Canvas state
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

  // Layer state
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

  // Panel toggles
  const toggleLeftPanel = () => {
    setLeftPanel(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed
    }))
  }

  const toggleRightPanel = () => {
    setRightPanel(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed
    }))
  }

  // Tab selection
  const selectLeftTab = (tab: LeftTabName) => {
    setLeftPanel(prev => ({
      ...prev,
      selectedTab: tab
    }))
  }

  const selectRightTab = (tab: RightTabName) => {
    setRightPanel(prev => ({
      ...prev,
      selectedTab: tab
    }))
  }

  // Canvas controls
  const updateCanvasState = (updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({
      ...prev,
      ...updates
    }))
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

  // Export functionality
  const handleExport = () => {
    if (canvasRef.current) {
      const drawingData = canvasRef.current.saveDrawing()
      console.log('Exporting artwork:', {
        drawing: drawingData,
        layers,
        characterData
      })
    }
  }

  // Handle AI generated image
  const handleAIGenerated = (imageUrl: string) => {
    // Create a new layer for the AI generated image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const newLayer: LayerData = {
        id: `layer-${layers.length + 1}`,
        name: 'AI Generated Layer',
        canvas: document.createElement('canvas'),
        visible: true,
        opacity: 100,
        blendMode: 'normal',
        locked: false
      }
      
      // Draw the image onto the new layer's canvas
      newLayer.canvas.width = img.width
      newLayer.canvas.height = img.height
      const ctx = newLayer.canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
      }
      
      setLayers(prev => [...prev, newLayer])
      setActiveLayerId(newLayer.id)
      setMode('creative') // Switch back to creative mode for editing
    }
    img.src = imageUrl
  }

  return (
    <div className="anime-chara-helper enhanced">
      {/* Mode Switcher */}
      <div className="toolbar">
        <button onClick={() => onBack()}>Back</button>
        <ModeSwitcher mode={mode} onChange={setMode} />
        <button onClick={handleExport}>Export</button>
      </div>

      {/* Left Sidebar */}
      <div className={`left-sidebar ${leftPanel.isCollapsed ? 'collapsed' : ''}`}>
        <button className="collapse-btn" onClick={toggleLeftPanel}>
          {leftPanel.isCollapsed ? '→' : '←'}
        </button>
        <div className="sidebar-content">
          {mode === 'creative' ? (
            <>
              <div className="tab-panel">
                <button 
                  className={`tab-button ${leftPanel.selectedTab === 'tools' ? 'active' : ''}`}
                  onClick={() => selectLeftTab('tools')}
                >
                  Tools
                </button>
                <button 
                  className={`tab-button ${leftPanel.selectedTab === 'layers' ? 'active' : ''}`}
                  onClick={() => selectLeftTab('layers')}
                >
                  Layers
                </button>
              </div>
              <div className="panel-content">
                {leftPanel.selectedTab === 'tools' && (
                  <CanvasControls
                    currentTool={canvasState.tool}
                    brushColor={canvasState.color}
                    brushSize={canvasState.size}
                    brushOpacity={canvasState.opacity}
                    blendMode={canvasState.blendMode}
                    layers={layers}
                    activeLayerId={activeLayerId}
                    layerPanelVisible={leftPanel.selectedTab === 'layers'}
                    onToolChange={tool => updateCanvasState({ tool })}
                    onBrushColorChange={color => updateCanvasState({ color })}
                    onBrushSizeChange={size => updateCanvasState({ size })}
                    onBrushOpacityChange={opacity => updateCanvasState({ opacity })}
                    onBlendModeChange={blendMode => updateCanvasState({ blendMode })}
                    onLayerSelect={setActiveLayerId}
                    onLayerToggleVisibility={(layerId: string, visible: boolean) => updateLayer(layerId, { visible })}
                    onLayerOpacityChange={(layerId: string, opacity: number) => updateLayer(layerId, { opacity })}
                    onLayerDelete={deleteLayer}
                    onLayerDuplicate={id => {
                      const layer = layers.find(l => l.id === id)
                      if (layer) {
                        const newLayer = { ...layer, id: `layer-${layers.length + 1}`, name: `${layer.name} Copy` }
                        setLayers(prev => [...prev, newLayer])
                      }
                    }}
                    onCreateNewLayer={addLayer}
                    onToggleLayerPanel={() => {
                      if (leftPanel.selectedTab === 'layers') {
                        selectLeftTab('tools')
                      } else {
                        selectLeftTab('layers')
                      }
                    }}
                  />
                )}
                {leftPanel.selectedTab === 'layers' && (
                  <div className="layer-panel">
                    {layers.map(layer => (
                      <div key={layer.id} className="layer-item">
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={e => updateLayer(layer.id, { visible: e.target.checked })}
                        />
                        <span>{layer.name}</span>
                        <button onClick={() => deleteLayer(layer.id)}>Delete</button>
                      </div>
                    ))}
                    <button onClick={addLayer}>Add Layer</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <AIGeneratePanel onDone={handleAIGenerated} />
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="main-content">
        <CanvasArea
          ref={canvasRef}
          tool={canvasState.tool}
          color={canvasState.color}
          size={canvasState.size}
          opacity={canvasState.opacity}
          blendMode={canvasState.blendMode}
          zoom={canvasState.zoom}
          position={canvasState.position}
          layers={layers}
          activeLayerId={activeLayerId}
          onLayerChange={(layerId, canvas) => {
            updateLayer(layerId, { canvas })
          }}
        />
      </div>

      {/* Right Sidebar */}
      <div className={`right-sidebar ${rightPanel.isCollapsed ? 'collapsed' : ''}`}>
        <button className="collapse-btn" onClick={toggleRightPanel}>
          {rightPanel.isCollapsed ? '←' : '→'}
        </button>
        <div className="sidebar-content">
          <div className="tab-panel">
            <button 
              className={`tab-button ${rightPanel.selectedTab === 'character' ? 'active' : ''}`}
              onClick={() => selectRightTab('character')}
            >
              Character
            </button>
            <button 
              className={`tab-button ${rightPanel.selectedTab === 'ai' ? 'active' : ''}`}
              onClick={() => selectRightTab('ai')}
            >
              AI
            </button>
          </div>
          <div className="panel-content">
            {rightPanel.selectedTab === 'character' && (
              <CharacterChat
                characterData={characterData}
                onCharacterDataChange={setCharacterData}
              />
            )}
            {rightPanel.selectedTab === 'ai' && (
              <AIAssistant />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnimeCharaHelperApp
