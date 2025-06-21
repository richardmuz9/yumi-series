import { useState, useCallback } from 'react'
import { apiClient } from '../services/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatContext {
  mode?: string
  provider?: string
  model?: string
}

interface ChatResponse {
  message: string
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string, options?: { context?: ChatContext }) => {
    try {
      setIsLoading(true)

      // Add user message to chat
      const userMessage: Message = { role: 'user', content }
      setMessages(prev => [...prev, userMessage])

      // Send to API
      const response = await apiClient.post<ChatResponse>('/api/chat', {
        message: content,
        context: options?.context
      })

      // Add assistant response to chat
      const assistantMessage: Message = { role: 'assistant', content: response.message }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    messages,
    sendMessage,
    isLoading
  }
} 