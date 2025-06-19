import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface ModelInfo {
  id: string
  name: string
  provider: string
  category: string
  cost: number
  description: string
  strengths: string[]
  useCases: string[]
  limitations: string[]
  speed: 'Fast' | 'Medium' | 'Slow'
  accuracy: 'High' | 'Medium' | 'Low'
  languages: string[]
}

interface ModelGuideProps {
  onClose: () => void
}

// Modal component for model details
const ModelDetailModal: React.FC<{ model: ModelInfo; onClose: () => void }> = ({ model, onClose }) => {
  const getCostColor = (cost: number) => {
    if (cost === 0) return 'text-green-600 bg-green-50'
    if (cost < 0.01) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'Fast': return 'text-green-600 bg-green-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Slow': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getProviderEmoji = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return '🤖'
      case 'openrouter': return '🌐'
      case 'qwen': return '🚀'
      case 'claude': return '🧠'
      case 'anthropic': return '🧠'
      case 'meta': return '🦙'
      case 'google': return '⭐'
      case 'microsoft': return '🔷'
      case 'mistral': return '🔥'
      default: return '⚡'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getProviderEmoji(model.provider)}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{model.name}</h2>
                <p className="text-sm text-gray-600">{model.provider} • {model.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Cost and Speed Badges */}
          <div className="flex gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCostColor(model.cost)}`}>
              {model.cost === 0 ? '🆓 Free' : `💰 $${model.cost}/1K tokens`}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSpeedColor(model.speed)}`}>
              ⚡ {model.speed}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
              🎯 {model.accuracy} Accuracy
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{model.description}</p>
          </div>

          {/* Strengths */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">✨ Strengths</h3>
            <div className="grid gap-2">
              {model.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">🎯 Best Use Cases</h3>
            <div className="grid gap-2">
              {model.useCases.map((useCase, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-blue-500">→</span>
                  <span className="text-gray-600">{useCase}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">⚠️ Limitations</h3>
            <div className="grid gap-2">
              {model.limitations.map((limitation, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-yellow-500">!</span>
                  <span className="text-gray-600">{limitation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">🌍 Supported Languages</h3>
            <div className="flex flex-wrap gap-2">
              {model.languages.map((language) => (
                <span
                  key={language}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ModelGuide: React.FC<ModelGuideProps> = ({ onClose }) => {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Enhanced model descriptions database
  const modelDescriptions: Record<string, Omit<ModelInfo, 'id' | 'name' | 'provider' | 'category' | 'cost'>> = {
    // OpenRouter Free Models
    'google/gemini-2.5-pro': {
      description: 'Google\'s latest and most advanced Gemini model with multimodal capabilities.',
      strengths: ['Multimodal (text, images)', 'Latest technology', 'Free to use', 'Excellent reasoning'],
      useCases: ['Image analysis', 'Complex reasoning', 'Research', 'Creative tasks'],
      limitations: ['Rate limits on free tier', 'Regional availability'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['English', 'Chinese', 'Japanese', 'Korean', 'Spanish', 'French']
    },
    'meta-llama/llama-3-70b-instruct': {
      description: 'Meta\'s powerful 70B parameter Llama 3 model, excellent for complex tasks.',
      strengths: ['Very large model', 'Excellent reasoning', 'Free to use', 'Open source'],
      useCases: ['Complex reasoning', 'Research', 'Advanced coding', 'Creative writing'],
      limitations: ['Rate limits', 'Slower due to size', 'Queue times'],
      speed: 'Slow',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese']
    },
    'microsoft/wizardlm-2-8x22b': {
      description: 'Microsoft\'s advanced mixture-of-experts model with excellent instruction following.',
      strengths: ['Excellent instruction following', 'Free to use', 'MoE architecture', 'Versatile'],
      useCases: ['Complex instructions', 'Analysis', 'Problem solving', 'Research'],
      limitations: ['Rate limits on free tier', 'Variable response time'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['English', 'Chinese', 'Spanish', 'French']
    },
    'mistralai/mistral-7b-instruct': {
      description: 'Mistral AI\'s efficient 7B parameter model with excellent performance-to-size ratio.',
      strengths: ['Balanced performance', 'Free to use', 'European AI', 'Efficient'],
      useCases: ['General purpose', 'Content creation', 'Simple coding', 'Analysis'],
      limitations: ['Smaller model', 'Rate limits', 'Limited reasoning'],
      speed: 'Fast',
      accuracy: 'Medium',
      languages: ['English', 'French', 'Spanish', 'German', 'Italian']
    },

    // Qwen Models
    'qwen-turbo': {
      description: 'Alibaba\'s fastest Qwen model optimized for speed with good multilingual support.',
      strengths: ['Excellent Chinese', 'Very fast', 'Cost effective', 'Good coding'],
      useCases: ['Chinese content', 'Fast responses', 'General chat', 'Coding'],
      limitations: ['Less reasoning than larger models', 'Speed over accuracy'],
      speed: 'Fast',
      accuracy: 'Medium',
      languages: ['Chinese', 'English', 'Japanese', 'Korean']
    },
    'qwen2.5-72b-instruct': {
      description: 'Latest Qwen 2.5 model with enhanced capabilities and improved performance.',
      strengths: ['Latest version', 'Best Qwen model', 'Excellent Chinese', 'State-of-the-art'],
      useCases: ['Professional tasks', 'Research', 'Complex reasoning', 'Creative writing'],
      limitations: ['Premium pricing', 'Slower processing', 'High resource use'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['Chinese', 'English', 'Japanese', 'Korean']
    },

    // OpenAI Models
    'gpt-4o': {
      description: 'OpenAI\'s most advanced multimodal model with vision, audio, and text capabilities.',
      strengths: ['Multimodal', 'Latest technology', 'Excellent reasoning', 'Vision support'],
      useCases: ['Complex tasks', 'Image analysis', 'Research', 'Professional applications'],
      limitations: ['Premium pricing', 'Rate limits', 'Cost per token'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese']
    },
    'gpt-4o-mini': {
      description: 'Faster, more affordable version of GPT-4o with good performance.',
      strengths: ['Cost effective', 'Fast responses', 'Good quality', 'OpenAI technology'],
      useCases: ['General chat', 'Content creation', 'Analysis', 'Coding help'],
      limitations: ['Less capable than full GPT-4o', 'Still paid', 'Rate limits'],
      speed: 'Fast',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Chinese']
    },
    'gpt-3.5-turbo': {
      description: 'OpenAI\'s efficient and cost-effective model, great balance of speed and capability.',
      strengths: ['Cost effective', 'Fast responses', 'Reliable', 'Well-tested'],
      useCases: ['General chat', 'Content creation', 'Simple coding', 'Q&A'],
      limitations: ['Less capable than GPT-4', 'Older technology', 'Limited reasoning'],
      speed: 'Fast',
      accuracy: 'Medium',
      languages: ['English', 'Spanish', 'French', 'German', 'Chinese']
    },

    // Claude Models
    'claude-3-5-sonnet-20241022': {
      description: 'Anthropic\'s latest and most capable Claude model with excellent reasoning.',
      strengths: ['Latest Claude', 'Excellent reasoning', 'Long context', 'Safe responses'],
      useCases: ['Complex analysis', 'Research', 'Professional writing', 'Code review'],
      limitations: ['Premium pricing', 'Anthropic-specific availability', 'Regional limits'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Chinese']
    }
  }

  const loadModels = async () => {
    try {
      setLoading(true)
      const modelsData = await apiService.getModels()
      
      // Convert the models data to ModelInfo format
      const allModels: ModelInfo[] = []
      
      Object.entries(modelsData).forEach(([provider, modelList]) => {
        if (Array.isArray(modelList)) {
          modelList.forEach(modelId => {
            const description = modelDescriptions[modelId] || {
              description: 'No description available for this model.',
              strengths: ['Advanced AI capabilities'],
              useCases: ['General purpose AI tasks'],
              limitations: ['May have usage limits'],
              speed: 'Medium' as const,
              accuracy: 'Medium' as const,
              languages: ['English']
            }

            const modelInfo: ModelInfo = {
              id: modelId,
              name: modelId.split('/').pop() || modelId,
              provider: provider.charAt(0).toUpperCase() + provider.slice(1),
              category: provider === 'openrouter' ? 'Free' : provider === 'qwen' ? 'Chinese AI' : 'Premium',
              cost: provider === 'openrouter' ? 0 : provider === 'qwen' ? 0.001 : 0.01,
              ...description
            }

            allModels.push(modelInfo)
          })
        }
      })

      setModels(allModels)
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModels()
  }, [])

  const getProviderEmoji = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return '🤖'
      case 'openrouter': return '🌐'
      case 'qwen': return '🚀'
      case 'claude': return '🧠'
      case 'anthropic': return '🧠'
      default: return '⚡'
    }
  }

  const getCostColor = (cost: number) => {
    if (cost === 0) return 'text-green-600 bg-green-50'
    if (cost < 0.01) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const filteredModels = models.filter(model => {
    const matchesCategory = filterCategory === 'All' || model.category === filterCategory
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.provider.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = ['All', ...Array.from(new Set(models.map(model => model.category)))]

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available models...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🤖 Available AI Models</h2>
                <p className="text-gray-600">Click on any model to see detailed information</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Models Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{getProviderEmoji(model.provider)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{model.name}</h3>
                      <p className="text-xs text-gray-600">{model.provider}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCostColor(model.cost)}`}>
                      {model.cost === 0 ? 'Free' : `$${model.cost}/1K`}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {model.speed}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {model.description}
                  </p>
                </button>
              ))}
            </div>

            {filteredModels.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No models found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Detail Modal */}
      {selectedModel && (
        <ModelDetailModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </>
  )
}

export default ModelGuide 