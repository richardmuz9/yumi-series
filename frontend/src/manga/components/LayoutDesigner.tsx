import React, { useState } from 'react';
import { PanelLayout } from '../types/manga';
import './LayoutDesigner.css';

interface LayoutDesignerProps {
  onLayoutSelect: (layout: PanelLayout) => void;
  onLayoutSave: (layout: PanelLayout) => void;
}

const DEFAULT_LAYOUTS: PanelLayout[] = [
  {
    id: 'single',
    name: '1x1',
    rows: 1,
    columns: 1,
    template: '1fr',
  },
  {
    id: '2x1',
    name: '2x1 Horizontal',
    rows: 1,
    columns: 2,
    template: '1fr 1fr',
  },
  {
    id: '1x2',
    name: '1x2 Vertical',
    rows: 2,
    columns: 1,
    template: '1fr',
  },
  {
    id: '2x2',
    name: '2x2 Grid',
    rows: 2,
    columns: 2,
    template: '1fr 1fr',
  },
  {
    id: '3x2',
    name: '3x2 Action',
    rows: 2,
    columns: 3,
    template: '1fr 1fr 1fr',
  },
];

export const LayoutDesigner: React.FC<LayoutDesignerProps> = ({
  onLayoutSelect,
  onLayoutSave,
}) => {
  const [customLayout, setCustomLayout] = useState<PanelLayout>({
    id: `custom-${Date.now()}`,
    name: 'Custom Layout',
    rows: 2,
    columns: 2,
    template: '1fr 1fr',
    isCustom: true,
  });

  const [showCustomEditor, setShowCustomEditor] = useState(false);

  const handleCustomLayoutChange = (field: keyof PanelLayout, value: string | number) => {
    setCustomLayout(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'rows' || field === 'columns') {
        updated.template = Array(Number(value)).fill('1fr').join(' ');
      }
      return updated;
    });
  };

  const handleSaveCustomLayout = () => {
    onLayoutSave(customLayout);
    setShowCustomEditor(false);
    setCustomLayout({
      id: `custom-${Date.now()}`,
      name: 'Custom Layout',
      rows: 2,
      columns: 2,
      template: '1fr 1fr',
      isCustom: true,
    });
  };

  return (
    <div className="layout-designer">
      <div className="layout-presets">
        <h3>プリセットレイアウト</h3>
        <div className="layout-grid">
          {DEFAULT_LAYOUTS.map(layout => (
            <div
              key={layout.id}
              className="layout-preview"
              onClick={() => onLayoutSelect(layout)}
            >
              <div
                className="layout-grid-preview"
                style={{
                  display: 'grid',
                  gridTemplateColumns: layout.template,
                  gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
                }}
              >
                {Array.from({ length: layout.rows * layout.columns }).map((_, i) => (
                  <div key={i} className="grid-cell" />
                ))}
              </div>
              <span>{layout.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="custom-layout">
        <h3>カスタムレイアウト</h3>
        <button
          className="create-custom-btn"
          onClick={() => setShowCustomEditor(!showCustomEditor)}
        >
          {showCustomEditor ? 'キャンセル' : 'カスタムレイアウトを作成'}
        </button>

        {showCustomEditor && (
          <div className="custom-layout-editor">
            <div className="layout-controls">
              <div className="control-group">
                <label>名前:</label>
                <input
                  type="text"
                  value={customLayout.name}
                  onChange={(e) => handleCustomLayoutChange('name', e.target.value)}
                />
              </div>
              <div className="control-group">
                <label>行数:</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={customLayout.rows}
                  onChange={(e) => handleCustomLayoutChange('rows', parseInt(e.target.value))}
                />
              </div>
              <div className="control-group">
                <label>列数:</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={customLayout.columns}
                  onChange={(e) => handleCustomLayoutChange('columns', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="layout-preview custom">
              <div
                className="layout-grid-preview"
                style={{
                  display: 'grid',
                  gridTemplateColumns: customLayout.template,
                  gridTemplateRows: `repeat(${customLayout.rows}, 1fr)`,
                }}
              >
                {Array.from({ length: customLayout.rows * customLayout.columns }).map((_, i) => (
                  <div key={i} className="grid-cell" />
                ))}
              </div>
            </div>

            <button className="save-layout-btn" onClick={handleSaveCustomLayout}>
              レイアウトを保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 