import React, { useState, useCallback } from 'react';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { ImageManager } from './ImageManager';
import '../styles/ImageManager.css';

interface Platform {
  id: string;
  label: string;
  icon: string;
  color: string;
  requiresImage?: boolean;
}

const PLATFORMS: Platform[] = [
  { 
    id: 'x', 
    label: 'X (Twitter)', 
    icon: '𝕏',
    color: '#000000'
  },
  { 
    id: 'red', 
    label: '小红书 / Rednote', 
    icon: '📕',
    color: '#fe2c55',
    requiresImage: true
  },
  { 
    id: 'instagram', 
    label: 'Instagram', 
    icon: '📸',
    color: '#E4405F'
  },
  { 
    id: 'facebook', 
    label: 'Facebook', 
    icon: '👤',
    color: '#1877F2'
  }
];

interface PostToProps {
  content: string;
  onPost: (platform: string, content: { text: string; images?: string[] }) => void;
}

export const PostTo: React.FC<PostToProps> = ({ content, onPost }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Register keyboard shortcut for quick post
  useKeyboardShortcuts({
    onQuickPost: () => setMenuOpen(true)
  });

  const handlePost = async (platform: Platform) => {
    if (platform.requiresImage && !selectedImages.length) {
      alert(`${platform.label} requires at least one image for posting.`);
      return;
    }

    setMenuOpen(false);
    onPost(platform.id, {
      text: content,
      images: selectedImages.length > 0 ? selectedImages : undefined
    });
    setSelectedImages([]); // Reset selected images after posting
  };

  const handleImageSelect = useCallback((images: string[]) => {
    setSelectedImages(images);
  }, []);

  return (
    <div className="post-to-container">
      <button 
        className="post-to-button"
        onClick={() => setMenuOpen(true)}
        title={KEYBOARD_SHORTCUTS.QUICK_POST}
      >
        ➤ Post To...
      </button>

      {menuOpen && (
        <>
          <div className="post-to-overlay" onClick={() => setMenuOpen(false)} />
          <div className="post-to-menu">
            <div className="post-to-menu-header">
              <h3>Choose Platform</h3>
              <button onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="post-to-platforms">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  className="platform-button"
                  onClick={() => handlePost(platform)}
                  style={{ '--platform-color': platform.color } as React.CSSProperties}
                >
                  <span className="platform-icon">{platform.icon}</span>
                  <span className="platform-label">
                    {platform.label}
                    {platform.requiresImage && !selectedImages.length && (
                      <span className="required-badge">Requires Image</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="post-to-images">
              <ImageManager onImageSelect={handleImageSelect} />
              {selectedImages.length > 0 && (
                <div className="selected-images-preview">
                  <h4>Selected Images ({selectedImages.length})</h4>
                  <div className="image-preview-grid">
                    {selectedImages.map((url, index) => (
                      <div key={index} className="preview-image">
                        <img src={url} alt={`Selected ${index + 1}`} />
                        <button 
                          className="remove-image"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImages(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="post-to-preview">
              <h4>Content Preview</h4>
              <div className="preview-content">
                {content.slice(0, 100)}...
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 