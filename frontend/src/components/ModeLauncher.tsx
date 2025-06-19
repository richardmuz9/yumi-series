import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { getTranslation } from '../translations'
import applicationData from '../data/applicationData.json'

interface ModeLauncherProps {
  onModeSelect: (mode: string) => void
  installedModes: string[]
  installingModes: Set<string>
  onInstallToggle: (modeKey: string, install: boolean) => void
}

interface ModeConfig {
  icon: string
  title: string
  description: string
  key: string
  pinned: boolean
  category: 'productivity' | 'creative' | 'ai' | 'utility'
}

const ModeLauncher: React.FC<ModeLauncherProps> = ({
  onModeSelect,
  installedModes,
  installingModes,
  onInstallToggle
}) => {
  const { language } = useStore()
  const t = getTranslation(language)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [userModeConfig, setUserModeConfig] = useState<ModeConfig[]>([])

  // Initialize mode configuration from data and localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('yumiModeConfig')
    let initialConfig: ModeConfig[]

    if (savedConfig) {
      try {
        initialConfig = JSON.parse(savedConfig)
      } catch {
        initialConfig = getDefaultModeConfig()
      }
    } else {
      initialConfig = getDefaultModeConfig()
    }

    setUserModeConfig(initialConfig)
  }, [])

  const getDefaultModeConfig = (): ModeConfig[] => {
    return applicationData.allModes.map(mode => ({
      ...mode,
      pinned: ['web-builder', 'writing-helper', 'report-writer'].includes(mode.key),
      category: getCategoryForMode(mode.key)
    }))
  }

  const getCategoryForMode = (key: string): 'productivity' | 'creative' | 'ai' | 'utility' => {
    switch (key) {
      case 'web-builder': return 'productivity'
      case 'writing-helper': return 'creative'
      case 'report-writer': return 'productivity'
      case 'anime-chara-helper': return 'creative'
      case 'study-advisor': return 'ai'
      default: return 'utility'
    }
  }

  const saveModeConfig = (config: ModeConfig[]) => {
    setUserModeConfig(config)
    localStorage.setItem('yumiModeConfig', JSON.stringify(config))
  }

  const toggleModePin = (modeKey: string) => {
    const newConfig = userModeConfig.map(mode =>
      mode.key === modeKey ? { ...mode, pinned: !mode.pinned } : mode
    )
    saveModeConfig(newConfig)
  }

  const pinnedModes = userModeConfig.filter(mode => mode.pinned)
  const unpinnedModes = userModeConfig.filter(mode => !mode.pinned)

  const handleModeClick = (modeKey: string) => {
    if (installedModes.includes(modeKey)) {
      onModeSelect(modeKey)
      setIsExpanded(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return '⚡'
      case 'creative': return '🎨'
      case 'ai': return '🤖'
      case 'utility': return '🛠️'
      default: return '📱'
    }
  }

  const groupModesByCategory = (modes: ModeConfig[]) => {
    return modes.reduce((acc, mode) => {
      if (!acc[mode.category]) {
        acc[mode.category] = []
      }
      acc[mode.category].push(mode)
      return acc
    }, {} as Record<string, ModeConfig[]>)
  }

  return (
    <div className="mode-launcher">
      {/* Collapsed State - Floating Button */}
      {!isExpanded && (
        <button
          className="launcher-toggle"
          onClick={() => setIsExpanded(true)}
          title="Open Mode Launcher"
        >
          <div className="launcher-icon">
            <div className="grid-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
          <div className="launcher-pulse"></div>
        </button>
      )}

      {/* Expanded State - Mode Panel */}
      {isExpanded && (
        <div className="launcher-panel">
          <div className="launcher-header">
            <h3 className="launcher-title">
              <span className="launcher-title-icon">🚀</span>
              {t.modes}
            </h3>
            <div className="launcher-actions">
              <button
                className={`customize-btn ${isCustomizing ? 'active' : ''}`}
                onClick={() => setIsCustomizing(!isCustomizing)}
                title="Customize Layout"
              >
                ⚙️
              </button>
              <button
                className="close-btn"
                onClick={() => setIsExpanded(false)}
                title="Close Launcher"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="launcher-content">
            {/* Pinned/Favorites Section */}
            {pinnedModes.length > 0 && (
              <div className="mode-section">
                <div className="section-header">
                  <span className="section-icon">⭐</span>
                  <span className="section-title">Favorites</span>
                </div>
                <div className="mode-grid favorites-grid">
                  {pinnedModes.map(mode => (
                    <div
                      key={mode.key}
                      className={`mode-item ${installedModes.includes(mode.key) ? 'installed' : 'not-installed'} ${installingModes.has(mode.key) ? 'installing' : ''}`}
                    >
                      <button
                        className="mode-button"
                        onClick={() => handleModeClick(mode.key)}
                        disabled={!installedModes.includes(mode.key) || installingModes.has(mode.key)}
                        title={`${mode.title} - ${mode.description}`}
                      >
                        <span className="mode-icon">{mode.icon}</span>
                        <span className="mode-label">{mode.title}</span>
                        {installingModes.has(mode.key) && (
                          <div className="installing-indicator">
                            <div className="spinner"></div>
                          </div>
                        )}
                      </button>
                      
                      {isCustomizing && (
                        <div className="mode-controls">
                          <button
                            className="pin-btn active"
                            onClick={() => toggleModePin(mode.key)}
                            title="Unpin from favorites"
                          >
                            📌
                          </button>
                          {!installedModes.includes(mode.key) && (
                            <button
                              className="install-btn"
                              onClick={() => onInstallToggle(mode.key, true)}
                              disabled={installingModes.has(mode.key)}
                              title="Install mode"
                            >
                              📦
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Modes by Category */}
            <div className="mode-section">
              <div className="section-header">
                <span className="section-icon">📱</span>
                <span className="section-title">All Modes</span>
              </div>
              
              {Object.entries(groupModesByCategory(userModeConfig)).map(([category, modes]) => (
                <div key={category} className="category-group">
                  <div className="category-header">
                    <span className="category-icon">{getCategoryIcon(category)}</span>
                    <span className="category-name">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  </div>
                  <div className="mode-grid category-grid">
                    {modes.map(mode => (
                      <div
                        key={mode.key}
                        className={`mode-item ${installedModes.includes(mode.key) ? 'installed' : 'not-installed'} ${installingModes.has(mode.key) ? 'installing' : ''}`}
                      >
                        <button
                          className="mode-button"
                          onClick={() => handleModeClick(mode.key)}
                          disabled={!installedModes.includes(mode.key) || installingModes.has(mode.key)}
                          title={`${mode.title} - ${mode.description}`}
                        >
                          <span className="mode-icon">{mode.icon}</span>
                          <span className="mode-label">{mode.title}</span>
                          {installingModes.has(mode.key) && (
                            <div className="installing-indicator">
                              <div className="spinner"></div>
                            </div>
                          )}
                        </button>
                        
                        {isCustomizing && (
                          <div className="mode-controls">
                            <button
                              className={`pin-btn ${mode.pinned ? 'active' : ''}`}
                              onClick={() => toggleModePin(mode.key)}
                              title={mode.pinned ? 'Unpin from favorites' : 'Pin to favorites'}
                            >
                              {mode.pinned ? '📌' : '📍'}
                            </button>
                            {!installedModes.includes(mode.key) ? (
                              <button
                                className="install-btn"
                                onClick={() => onInstallToggle(mode.key, true)}
                                disabled={installingModes.has(mode.key)}
                                title="Install mode"
                              >
                                📦
                              </button>
                            ) : (
                              <button
                                className="uninstall-btn"
                                onClick={() => onInstallToggle(mode.key, false)}
                                title="Uninstall mode"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isCustomizing && (
            <div className="launcher-footer">
              <p className="customize-tip">
                📌 Pin modes to favorites • 📦 Install/uninstall modes
              </p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="launcher-backdrop"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}

export default ModeLauncher 