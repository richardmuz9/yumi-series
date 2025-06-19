import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { getLocalAnswer } from '../utils/faqResponses'

interface AIAssistantProps {
  onClose: () => void
}

type AssistantMode = 'chat' | 'models' | 'help' | 'billing' | 'feedback'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ModelInfo {
  id: string
  name: string
  provider: string
  cost: number
  description: string
  strengths: string[]
  useCases: string[]
  speed: 'Fast' | 'Medium' | 'Slow'
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  const [mode, setMode] = useState<AssistantMode>('chat')
  const [isAnimating, setIsAnimating] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your enhanced Yumi AI Assistant! I can help you with:\n\n⚡ **Instant Answers** - Common questions answered immediately\n🤖 **Model Selection** - Find the perfect AI model\n📚 **How-to Guides** - Learn to use all Yumi features\n💰 **Billing Questions** - Understand our pricing\n📝 **Feedback** - Share your thoughts\n\nTry asking about "pricing", "free models", "how to start", or any Yumi feature!',
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackCategory, setFeedbackCategory] = useState('general')

  // Robot animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Predefined knowledge base
  const knowledgeBase = {
    models: {
      'model selection': 'I can help you choose the perfect AI model! Here are our recommendations:\n\n🆓 **Free Models**: Google Gemini 2.5 Pro, Llama 3 70B\n⚡ **Fast & Cheap**: GPT-4o mini, Qwen Turbo\n🧠 **Most Capable**: GPT-4o, Claude 3.5 Sonnet\n🎯 **Best Value**: GPT-4o mini for most tasks\n\nWhat type of task are you working on?',
      'free models': 'Great choice! Our free models include:\n\n🌟 **Google Gemini 2.5 Pro** - Multimodal, latest tech\n🦙 **Meta Llama 3 70B** - Powerful reasoning\n🔥 **Mistral 7B** - European AI, efficient\n🧙 **WizardLM 2** - Great instruction following\n\nThese models are completely free with some rate limits.',
      'paid models': 'Our premium models offer the best performance:\n\n🤖 **GPT-4o** - Most advanced, multimodal\n🧠 **Claude 3.5 Sonnet** - Excellent reasoning\n⚡ **GPT-4o mini** - Best value for money\n🚀 **Qwen models** - Great for Chinese content\n\nPricing starts at $0.15/1K tokens with our 3x sustainable markup.'
    },
    features: {
      'writing helper': '✍️ **Writing Helper** makes content creation easy!\n\n**How to use:**\n1. Choose your platform (Twitter, LinkedIn, etc.)\n2. Select audience & objective\n3. Pick tone & style\n4. Add your topic & key points\n5. Click Generate!\n\n**Pro Tips:**\n• Use anime personas for unique voice\n• Enable variations for multiple options\n• Add trending hashtags for reach',
      'web builder': '🌐 **Web Builder** creates websites with AI!\n\n**Steps:**\n1. Describe your website idea\n2. AI generates HTML/CSS/JS\n3. Preview in real-time\n4. Make edits with natural language\n5. Download or deploy\n\n**Perfect for:**\n• Landing pages\n• Portfolios\n• Small business sites\n• Prototypes',
      'study advisor': '📚 **Study Advisor** is your learning companion!\n\n**Features:**\n• Personalized study plans\n• University recommendations\n• Course suggestions\n• Progress tracking\n• AI tutoring\n\n**How it works:**\n1. Input your goals & subjects\n2. Get customized study plan\n3. Track progress daily\n4. Ask questions anytime',
      'anime character helper': '🎭 **Anime Character Helper** brings stories to life!\n\n**Create:**\n• Character profiles\n• Personality traits\n• Story outlines\n• Dialogue scenes\n• Art descriptions\n\n**Tools:**\n• Template library\n• Character chat\n• Progress analyzer\n• Canvas area for notes',
      'report writer': '📄 **Report Writer** for academic & professional reports!\n\n**Features:**\n• LaTeX support\n• Research integration\n• Citation management\n• Collaboration tools\n• Professional formatting\n\n**Great for:**\n• Academic papers\n• Business reports\n• Research documents\n• Technical writing'
    },
    billing: {
      'pricing': '💰 **Yumi Pricing** - Transparent & Fair\n\n🆓 **Free Tier:**\n• 1M Qwen tokens/month\n• 50 OpenRouter requests/day\n• All features included\n\n💎 **Monthly Pro ($10/month):**\n• 35K tokens daily\n• Unlimited access\n• Premium models\n• Priority support\n\n💳 **Pay-as-you-go:**\n• $5+ credit top-ups\n• Only pay for what you use\n• No monthly commitment',
      'subscription': '📅 **Monthly Pro Subscription** gives you:\n\n✅ 35,000 tokens daily (1M+ monthly)\n✅ Access to all premium models\n✅ No rate limits\n✅ Priority support\n✅ Early access to new features\n\n**Value:** $40+ worth of tokens for just $10!\n\nPerfect for regular users, content creators, and professionals.',
      'tokens': '🎯 **Understanding Tokens**\n\n**What are tokens?**\nTokens are how AI models process text. ~4 characters = 1 token.\n\n**Examples:**\n• "Hello world" = ~3 tokens\n• Average email = ~200 tokens\n• Blog post = ~1,000 tokens\n\n**Your allowances:**\n• Free: 1M Qwen tokens/month\n• Pro: 35K mixed tokens/day\n• Credits: Pay per use',
      'credits': '💳 **Credits System**\n\nCredits = Direct payment for premium models\n\n**When used:**\n• When free limits are reached\n• For premium models (GPT-4, Claude)\n• For high-usage scenarios\n\n**Pricing:**\n• Minimum $5 top-up\n• Transparent per-token pricing\n• No expiration'
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)

    try {
      // First, try local FAQ responses for instant answers
      let response = getLocalAnswer(currentMessage)
      
      // If no local answer, check knowledge base
      if (!response) {
        response = handleKnowledgeQuery(currentMessage)
      }
      
      // If still no answer, fallback to AI API
      if (!response) {
        const aiResponse = await apiService.chat({
          messages: [
            {
              role: 'user',
              content: 'You are Yumi AI Assistant, helping users with Yumi-Series platform. Be helpful, friendly, and concise. Focus on Yumi features: Writing Helper, Web Builder, Study Advisor, Anime Character Helper, Report Writer. Explain billing clearly.'
            },
            ...chatMessages.slice(-5), // Last 5 messages for context
            userMessage
          ],
          mode: 'assistant',
          provider: 'qwen',
          model: 'google/gemini-2.5-pro'
        })
        response = aiResponse.response
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Assistant error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '😅 Sorry, I\'m having trouble connecting right now. But I can still help with Yumi-Series questions! Try asking about our features or billing.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKnowledgeQuery = (query: string): string | null => {
    const lowerQuery = query.toLowerCase()
    
    // Check all knowledge categories
    for (const [, items] of Object.entries(knowledgeBase)) {
      for (const [key, value] of Object.entries(items)) {
        if (lowerQuery.includes(key) || 
            key.split(' ').some(word => lowerQuery.includes(word))) {
          return value
        }
      }
    }

    // Common questions
    if (lowerQuery.includes('how') && lowerQuery.includes('use')) {
      return '🛠️ **How to Use Yumi-Series:**\n\n1. **Choose a tool** from the main menu\n2. **Follow the guided steps** in each tool\n3. **Customize settings** to your needs\n4. **Generate with AI** and refine\n5. **Export or save** your results\n\nWhich specific tool would you like help with?'
    }

    if (lowerQuery.includes('error') || lowerQuery.includes('problem')) {
      return '🔧 **Having Issues?**\n\nCommon solutions:\n• Refresh the page\n• Check your internet connection\n• Try a different model\n• Clear browser cache\n\nIf problems persist, use the feedback option to report it!'
    }

    return null
  }

  const handleFeedback = async () => {
    if (!feedbackText.trim()) return

    try {
      // In a real app, send to backend
      console.log('Feedback submitted:', { category: feedbackCategory, text: feedbackText })
      
      setFeedbackText('')
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '✅ Thank you for your feedback! We really appreciate it and will use it to improve Yumi-Series. Your input helps us make the platform better for everyone! 🙏',
        timestamp: new Date()
      }])
      setMode('chat')
    } catch (error) {
      console.error('Feedback error:', error)
    }
  }

  const quickActions = [
    { label: '🤖 Model Help', action: () => setMode('models') },
    { label: '📚 How-to Guide', action: () => setMode('help') },
    { label: '💰 Billing Info', action: () => setMode('billing') },
    { label: '📝 Feedback', action: () => setMode('feedback') }
  ]

  const faqSuggestions = [
    { label: '💰 Pricing', query: 'What is your pricing?' },
    { label: '🆓 Free tier', query: 'Tell me about the free tier' },
    { label: '📱 How to install', query: 'How do I install the app?' },
    { label: '🚀 Getting started', query: 'How to start using Yumi?' },
    { label: '🌍 Change language', query: 'How to change language?' },
    { label: '🤖 Which model', query: 'Which AI model should I use?' }
  ]

  const renderContent = () => {
    switch (mode) {
      case 'models':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">🤖 AI Model Guide</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">🆓 Free Models</h4>
                <p className="text-sm text-green-700">Google Gemini 2.5 Pro, Llama 3 70B, Mistral 7B</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">⚡ Best Value</h4>
                <p className="text-sm text-blue-700">GPT-4o mini - Fast, capable, affordable</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800">🧠 Most Capable</h4>
                <p className="text-sm text-purple-700">GPT-4o, Claude 3.5 Sonnet - Premium quality</p>
              </div>
            </div>
            <button 
              onClick={() => setMode('chat')}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Ask About Specific Models
            </button>
          </div>
        )

      case 'help':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">📚 Yumi-Series Guide</h3>
            <div className="space-y-2">
              {[
                '✍️ Writing Helper - Social media content',
                '🌐 Web Builder - Create websites with AI', 
                '📚 Study Advisor - Learning companion',
                '🎭 Anime Character Helper - Story creation',
                '📄 Report Writer - Academic & professional'
              ].map((feature, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentMessage(`How to use ${feature.split(' - ')[0]}`)
                    setMode('chat')
                    handleSendMessage()
                  }}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">💰 Billing & Pricing</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">🆓 Free Tier</h4>
                <p className="text-sm text-green-700">1M Qwen tokens/month + 50 OpenRouter requests/day</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">💎 Monthly Pro - $10</h4>
                <p className="text-sm text-blue-700">35K tokens daily + unlimited access</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800">💳 Pay-as-you-go</h4>
                <p className="text-sm text-purple-700">$5+ credits for premium models</p>
              </div>
            </div>
            <button 
              onClick={() => setMode('chat')}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Ask Billing Questions
            </button>
          </div>
        )

      case 'feedback':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">📝 Your Feedback</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="billing">Billing Issue</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think, report issues, or suggest improvements..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 h-32 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFeedback}
                disabled={!feedbackText.trim()}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setMode('chat')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )

      default: // chat mode
        return (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FAQ Quick Suggestions */}
            {chatMessages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600 font-medium">💡 Try these common questions:</p>
                <div className="grid grid-cols-2 gap-1">
                  {faqSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        setCurrentMessage(suggestion.query)
                        // Trigger sending the message
                        const userMessage: ChatMessage = {
                          role: 'user',
                          content: suggestion.query,
                          timestamp: new Date()
                        }
                        setChatMessages(prev => [...prev, userMessage])
                        setCurrentMessage('')
                        setIsLoading(true)

                        try {
                          const response = getLocalAnswer(suggestion.query) || 
                                         handleKnowledgeQuery(suggestion.query) ||
                                         'Let me help you with that! Can you provide more details?'
                          
                          const assistantMessage: ChatMessage = {
                            role: 'assistant',
                            content: response,
                            timestamp: new Date()
                          }
                          setChatMessages(prev => [...prev, assistantMessage])
                        } catch (error) {
                          console.error('FAQ error:', error)
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                      className="p-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-left"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about Yumi-Series..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      {/* AI Assistant Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`text-2xl transition-transform duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
                  🤖
                </div>
                <div>
                  <h2 className="font-bold">Yumi AI Assistant</h2>
                  <p className="text-sm opacity-90">Your helpful guide</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  )
}

export default AIAssistant 