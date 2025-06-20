import React, { useState, useEffect } from 'react'
import { postGeneratorService } from '../../services/postGeneratorApi'

interface AnimaPersona {
  id: string
  name: string
  anime: string
  icon: string
  description: string
  personality: string[]
  exampleHooks: string[]
}

interface AnimePersonaSelectorProps {
  selectedPersona: string
  onPersonaChange: (persona: string) => void
  platform: string
}

export const AnimePersonaSelector: React.FC<AnimePersonaSelectorProps> = ({
  selectedPersona,
  onPersonaChange,
  platform
}) => {
  const [personas, setPersonas] = useState<Record<string, AnimaPersona>>({})
  const [categories, setCategories] = useState<Record<string, string[]>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showExample, setShowExample] = useState<string | null>(null)

  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    try {
      const response = await postGeneratorService.getAnimePersonas()
      setPersonas(response.personas)
      setCategories(response.personaCategories)
    } catch (error) {
      console.error('Failed to load personas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredPersonas = () => {
    if (selectedCategory === 'all') {
      return Object.entries(personas)
    }
    
    const categoryPersonaIds = categories[selectedCategory] || []
    return Object.entries(personas).filter(([id]) => categoryPersonaIds.includes(id))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'confident': return '😎'
      case 'gentle': return '🌸'
      case 'energetic': return '⚡'
      case 'intense': return '⚔️'
      case 'encouraging': return '💙'
      case 'intellectual': return '🧪'
      case 'playful': return '🎭'
      default: return '✨'
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading anime personas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          🎭 Choose Your Anime Persona
        </h2>
        <p className="text-gray-600 mb-6">
          Let your favorite anime character's personality shine through your posts!
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
            selectedCategory === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✨ All
        </button>
        {Object.keys(categories).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* No Persona Option */}
      <button
        onClick={() => onPersonaChange('')}
        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
          selectedPersona === ''
            ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🚫</span>
          <span className="font-medium text-gray-800">No Persona</span>
        </div>
        <p className="text-sm text-gray-600">Use standard tone without anime character influence</p>
      </button>

      {/* Persona Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getFilteredPersonas().map(([id, persona]) => (
          <div
            key={id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              selectedPersona === id
                ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
            }`}
            onClick={() => onPersonaChange(id)}
          >
            {/* Persona Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{persona.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{persona.name}</h3>
                  <p className="text-xs text-gray-500">{persona.anime}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowExample(showExample === id ? null : id)
                }}
                className="text-purple-500 hover:text-purple-700 text-sm px-2 py-1 rounded hover:bg-purple-100 transition-colors"
              >
                {showExample === id ? 'Hide' : 'Example'}
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-3">{persona.description}</p>

            {/* Personality Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {persona.personality.slice(0, 3).map((trait) => (
                <span
                  key={trait}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                >
                  {trait}
                </span>
              ))}
              {persona.personality.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{persona.personality.length - 3} more
                </span>
              )}
            </div>

            {/* Platform Adaptation Note */}
            <div className="text-xs text-gray-500 italic">
              ✨ Adapted for {platform === 'xiaohongshu' ? '小红书/Rednote' : platform}
            </div>

            {/* Example Hook (Expandable) */}
            {showExample === id && (
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-purple-800 mb-2">
                  Example Hook:
                </h4>
                <p className="text-sm text-gray-700 italic">
                  "{persona.exampleHooks[0]}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Persona Preview */}
      {selectedPersona && personas[selectedPersona] && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">
            Selected Persona: {personas[selectedPersona].name}
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-purple-600">Personality:</span>
              <span className="text-gray-800 ml-2">
                {personas[selectedPersona].personality.join(', ')}
              </span>
            </div>
            <div>
              <span className="font-medium text-purple-600">Style:</span>
              <span className="text-gray-800 ml-2">
                {personas[selectedPersona].description}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {getFilteredPersonas().length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🎭</div>
          <p className="text-gray-600">No personas found in this category</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-2 text-purple-600 hover:text-purple-700 text-sm underline"
          >
            Show all personas
          </button>
        </div>
      )}
    </div>
  )
} 