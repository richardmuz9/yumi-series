import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

export interface CanvasAreaRef {
  loadOutline: (svgUrl: string) => void;
  saveDrawing: () => string | null;
  clearCanvas: () => void;
  setDrawingMode: (enabled: boolean) => void;
  exportLayers: () => LayerData[];
  importLayers: (layers: LayerData[]) => void;
  regenerateRegion: (maskData: string) => Promise<void>;
}

interface CanvasAreaProps {
  className?: string;
  onDrawingChange?: (hasDrawing: boolean) => void;
}

// Layer system interfaces
interface LayerData {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  visible: boolean;
  opacity: number;
  blendMode: string;
  locked: boolean;
}

type DrawingTool = 'brush' | 'eraser' | 'mask' | 'selection';
type BlendMode = 'normal' | 'multiply' | 'overlay' | 'screen' | 'soft-light';

const CanvasArea = forwardRef<CanvasAreaRef, CanvasAreaProps>(({ className, onDrawingChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Layer management
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('');
  const [layerPanelVisible, setLayerPanelVisible] = useState(false);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [outlineImage, setOutlineImage] = useState<HTMLImageElement | null>(null);

  // Enhanced drawing settings
  const [currentTool, setCurrentTool] = useState<DrawingTool>('brush');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [blendMode, setBlendMode] = useState<BlendMode>('normal');
  
  // Masking and selection
  const [maskMode, setMaskMode] = useState(false);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Initialize layers
  useEffect(() => {
    if (layers.length === 0) {
      createNewLayer('Background');
    }
  }, []);

  const createNewLayer = (name: string = `Layer ${layers.length + 1}`) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = canvas.width;
    layerCanvas.height = canvas.height;
    
    const newLayer: LayerData = {
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      canvas: layerCanvas,
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false
    };

    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    return newLayer;
  };

  const getActiveLayer = (): LayerData | null => {
    return layers.find(layer => layer.id === activeLayerId) || null;
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear main canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw outline if exists
    if (outlineImage) {
      const rect = canvas.getBoundingClientRect();
      context.drawImage(outlineImage, 0, 0, rect.width, rect.height);
    }

    // Composite all visible layers
    layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        context.save();
        context.globalAlpha = layer.opacity / 100;
        context.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
        context.drawImage(layer.canvas, 0, 0);
        context.restore();
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    // Scale for high DPI displays
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    contextRef.current = context;
    redrawCanvas();
  }, [brushColor, brushSize, outlineImage, layers]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode || !contextRef.current) return;

    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const layerContext = activeLayer.canvas.getContext('2d');
    if (!layerContext) return;

    // Set up drawing context for current tool
    layerContext.lineCap = 'round';
    layerContext.lineJoin = 'round';
    layerContext.lineWidth = brushSize;
    layerContext.globalAlpha = brushOpacity / 100;

    if (currentTool === 'brush') {
      layerContext.globalCompositeOperation = 'source-over';
      layerContext.strokeStyle = brushColor;
    } else if (currentTool === 'eraser') {
      layerContext.globalCompositeOperation = 'destination-out';
    } else if (currentTool === 'mask') {
      // Create mask if it doesn't exist
      if (!maskCanvas) {
        const newMaskCanvas = document.createElement('canvas');
        newMaskCanvas.width = canvas.width;
        newMaskCanvas.height = canvas.height;
        setMaskCanvas(newMaskCanvas);
      }
      
      const maskContext = maskCanvas?.getContext('2d');
      if (maskContext) {
        maskContext.lineCap = 'round';
        maskContext.lineJoin = 'round';
        maskContext.lineWidth = brushSize;
        maskContext.strokeStyle = '#ffffff';
        maskContext.globalCompositeOperation = 'source-over';
        maskContext.beginPath();
        maskContext.moveTo(x, y);
      }
      setIsDrawing(true);
      return;
    }

    layerContext.beginPath();
    layerContext.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode) return;

    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currentTool === 'mask' && maskCanvas) {
      const maskContext = maskCanvas.getContext('2d');
      if (maskContext) {
        maskContext.lineTo(x, y);
        maskContext.stroke();
      }
    } else {
      const layerContext = activeLayer.canvas.getContext('2d');
      if (layerContext) {
        layerContext.lineTo(x, y);
        layerContext.stroke();
      }
    }

    redrawCanvas();

    if (!hasDrawing) {
      setHasDrawing(true);
      onDrawingChange?.(true);
    }
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    
    const activeLayer = getActiveLayer();
    if (activeLayer) {
      const layerContext = activeLayer.canvas.getContext('2d');
      layerContext?.closePath();
    }
    
    if (maskCanvas && currentTool === 'mask') {
      const maskContext = maskCanvas.getContext('2d');
      maskContext?.closePath();
    }
    
    setIsDrawing(false);
  };

  // Advanced layer operations
  const duplicateLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const newLayer = createNewLayer(`${layer.name} copy`);
    if (newLayer) {
      const newContext = newLayer.canvas.getContext('2d');
      if (newContext) {
        newContext.drawImage(layer.canvas, 0, 0);
        redrawCanvas();
      }
    }
  };

  const deleteLayer = (layerId: string) => {
    if (layers.length <= 1) return; // Keep at least one layer
    
    setLayers(prev => prev.filter(l => l.id !== layerId));
    
    if (activeLayerId === layerId) {
      const remainingLayers = layers.filter(l => l.id !== layerId);
      setActiveLayerId(remainingLayers[0]?.id || '');
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
    redrawCanvas();
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity: Math.max(0, Math.min(100, opacity)) }
        : layer
    ));
    redrawCanvas();
  };

  // Region regeneration using mask
  const regenerateRegion = async (designBrief?: any) => {
    if (!maskCanvas) {
      alert('Please create a mask first by using the mask tool');
      return;
    }

    setIsRegenerating(true);
    
    try {
      // Convert mask to data URL
      const maskData = maskCanvas.toDataURL('image/png');
      
      // Get current canvas state
      const currentImage = canvasRef.current?.toDataURL('image/png');
      
      // Call AI regeneration API
      const response = await fetch('/api/anime-chara/regenerate-region', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          originalImage: currentImage,
          maskData: maskData,
          designBrief: designBrief,
          style: 'detailed-anime' // Could be passed from parent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate region');
      }

      const result = await response.json();
      
      if (result.regeneratedImage) {
        // Load the regenerated image onto a new layer
        const img = new Image();
        img.onload = () => {
          const newLayer = createNewLayer('Regenerated Region');
          if (newLayer) {
            const newContext = newLayer.canvas.getContext('2d');
            if (newContext) {
              newContext.drawImage(img, 0, 0);
              redrawCanvas();
            }
          }
        };
        img.src = result.regeneratedImage;
      }

      // Clear the mask after successful regeneration
      if (maskCanvas) {
        const maskContext = maskCanvas.getContext('2d');
        maskContext?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      }

    } catch (error) {
      console.error('Region regeneration failed:', error);
      alert('Failed to regenerate region. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Touch events for mobile support
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startDrawing(mouseEvent as any);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    draw(mouseEvent as any);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stopDrawing();
  };

  useImperativeHandle(ref, () => ({
    loadOutline: (imageUrl: string) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        const rect = canvas.getBoundingClientRect();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, rect.width, rect.height);
        setOutlineImage(img);
        redrawCanvas();
      };
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    },

    saveDrawing: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL('image/png');
    },

    clearCanvas: () => {
      layers.forEach(layer => {
        const context = layer.canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
      });
      
      redrawCanvas();
      setHasDrawing(false);
      onDrawingChange?.(false);
    },

    setDrawingMode: (enabled: boolean) => {
      setDrawingMode(enabled);
    },

    exportLayers: () => {
      return layers.map(layer => ({
        ...layer,
        canvas: layer.canvas.cloneNode(true) as HTMLCanvasElement
      }));
    },

    importLayers: (importedLayers: LayerData[]) => {
      setLayers(importedLayers);
      if (importedLayers.length > 0) {
        setActiveLayerId(importedLayers[0].id);
      }
      redrawCanvas();
    },

    regenerateRegion: regenerateRegion
  }));

  return (
    <div className={`canvas-area enhanced ${className || ''}`}>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: drawingMode ? 'crosshair' : 'default',
            pointerEvents: 'auto'
          }}
        />
        
        {/* Mask overlay for visualization */}
        {maskMode && maskCanvas && (
          <canvas
            ref={previewCanvasRef}
            className="mask-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              opacity: 0.5,
              mixBlendMode: 'multiply'
            }}
          />
        )}
        
        {!drawingMode && (
          <div className="canvas-placeholder">
            <div className="placeholder-content">
              <div className="palette-icon">🎨</div>
              <h3>Enhanced Canvas Area</h3>
              <p>Professional layer-based drawing with masking and AI region regeneration</p>
            </div>
          </div>
        )}

        {drawingMode && (
          <div className="drawing-tools enhanced">
            {/* Tool Selection */}
            <div className="tool-group">
              <label>Tool:</label>
              <div className="tool-buttons">
                <button 
                  className={`tool-btn ${currentTool === 'brush' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('brush')}
                  title="Brush Tool"
                >
                  🖌️
                </button>
                <button 
                  className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('eraser')}
                  title="Eraser Tool"
                >
                  🧽
                </button>
                <button 
                  className={`tool-btn ${currentTool === 'mask' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('mask')}
                  title="Mask Tool"
                >
                  🎭
                </button>
              </div>
            </div>

            {/* Brush Settings */}
            <div className="tool-group">
              <label>Color:</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="color-picker"
                disabled={currentTool === 'eraser'}
              />
            </div>

            <div className="tool-group">
              <label>Size:</label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="size-slider"
              />
              <span className="size-display">{brushSize}px</span>
            </div>

            <div className="tool-group">
              <label>Opacity:</label>
              <input
                type="range"
                min="10"
                max="100"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(Number(e.target.value))}
                className="opacity-slider"
              />
              <span className="opacity-display">{brushOpacity}%</span>
            </div>

            {/* Layer Controls */}
            <div className="tool-group">
              <button 
                className="layer-panel-btn"
                onClick={() => setLayerPanelVisible(!layerPanelVisible)}
              >
                📋 Layers
              </button>
            </div>

            {/* AI Regeneration */}
            {currentTool === 'mask' && (
              <div className="tool-group">
                <button 
                  className="regenerate-btn"
                  onClick={() => regenerateRegion()}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? '⏳ Regenerating...' : '✨ Regenerate Region'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Layer Panel */}
        {layerPanelVisible && (
          <div className="layer-panel">
            <div className="layer-panel-header">
              <h3>Layers</h3>
              <button 
                className="close-btn"
                onClick={() => setLayerPanelVisible(false)}
              >
                ×
              </button>
            </div>
            
            <div className="layer-controls">
              <button onClick={() => createNewLayer()}>+ New Layer</button>
            </div>

            <div className="layer-list">
              {layers.map((layer, index) => (
                <div 
                  key={layer.id}
                  className={`layer-item ${layer.id === activeLayerId ? 'active' : ''}`}
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <div className="layer-info">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => toggleLayerVisibility(layer.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="layer-name">{layer.name}</span>
                  </div>
                  
                  <div className="layer-controls">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.opacity}
                      onChange={(e) => updateLayerOpacity(layer.id, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-slider"
                    />
                    <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}>📋</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CanvasArea.displayName = 'CanvasArea';

export default CanvasArea; 