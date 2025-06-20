import React, { useState } from 'react';

interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  mood: string;
  description: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'neon_cyberpunk',
    name: 'Neon Cyberpunk',
    primary: '#ff00ff',
    secondary: '#00ffff',
    accent: '#ffff00',
    mood: 'edgy futuristic',
    description: 'Electric neon colors for a cyberpunk aesthetic'
  },
  {
    id: 'pastel_kawaii',
    name: 'Pastel Kawaii',
    primary: '#ffb3d9',
    secondary: '#b3d9ff',
    accent: '#ffffb3',
    mood: 'cute soft',
    description: 'Soft pastel colors for adorable characters'
  },
  {
    id: 'warm_autumn',
    name: 'Warm Autumn',
    primary: '#ff7f50',
    secondary: '#daa520',
    accent: '#8b4513',
    mood: 'cozy nostalgic',
    description: 'Warm earth tones for a cozy feeling'
  },
  {
    id: 'ocean_depths',
    name: 'Ocean Depths',
    primary: '#0077be',
    secondary: '#4682b4',
    accent: '#20b2aa',
    mood: 'mysterious deep',
    description: 'Deep blues and teals for mysterious characters'
  },
  {
    id: 'sunset_warm',
    name: 'Sunset Warmth',
    primary: '#ff6b35',
    secondary: '#f7931e',
    accent: '#ffcc02',
    mood: 'warm energetic',
    description: 'Vibrant sunset colors for energetic characters'
  },
  {
    id: 'forest_natural',
    name: 'Forest Natural',
    primary: '#228b22',
    secondary: '#32cd32',
    accent: '#9acd32',
    mood: 'natural peaceful',
    description: 'Earth greens for nature-loving characters'
  }
];

interface ColorPaletteEngineProps {
  selectedPalette: ColorPalette;
  onPaletteSelect: (palette: ColorPalette) => void;
  onClose: () => void;
}

const ColorPaletteEngine: React.FC<ColorPaletteEngineProps> = ({
  selectedPalette,
  onPaletteSelect,
  onClose
}) => {
  const [moodKeywords, setMoodKeywords] = useState('');
  const [filteredPalettes, setFilteredPalettes] = useState(COLOR_PALETTES);

  const generatePaletteFromMood = () => {
    if (!moodKeywords.trim()) {
      setFilteredPalettes(COLOR_PALETTES);
      return;
    }

    const keywords = moodKeywords.toLowerCase().split(' ');
    const filtered = COLOR_PALETTES.filter(palette =>
      keywords.some(keyword =>
        palette.mood.includes(keyword) ||
        palette.description.toLowerCase().includes(keyword) ||
        palette.name.toLowerCase().includes(keyword)
      )
    );

    setFilteredPalettes(filtered.length > 0 ? filtered : COLOR_PALETTES);
    
    if (filtered.length > 0) {
      onPaletteSelect(filtered[0]);
    }
  };

  const renderColorSwatch = (color: string, label: string) => (
    <div className="color-swatch-item">
      <div
        className="color-swatch"
        style={{ backgroundColor: color }}
        title={`${label}: ${color}`}
      />
      <span className="color-label">{label}</span>
    </div>
  );

  return (
    <div className="palette-engine-modal">
      <div className="palette-engine-content">
        <div className="palette-engine-header">
          <h3>🎨 Color Palette Engine</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="mood-input-section">
          <label className="mood-label">Describe the mood or feeling:</label>
          <div className="mood-input-group">
            <input
              type="text"
              value={moodKeywords}
              onChange={(e) => setMoodKeywords(e.target.value)}
              placeholder="e.g., cute, mysterious, energetic, warm..."
              className="mood-input"
              onKeyPress={(e) => e.key === 'Enter' && generatePaletteFromMood()}
            />
            <button
              onClick={generatePaletteFromMood}
              className="generate-palette-btn"
            >
              ✨ Generate
            </button>
          </div>
        </div>

        <div className="palettes-grid">
          {filteredPalettes.map(palette => (
            <div
              key={palette.id}
              className={`palette-card ${selectedPalette.id === palette.id ? 'selected' : ''}`}
              onClick={() => onPaletteSelect(palette)}
            >
              <div className="palette-preview">
                <div className="color-strip">
                  <div className="color-segment" style={{ backgroundColor: palette.primary }} />
                  <div className="color-segment" style={{ backgroundColor: palette.secondary }} />
                  <div className="color-segment" style={{ backgroundColor: palette.accent }} />
                </div>
              </div>
              
              <div className="palette-info">
                <h4 className="palette-name">{palette.name}</h4>
                <p className="palette-mood">Mood: {palette.mood}</p>
                <p className="palette-description">{palette.description}</p>
              </div>

              <div className="palette-colors">
                {renderColorSwatch(palette.primary, 'Primary')}
                {renderColorSwatch(palette.secondary, 'Secondary')}
                {renderColorSwatch(palette.accent, 'Accent')}
              </div>
            </div>
          ))}
        </div>

        <div className="palette-actions">
          <button
            onClick={() => onPaletteSelect(selectedPalette)}
            className="confirm-palette-btn"
          >
            ✅ Use Selected Palette
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteEngine; 