import React from 'react'
import { useStore } from '../store'

interface ModelSwitcherProps {
  className?: string
  compact?: boolean
}

export const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ 
  className = '',
  compact = false 
}) => {
  const { provider, model, availableModels, setProvider, setModel } = useStore()

  const getProviderEmoji = (providerName: string) => {
    switch (providerName) {
      case 'qwen': return '🚀'
      case 'openrouter': return '🌐'
      case 'openai': return '🤖'
      case 'claude': return '🧠'
      default: return '⚡'
    }
  }

  const getProviderColor = (providerName: string) => {
    switch (providerName) {
      case 'qwen': return 'from-blue-400 to-cyan-400'
      case 'openrouter': return 'from-green-400 to-emerald-400'
      case 'openai': return 'from-purple-400 to-pink-400'
      case 'claude': return 'from-orange-400 to-red-400'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const handleProviderChange = (newProvider: 'openai' | 'openrouter' | 'qwen' | 'claude') => {
    setProvider(newProvider)
    const models = availableModels[newProvider]
    if (Array.isArray(models) && models.length > 0) {
      setModel(models[0])
    }
  }

  const getCurrentModels = () => {
    const models = availableModels[provider]
    return Array.isArray(models) ? models : []
  }

  const isPaidProvider = provider === 'openai' || provider === 'claude'

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="qwen">🚀 Qwen (Free)</option>
          <option value="openrouter">🌐 OpenRouter (Free)</option>
          <option value="openai">🤖 OpenAI (Paid)</option>
          <option value="claude">🧠 Claude (Paid)</option>
        </select>
        
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white min-w-0 flex-1"
        >
          {getCurrentModels().map((modelName) => (
            <option key={modelName} value={modelName}>
              {modelName}
            </option>
          ))}
        </select>
        
        {isPaidProvider && (
          <span className="text-xs text-orange-600 flex items-center gap-1">
            💳
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-lg">🔧</span>
        AI Model Selection
      </h3>
      
      {/* Provider Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Provider
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['qwen', 'openrouter', 'openai', 'claude'] as const).map((providerOption) => {
            const isPaid = providerOption === 'openai' || providerOption === 'claude'
            return (
              <button
                key={providerOption}
                onClick={() => handleProviderChange(providerOption)}
                className={`p-2 rounded-lg border-2 transition-all duration-300 text-sm ${
                  provider === providerOption
                    ? `border-purple-300 bg-gradient-to-r ${getProviderColor(providerOption)} text-white shadow-lg`
                    : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-md'
                } ${isPaid ? 'border-l-4 border-l-orange-400' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getProviderEmoji(providerOption)}</span>
                  <div className="text-left">
                    <div className="font-medium capitalize">
                      {providerOption}
                      {isPaid && <span className="text-xs ml-1">💳</span>}
                    </div>
                    <div className={`text-xs ${provider === providerOption ? 'text-white/80' : 'text-gray-500'}`}>
                      {providerOption === 'qwen' && 'Fast & Free'}
                      {providerOption === 'openrouter' && 'Free Models'}
                      {providerOption === 'openai' && 'Premium GPT'}
                      {providerOption === 'claude' && 'Advanced Claude'}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
        >
          {getCurrentModels().length > 0 ? (
            getCurrentModels().map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))
          ) : (
            <option value="">Loading models...</option>
          )}
        </select>
      </div>

      {/* Provider Info */}
      {isPaidProvider && (
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-start gap-2">
            <span className="text-orange-600">⚠️</span>
            <div className="text-sm text-orange-700">
              <strong>Premium Provider:</strong> This provider requires API credits. 
              High-performance models with excellent capabilities.
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 