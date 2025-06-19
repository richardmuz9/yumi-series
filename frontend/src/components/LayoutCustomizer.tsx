import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './LayoutCustomizer.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface PanelConfig {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
  minW?: number;
  minH?: number;
}

interface LayoutCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  t: any; // translations
}

interface BackgroundOption {
  id: string;
  name: string;
  value: string;
  type: 'gradient' | 'image' | 'solid';
  preview: string;
}

const backgroundOptions: BackgroundOption[] = [
  {
    id: 'default',
    name: 'Default Yumi',
    value: "url('/yumi-tusr.png')",
    type: 'image',
    preview: '/yumi-tusr.png'
  },
  {
    id: 'gradient1',
    name: 'Purple Dream',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'gradient2',
    name: 'Ocean Sunset',
    value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  {
    id: 'gradient3',
    name: 'Aurora',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    id: 'gradient4',
    name: 'Midnight',
    value: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #232526 0%, #414345 100%)'
  },
  {
    id: 'gradient5',
    name: 'Cosmic',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)'
  },
  {
    id: 'solid1',
    name: 'Deep Navy',
    value: '#1a202c',
    type: 'solid',
    preview: '#1a202c'
  },
  {
    id: 'solid2',
    name: 'Forest',
    value: '#2d5016',
    type: 'solid',
    preview: '#2d5016'
  }
];

const defaultLayout: PanelConfig[] = [
  { i: 'modes', x: 0, y: 0, w: 8, h: 6, minW: 4, minH: 4 },
  { i: 'charge', x: 8, y: 0, w: 2, h: 6, minW: 2, minH: 4, static: true },
  { i: 'header', x: 2, y: 6, w: 6, h: 3, minW: 4, minH: 2, static: true },
  { i: 'footer', x: 0, y: 9, w: 10, h: 1, minW: 4, minH: 1, static: true }
];

interface PanelVisibility {
  modes: boolean;
  charge: boolean;
  header: boolean;
  footer: boolean;
}

const LayoutCustomizer: React.FC<LayoutCustomizerProps> = ({ isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState<PanelConfig[]>(defaultLayout);
  const [selectedBackground, setSelectedBackground] = useState('default');
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string>('');
  const [showPanels, setShowPanels] = useState<PanelVisibility>({
    modes: true,
    charge: true,
    header: true,
    footer: true
  });
  const [saveNotification, setSaveNotification] = useState<string>('');

  // Load saved configuration on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('yumiLayout');
    const savedBackground = localStorage.getItem('yumiBackground');
    const savedPanels = localStorage.getItem('yumiPanels');
    
    if (savedLayout) {
      try {
        setLayoutConfig(JSON.parse(savedLayout));
      } catch (e) {
        console.log('Failed to load saved layout, using default');
      }
    }
    
    if (savedBackground) {
      setSelectedBackground(savedBackground);
      applyBackground(savedBackground);
    }
    
    if (savedPanels) {
      try {
        setShowPanels(JSON.parse(savedPanels));
      } catch (e) {
        console.log('Failed to load saved panels, using default');
      }
    }
  }, []);

  // Save configuration
  useEffect(() => {
    localStorage.setItem('yumiLayout', JSON.stringify(layoutConfig));
  }, [layoutConfig]);

  useEffect(() => {
    localStorage.setItem('yumiBackground', selectedBackground);
  }, [selectedBackground]);

  useEffect(() => {
    localStorage.setItem('yumiPanels', JSON.stringify(showPanels));
  }, [showPanels]);

  const applyBackground = (backgroundId: string, customUrl?: string) => {
    const bg = backgroundOptions.find(bg => bg.id === backgroundId);
    const mainBg = document.querySelector('.main-background') as HTMLElement;
    
    if (mainBg) {
      if (backgroundId === 'custom' && customUrl) {
        mainBg.style.backgroundImage = `url(${customUrl})`;
        mainBg.style.backgroundColor = '';
      } else if (bg) {
        if (bg.type === 'image') {
          mainBg.style.backgroundImage = bg.value;
          mainBg.style.backgroundColor = '';
        } else {
          mainBg.style.backgroundImage = '';
          mainBg.style.background = bg.value;
        }
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomBackgroundUrl(result);
        setSelectedBackground('custom');
        applyBackground('custom', result);
        localStorage.setItem('yumiCustomBackground', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCurrentLayout = () => {
    const timestamp = new Date().toISOString();
    const layoutData = {
      layout: layoutConfig,
      background: selectedBackground,
      customBackground: customBackgroundUrl,
      panels: showPanels,
      timestamp
    };
    
    localStorage.setItem('yumiSavedLayout', JSON.stringify(layoutData));
    setSaveNotification('Layout saved successfully! ✅');
    setTimeout(() => setSaveNotification(''), 3000);
  };

  const handleBackgroundChange = (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    applyBackground(backgroundId);
  };

  const handleLayoutChange = (layout: Layout[]) => {
    const newLayout = layout.map(item => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      static: layoutConfig.find(l => l.i === item.i)?.static || false,
      minW: layoutConfig.find(l => l.i === item.i)?.minW,
      minH: layoutConfig.find(l => l.i === item.i)?.minH
    }));
    setLayoutConfig(newLayout);
  };

  const resetLayout = () => {
    setLayoutConfig([...defaultLayout]);
    setSelectedBackground('default');
    setShowPanels({
      modes: true,
      charge: true,
      header: true,
      footer: true
    });
    applyBackground('default');
  };

  const exportLayout = () => {
    const config = {
      layout: layoutConfig,
      background: selectedBackground,
      panels: showPanels
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yumi-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          if (config.layout) setLayoutConfig(config.layout);
          if (config.background) {
            setSelectedBackground(config.background);
            applyBackground(config.background);
          }
          if (config.panels) setShowPanels(config.panels);
        } catch (error) {
          alert('Invalid layout file');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const togglePanel = (panelId: keyof PanelVisibility) => {
    setShowPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="layout-customizer-overlay" onClick={onClose}>
      <div className="layout-customizer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="customizer-header">
          <h2>🎨 Layout & Theme Customizer</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="customizer-content">
          {/* Layout Controls */}
          <div className="customizer-section">
            <h3>📐 Layout Settings</h3>
            <div className="layout-controls">
              <button 
                className={`edit-btn ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '✅ Exit Editor' : '✏️ Edit Layout'}
              </button>
              
              <button onClick={saveCurrentLayout} className="save-btn">💾 Save Layout</button>
              
              {saveNotification && (
                <div className="save-notification">{saveNotification}</div>
              )}
              
              {isEditing && (
                <div className="edit-toolbar">
                  <button onClick={resetLayout} className="reset-btn">🔄 Reset</button>
                  <button onClick={exportLayout} className="export-btn">📤 Export</button>
                  <label className="import-btn">
                    📥 Import
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={importLayout}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Panel Visibility */}
          <div className="customizer-section">
            <h3>👁️ Panel Visibility</h3>
            <div className="panel-toggles">
              {(Object.entries(showPanels) as [keyof PanelVisibility, boolean][]).map(([panelId, visible]) => (
                <label key={panelId} className="panel-toggle">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => togglePanel(panelId)}
                  />
                  <span className="toggle-text">
                    {panelId.charAt(0).toUpperCase() + panelId.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Background Customization */}
          <div className="customizer-section">
            <h3>🌈 Background Theme</h3>
            
            {/* Upload Custom Background */}
            <div className="upload-background">
              <label className="upload-btn">
                🖼️ Upload Custom Background
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              {customBackgroundUrl && (
                <div className="custom-preview">
                  <img src={customBackgroundUrl} alt="Custom background" className="custom-bg-preview" />
                  <span>Custom Background Applied</span>
                </div>
              )}
            </div>
            
            <div className="background-grid">
              {backgroundOptions.map((bg) => (
                <div
                  key={bg.id}
                  className={`bg-option ${selectedBackground === bg.id ? 'selected' : ''}`}
                  onClick={() => handleBackgroundChange(bg.id)}
                >
                  <div 
                    className="bg-preview"
                    style={{
                      background: bg.type === 'image' ? `url(${bg.preview})` : bg.preview,
                      backgroundSize: bg.type === 'image' ? 'cover' : 'auto',
                      backgroundPosition: 'center'
                    }}
                  />
                  <span className="bg-name">{bg.name}</span>
                </div>
              ))}
              
              {/* Custom Background Option */}
              {customBackgroundUrl && (
                <div
                  className={`bg-option ${selectedBackground === 'custom' ? 'selected' : ''}`}
                  onClick={() => handleBackgroundChange('custom')}
                >
                  <div 
                    className="bg-preview"
                    style={{
                      backgroundImage: `url(${customBackgroundUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <span className="bg-name">Custom</span>
                </div>
              )}
            </div>
          </div>

          {/* Layout Preview */}
          <div className="customizer-section">
            <h3>🔍 Layout Preview</h3>
            <div className="layout-preview">
              <ResponsiveGridLayout
                className="preview-grid"
                layouts={{ lg: layoutConfig }}
                cols={{ lg: 10, md: 8, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={30}
                isDraggable={isEditing}
                isResizable={isEditing}
                onLayoutChange={handleLayoutChange}
                margin={[5, 5]}
                containerPadding={[0, 0]}
              >
                {showPanels.modes && (
                  <div key="modes" className="preview-panel modes-panel">
                    🎯 Modes Grid
                  </div>
                )}
                {showPanels.charge && (
                  <div key="charge" className="preview-panel charge-panel">
                    💎 Charge
                  </div>
                )}
                {showPanels.header && (
                  <div key="header" className="preview-panel header-panel">
                    📋 Header
                  </div>
                )}
                {showPanels.footer && (
                  <div key="footer" className="preview-panel footer-panel">
                    📝 Footer
                  </div>
                )}
              </ResponsiveGridLayout>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutCustomizer; 