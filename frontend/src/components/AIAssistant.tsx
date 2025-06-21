import React, { useState } from 'react'
import { useStore } from '../store'
import { useChat } from '../hooks/useChat'
import './AIAssistant.css'

const GUIDES = [
  {
    id: 'writing',
    label: '✍️ Writing Helper',
    description: 'AI-powered writing assistant for scripts, blogs, posts & creative content'
  },
  {
    id: 'anime',
    label: '🎨 Anime Character Helper',
    description: 'Step-by-step guide for creating anime characters with AI'
  }
]

interface AIAssistantProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function AIAssistant({ isOpen = true, onClose }: AIAssistantProps) {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)
  const { messages, sendMessage, isLoading } = useChat()
  const { provider, model } = useStore()

  const handleGuideSelect = (guideId: string) => {
    setSelectedGuide(guideId)
    const guide = GUIDES.find(g => g.id === guideId)
    if (guide) {
      sendMessage(`Show me how to use the ${guide.label} effectively.`)
    }
  }

  const handleSendMessage = (message: string) => {
    if (selectedGuide) {
      sendMessage(message, {
        context: {
          mode: selectedGuide,
          provider,
          model
        }
      })
    } else {
      sendMessage(message)
    }
  }

  return (
    <div className={`ai-assistant ${isOpen ? 'open' : ''}`}>
      <div className="ai-header">
        <h3>Yumi AI Assistant</h3>
        <p>Your helpful guide</p>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      {!selectedGuide && (
        <div className="guide-selection">
          {GUIDES.map(guide => (
            <button
              key={guide.id}
              className="guide-btn"
              onClick={() => handleGuideSelect(guide.id)}
            >
              <div className="guide-title">{guide.label}</div>
              <div className="guide-desc">{guide.description}</div>
            </button>
          ))}
        </div>
      )}

      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="loading">...</div>}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask me anything about Yumi-Series..."
          onKeyPress={e => e.key === 'Enter' && handleSendMessage(e.currentTarget.value)}
        />
        <button onClick={() => {
          const input = document.querySelector('.chat-input input') as HTMLInputElement
          if (input.value) handleSendMessage(input.value)
        }}>Send</button>
      </div>
    </div>
  )
} 