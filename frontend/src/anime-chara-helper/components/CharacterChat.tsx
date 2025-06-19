import React, { useState, useEffect } from 'react'

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

const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'neon_cyberpunk',
    name: 'Neon Cyberpunk',
    primary: '#ff00ff',
    secondary: '#00ffff',
    accent: '#ffff00',
    mood: 'edgy futuristic',
    description: 'Electric neon colors for a cyberpunk aesthetic'
  },
  {
    id: 'pastel_kawaii',
    name: 'Pastel Kawaii',
    primary: '#ffb3d9',
    secondary: '#b3d9ff',
    accent: '#ffffb3',
    mood: 'cute soft',
    description: 'Soft pastel colors for adorable characters'
  },
  {
    id: 'warm_autumn',
    name: 'Warm Autumn',
    primary: '#ff7f50',
    secondary: '#daa520',
    accent: '#8b4513',
    mood: 'cozy nostalgic',
    description: 'Warm earth tones for a cozy feeling'
  },
  {
    id: 'ocean_depths',
    name: 'Ocean Depths',
    primary: '#0077be',
    secondary: '#4682b4',
    accent: '#20b2aa',
    mood: 'mysterious deep',
    description: 'Deep blues and teals for mysterious characters'
  }
]

const CHARACTER_POSES: CharacterPose[] = [
  {
    id: 'confident_stand',
    name: 'Confident Stand',
    description: 'Standing with hands on hips, confident pose',
    preview: '🧍‍♀️',
    category: 'standing'
  },
  {
    id: 'energetic_jump',
    name: 'Energetic Jump',
    description: 'Mid-jump with arms raised, full of energy',
    preview: '🤸‍♀️',
    category: 'action'
  },
  {
    id: 'relaxed_sitting',
    name: 'Relaxed Sitting',
    description: 'Sitting casually with a relaxed posture',
    preview: '🪑',
    category: 'sitting'
  },
  {
    id: 'happy_smile',
    name: 'Happy Smile',
    description: 'Bright, genuine smile with sparkling eyes',
    preview: '😊',
    category: 'expression'
  },
  {
    id: 'surprised_gasp',
    name: 'Surprised Gasp',
    description: 'Wide eyes and open mouth, surprised expression',
    preview: '😲',
    category: 'expression'
  },
  {
    id: 'mischievous_smirk',
    name: 'Mischievous Smirk',
    description: 'Slight smirk with a playful glint in the eyes',
    preview: '😏',
    category: 'expression'
  }
]

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
  const [showPersonalityBuilder, setShowPersonalityBuilder] = useState(false)
  const [moodKeywords, setMoodKeywords] = useState('')
  const [progressStage, setProgressStage] = useState<'outline' | 'coloring' | 'details' | 'final'>('outline')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  // Future: May use provider and model for AI integration
  // const { provider, model } = useStore()

  const generatePaletteFromMood = async () => {
    if (!moodKeywords.trim()) return

    // Simulate AI palette generation based on mood
    const moodBasedPalettes = COLOR_PALETTES.filter(palette => 
      moodKeywords.toLowerCase().split(' ').some(keyword => 
        palette.mood.includes(keyword) || palette.description.toLowerCase().includes(keyword)
      )
    )

    if (moodBasedPalettes.length > 0) {
      setSelectedPalette(moodBasedPalettes[0])
    }
  }

  const generatePersonalityBio = async () => {
    if (!characterPersonality.name) return

    // Simulate AI bio generation
    const traits = characterPersonality.traits.join(', ')
    const motifs = characterPersonality.visualMotifs.join(', ')
    
    // This would normally call an AI API
    console.log(`Generating bio for ${characterPersonality.name} with traits: ${traits} and motifs: ${motifs}`)
    
    // Call onComplete if character has enough details
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
        "Add facial features and expressions",
        "Include clothing patterns and accessories",
        "Refine hair texture and flow"
      ],
      final: [
        "Clean up line art and remove guides",
        "Add final highlights and shadows",
        "Consider background elements"
      ]
    }
    return suggestions[stage as keyof typeof suggestions] || []
  }

  const exportToSpriteSheet = () => {
    // Simulate sprite sheet generation
    const frames = ['idle1', 'idle2', 'walk1', 'walk2']
    console.log('Generating sprite sheet with frames:', frames)
    
    // In a real implementation, this would generate actual sprite frames
    alert(`🎨 Sprite sheet generated! 
    
Frames included:
- ${frames.join('\n- ')}

Ready for Unity/Godot import!`)
  }

  const addVisualMotif = (motif: string) => {
    setCharacterPersonality(prev => ({
      ...prev,
      visualMotifs: [...prev.visualMotifs, motif]
    }))
  }

  const removeVisualMotif = (index: number) => {
    setCharacterPersonality(prev => ({
      ...prev,
      visualMotifs: prev.visualMotifs.filter((_, i) => i !== index)
    }))
  }

  useEffect(() => {
    setAiSuggestions(getProgressSuggestions(progressStage))
  }, [progressStage])

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">🎨</span>
              AI Character Designer
              <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                ENHANCED
              </span>
            </h1>
            <p className="text-gray-600">Create stunning anime characters with AI-powered tools</p>
          </div>

          {/* Enhanced Toolbar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPaletteEngine(true)}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
            >
              🎨 Adaptive Palette
            </button>
            
            <button
              onClick={() => setShowPoseLibrary(true)}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
            >
              🤖 Pose Library
            </button>
            
            <button
              onClick={() => setShowPersonalityBuilder(true)}
              className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
            >
              🧠 Personality
            </button>
            
            <button
              onClick={exportToSpriteSheet}
              className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
            >
              🔁 Export Sprites
            </button>
          </div>
        </div>
      </div>

      {/* Progress Stage Selector */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Progress Stage:</span>
          {(['outline', 'coloring', 'details', 'final'] as const).map(stage => (
            <button
              key={stage}
              onClick={() => setProgressStage(stage)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                progressStage === stage
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Tools & Suggestions */}
        <div className="w-1/3 border-r border-gray-200 bg-white p-6 overflow-y-auto">
          {/* Current Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🎯 Current Selection
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎨</span>
                  <span className="font-medium">{selectedPalette.name}</span>
                </div>
                <div className="flex gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: selectedPalette.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: selectedPalette.secondary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: selectedPalette.accent }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedPose.preview}</span>
                  <span className="font-medium">{selectedPose.name}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{selectedPose.description}</p>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🤖 AI Suggestions
            </h3>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  💡 {suggestion}
                </div>
              ))}
            </div>
          </div>

          {/* Character Info */}
          {characterPersonality.name && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                👤 Character Profile
              </h3>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium text-green-800">{characterPersonality.name}</div>
                {characterPersonality.age && (
                  <div className="text-sm text-green-600">Age: {characterPersonality.age}</div>
                )}
                {characterPersonality.catchphrase && (
                  <div className="text-sm text-green-600 italic">"{characterPersonality.catchphrase}"</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Canvas Area */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Canvas Area</h3>
            <p className="text-gray-500 max-w-md">
              This would be the main drawing canvas where users create their anime characters.
              Integration with Canva or similar drawing tools would go here.
            </p>
            <div className="mt-6 p-6 bg-white rounded-lg shadow-sm max-w-md">
              <h4 className="font-medium text-gray-800 mb-3">Quick Actions:</h4>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-all">
                  🖌️ Start Drawing
                </button>
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all">
                  📱 Load Template
                </button>
                <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-all">
                  💾 Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Palette Engine Modal */}
      {showPaletteEngine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🎨 Adaptive Color Palette Engine
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your character's mood or theme:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={moodKeywords}
                  onChange={(e) => setMoodKeywords(e.target.value)}
                  placeholder="e.g., 'mysterious dark knight' or 'cheerful magical girl'"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={generatePaletteFromMood}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {COLOR_PALETTES.map(palette => (
                <div
                  key={palette.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-purple-400 ${
                    selectedPalette.id === palette.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPalette(palette)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: palette.secondary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: palette.accent }}
                      />
                    </div>
                    <span className="font-medium">{palette.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{palette.description}</p>
                  <div className="text-xs text-gray-500 mt-1">Mood: {palette.mood}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPaletteEngine(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pose Library Modal */}
      {showPoseLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🤖 Pose & Expression Library
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {CHARACTER_POSES.map(pose => (
                <div
                  key={pose.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-blue-400 text-center ${
                    selectedPose.id === pose.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPose(pose)}
                >
                  <div className="text-4xl mb-2">{pose.preview}</div>
                  <div className="font-medium text-sm">{pose.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{pose.description}</div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                    {pose.category}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPoseLibrary(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personality Builder Modal */}
      {showPersonalityBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🧠 Character Personality Builder
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={characterPersonality.name}
                  onChange={(e) => setCharacterPersonality(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter character name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="text"
                    value={characterPersonality.age}
                    onChange={(e) => setCharacterPersonality(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 16, Unknown, Immortal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catchphrase</label>
                  <input
                    type="text"
                    value={characterPersonality.catchphrase}
                    onChange={(e) => setCharacterPersonality(prev => ({ ...prev, catchphrase: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 'Believe it!'"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <textarea
                  value={characterPersonality.background}
                  onChange={(e) => setCharacterPersonality(prev => ({ ...prev, background: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none"
                  placeholder="Brief character background and history..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visual Motifs</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {characterPersonality.visualMotifs.map((motif, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm flex items-center gap-1"
                    >
                      {motif}
                      <button
                        onClick={() => removeVisualMotif(index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Cat ears', 'Belt with pouches', 'Magical staff', 'Flowing scarf', 'Goggles', 'Wings'].map(motif => (
                    <button
                      key={motif}
                      onClick={() => addVisualMotif(motif)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all text-sm"
                    >
                      + {motif}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={generatePersonalityBio}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
              >
                🤖 Generate Bio
              </button>
              
              <button
                onClick={() => setShowPersonalityBuilder(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
export default CharacterChat