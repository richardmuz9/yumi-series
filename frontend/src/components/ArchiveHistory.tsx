import React, { useState, useEffect } from 'react'

interface ArchivedChat {
  messages: Array<{
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
  }>
  timestamp: string
  provider: string
  model: string
  mode: 'agent' | 'assistant'
}

interface ArchiveHistoryProps {
  onBack: () => void
}

export const ArchiveHistory: React.FC<ArchiveHistoryProps> = ({ onBack }) => {
  const [archives, setArchives] = useState<ArchivedChat[]>([])
  const [selectedArchive, setSelectedArchive] = useState<ArchivedChat | null>(null)

  useEffect(() => {
    loadArchives()
  }, [])

  const loadArchives = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedArchives = JSON.parse(localStorage.getItem('yumi-chat-archives') || '[]')
        // Ensure savedArchives is an array and contains valid data
        if (Array.isArray(savedArchives)) {
          const validArchives = savedArchives.filter(archive => 
            archive && 
            typeof archive === 'object' && 
            Array.isArray(archive.messages)
          )
          setArchives(validArchives.reverse()) // Show newest first
        } else {
          console.warn('Invalid archives data structure, resetting')
          setArchives([])
        }
      } else {
        setArchives([])
      }
    } catch (error) {
      console.error('Error loading archives:', error)
      setArchives([])
      // Clear corrupted data
      try {
        localStorage.removeItem('yumi-chat-archives')
      } catch (cleanupError) {
        console.warn('Could not clear corrupted localStorage:', cleanupError)
      }
    }
  }

  const deleteArchive = (index: number) => {
    const updatedArchives = archives.filter((_, i) => i !== index)
    setArchives(updatedArchives)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('yumi-chat-archives', JSON.stringify(updatedArchives.reverse()))
      }
    } catch (error) {
      console.warn('Failed to update localStorage:', error)
    }
    setSelectedArchive(null)
  }

  const clearAllArchives = () => {
    if (confirm('Are you sure you want to delete all chat archives? This cannot be undone.')) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('yumi-chat-archives')
        }
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
      setArchives([])
      setSelectedArchive(null)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getProviderEmoji = (provider: string) => {
    switch (provider) {
      case 'qwen': return '🚀'
      case 'openrouter': return '🌐'
      case 'openai': return '🤖'
      default: return '⚡'
    }
  }

  if (selectedArchive) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Header */}
        <div className="border-b border-purple-100 p-4 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedArchive(null)}
              className="p-2 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">📜</span>
                Archived Chat
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>{getProviderEmoji(selectedArchive.provider)}</span>
                {selectedArchive.provider} • {selectedArchive.model} • {formatDate(selectedArchive.timestamp)}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Array.isArray(selectedArchive.messages) && selectedArchive.messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white border border-purple-100 text-gray-800 shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="border-b border-purple-100 p-4 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🗄️</span>
                Chat Archive History
              </h2>
              <p className="text-sm text-gray-600">
                {archives.length} archived conversations
              </p>
            </div>
          </div>
          {archives.length > 0 && (
            <button
              onClick={clearAllArchives}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Archive List */}
      <div className="flex-1 overflow-y-auto p-4">
        {archives.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-medium mb-2 text-purple-700">No Archived Chats</h3>
            <p className="text-sm max-w-md mx-auto">
              Your archived conversations will appear here. Start chatting and use the "Archive Chat" button to save important conversations!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(archives) && archives.map((archive, index) => (
              <div
                key={index}
                className="bg-white/80 rounded-xl border border-purple-100 p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-purple-200"
                onClick={() => setSelectedArchive(archive)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getProviderEmoji(archive.provider)}</span>
                      <span className="font-medium text-gray-800">
                        {archive.mode === 'agent' ? '🤖 Agent Mode' : '💬 Assistant Mode'}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {archive.provider}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      📅 {formatDate(archive.timestamp)}
                    </div>
                    <div className="text-sm text-gray-700">
                      {Array.isArray(archive.messages) ? archive.messages.length : 0} messages • Last: {Array.isArray(archive.messages) && archive.messages.length > 0 ? archive.messages[archive.messages.length - 1]?.content.slice(0, 100) + '...' : 'No messages'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteArchive(index)
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Archive"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 