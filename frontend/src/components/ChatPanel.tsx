import { useState, useEffect, useRef } from 'react'
import { useAssistantStore } from '../store/assistant'
import { apiService } from '../services/api'
import { directApiService } from '../services/directApi'
import './ChatPanel.css'

export const ChatPanel = () => {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { 
    messages, 
    mode, 
    provider, 
    model, 
    isLoading,
    addMessage, 
    setLoading 
  } = useAssistantStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    
    // Add user message to the store
    const newUserMessage = {
      content: userMessage,
      role: 'user' as const
    }
    addMessage(newUserMessage)

    setLoading(true)

    try {
      // Prepare conversation history for API
      const conversationMessages = [
        ...(Array.isArray(messages) ? messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })) : []),
        {
          role: 'user' as const,
          content: userMessage
        }
      ]

      let response
      try {
        // Try backend first
        response = await apiService.chat({
          messages: conversationMessages,
          mode,
          provider,
          model
        })
      } catch (backendError: any) {
        console.log('Backend error:', backendError)
        
        // Check if it's a rate limit error
        if (backendError.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a minute before trying again.')
        }
        
        // Check if it's a server error
        if (backendError.response?.status === 500) {
          const errorDetails = backendError.response?.data?.details || backendError.response?.data?.error
          throw new Error(`Server error: ${errorDetails || 'Unknown error'}`)
        }
        
        // If it's a network error, try direct API
        if (provider === 'openai' || provider === 'claude') {
          throw new Error('OpenAI and Claude are only available through the backend. Please use Qwen (free) instead.')
        }
        
        // Try direct API with Qwen
        response = await directApiService.chat({
          message: conversationMessages[conversationMessages.length - 1].content,
          provider: 'qwen',
          model: 'qwen-turbo'
        })
      }

      // Add assistant response
      addMessage({
        content: response.response,
        role: 'assistant',
        provider: response.provider,
        model: response.model
      })
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      addMessage({
        content: `Sorry, I encountered an error: ${errorMessage} 😅\n\nPlease try again with Qwen (free model) if you're having issues.`,
        role: 'assistant'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-panel">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="loading">
            Thinking
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
} 