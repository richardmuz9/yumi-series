import React, { useState, useEffect } from 'react'
import { postGeneratorService, TemplatesResponse } from '../../services/postGeneratorApi'

interface TemplateLibraryProps {
  onSelectTemplate: (template: any, platform: string) => void
  onClose: () => void
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const [templates, setTemplates] = useState<TemplatesResponse | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await postGeneratorService.getTemplates()
      setTemplates(response)
    } catch (err) {
      setError('Failed to load templates')
      console.error('Templates load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return '💼'
      case 'xiaohongshu': return '📱'
      case 'twitter': return '🐦'
      default: return '📊'
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading templates...</p>
      </div>
    )
  }

  if (error || !templates) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{error || 'Failed to load templates'}</p>
        <div className="space-x-3">
          <button
            onClick={loadTemplates}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const platforms = Object.keys(templates.platforms)
  const currentPlatform = templates.platforms[selectedPlatform]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            Template Library
          </h2>
          <p className="text-gray-600">Choose a template to get started quickly</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Platform Selector */}
      <div className="flex gap-2 overflow-x-auto">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
              selectedPlatform === platform
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-lg">{getPlatformIcon(platform)}</span>
            <span className="font-medium">{templates.platforms[platform].name}</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentPlatform.templates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-300"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{template.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {template.objective}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {template.tone}
                  </span>
                </div>
              </div>
            </div>

            {/* Template Description */}
            <p className="text-sm text-gray-600 mb-4">
              {template.template.replace(/\{[^}]+\}/g, '[placeholder]')}
            </p>

            {/* Example Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Example:</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
                {template.example}
              </div>
            </div>

            {/* Platform Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Max length: {currentPlatform.maxLength} chars</span>
              <span>Platform: {currentPlatform.name}</span>
            </div>

            {/* Use Template Button */}
            <button
              onClick={() => onSelectTemplate(template, selectedPlatform)}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium flex items-center justify-center gap-2"
            >
              <span>✨</span>
              Use This Template
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentPlatform.templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <p className="text-gray-600">No templates available for this platform yet</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Create Custom Post
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
        <h3 className="font-medium text-purple-800 mb-2">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-purple-600">{platforms.length}</div>
            <div className="text-purple-700">Platforms</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">
              {Object.values(templates.platforms).reduce((sum, p) => sum + p.templates.length, 0)}
            </div>
            <div className="text-purple-700">Templates</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">{Object.keys(templates.stylePacks).length}</div>
            <div className="text-purple-700">Style Packs</div>
          </div>
        </div>
      </div>
    </div>
  )
} 