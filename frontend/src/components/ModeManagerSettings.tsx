import React, { useState, useEffect } from 'react';
import { modeManager } from '../utils/modeManager';
import './ModeManagerSettings.css';

interface ModeInfo {
  id: string;
  name: string;
  nameJapanese: string;
  icon: string;
  description: string;
  size: string;
  category: 'essential' | 'productivity' | 'creative' | 'learning';
  installed: boolean;
  installing: boolean;
  uninstalling: boolean;
  lastUsed?: Date;
  usageCount: number;
}

interface ModeManagerSettingsProps {
  onClose: () => void;
}

const ModeManagerSettings: React.FC<ModeManagerSettingsProps> = ({ onClose }) => {
  const [modes, setModes] = useState<ModeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const [availableStorage, setAvailableStorage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadModeInfo();
    calculateStorage();
  }, []);

  const loadModeInfo = async () => {
    try {
      const installedModes = await modeManager.getInstalledModes();
      const usageStats = await modeManager.getUsageStats();
      
      const modesList: ModeInfo[] = [
        {
          id: 'web-builder',
          name: 'Web Builder',
          nameJapanese: 'ウェブビルダー',
          icon: '🌐',
          description: 'AI-powered website creation and management',
          size: '2.1 MB',
          category: 'productivity',
          installed: installedModes.includes('web-builder'),
          installing: false,
          uninstalling: false,
          lastUsed: usageStats['web-builder']?.lastUsed,
          usageCount: usageStats['web-builder']?.count || 0
        },
        {
          id: 'writing-helper',
          name: 'Writing Helper',
          nameJapanese: '書き助',
          icon: '✒️',
          description: 'AI-powered writing assistant for scripts, blogs, posts & creative content',
          size: '1.8 MB',
          category: 'creative',
          installed: installedModes.includes('writing-helper'),
          installing: false,
          uninstalling: false,
          lastUsed: usageStats['writing-helper']?.lastUsed,
          usageCount: usageStats['writing-helper']?.count || 0
        },
        {
          id: 'report-writer',
          name: 'Report Writer',
          nameJapanese: 'レポートライター',
          icon: '📊',
          description: 'Generate comprehensive reports and documents',
          size: '1.5 MB',
          category: 'productivity',
          installed: installedModes.includes('report-writer'),
          installing: false,
          uninstalling: false,
          lastUsed: usageStats['report-writer']?.lastUsed,
          usageCount: usageStats['report-writer']?.count || 0
        },
        {
          id: 'anime-chara-helper',
          name: 'Anime Character Designer',
          nameJapanese: 'アニメキャラデザイナー',
          icon: '🎨',
          description: 'AI-powered anime character creation',
          size: '3.2 MB',
          category: 'creative',
          installed: installedModes.includes('anime-chara-helper'),
          installing: false,
          uninstalling: false,
          lastUsed: usageStats['anime-chara-helper']?.lastUsed,
          usageCount: usageStats['anime-chara-helper']?.count || 0
        },
        {
          id: 'study-advisor',
          name: 'Study Advisor',
          nameJapanese: '学習アドバイザー',
          icon: '🎓',
          description: 'Personalized learning paths and university guidance',
          size: '1.2 MB',
          category: 'learning',
          installed: installedModes.includes('study-advisor'),
          installing: false,
          uninstalling: false,
          lastUsed: usageStats['study-advisor']?.lastUsed,
          usageCount: usageStats['study-advisor']?.count || 0
        }
      ];

      setModes(modesList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading mode info:', error);
      setLoading(false);
    }
  };

  const calculateStorage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        
        setTotalStorageUsed(Math.round(used / (1024 * 1024) * 100) / 100); // MB
        setAvailableStorage(Math.round((quota - used) / (1024 * 1024) * 100) / 100); // MB
      }
    } catch (error) {
      console.error('Error calculating storage:', error);
    }
  };

  const handleInstallMode = async (modeId: string) => {
    setModes(prev => prev.map(mode => 
      mode.id === modeId ? { ...mode, installing: true } : mode
    ));

    try {
      await modeManager.installMode(modeId);
      setModes(prev => prev.map(mode => 
        mode.id === modeId ? { ...mode, installed: true, installing: false } : mode
      ));
      calculateStorage();
    } catch (error) {
      console.error(`Error installing mode ${modeId}:`, error);
      setModes(prev => prev.map(mode => 
        mode.id === modeId ? { ...mode, installing: false } : mode
      ));
    }
  };

  const handleUninstallMode = async (modeId: string) => {
    setModes(prev => prev.map(mode => 
      mode.id === modeId ? { ...mode, uninstalling: true } : mode
    ));

    try {
      await modeManager.uninstallMode(modeId);
      setModes(prev => prev.map(mode => 
        mode.id === modeId ? { ...mode, installed: false, uninstalling: false } : mode
      ));
      calculateStorage();
    } catch (error) {
      console.error(`Error uninstalling mode ${modeId}:`, error);
      setModes(prev => prev.map(mode => 
        mode.id === modeId ? { ...mode, uninstalling: false } : mode
      ));
    }
  };

  const getUnusedModes = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return modes.filter(mode => 
      mode.installed && 
      (mode.usageCount === 0 || (mode.lastUsed && mode.lastUsed < thirtyDaysAgo))
    );
  };

  const handleCleanupUnused = async () => {
    const unusedModes = getUnusedModes();
    for (const mode of unusedModes) {
      await handleUninstallMode(mode.id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential': return '#4CAF50';
      case 'productivity': return '#2196F3';
      case 'creative': return '#FF9800';
      case 'learning': return '#9C27B0';
      default: return '#666';
    }
  };

  const filteredModes = selectedCategory === 'all' 
    ? modes 
    : modes.filter(mode => mode.category === selectedCategory);

  const installedCount = modes.filter(mode => mode.installed).length;
  const totalSize = modes.filter(mode => mode.installed)
    .reduce((sum, mode) => sum + parseFloat(mode.size), 0);

  if (loading) {
    return (
      <div className="mode-manager-settings loading">
        <div className="loading-spinner">Loading modes...</div>
      </div>
    );
  }

  return (
    <div className="mode-manager-settings">
      <div className="settings-header">
        <h2>📦 Mode Manager</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {/* Storage Overview */}
      <div className="storage-overview">
        <div className="storage-stats">
          <div className="stat-item">
            <span className="stat-label">Installed Modes</span>
            <span className="stat-value">{installedCount}/5</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Size</span>
            <span className="stat-value">{totalSize.toFixed(1)} MB</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Available Storage</span>
            <span className="stat-value">{availableStorage.toFixed(0)} MB</span>
          </div>
        </div>

        <div className="storage-bar">
          <div 
            className="storage-used" 
            style={{ width: `${Math.min((totalStorageUsed / (totalStorageUsed + availableStorage)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="action-button install-all"
          onClick={() => modes.filter(m => !m.installed).forEach(m => handleInstallMode(m.id))}
        >
          📥 Install All Modes
        </button>
        <button 
          className="action-button cleanup"
          onClick={handleCleanupUnused}
          disabled={getUnusedModes().length === 0}
        >
          🧹 Clean Unused ({getUnusedModes().length})
        </button>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button 
          className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        <button 
          className={`filter-button ${selectedCategory === 'productivity' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('productivity')}
        >
          Productivity
        </button>
        <button 
          className={`filter-button ${selectedCategory === 'creative' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('creative')}
        >
          Creative
        </button>
        <button 
          className={`filter-button ${selectedCategory === 'learning' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('learning')}
        >
          Learning
        </button>
      </div>

      {/* Modes List */}
      <div className="modes-list">
        {filteredModes.map((mode) => (
          <div key={mode.id} className={`mode-item ${mode.installed ? 'installed' : 'not-installed'}`}>
            <div className="mode-info">
              <div className="mode-header">
                <span className="mode-icon">{mode.icon}</span>
                <div className="mode-names">
                  <h3 className="mode-name">{mode.name}</h3>
                  <p className="mode-name-jp">{mode.nameJapanese}</p>
                </div>
                <div 
                  className="category-badge" 
                  style={{ backgroundColor: getCategoryColor(mode.category) }}
                >
                  {mode.category}
                </div>
              </div>
              
              <p className="mode-description">{mode.description}</p>
              
              <div className="mode-meta">
                <span className="mode-size">📁 {mode.size}</span>
                {mode.installed && (
                  <>
                    <span className="usage-count">🔢 Used {mode.usageCount} times</span>
                    {mode.lastUsed && (
                      <span className="last-used">
                        🕒 Last used {new Date(mode.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mode-actions">
              {mode.installed ? (
                <button 
                  className="action-button uninstall"
                  onClick={() => handleUninstallMode(mode.id)}
                  disabled={mode.uninstalling}
                >
                  {mode.uninstalling ? (
                    <span className="loading-spinner-small">Uninstalling...</span>
                  ) : (
                    '❌ Uninstall'
                  )}
                </button>
              ) : (
                <button 
                  className="action-button install"
                  onClick={() => handleInstallMode(mode.id)}
                  disabled={mode.installing}
                >
                  {mode.installing ? (
                    <span className="loading-spinner-small">Installing...</span>
                  ) : (
                    '⬇️ Install'
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="tips-section">
        <h3>💡 Storage Tips</h3>
        <ul>
          <li>Uninstall unused modes to free up storage space</li>
          <li>Modes can be reinstalled anytime without losing data</li>
          <li>Essential features are always available</li>
          <li>Your preferences and settings are preserved</li>
        </ul>
      </div>
    </div>
  );
};

export default ModeManagerSettings; 