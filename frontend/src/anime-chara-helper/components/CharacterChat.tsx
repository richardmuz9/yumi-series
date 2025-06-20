import React, { useState, useEffect } from 'react'
import ColorPaletteEngine, { COLOR_PALETTES } from './ColorPaletteEngine'
import PoseLibrary, { CHARACTER_POSES } from './PoseLibrary'

interface ColorPalette {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  mood: string
  description: string
}

interface CharacterPose {
  id: string
  name: string
  description: string
  preview: string
  category: 'standing' | 'action' | 'sitting' | 'expression'
}

interface CharacterPersonality {
  name: string
  age: string
  background: string
  catchphrase: string
  traits: string[]
  visualMotifs: string[]
}

interface CharacterChatProps {
  onComplete?: (data: any) => void;
  clarificationQuestions?: string[];
  existingBrief?: any;
}

const CharacterChat: React.FC<CharacterChatProps> = ({ 
  onComplete,
  clarificationQuestions = [],
  existingBrief 
}) => {
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(COLOR_PALETTES[0])
  const [selectedPose, setSelectedPose] = useState<CharacterPose>(CHARACTER_POSES[0])
  const [characterPersonality, setCharacterPersonality] = useState<CharacterPersonality>(() => {
    if (existingBrief?.character) {
      return existingBrief.character
    }
    return {
      name: '',
      age: '',
      background: '',
      catchphrase: '',
      traits: [],
      visualMotifs: []
    }
  })
  const [showPaletteEngine, setShowPaletteEngine] = useState(false)
  const [showPoseLibrary, setShowPoseLibrary] = useState(false)
  const [progressStage, setProgressStage] = useState<'outline' | 'coloring' | 'details' | 'final'>('outline')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [newTrait, setNewTrait] = useState('')
  const [newMotif, setNewMotif] = useState('')

  useEffect(() => {
    const suggestions = getProgressSuggestions(progressStage)
    setAiSuggestions(suggestions)
  }, [progressStage])

  const generatePersonalityBio = async () => {
    if (!characterPersonality.name) return

    const traits = characterPersonality.traits.join(', ')
    const motifs = characterPersonality.visualMotifs.join(', ')
    
    console.log(`Generating bio for ${characterPersonality.name} with traits: ${traits} and motifs: ${motifs}`)
    
    if (onComplete && characterPersonality.name && characterPersonality.traits.length > 0) {
      onComplete({
        sessionId: `session_${Date.now()}`,
        designBrief: {
          character: characterPersonality,
          palette: selectedPalette,
          pose: selectedPose,
          stage: progressStage
        },
        clarificationQuestions: clarificationQuestions
      })
    }
  }

  const getProgressSuggestions = (stage: string) => {
    const suggestions = {
      outline: [
        "Start with basic shapes and proportions",
        "Focus on the overall silhouette first",
        "Use light strokes for initial sketching"
      ],
      coloring: [
        "Apply base colors from your selected palette",
        "Consider the lighting source for shading",
        "Use color harmony principles"
      ],
      details: [
        "Add facial expressions and personality",
        "Include character-specific accessories",
        "Refine clothing and texture details"
      ],
      final: [
        "Add highlights and final touches",
        "Check overall composition balance",
        "Prepare for export and sharing"
      ]
    }
    return suggestions[stage as keyof typeof suggestions] || []
  }

  const addTrait = () => {
    if (newTrait.trim() && !characterPersonality.traits.includes(newTrait.trim())) {
      setCharacterPersonality(prev => ({
        ...prev,
        traits: [...prev.traits, newTrait.trim()]
      }))
      setNewTrait('')
    }
  }

  const removeTrait = (index: number) => {
    setCharacterPersonality(prev => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== index)
    }))
  }

  const addVisualMotif = () => {
    if (newMotif.trim() && !characterPersonality.visualMotifs.includes(newMotif.trim())) {
      setCharacterPersonality(prev => ({
        ...prev,
        visualMotifs: [...prev.visualMotifs, newMotif.trim()]
      }))
      setNewMotif('')
    }
  }

  const removeVisualMotif = (index: number) => {
    setCharacterPersonality(prev => ({
      ...prev,
      visualMotifs: prev.visualMotifs.filter((_, i) => i !== index)
    }))
  }

  const updatePersonalityField = (field: keyof CharacterPersonality, value: string) => {
    setCharacterPersonality(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="character-chat">
      <div className="chat-header">
        <h2>💬 Character Design Chat</h2>
        <p>Let's create your anime character step by step!</p>
      </div>

      <div className="character-form">
        {/* Basic Info Section */}
        <div className="form-section">
          <h3>👤 Basic Information</h3>
          <div className="form-row">
            <input
              type="text"
              value={characterPersonality.name}
              onChange={(e) => updatePersonalityField('name', e.target.value)}
              placeholder="Character name..."
              className="character-input"
            />
            <input
              type="text"
              value={characterPersonality.age}
              onChange={(e) => updatePersonalityField('age', e.target.value)}
              placeholder="Age..."
              className="character-input"
            />
          </div>
          
          <textarea
            value={characterPersonality.background}
            onChange={(e) => updatePersonalityField('background', e.target.value)}
            placeholder="Character background story..."
            className="character-textarea"
            rows={3}
          />
          
          <input
            type="text"
            value={characterPersonality.catchphrase}
            onChange={(e) => updatePersonalityField('catchphrase', e.target.value)}
            placeholder="Catchphrase or motto..."
            className="character-input"
          />
        </div>

        {/* Traits Section */}
        <div className="form-section">
          <h3>✨ Personality Traits</h3>
          <div className="add-item-row">
            <input
              type="text"
              value={newTrait}
              onChange={(e) => setNewTrait(e.target.value)}
              placeholder="Add a personality trait..."
              className="add-input"
              onKeyPress={(e) => e.key === 'Enter' && addTrait()}
            />
            <button onClick={addTrait} className="add-btn">➕ Add</button>
          </div>
          
          <div className="tags-container">
            {characterPersonality.traits.map((trait: string, index: number) => (
              <span key={index} className="trait-tag">
                {trait}
                <button onClick={() => removeTrait(index)} className="remove-tag">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Visual Motifs Section */}
        <div className="form-section">
          <h3>🎨 Visual Motifs</h3>
          <div className="add-item-row">
            <input
              type="text"
              value={newMotif}
              onChange={(e) => setNewMotif(e.target.value)}
              placeholder="Add a visual element..."
              className="add-input"
              onKeyPress={(e) => e.key === 'Enter' && addVisualMotif()}
            />
            <button onClick={addVisualMotif} className="add-btn">➕ Add</button>
          </div>

          <div className="tags-container">
            {characterPersonality.visualMotifs.map((motif: string, index: number) => (
              <span key={index} className="motif-tag">
                {motif}
                <button onClick={() => removeVisualMotif(index)} className="remove-tag">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Design Tools */}
        <div className="form-section">
          <h3>🛠️ Design Tools</h3>
          <div className="tool-buttons">
            <button
              onClick={() => setShowPaletteEngine(true)}
              className="tool-btn palette-btn"
            >
              🎨 Choose Color Palette
              <span className="current-selection">{selectedPalette.name}</span>
            </button>
            
            <button
              onClick={() => setShowPoseLibrary(true)}
              className="tool-btn pose-btn"
            >
              🎭 Select Pose
              <span className="current-selection">{selectedPose.name}</span>
            </button>
        </div>
      </div>

        {/* Progress Stage */}
        <div className="form-section">
          <h3>📈 Current Stage</h3>
          <div className="stage-selector">
            {['outline', 'coloring', 'details', 'final'].map(stage => (
            <button
              key={stage}
                className={`stage-btn ${progressStage === stage ? 'active' : ''}`}
                onClick={() => setProgressStage(stage as any)}
            >
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </button>
          ))}
        </div>
      </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="form-section">
            <h3>🤖 AI Suggestions</h3>
            <div className="suggestions-list">
              {aiSuggestions.map((suggestion: string, index: number) => (
                <div key={index} className="suggestion-item">
                  <span className="suggestion-icon">💡</span>
                  <span className="suggestion-text">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clarification Questions */}
        {clarificationQuestions.length > 0 && (
          <div className="form-section">
            <h3>❓ Clarification Questions</h3>
            <div className="questions-list">
              {clarificationQuestions.map((question: string, index: number) => (
                <div key={index} className="question-item">
                  <span className="question-icon">❓</span>
                  <span className="question-text">{question}</span>
                </div>
              ))}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            onClick={generatePersonalityBio}
            className="generate-btn"
            disabled={!characterPersonality.name || characterPersonality.traits.length === 0}
          >
            ✨ Generate Character Design
                </button>
        </div>
      </div>

      {/* Modals */}
      {showPaletteEngine && (
        <ColorPaletteEngine
          selectedPalette={selectedPalette}
          onPaletteSelect={(palette) => {
            setSelectedPalette(palette)
            setShowPaletteEngine(false)
          }}
          onClose={() => setShowPaletteEngine(false)}
        />
      )}

      {showPoseLibrary && (
        <PoseLibrary
          selectedPose={selectedPose}
          onPoseSelect={(pose) => {
            setSelectedPose(pose)
            setShowPoseLibrary(false)
          }}
          onClose={() => setShowPoseLibrary(false)}
        />
      )}
    </div>
  )
} 

export default CharacterChat