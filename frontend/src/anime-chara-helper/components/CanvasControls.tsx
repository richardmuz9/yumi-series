import React from 'react';
import { DrawingTool, BlendMode, LayerData } from '../types';

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
  onLayerToggleVisibility: (layerId: string, visible: boolean) => void;
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
  const tools: DrawingTool[] = ['brush', 'eraser', 'mask', 'selection'];
  const blendModes: BlendMode[] = ['normal', 'multiply', 'overlay', 'screen', 'soft-light'];

  return (
    <div className="canvas-controls">
      {/* Tool Selection */}
      <div className="control-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          {tools.map(tool => (
            <button
              key={tool}
              className={`tool-button ${currentTool === tool ? 'active' : ''}`}
              onClick={() => onToolChange(tool)}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      {/* Brush Settings */}
      <div className="control-section">
        <h3>Brush Settings</h3>
        <div className="brush-controls">
          <div className="control-row">
            <label>Color</label>
            <input
              type="color"
              value={brushColor}
              onChange={e => onBrushColorChange(e.target.value)}
            />
          </div>
          <div className="control-row">
            <label>Size</label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={e => onBrushSizeChange(Number(e.target.value))}
            />
            <span>{brushSize}px</span>
          </div>
          <div className="control-row">
            <label>Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushOpacity}
              onChange={e => onBrushOpacityChange(Number(e.target.value))}
            />
            <span>{brushOpacity}%</span>
          </div>
          <div className="control-row">
            <label>Blend Mode</label>
            <select
              value={blendMode}
              onChange={e => onBlendModeChange(e.target.value as BlendMode)}
            >
              {blendModes.map(mode => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="control-section">
        <div className="section-header">
          <h3>Layers</h3>
          <button onClick={onToggleLayerPanel}>
            {layerPanelVisible ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="layer-list">
          {layers.map(layer => (
            <div
              key={layer.id}
              className={`layer-item ${layer.id === activeLayerId ? 'active' : ''}`}
              onClick={() => onLayerSelect(layer.id)}
            >
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={e => onLayerToggleVisibility(layer.id, e.target.checked)}
              />
              <span className="layer-name">{layer.name}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={layer.opacity}
                onChange={e => onLayerOpacityChange(layer.id, Number(e.target.value))}
              />
              <button onClick={() => onLayerDuplicate(layer.id)}>Copy</button>
              <button onClick={() => onLayerDelete(layer.id)}>Delete</button>
            </div>
          ))}
          <button className="add-layer" onClick={onCreateNewLayer}>
            Add Layer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasControls; 