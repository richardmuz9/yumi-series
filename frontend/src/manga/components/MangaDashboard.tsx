import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MangaProject, MangaStyle } from '../types/manga';
import { Character } from '../../anime-chara-helper/types';
import { WritingProject } from '../../writing-helper/types';
import './MangaDashboard.css';

interface ProjectCard {
  id: string;
  title: string;
  coverImage?: string;
  style: MangaStyle;
  lastModified: string;
  chaptersCount: number;
}

export const MangaDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [writingProjects, setWritingProjects] = useState<WritingProject[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  useEffect(() => {
    // Load projects, writing projects, and characters
    // TODO: Implement actual data loading
  }, []);

  const handleCreateNewProject = () => {
    setShowNewProjectModal(true);
  };

  const handleImportFromWriting = (writingProject: WritingProject) => {
    // TODO: Implement writing project import
  };

  return (
    <div className="manga-dashboard">
      <header className="dashboard-header">
        <h1>マンガクリエイター</h1>
        <div className="header-actions">
          <button className="create-btn" onClick={handleCreateNewProject}>
            新規作成
          </button>
          <button className="import-btn">
            原稿からインポート
          </button>
        </div>
      </header>

      <section className="recent-projects">
        <h2>最近のプロジェクト</h2>
        <div className="project-grid">
          {projects.map(project => (
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => navigate(`/manga/editor/${project.id}`)}
            >
              <div className="project-cover">
                {project.coverImage ? (
                  <img src={project.coverImage} alt={project.title} />
                ) : (
                  <div className="cover-placeholder">
                    <span>{project.title[0]}</span>
                  </div>
                )}
              </div>
              <div className="project-info">
                <h3>{project.title}</h3>
                <div className="project-meta">
                  <span className="style-badge">{project.style}</span>
                  <span className="chapters">{project.chaptersCount} chapters</span>
                </div>
                <time>{new Date(project.lastModified).toLocaleDateString()}</time>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="writing-imports">
        <h2>原稿からマンガを作成</h2>
        <div className="writing-grid">
          {writingProjects.map(project => (
            <div 
              key={project.id} 
              className="writing-card"
              onClick={() => handleImportFromWriting(project)}
            >
              <h3>{project.title}</h3>
              <div className="writing-meta">
                <span>{project.chapters.length} chapters</span>
                <span>{project.metadata.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="character-library">
        <h2>キャラクターライブラリ</h2>
        <div className="character-grid">
          {characters.map(character => (
            <div key={character.id} className="character-card">
              <img src={character.imageUrl} alt={character.name} />
              <h4>{character.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {showNewProjectModal && (
        <div className="modal new-project-modal">
          <div className="modal-content">
            <h2>新規マンガプロジェクト</h2>
            {/* TODO: Add new project form */}
          </div>
        </div>
      )}
    </div>
  );
}; 