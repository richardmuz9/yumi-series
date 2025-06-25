import React, { useState, useEffect } from 'react'
import { 
  CreativeControlSettings, 
  CreativeControlLevel, 
  CreativeControlPanelProps,
  UserCreativeHistory,
  MemoryNudge 
} from '../types/creativeModes'
import './CreativeControlPanel.css'

// Import Yumi personalities (we'll create a service for this)
import { getYumiPersonalities, getPersonalityGuide } from '../services/yumiPersonalityService'

export const CreativeControlPanel: React.FC<CreativeControlPanelProps> = ({
  currentSettings,
  onSettingsChange,
  userHistory,
  availablePersonalities,
  mode
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [memoryNudges, setMemoryNudges] = useState<MemoryNudge[]>([])
  const [selectedPersonality, setSelectedPersonality] = useState(currentSettings.yumiPersonality)
  
  useEffect(() => {
    generateMemoryNudges()
  }, [userHistory, mode])

  const generateMemoryNudges = () => {
    const nudges: MemoryNudge[] = []
    
    // Theme reuse nudge
    if (userHistory.recentThemes.length > 0) {
      const lastTheme = userHistory.recentThemes[0]
      nudges.push({
        type: 'theme_reuse',
        message: `Continue with "${lastTheme}" theme?`,
        action: `Use ${lastTheme} again`,
        confidence: 0.8,
        relatedHistory: [lastTheme]
      })
    }

    // Personality consistency nudge
    if (userHistory.lastUsedPersonality && userHistory.lastUsedPersonality !== selectedPersonality) {
      nudges.push({
        type: 'personality_consistency',
        message: `Switch back to ${userHistory.lastUsedPersonality}?`,
        action: `Use ${userHistory.lastUsedPersonality}`,
        confidence: 0.6,
        relatedHistory: [userHistory.lastUsedPersonality]
      })
    }

    setMemoryNudges(nudges)
  }

  const handleLevelChange = (level: CreativeControlLevel) => {
    const updatedSettings: CreativeControlSettings = {
      ...currentSettings,
      level,
      // Auto-adjust related settings based on level
      allowSuggestions: level !== 'precise',
      iterativeMode: level === 'balanced',
      memoryNudges: level !== 'freestyle'
    }
    onSettingsChange(updatedSettings)
  }

  const handlePersonalityChange = (personality: string) => {
    setSelectedPersonality(personality)
    onSettingsChange({
      ...currentSettings,
      yumiPersonality: personality
    })
  }

  const applyMemoryNudge = (nudge: MemoryNudge) => {
    switch (nudge.type) {
      case 'theme_reuse':
        // Apply theme to current context
        break
      case 'personality_consistency':
        handlePersonalityChange(nudge.relatedHistory[0])
        break
    }
  }

  const getPersonalityEmoji = (personality: string) => {
    const emojiMap: Record<string, string> = {
      'otaku': '🎌',
      'tsundere': '😤',
      'teacher': '👩‍🏫',
      'imouto': '🌸',
      'classmate': '👫',
      'kuudere': '❄️',
      'genki': '⚡'
    }
    return emojiMap[personality] || '✨'
  }

  const getLevelDescription = (level: CreativeControlLevel) => {
    switch (level) {
      case 'precise':
        return 'I\'ll give detailed instructions. AI follows exactly.'
      case 'balanced':
        return 'Good result with smart questions when needed.'
      case 'freestyle':
        return 'Surprise me! Full AI creativity based on vibe.'
    }
  }

  const getLevelEmoji = (level: CreativeControlLevel) => {
    switch (level) {
      case 'precise': return '🎯'
      case 'balanced': return '🎨'
      case 'freestyle': return '🎲'
    }
  }

  const currentPersonalityGuide = getPersonalityGuide(selectedPersonality)

  return (
    <div className={`creative-control-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Quick Control Header */}
      <div className="control-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="current-mode">
          <span className="mode-emoji">{getLevelEmoji(currentSettings.level)}</span>
          <span className="mode-name">{currentSettings.level}</span>
          <span className="personality-indicator">
            {getPersonalityEmoji(selectedPersonality)} {selectedPersonality}
          </span>
        </div>
        <button className="expand-toggle">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="control-content">
          {/* Memory Nudges */}
          {memoryNudges.length > 0 && (
            <div className="memory-nudges">
              <h4>💭 Smart Suggestions</h4>
              {memoryNudges.map((nudge, index) => (
                <div key={index} className={`memory-nudge ${nudge.type}`}>
                  <span className="nudge-message">{nudge.message}</span>
                  <button 
                    className="nudge-action"
                    onClick={() => applyMemoryNudge(nudge)}
                  >
                    {nudge.action}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Creative Control Level */}
          <div className="control-section">
            <h4>🎯 Creative Control Level</h4>
            <div className="level-selector">
              {(['precise', 'balanced', 'freestyle'] as CreativeControlLevel[]).map(level => (
                <button
                  key={level}
                  className={`level-button ${currentSettings.level === level ? 'active' : ''}`}
                  onClick={() => handleLevelChange(level)}
                >
                  <div className="level-icon">{getLevelEmoji(level)}</div>
                  <div className="level-name">{level}</div>
                  <div className="level-desc">{getLevelDescription(level)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Yumi Personality Selector */}
          <div className="control-section">
            <h4>✨ Yumi's Creative Guide</h4>
            <div className="personality-grid">
              {availablePersonalities.map(personality => (
                <button
                  key={personality}
                  className={`personality-card ${selectedPersonality === personality ? 'active' : ''}`}
                  onClick={() => handlePersonalityChange(personality)}
                >
                  <div className="personality-emoji">{getPersonalityEmoji(personality)}</div>
                  <div className="personality-name">{personality}</div>
                </button>
              ))}
            </div>
            
            {/* Current Personality Influence */}
            {currentPersonalityGuide && (
              <div className="personality-influence">
                <h5>🎭 {currentPersonalityGuide.name} will help by:</h5>
                <div className="influence-tags">
                  {mode === 'writing' && currentPersonalityGuide.creativeSuggestions.writing.slice(0, 3).map((suggestion, index) => (
                    <span key={index} className="influence-tag">{suggestion}</span>
                  ))}
                  {mode === 'image' && currentPersonalityGuide.creativeSuggestions.visual.slice(0, 3).map((suggestion, index) => (
                    <span key={index} className="influence-tag">{suggestion}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="control-section advanced-settings">
            <h4>⚙️ Fine-tuning</h4>
            <div className="setting-toggles">
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={currentSettings.allowSuggestions}
                  onChange={(e) => onSettingsChange({
                    ...currentSettings,
                    allowSuggestions: e.target.checked
                  })}
                  disabled={currentSettings.level === 'precise'}
                />
                <span>💡 Allow AI suggestions</span>
              </label>
              
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={currentSettings.memoryNudges}
                  onChange={(e) => onSettingsChange({
                    ...currentSettings,
                    memoryNudges: e.target.checked
                  })}
                />
                <span>🧠 Smart memory nudges</span>
              </label>
              
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={currentSettings.iterativeMode}
                  onChange={(e) => onSettingsChange({
                    ...currentSettings,
                    iterativeMode: e.target.checked
                  })}
                />
                <span>🔄 Show alternative versions</span>
              </label>
            </div>
          </div>

          {/* Mode-Specific Quick Actions */}
          <div className="control-section">
            <h4>🚀 Quick Actions</h4>
            <div className="quick-actions">
              {(mode === 'writing' || mode === 'report') && (
                <>
                  <button className="quick-action">📖 Continue Story</button>
                  <button className="quick-action">💬 Add Dialogue</button>
                  <button className="quick-action">🎭 Change Tone</button>
                </>
              )}
              {mode === 'image' && (
                <>
                  <button className="quick-action">🎨 New Pose</button>
                  <button className="quick-action">👗 Change Outfit</button>
                  <button className="quick-action">🌈 Adjust Mood</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 