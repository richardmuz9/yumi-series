import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PanelEditor } from './components/PanelEditor';
import { LayoutDesigner } from './components/LayoutDesigner';
import { MangaProject, MangaPage, Panel, PanelLayout } from './types/manga';
import { Character } from '../anime-chara-helper/types';
import './MangaEditor.css';

export const MangaEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<MangaProject | null>(null);
  const [currentPage, setCurrentPage] = useState<MangaPage | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [showLayoutDesigner, setShowLayoutDesigner] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    // TODO: Load project data
    // TODO: Load characters from Anime Chara Helper
  }, [projectId]);

  const handleLayoutSelect = (layout: PanelLayout) => {
    if (!currentPage) return;

    const updatedPage: MangaPage = {
      ...currentPage,
      layout,
      panels: Array.from({ length: layout.rows * layout.columns }).map((_, i) => ({
        id: `panel-${i}`,
        characters: [],
        dialogues: [],
        effects: [],
      })),
    };

    // TODO: Save page update to backend
    setCurrentPage(updatedPage);
    setShowLayoutDesigner(false);
  };

  const handlePanelUpdate = (updatedPanel: Panel) => {
    if (!currentPage) return;

    const updatedPage = {
      ...currentPage,
      panels: currentPage.panels.map(panel =>
        panel.id === updatedPanel.id ? updatedPanel : panel
      ),
    };

    // TODO: Save page update to backend
    setCurrentPage(updatedPage);
  };

  return (
    <div className="manga-editor">
      <header className="editor-header">
        <div className="project-info">
          <h1>{project?.title || 'Loading...'}</h1>
          <div className="chapter-selector">
            <select>
              {project?.chapters.map(chapter => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="page-controls">
          <button className="page-nav-btn" disabled={!currentPage?.pageNumber}>
            ◀
          </button>
          <span>Page {currentPage?.pageNumber || 1}</span>
          <button className="page-nav-btn">▶</button>
          <button
            className="layout-btn"
            onClick={() => setShowLayoutDesigner(!showLayoutDesigner)}
          >
            レイアウトを変更
          </button>
        </div>

        <div className="editor-actions">
          <button className="preview-btn">プレビュー</button>
          <button className="save-btn">保存</button>
          <button className="export-btn">エクスポート</button>
        </div>
      </header>

      <main className="editor-main">
        {showLayoutDesigner ? (
          <div className="layout-designer-container">
            <LayoutDesigner
              onLayoutSelect={handleLayoutSelect}
              onLayoutSave={(layout) => {
                // TODO: Save custom layout
                handleLayoutSelect(layout);
              }}
            />
          </div>
        ) : (
          <div className="editor-workspace">
            <div className="page-canvas">
              {currentPage?.panels.map(panel => (
                <div
                  key={panel.id}
                  className={`panel-container ${selectedPanel?.id === panel.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPanel(panel)}
                >
                  <PanelEditor
                    panel={panel}
                    layout={currentPage.layout}
                    characters={characters}
                    onPanelUpdate={handlePanelUpdate}
                  />
                </div>
              ))}
            </div>

            <aside className="editor-sidebar">
              <div className="sidebar-section">
                <h3>キャラクター</h3>
                <div className="character-list">
                  {characters.map(character => (
                    <div key={character.id} className="character-item">
                      <img src={character.imageUrl} alt={character.name} />
                      <span>{character.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <h3>AI アシスタント</h3>
                <div className="ai-tools">
                  <button>シーン生成</button>
                  <button>ダイアログ提案</button>
                  <button>構図アドバイス</button>
                </div>
              </div>

              {selectedPanel && (
                <div className="sidebar-section">
                  <h3>パネル設定</h3>
                  <div className="panel-settings">
                    <button>背景を追加</button>
                    <button>効果を追加</button>
                    <button>テキストを追加</button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}; 