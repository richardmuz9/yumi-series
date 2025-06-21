import React, { useState, useCallback } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface AnimeCharacter {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

interface ImageManagerProps {
  onImageSelect: (images: string[]) => void;
}

export const ImageManager: React.FC<ImageManagerProps> = ({ onImageSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [animeCharacters, setAnimeCharacters] = useState<AnimeCharacter[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'characters'>('upload');

  // Fetch anime characters from AnimeCharaHelper
  const fetchAnimeCharacters = useCallback(async () => {
    try {
      const response = await fetch('/api/anime-characters');
      const data = await response.json();
      setAnimeCharacters(data);
    } catch (error) {
      console.error('Failed to fetch anime characters:', error);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImages(prev => [...prev, imageUrl]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle image selection
  const handleImageSelect = useCallback((imageUrl: string) => {
    setSelectedImages(prev => {
      const isSelected = prev.includes(imageUrl);
      if (isSelected) {
        return prev.filter(url => url !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  }, []);

  // Confirm selection
  const handleConfirm = useCallback(() => {
    onImageSelect(selectedImages);
    setIsExpanded(false);
  }, [selectedImages, onImageSelect]);

  // Load anime characters when tab changes
  React.useEffect(() => {
    if (activeTab === 'characters') {
      fetchAnimeCharacters();
    }
  }, [activeTab, fetchAnimeCharacters]);

  return (
    <div className={`image-manager ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="image-manager-toggle"
        onClick={() => setIsExpanded(prev => !prev)}
        title="Manage Images"
      >
        📷
      </button>

      {isExpanded && (
        <div className="image-manager-panel">
          <div className="image-manager-header">
            <h3>Image Manager</h3>
            <div className="tab-buttons">
              <button 
                className={activeTab === 'upload' ? 'active' : ''}
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </button>
              <button 
                className={activeTab === 'characters' ? 'active' : ''}
                onClick={() => setActiveTab('characters')}
              >
                Characters
              </button>
            </div>
          </div>

          <div className="image-manager-content">
            {activeTab === 'upload' && (
              <div className="upload-section">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <div className="uploaded-images">
                  {uploadedImages.map((url, index) => (
                    <div 
                      key={index}
                      className={`image-item ${selectedImages.includes(url) ? 'selected' : ''}`}
                      onClick={() => handleImageSelect(url)}
                    >
                      <img src={url} alt={`Uploaded ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'characters' && (
              <div className="characters-section">
                {animeCharacters.map(character => (
                  <div 
                    key={character.id}
                    className={`character-item ${selectedImages.includes(character.imageUrl) ? 'selected' : ''}`}
                    onClick={() => handleImageSelect(character.imageUrl)}
                  >
                    <img src={character.imageUrl} alt={character.name} />
                    <span className="character-name">{character.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="image-manager-footer">
            <span>{selectedImages.length} selected</span>
            <button 
              className="confirm-button"
              onClick={handleConfirm}
              disabled={selectedImages.length === 0}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 