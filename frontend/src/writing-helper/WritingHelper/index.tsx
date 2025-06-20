import React, { useState, Suspense } from 'react'
import { ContentTypeOption } from './Shared/types'
import { useAuth } from './Shared/hooks'

// Dynamic imports for code splitting - these will be created next
const SocialMediaWizard = React.lazy(() => import('./SocialMedia/Wizard'))
const BlogArticlesWizard = React.lazy(() => import('./BlogArticles/Wizard'))
const CreativeWritingWizard = React.lazy(() => import('./CreativeWriting/Wizard'))
const GalgameScriptsWizard = React.lazy(() => import('./GalgameScripts/Wizard'))

const contentTypes: ContentTypeOption[] = [
  {
    key: 'social-media',
    title: 'Social Media Posts',
    subtitle: 'LinkedIn, Twitter, 小红书 posts',
    icon: '📱',
    description: 'Create engaging social media content optimized for different platforms'
  },
  {
    key: 'creative-writing',
    title: 'Creative Writing',
    subtitle: 'Stories, poems, scripts',
    icon: '✍️',
    description: 'Craft compelling stories, poems, and creative content'
  },
  {
    key: 'blog-article',
    title: 'Blog Articles',
    subtitle: 'Long-form articles and blogs',
    icon: '📄',
    description: 'Write detailed blog posts and long-form articles'
  },
  {
    key: 'script',
    title: 'Galgame Scripts',
    subtitle: 'Visual novel dialogues and scenes',
    icon: '🎮',
    description: 'Create immersive visual novel dialogue and scene scripts'
  }
]

const wizardComponents = {
  'social-media': SocialMediaWizard,
  'blog-article': BlogArticlesWizard,
  'creative-writing': CreativeWritingWizard,
  'script': GalgameScriptsWizard
}

interface WritingHelperProps {
  onBackToMain?: () => void
}

const WritingHelper: React.FC<WritingHelperProps> = ({ onBackToMain }) => {
  const [selectedType, setSelectedType] = useState<ContentTypeOption['key'] | null>(null)
  const { user, isAuthenticated, authLoading, isDemoMode } = useAuth()

  // Content Type Selection Screen
  if (!selectedType) {
    return (
      <div className="writing-helper-selection min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-5">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center text-white mb-10 relative">
            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="absolute top-0 left-0 px-6 py-3 bg-white/90 border-none rounded-full text-indigo-600 font-bold cursor-pointer transition-all duration-300 hover:bg-white hover:-translate-x-1"
              >
                ← Back to Main
              </button>
            )}
            
            <div className="pt-16">
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                ✒️ Writing Helper
              </h1>
              <h2 className="text-xl mb-4 opacity-90">
                書き助 - Your Creative Writing Companion
              </h2>
              <p className="text-lg opacity-80">
                Choose the type of content you want to create
              </p>
            </div>

            {/* Authentication Status */}
            <div className="absolute top-0 right-0 px-4 py-2 bg-white/10 rounded-2xl text-sm backdrop-blur-sm">
              {authLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Checking...</span>
                </div>
              ) : isDemoMode ? (
                <div>🎭 Demo Mode</div>
              ) : isAuthenticated && user ? (
                <div>👤 {user.username} | {user.tokensRemaining} tokens</div>
              ) : (
                <div>⚠️ Guest Mode</div>
              )}
            </div>
          </div>

          {/* Content Type Options */}
          <div className="bg-white/95 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800">
              🎯 What type of content are you creating?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {contentTypes.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelectedType(option.key)}
                  className={`bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 text-left flex items-start gap-4 hover:border-indigo-500 hover:-translate-y-1 hover:shadow-lg ${
                    option.key === 'creative-writing' 
                      ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-4xl flex-shrink-0">{option.icon}</div>
                  <div>
                    <h4 className="text-xl font-bold mb-1 text-gray-900">{option.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{option.subtitle}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Selected Wizard
  const WizardComponent = wizardComponents[selectedType]
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-gray-200 gap-5">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-lg text-gray-700">
          Loading {contentTypes.find(t => t.key === selectedType)?.title} wizard...
        </p>
      </div>
    }>
      <WizardComponent onBack={() => setSelectedType(null)} />
    </Suspense>
  )
}

export default WritingHelper
