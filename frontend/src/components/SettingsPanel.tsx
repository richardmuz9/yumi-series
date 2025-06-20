import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { apiService } from '../services/api'
import ModeManagerSettings from './ModeManagerSettings'
import BillingStatus from './BillingStatus'
import PWAInstaller from './PWAInstaller'

type Language = 'en' | 'cn' | 'jp' | 'kr'

export const SettingsPanel = () => {
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const [aiInstructions, setAiInstructions] = useState('')
  const [isProcessingInstructions, setIsProcessingInstructions] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [showAIEditor, setShowAIEditor] = useState(false)
  const [showModeManager, setShowModeManager] = useState(false)
  
  const {
    provider,
    model,
    availableModels,
    messages,
    language,
    setProvider,
    setModel,
    setAvailableModels,
    clearMessages,
    archiveMessages,
    setCurrentView,
    setLanguage
  } = useStore()

  useEffect(() => {
    const loadModels = async () => {
      try {
        setBackendStatus('checking')
        const models = await apiService.getModels()
        setAvailableModels(models)
        setBackendStatus('connected')
      } catch (error) {
        console.error('Failed to load models from backend, using fallback:', error)
        setBackendStatus('disconnected')
        
        // Set fallback models immediately to prevent crashes - matching backend config
        const fallbackModels = {
          qwen: [
            'qwen-turbo',
            'qwen-plus',
            'qwen-max',
            'qwen-vl-plus',
            'qwen-vl-max',
            'deepseek/deepseek-chat',
            'deepseek/deepseek-coder'
          ],
          openai: [
            'gpt-4',
            'gpt-4-turbo',
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-3.5-turbo'
          ],
          claude: [
            'claude-opus-4-20250514',
            'claude-sonnet-4-20250514',
            'claude-3-opus-20240229',
            'claude-3-5-sonnet-20240620',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307'
          ]
        }
        
        try {
          setAvailableModels(fallbackModels)
        } catch (setError) {
          console.error('Error setting fallback models:', setError)
        }
      }
    }
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (backendStatus === 'checking') {
        console.warn('Backend check timed out, using fallback')
        setBackendStatus('disconnected')
      }
    }, 10000) // 10 second timeout
    
    loadModels().finally(() => {
      clearTimeout(timeoutId)
    })
  }, [setAvailableModels])

  const handleProviderChange = (newProvider: 'openai' | 'qwen' | 'claude') => {
    setProvider(newProvider)
    // Set default model for the new provider with defensive check
    const models = availableModels[newProvider]
    if (Array.isArray(models) && models.length > 0) {
      setModel(models[0])
    }
  }

  const getProviderEmoji = (providerName: string) => {
    switch (providerName) {
      case 'qwen': return '🚀'

      case 'openai': return '🤖'
      case 'anthropic': return '🧠'
      default: return '⚡'
    }
  }

  const getProviderColor = (providerName: string) => {
    switch (providerName) {
      case 'qwen': return 'from-blue-400 to-cyan-400'

      case 'openai': return 'from-purple-400 to-pink-400'
      case 'anthropic': return 'from-orange-400 to-red-400'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  // Defensive helper to safely get models array
  const getCurrentModels = () => {
    const models = availableModels[provider]
    return Array.isArray(models) ? models : []
  }

  const handleAIInstructions = async () => {
    setIsProcessingInstructions(true)
    try {
      const response = await apiService.editWebsite(aiInstructions)
      setAiResponse(response)
    } catch (error) {
      console.error('Error processing AI instructions:', error)
      setAiResponse('An error occurred while processing your request.')
    } finally {
      setIsProcessingInstructions(false)
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-xl">⚙️</span>
        Settings
      </h3>
      
      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Language / 语言 / 言語 / 언어
        </label>
        <select 
          className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 backdrop-blur-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          <option value="en">🇺🇸 English</option>
          <option value="cn">🇨🇳 中文</option>
          <option value="jp">🇯🇵 日本語</option>
          <option value="kr">🇰🇷 한국어</option>
        </select>
      </div>

      {/* PWA Installation */}
      <div className="mb-6">
        <PWAInstaller />
      </div>
      
      {/* Provider Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          AI Provider
        </label>
        <div className="space-y-2">
          {(['qwen', 'openai', 'claude'] as const).map((providerOption) => {
            const isPaidProvider = providerOption === 'openai' || providerOption === 'claude'
            return (
                              <button
                  key={providerOption}
                  onClick={() => handleProviderChange(providerOption)}
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                    provider === providerOption
                      ? `border-purple-300 bg-gradient-to-r ${getProviderColor(providerOption)} text-white shadow-lg transform scale-105`
                      : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-md'
                  } ${isPaidProvider ? 'border-l-4 border-l-orange-400' : ''}`}
              >
                <span className="text-2xl">{getProviderEmoji(providerOption)}</span>
                <div className="text-left">
                  <div className="font-medium capitalize">
                    {providerOption}
                    {providerOption === 'qwen' && (
                      <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${provider === providerOption ? 'text-white/80' : 'text-gray-500'}`}>
                    {providerOption === 'qwen' && 'Fast and cost-effective'}

                    {providerOption === 'openai' && 'Premium GPT models (requires API credits)'}
                    {providerOption === 'claude' && 'Advanced Claude models (requires API credits)'}
                  </div>
                  {isPaidProvider && (
                    <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <span>💳</span> Premium models require payment
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 backdrop-blur-sm"
        >
          {getCurrentModels().length > 0 ? (
            Array.isArray(getCurrentModels()) && getCurrentModels().map((modelName) => (
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
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{getProviderEmoji(provider)}</span>
          <div className="text-sm text-gray-700">
            {provider === 'qwen' && (
              <div>
                <div className="font-medium text-purple-700 mb-1">Qwen by Alibaba</div>
                <p>Fast, reliable, and cost-effective AI models perfect for website building tasks! 🚀</p>
              </div>
            )}

            {provider === 'openai' && (
              <div>
                <div className="font-medium text-purple-700 mb-1">OpenAI</div>
                <p>Premium GPT models with excellent reasoning capabilities. Requires API credits. Perfect for high-quality content generation. 🤖</p>
              </div>
            )}
            {provider === 'claude' && (
              <div>
                <div className="font-medium text-orange-700 mb-1">Anthropic Claude</div>
                <p>Advanced Claude models with superior reasoning and safety. Requires API credits. Excellent for complex analysis and creative tasks. 🧠</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing Status */}
      <div className="mb-6">
        <BillingStatus compact={true} />
      </div>

      {/* Mode Manager */}
      <div className="mb-6">
        <button
          onClick={() => setShowModeManager(true)}
          className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span className="text-lg">📦</span>
          <span>Manage App Modes</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Storage</span>
        </button>
      </div>

      {/* Chat Management */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <span className="text-lg">💬</span>
          Chat Management
        </h4>
        
        <button
          onClick={() => setCurrentView('archive')}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span className="text-lg">🗄️</span>
          <span>View Archive</span>
        </button>
        
        <button
          onClick={archiveMessages}
          disabled={!Array.isArray(messages) || messages.length === 0}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span className="text-lg">📦</span>
          <span>Archive Chat</span>
        </button>
        
        <button
          onClick={clearMessages}
          disabled={!Array.isArray(messages) || messages.length === 0}
          className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span className="text-lg">🧹</span>
          <span>Clear Chat</span>
        </button>
      </div>

      {/* AI Website Editor Section */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            🤖 AI Website Editor
            <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
              FUTURISTIC
            </span>
          </h4>
          <button
            onClick={() => setShowAIEditor(!showAIEditor)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              showAIEditor 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            {showAIEditor ? 'Hide Editor' : 'Show Editor'}
          </button>
        </div>
        
        {showAIEditor && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-3">
                🚀 Tell the AI how you want to modify your website! It can change layouts, colors, add features, and more.
              </p>
              
              <div className="space-y-3">
                <textarea
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  placeholder="e.g., 'Make the background more futuristic with neon colors', 'Add a floating action button for quick access', 'Change the layout to be more mobile-friendly'..."
                  className="w-full h-24 px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                  disabled={isProcessingInstructions}
                />
                
                <button
                  onClick={handleAIInstructions}
                  disabled={!aiInstructions.trim() || isProcessingInstructions || backendStatus === 'disconnected'}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                    !aiInstructions.trim() || isProcessingInstructions || backendStatus === 'disconnected'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {isProcessingInstructions ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      AI is editing your website...
                    </div>
                  ) : (
                    '✨ Let AI Edit My Website'
                  )}
                </button>
              </div>
            </div>
            
            {aiResponse && (
              <div className="bg-white rounded-lg p-4 border border-green-200 border-l-4 border-l-green-500">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🤖</span>
                  <div className="flex-1">
                    <div className="font-medium text-green-800 mb-2">AI Response:</div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">⚠️</span>
                <div className="text-xs text-yellow-700">
                  <strong>Beta Feature:</strong> The AI can modify your website's appearance and layout. 
                  Changes are applied in real-time. Use "Reset Layout" in Layout Customizer to undo changes if needed.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            backendStatus === 'connected' ? 'bg-green-400 animate-pulse' :
            backendStatus === 'disconnected' ? 'bg-orange-400 animate-pulse' :
            'bg-gray-400 animate-spin'
          }`}></div>
          <span>
            {backendStatus === 'connected' ? `Backend Connected • ${provider}` :
             backendStatus === 'disconnected' ? `Direct API Mode • ${provider}` :
             'Checking connection...'}
          </span>
        </div>
        {backendStatus === 'disconnected' && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            Backend unavailable - Using direct API calls
          </div>
        )}
        {getCurrentModels().length === 0 && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
            No models available - Check API connection
          </div>
        )}
      </div>

      {/* Mode Manager Modal */}
      {showModeManager && (
        <ModeManagerSettings onClose={() => setShowModeManager(false)} />
      )}
    </div>
  )
}