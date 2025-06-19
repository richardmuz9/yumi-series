import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import './ModelIntroduction.css'

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

interface ModelIntroductionProps {
  onClose: () => void
}

const ModelIntroduction: React.FC<ModelIntroductionProps> = ({ onClose }) => {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [isChatting, setIsChatting] = useState(false)

  // Model descriptions database - All available models
  const modelDescriptions: Record<string, Omit<ModelInfo, 'id' | 'name' | 'provider' | 'category' | 'cost'>> = {
    // OpenRouter Free Models
    'meta-llama/llama-3.1-8b-instruct:free': {
      description: 'Meta\'s latest Llama 3.1 model with improved reasoning and longer context.',
      strengths: ['Latest Llama version', 'Free to use', 'Good reasoning', 'Long context'],
      useCases: ['General chat', 'Programming', 'Content creation', 'Analysis'],
      limitations: ['Rate limits on free tier', '8B parameters'],
      speed: 'Fast',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese']
    },
    'meta-llama/llama-3.1-70b-instruct:free': {
      description: 'Meta\'s powerful 70B parameter Llama 3.1 model, available for free.',
      strengths: ['Very large model', 'Excellent reasoning', 'Free to use', 'Latest technology'],
      useCases: ['Complex reasoning', 'Research', 'Advanced coding', 'Creative writing'],
      limitations: ['Rate limits', 'Slower due to size', 'Queue times'],
      speed: 'Slow',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese']
    },
    'microsoft/wizardlm-2-8x22b:free': {
      description: 'Microsoft\'s advanced mixture-of-experts model with excellent instruction following.',
      strengths: ['Excellent instruction following', 'Free to use', 'MoE architecture', 'Versatile'],
      useCases: ['Complex instructions', 'Analysis', 'Problem solving', 'Research'],
      limitations: ['Rate limits on free tier', 'Variable response time'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['English', 'Chinese', 'Spanish', 'French']
    },
    'google/gemma-2-9b-it:free': {
      description: 'Google\'s updated Gemma 2 model with improved capabilities and conversation skills.',
      strengths: ['Latest Gemma version', 'Free to use', 'Good for chat', 'Google technology'],
      useCases: ['Chatbots', 'Q&A', 'Content creation', 'Conversation'],
      limitations: ['Mid-size model', 'Rate limits', 'Basic reasoning'],
      speed: 'Fast',
      accuracy: 'Medium',
      languages: ['English', 'Spanish', 'French', 'German']
    },
    'mistralai/mistral-7b-instruct:free': {
      description: 'Mistral AI\'s efficient 7B parameter model with excellent performance-to-size ratio.',
      strengths: ['Balanced performance', 'Free to use', 'European AI', 'Efficient'],
      useCases: ['General purpose', 'Content creation', 'Simple coding', 'Analysis'],
      limitations: ['Smaller model', 'Rate limits', 'Limited reasoning'],
      speed: 'Fast',
      accuracy: 'Medium',
      languages: ['English', 'French', 'Spanish', 'German', 'Italian']
    },
    'huggingfaceh4/zephyr-7b-beta:free': {
      description: 'HuggingFace\'s community-trained model optimized for helpful responses.',
      strengths: ['Helpful responses', 'Free to use', 'Open source', 'Community driven'],
      useCases: ['General chat', 'Q&A', 'Learning', 'Simple tasks'],
      limitations: ['Beta version', 'Limited capabilities', 'Smaller model'],
      speed: 'Fast',
      accuracy: 'Medium',
      languages: ['English', 'Spanish', 'French']
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
    'qwen-vl-plus': {
      description: 'Qwen\'s vision-language model capable of understanding images and text.',
      strengths: ['Vision + Language', 'Good Chinese', 'Multimodal', 'Image analysis'],
      useCases: ['Image analysis', 'Visual Q&A', 'Content creation', 'OCR tasks'],
      limitations: ['More complex', 'Higher cost', 'Specialized use case'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['Chinese', 'English', 'Japanese']
    },
    'qwen-vl-max': {
      description: 'Qwen\'s most advanced vision-language model with superior image understanding.',
      strengths: ['Best vision capabilities', 'Excellent Chinese', 'Advanced multimodal', 'High accuracy'],
      useCases: ['Complex image analysis', 'Advanced visual tasks', 'Research', 'Professional use'],
      limitations: ['High cost', 'Specialized', 'Slower processing'],
      speed: 'Slow',
      accuracy: 'High',
      languages: ['Chinese', 'English', 'Japanese']
    },
    'qwen2-72b-instruct': {
      description: 'Large 72B parameter Qwen model with excellent reasoning and Chinese capabilities.',
      strengths: ['Large model', 'Excellent Chinese', 'Good reasoning', 'Instruction following'],
      useCases: ['Complex Chinese tasks', 'Research', 'Advanced analysis', 'Professional writing'],
      limitations: ['Higher cost', 'Slower speed', 'Resource intensive'],
      speed: 'Medium',
      accuracy: 'High',
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
    'gpt-4-turbo': {
      description: 'OpenAI\'s fast GPT-4 variant optimized for speed and efficiency.',
      strengths: ['GPT-4 quality', 'Faster than base GPT-4', 'Reliable', 'Proven model'],
      useCases: ['Professional tasks', 'Complex reasoning', 'Content creation', 'Code review'],
      limitations: ['Premium pricing', 'Not the latest version', 'Cost considerations'],
      speed: 'Fast',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese']
    },
    'gpt-4': {
      description: 'OpenAI\'s flagship large language model with exceptional reasoning capabilities.',
      strengths: ['Excellent reasoning', 'Proven reliability', 'High quality', 'Versatile'],
      useCases: ['Complex analysis', 'Research', 'Professional writing', 'Problem solving'],
      limitations: ['Higher cost', 'Slower than Turbo', 'Rate limits'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese']
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

    // Anthropic Models
    'claude-3-5-sonnet-20241022': {
      description: 'Anthropic\'s latest and most capable Claude model with excellent reasoning.',
      strengths: ['Latest Claude', 'Excellent reasoning', 'Long context', 'Safe responses'],
      useCases: ['Complex analysis', 'Research', 'Professional writing', 'Code review'],
      limitations: ['Premium pricing', 'Anthropic-specific availability', 'Regional limits'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Chinese']
    },
    'claude-3-5-haiku-20241022': {
      description: 'Anthropic\'s fastest Claude model, optimized for speed while maintaining quality.',
      strengths: ['Very fast', 'Good quality', 'Cost effective', 'Latest Haiku'],
      useCases: ['Quick responses', 'General chat', 'Simple tasks', 'Content creation'],
      limitations: ['Less capable than Sonnet', 'Focused on speed', 'Simpler reasoning'],
      speed: 'Fast',
      accuracy: 'Medium',
      languages: ['English', 'Spanish', 'French', 'German']
    },
    'claude-3-opus-20240229': {
      description: 'Anthropic\'s most powerful Claude 3 model with exceptional capabilities.',
      strengths: ['Most capable Claude 3', 'Excellent reasoning', 'Creative', 'High quality'],
      useCases: ['Complex tasks', 'Research', 'Creative writing', 'Analysis'],
      limitations: ['High cost', 'Slower speed', 'Premium tier'],
      speed: 'Slow',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German', 'Chinese']
    },
    'claude-3-sonnet-20240229': {
      description: 'Anthropic\'s balanced Claude 3 model offering good performance and efficiency.',
      strengths: ['Balanced performance', 'Good reasoning', 'Reliable', 'Claude 3 quality'],
      useCases: ['General purpose', 'Analysis', 'Content creation', 'Professional tasks'],
      limitations: ['Mid-tier pricing', 'Not the fastest', 'Not the most capable'],
      speed: 'Medium',
      accuracy: 'High',
      languages: ['English', 'Spanish', 'French', 'German']
    },
    'claude-3-haiku-20240307': {
      description: 'Anthropic\'s efficient Claude 3 model designed for speed and cost-effectiveness.',
      strengths: ['Fast responses', 'Cost effective', 'Reliable', 'Good for chat'],
      useCases: ['Quick Q&A', 'General chat', 'Simple tasks', 'Content assistance'],
      limitations: ['Basic capabilities', 'Limited reasoning', 'Simpler model'],
      speed: 'Fast',
      accuracy: 'Medium',
      languages: ['English', 'Spanish', 'French']
    }
  }

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      setLoading(true)
      
      // Fallback models from SettingsPanel
      const fallbackModels = {
        qwen: [
          'qwen-turbo',
          'qwen-vl-plus',
          'qwen-vl-max',
          'qwen2-72b-instruct',
          'qwen2.5-72b-instruct'
        ],
        openrouter: [
          'meta-llama/llama-3.1-8b-instruct:free',
          'microsoft/wizardlm-2-8x22b:free',
          'google/gemma-2-9b-it:free',
          'mistralai/mistral-7b-instruct:free',
          'huggingfaceh4/zephyr-7b-beta:free',
          'meta-llama/llama-3.1-70b-instruct:free'
        ],
        openai: [
          'gpt-4o',
          'gpt-4o-mini',
          'gpt-4-turbo',
          'gpt-4',
          'gpt-3.5-turbo'
        ],
        anthropic: [
          'claude-3-5-sonnet-20241022',
          'claude-3-5-haiku-20241022', 
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307'
        ]
      }

      try {
        const response = await fetch('/api/models', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // Transform the models data from API
          const allModels: ModelInfo[] = []
          
          if (data.models && Array.isArray(data.models)) {
            data.models.forEach((model: any) => {
              const description = modelDescriptions[model.id] || {
                description: 'AI model for various tasks',
                strengths: ['General purpose'],
                useCases: ['Various tasks'],
                limitations: ['Limited information available'],
                speed: 'Medium' as const,
                accuracy: 'Medium' as const,
                languages: ['English']
              }
              
              allModels.push({
                id: model.id,
                name: model.name,
                provider: model.provider,
                category: model.category,
                cost: model.cost,
                ...description
              })
            })
          }
          
          setModels(allModels)
          return
        }
      } catch (error) {
        console.warn('API models unavailable, using fallback models:', error)
      }

      // Use fallback models when API is unavailable
      const allModels: ModelInfo[] = []
      
      Object.entries(fallbackModels).forEach(([provider, modelList]) => {
        modelList.forEach((modelId: string) => {
          const description = modelDescriptions[modelId] || {
            description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} AI model for various tasks`,
            strengths: ['General purpose', 'Reliable performance'],
            useCases: ['Chat', 'Content creation', 'Analysis'],
            limitations: ['Standard limitations apply'],
            speed: 'Medium' as const,
            accuracy: 'High' as const,
            languages: ['English']
          }
          
          allModels.push({
            id: modelId,
            name: modelId.split('/').pop() || modelId,
            provider: provider,
            category: 'Language Model',
            cost: provider === 'openrouter' && modelId.includes(':free') ? 0 : 1,
            ...description
          })
        })
      })
      
      setModels(allModels)
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || isChatting) return

    const userMessage = chatMessage.trim()
    setChatMessage('')
    setIsChatting(true)

    // Add user message to chat
    const newHistory = [...chatHistory, { role: 'user' as const, content: userMessage }]
    setChatHistory(newHistory)

    try {
      // Create a prompt for model recommendation
      const systemPrompt = `You are an AI model expert. Based on the user's needs, recommend the best AI model from our available options. 

Available models:
${models.map(m => `- ${m.name} (${m.provider}): ${m.description} - Cost: ${m.cost} tokens - Speed: ${m.speed} - Accuracy: ${m.accuracy}`).join('\n')}

User query: "${userMessage}"

Provide a recommendation in this format:
**Recommended Model:** [Model Name]
**Reason:** [Brief explanation why this model fits their needs]
**Alternative:** [Alternative model if applicable]

Be concise and helpful.`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: systemPrompt,
          provider: 'qwen',
          model: 'qwen-turbo',
          mode: 'assistant'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendation')
      }

      const result = await response.json()
      const assistantMessage = result.message || 'Sorry, I couldn\'t provide a recommendation at this time.'

      setChatHistory([...newHistory, { role: 'assistant', content: assistantMessage }])
    } catch (error) {
      console.error('Chat error:', error)
      setChatHistory([...newHistory, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.' 
      }])
    } finally {
      setIsChatting(false)
    }
  }

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.provider.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = filterCategory === 'All' || model.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ['All', ...Array.from(new Set(models.map(m => m.category)))]

  const getCostColor = (cost: number) => {
    if (cost === 0) return '#10b981' // green for free
    if (cost <= 3) return '#f59e0b' // yellow for low cost
    if (cost <= 6) return '#f97316' // orange for medium cost
    return '#ef4444' // red for high cost
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'Fast': return '#10b981'
      case 'Medium': return '#f59e0b'
      case 'Slow': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="model-intro-overlay">
        <div className="model-intro-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading AI models...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="model-intro-overlay">
      <div className="model-intro-container">
        <div className="model-intro-header">
          <h2>🤖 AI Model Guide</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="model-intro-content">
          {/* Search and Filter */}
          <div className="model-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-filter"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="model-layout">
            {/* Models List */}
            <div className="models-list">
              <h3>Available Models ({filteredModels.length})</h3>
              <div className="models-grid">
                {filteredModels.map(model => (
                  <div
                    key={model.id}
                    className={`model-card ${selectedModel?.id === model.id ? 'selected' : ''}`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <div className="model-card-header">
                      <h4>{model.name}</h4>
                      <span className="model-provider">{model.provider}</span>
                    </div>
                    <p className="model-description">{model.description}</p>
                    <div className="model-stats">
                      <div className="stat">
                        <span className="stat-label">Cost:</span>
                        <span 
                          className="stat-value"
                          style={{ color: getCostColor(model.cost) }}
                        >
                          {model.cost === 0 ? 'Free' : `${model.cost} tokens`}
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Speed:</span>
                        <span 
                          className="stat-value"
                          style={{ color: getSpeedColor(model.speed) }}
                        >
                          {model.speed}
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Accuracy:</span>
                        <span className="stat-value">{model.accuracy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Details */}
            <div className="model-details">
              {selectedModel ? (
                <div className="model-detail-content">
                  <h3>{selectedModel.name}</h3>
                  <p className="model-detail-description">{selectedModel.description}</p>
                  
                  <div className="detail-section">
                    <h4>✨ Strengths</h4>
                    <ul>
                      {selectedModel.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h4>🎯 Best Use Cases</h4>
                    <ul>
                      {selectedModel.useCases.map((useCase, index) => (
                        <li key={index}>{useCase}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h4>⚠️ Limitations</h4>
                    <ul>
                      {selectedModel.limitations.map((limitation, index) => (
                        <li key={index}>{limitation}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h4>🌍 Supported Languages</h4>
                    <div className="language-tags">
                      {selectedModel.languages.map((lang, index) => (
                        <span key={index} className="language-tag">{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <h3>Select a model to see details</h3>
                  <p>Click on any model card to learn more about its capabilities and use cases.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Assistant */}
          <div className="chat-assistant">
            <h3>🤔 Need Help Choosing? Ask Qwen!</h3>
            <div className="chat-container">
              <div className="chat-messages">
                {chatHistory.length === 0 ? (
                  <div className="chat-placeholder">
                    <p>👋 Hi! I'm here to help you choose the best AI model for your needs.</p>
                    <p>Just describe what you want to do, and I'll recommend the perfect model!</p>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.role}`}>
                      <div className="message-content">{msg.content}</div>
                    </div>
                  ))
                )}
                {isChatting && (
                  <div className="chat-message assistant">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  placeholder="e.g., 'I need help with Chinese content creation' or 'I want fast responses for customer service'"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  className="chat-input"
                  disabled={isChatting}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatMessage.trim() || isChatting}
                  className="send-btn"
                >
                  {isChatting ? '⏳' : '📤'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelIntroduction 