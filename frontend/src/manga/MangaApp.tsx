import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MangaApp.css';

interface MangaAppProps {
  onBack?: () => void;
}

const MangaApp: React.FC<MangaAppProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [currentProject, setCurrentProject] = useState(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="manga-app">
      <header className="manga-header">
        <button onClick={handleBack} className="back-button">
          Back
        </button>
        <h1>Manga Creator</h1>
      </header>
      <main className="manga-content">
        {/* Content will be added in future updates */}
        <div className="placeholder-message">
          <h2>Coming Soon</h2>
          <p>The manga creation tools are under development.</p>
        </div>
      </main>
    </div>
  );
};

export default MangaApp; 