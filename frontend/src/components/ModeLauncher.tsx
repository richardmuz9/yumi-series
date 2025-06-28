import React from 'react';
import type { BillingInfo } from '../types/billing';
import './ModeLauncher.css';

interface ModeLauncherProps {
  modes: string[];
  onSelect: (mode: string) => void;
  userInfo: BillingInfo | null;
  onClose: () => void;
}

const ModeLauncher: React.FC<ModeLauncherProps> = ({
  modes,
  onSelect,
  userInfo,
  onClose
}) => {
  return (
    <div className="mode-launcher">
      <div className="mode-launcher-header">
        <h2>Select Mode</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="mode-grid">
        {modes.map(mode => (
          <button
            key={mode}
            className={`mode-item ${mode}`}
            onClick={() => onSelect(mode)}
          >
            <span className="mode-icon">
              {mode === 'writing' ? '✍️' : '🎨'}
            </span>
            <div className="mode-content">
              <span className="mode-name">
                {mode === 'writing' ? 'Writing Helper' : 'Anime Character Helper'}
              </span>
              <span className="mode-description">
                {mode === 'writing' 
                  ? 'Create amazing content with AI assistance'
                  : 'Design and generate anime characters'
                }
              </span>
              <span className="token-cost">
                1000 TS per session
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="token-info">
        <span className="token-balance">
          Available: {userInfo ? `${userInfo.tokens} TS` : '0 TS'}
        </span>
        {userInfo?.blessingActive && (
          <span className="blessing-active">
            ✨ Yumi Blessing Active
          </span>
        )}
      </div>
    </div>
  );
};

export default ModeLauncher; 