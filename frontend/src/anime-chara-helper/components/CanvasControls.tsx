import React from 'react';

type DrawingTool = 'brush' | 'eraser' | 'mask' | 'selection';
type BlendMode = 'normal' | 'multiply' | 'overlay' | 'screen' | 'soft-light';

interface LayerData {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  visible: boolean;
  opacity: number;
  blendMode: string;
  locked: boolean;
}

interface CanvasControlsProps {
  // Drawing settings
  currentTool: DrawingTool;
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  blendMode: BlendMode;
  
  // Layer management
  layers: LayerData[];
  activeLayerId: string;
  layerPanelVisible: boolean;
  
  // Event handlers
  onToolChange: (tool: DrawingTool) => void;
  onBrushColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onBrushOpacityChange: (opacity: number) => void;
  onBlendModeChange: (mode: BlendMode) => void;
  
  // Layer handlers
  onLayerSelect: (layerId: string) => void;
  onLayerToggleVisibility: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onCreateNewLayer: () => void;
  onToggleLayerPanel: () => void;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  currentTool,
  brushColor,
  brushSize,
  brushOpacity,
  blendMode,
  layers,
  activeLayerId,
  layerPanelVisible,
  onToolChange,
  onBrushColorChange,
  onBrushSizeChange,
  onBrushOpacityChange,
  onBlendModeChange,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerOpacityChange,
  onLayerDelete,
  onLayerDuplicate,
  onCreateNewLayer,
  onToggleLayerPanel
}) => {
  const tools = [
    { id: 'brush', name: 'Brush', icon: '🖌️' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
    { id: 'mask', name: 'Mask', icon: '🎭' },
    { id: 'selection', name: 'Select', icon: '▫️' }
  ];

  const blendModes = [
    { id: 'normal', name: 'Normal' },
    { id: 'multiply', name: 'Multiply' },
    { id: 'overlay', name: 'Overlay' },
    { id: 'screen', name: 'Screen' },
    { id: 'soft-light', name: 'Soft Light' }
  ];

  return (
    <div className="canvas-controls">
      {/* Drawing Tools */}
      <div className="tool-section">
        <h4>🛠️ Tools</h4>
        <div className="tool-buttons">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolChange(tool.id as DrawingTool)}
              title={tool.name}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brush Settings */}
      <div className="tool-section">
        <h4>🎨 Brush</h4>
        <div className="brush-controls">
          <div className="control-group">
            <label>Color:</label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => onBrushColorChange(e.target.value)}
              className="color-picker"
            />
          </div>
          
          <div className="control-group">
            <label>Size: <span className="size-display">{brushSize}px</span></label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              className="size-slider"
            />
          </div>
          
          <div className="control-group">
            <label>Opacity: <span className="opacity-display">{brushOpacity}%</span></label>
            <input
              type="range"
              min="1"
              max="100"
              value={brushOpacity}
              onChange={(e) => onBrushOpacityChange(Number(e.target.value))}
              className="opacity-slider"
            />
          </div>
          
          <div className="control-group">
            <label>Blend Mode:</label>
            <select
              value={blendMode}
              onChange={(e) => onBlendModeChange(e.target.value as BlendMode)}
              className="blend-mode-select"
            >
              {blendModes.map(mode => (
                <option key={mode.id} value={mode.id}>
                  {mode.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Layer Panel Toggle */}
      <div className="tool-section">
        <button
          className="layer-panel-btn"
          onClick={onToggleLayerPanel}
        >
          📁 {layerPanelVisible ? 'Hide' : 'Show'} Layers
        </button>
      </div>

      {/* Layer Panel */}
      {layerPanelVisible && (
        <div className="layer-panel">
          <div className="layer-panel-header">
            <h3>📁 Layers</h3>
            <button className="close-btn" onClick={onToggleLayerPanel}>×</button>
          </div>
          
          <div className="layer-controls">
            <button onClick={onCreateNewLayer} className="new-layer-btn">
              ➕ New Layer
            </button>
          </div>
          
          <div className="layer-list">
            {layers.map(layer => (
              <div
                key={layer.id}
                className={`layer-item ${activeLayerId === layer.id ? 'active' : ''}`}
                onClick={() => onLayerSelect(layer.id)}
              >
                <div className="layer-info">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => onLayerToggleVisibility(layer.id)}
                    className="layer-visibility"
                  />
                  <span className="layer-name">{layer.name}</span>
                </div>
                
                <div className="layer-controls">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.opacity}
                    onChange={(e) => onLayerOpacityChange(layer.id, Number(e.target.value))}
                    className="opacity-slider"
                    title={`Opacity: ${layer.opacity}%`}
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDuplicate(layer.id);
                    }}
                    className="layer-action-btn"
                    title="Duplicate Layer"
                  >
                    📄
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDelete(layer.id);
                    }}
                    className="layer-action-btn"
                    title="Delete Layer"
                    disabled={layers.length <= 1}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasControls; 