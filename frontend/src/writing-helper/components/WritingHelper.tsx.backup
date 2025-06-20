import React, { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { PlatformSelector } from './PlatformSelector'
import { ObjectiveSelector } from './ObjectiveSelector'
import { StyleSelector } from './StyleSelector'
import { ContentInputs } from './ContentInputs'
import { TrendingHooks } from './TrendingHooks'
import { TemplateLibrary } from './TemplateLibrary'
import { PostPreview } from './PostPreview'
import { AnimePersonaSelector } from './AnimePersonaSelector'
import { PostVariations } from './PostVariations'
import { postGeneratorService } from '../../services/postGeneratorApi'
import { authService, User } from '../../services/api'
import ImageUpload from '../../components/ImageUpload'
import SpeechToText from '../../components/SpeechToText'
import writingHelperData from '../../data/writingHelperData.json'
import IconButton from '../../components/IconButton'

interface PostVariation {
  id: string
  content: string
  changes: string[]
  confidence: number
}

interface WritingHelperState {
  step: number
  contentType: 'social-media' | 'creative-writing' | 'blog-article' | 'script'
  platform: string
  audience: string
  objective: string
  tone: string
  stylePack: string
  animePersona: string
  topic: string
  keyPoints: string[]
  pastPost: string
  trendingHashtags: string[]
  customInstructions: string
  showTemplates: boolean
  isGenerating: boolean
  generatedPost: string
  characterCount: number
  maxLength: number
  withinLimit: boolean
  uploadedImages: Array<{file: File, preview: string, analysis?: string}>
  showImageUpload: boolean
  showSpeechToText: boolean
  speechTranscript: string
  showAnimePersona: boolean
  generateVariations: boolean
  variations: PostVariation[]
  selectedVariation: PostVariation | null
}

const WritingHelper: React.FC = () => {
  const { provider, model, setLoading } = useStore()
  
  // Additional UI state for futuristic interface
  const [quickActionMode, setQuickActionMode] = useState(false)
  
  // Authentication state
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  
  const [state, setState] = useState<WritingHelperState>({
    step: 1,
    contentType: 'social-media',
    platform: 'linkedin',
    audience: 'industry_peers',
    objective: 'Introduce product',
    tone: 'Professional',
    stylePack: 'professional',
    animePersona: '',
    topic: '',
    keyPoints: [],
    pastPost: '',
    trendingHashtags: [],
    customInstructions: '',
    showTemplates: false,
    isGenerating: false,
    generatedPost: '',
    characterCount: 0,
    maxLength: 3000,
    withinLimit: true,
    uploadedImages: [],
    showImageUpload: false,
    showSpeechToText: false,
    speechTranscript: '',
    showAnimePersona: false,
    generateVariations: false,
    variations: [],
    selectedVariation: null
  })

  // Authentication and demo mode handling
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Check for demo mode
        const urlParams = new URLSearchParams(window.location.search)
        const isDemo = urlParams.get('demo') === 'true'
        
        if (isDemo) {
          console.log('[WritingHelper] Demo mode activated')
          setIsDemoMode(true)
          setIsAuthenticated(true)
          setUser({
            id: -1,
            email: 'demo@example.com',
            username: 'Demo User',
            tokensRemaining: 1000,
            totalTokensUsed: 0,
            freeTokensUsedThisMonth: 0,
            subscriptionStatus: 'free',
            createdAt: new Date().toISOString()
          })
          setAuthLoading(false)
          return
        }

        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          console.log('[WritingHelper] User already authenticated, fetching profile')
          const profileResponse = await authService.getProfile()
          
          if (profileResponse.success && profileResponse.user) {
            setUser(profileResponse.user)
            setIsAuthenticated(true)
            console.log('[WritingHelper] Profile loaded successfully')
          } else {
            console.warn('[WritingHelper] Failed to load profile:', profileResponse.error)
            setIsAuthenticated(false)
          }
        } else {
          console.log('[WritingHelper] User not authenticated')
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('[WritingHelper] Authentication check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  const updateState = (updates: Partial<WritingHelperState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    setState(prev => ({ ...prev, step: prev.step + 1 }))
  }

  const prevStep = () => {
    setState(prev => ({ ...prev, step: prev.step - 1 }))
  }

  // Quick action to jump directly to content creation
  const startQuickCreate = () => {
    setQuickActionMode(true)
    setState(prev => ({ ...prev, step: 5 })) // Jump to topic input
    // setCurrentView('create')
  }

  // 3D micro-interaction for buttons
  const handleButtonPress = (e: React.MouseEvent) => {
    const button = e.currentTarget as HTMLElement
    button.style.transform = 'scale(0.95) translateZ(-10px)'
    setTimeout(() => {
      button.style.transform = 'scale(1) translateZ(0px)'
    }, 150)
  }

  const generatePost = async () => {
    if (!state.topic.trim()) return

    updateState({ isGenerating: true, variations: [], selectedVariation: null })
    setLoading(true)

    try {
      let response
      
      if (state.contentType === 'social-media') {
        // Use existing post generator for social media
        response = await postGeneratorService.generatePost({
          platform: state.platform,
          audience: state.audience,
          objective: state.objective,
          tone: state.tone,
          stylePack: state.stylePack,
          animePersona: state.animePersona || undefined,
          topic: state.topic,
          keyPoints: state.keyPoints,
          pastPost: state.pastPost || undefined,
          trendingHashtags: state.trendingHashtags,
          customInstructions: state.customInstructions || undefined,
          generateVariations: state.generateVariations,
          variationCount: 3,
          model,
          provider
        })
        
        const updates: Partial<WritingHelperState> = {
          generatedPost: response.post,
          characterCount: response.characterCount || response.post.length,
          maxLength: response.maxLength || 3000,
          withinLimit: response.withinLimit ?? true
        }

        // Handle variations if they exist
        if (response.variations && response.variations.length > 0) {
          updates.variations = response.variations
        }

        updateState(updates)
      } else {
        // Use enhanced writing helper for other content types
        response = await postGeneratorService.generateContent({
          contentType: state.contentType,
          platform: state.platform,
          audience: state.audience,
          objective: state.objective,
          tone: state.tone,
          stylePack: state.stylePack,
          animePersona: state.animePersona || undefined,
          topic: state.topic,
          keyPoints: state.keyPoints,
          pastPost: state.pastPost || undefined,
          trendingHashtags: state.trendingHashtags,
          customInstructions: state.customInstructions || undefined,
          generateVariations: state.generateVariations,
          variationCount: 3,
          model,
          provider
        })

        const updates: Partial<WritingHelperState> = {
          generatedPost: response.content,
          characterCount: response.characterCount || response.content.length,
          maxLength: response.maxLength || 10000,
          withinLimit: response.withinLimit ?? true
        }

        // Handle variations if they exist
        if (response.variations && response.variations.length > 0) {
          updates.variations = response.variations
        }

        updateState(updates)
      }
      
      // Auto-switch to preview mode after generation
      // setCurrentView('preview')
    } catch (error) {
      console.error('Content generation error:', error)
      updateState({
        generatedPost: 'Sorry, there was an error generating your content. Please try again.'
      })
    } finally {
      updateState({ isGenerating: false })
      setLoading(false)
    }
  }

  const resetWizard = () => {
    setState({
      step: 1,
      contentType: 'social-media',
      platform: 'linkedin',
      audience: 'industry_peers',
      objective: 'Introduce product',
      tone: 'Professional',
      stylePack: 'professional',
      animePersona: '',
      topic: '',
      keyPoints: [],
      pastPost: '',
      trendingHashtags: [],
      customInstructions: '',
      showTemplates: false,
      isGenerating: false,
      generatedPost: '',
      characterCount: 0,
      maxLength: 3000,
      withinLimit: true,
      uploadedImages: [],
      showImageUpload: false,
      showSpeechToText: false,
      speechTranscript: '',
      showAnimePersona: false,
      generateVariations: false,
      variations: [],
      selectedVariation: null
    })
  }

  const getStepTitle = () => {
    switch (state.step) {
      case 1: return 'Content Type & Platform'
      case 2: return 'Purpose & Audience'
      case 3: return 'Writing Objective'
      case 4: return 'Tone & Style'
      case 5: return 'Content Details'
      case 6: return 'Enhancement & Persona'
      case 7: return 'Preview & Generate'
      default: return 'Writing Helper'
    }
  }

  const canProceed = () => {
    switch (state.step) {
      case 1: return state.contentType
      case 2: return state.contentType === 'social-media' ? state.platform && state.audience : true
      case 3: return state.objective
      case 4: return state.tone
      case 5: return state.topic.trim().length > 0
      case 6: return true // Optional step
      case 7: return true
      default: return false
    }
  }

  const getContentTypes = () => writingHelperData.contentTypes

  const [currentView, setCurrentView] = useState('overview')
  const [showAIChat, setShowAIChat] = useState(false)
  const [isFullScreenMode, setIsFullScreenMode] = useState(false)
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [leftActiveTab, setLeftActiveTab] = useState('selection')
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [rightActiveTab, setRightActiveTab] = useState('actions')
  const [showStylePacks, setShowStylePacks] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const getStepIcon = () => {
    switch (state.step) {
      case 1: return '🎯'
      case 2: return '🎯'
      case 3: return '🎯'
      case 4: return '🎯'
      case 5: return '📋'
      case 6: return '🎯'
      case 7: return '✨'
      default: return '💬'
    }
  }

  const renderCurrentStepControls = () => {
    switch (state.step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🎯 What type of content are you creating?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getContentTypes().map((type) => (
                  <button
                    key={type.id}
                    onClick={() => updateState({ contentType: type.id as any })}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                      state.contentType === type.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium text-gray-800">{type.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      case 2:
        return state.contentType === 'social-media' ? (
          <PlatformSelector
            platform={state.platform}
            audience={state.audience}
            onPlatformChange={(platform) => updateState({ platform })}
            onAudienceChange={(audience) => updateState({ audience })}
          />
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🎯 Who is your target audience?
              </h2>
              <div className="space-y-3">
                {writingHelperData.audiences.general.map((aud) => (
                  <button
                    key={aud.id}
                    onClick={() => updateState({ audience: aud.id })}
                    className={`w-full p-4 rounded-lg border text-left transition-all duration-300 ${
                      state.audience === aud.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{aud.name}</div>
                    <div className="text-sm text-gray-600">{aud.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <ObjectiveSelector
            objective={state.objective}
            platform={state.contentType === 'social-media' ? state.platform : state.contentType}
            onObjectiveChange={(objective) => updateState({ objective })}
          />
        )
      case 4:
        return (
          <div className="space-y-6">
            <StyleSelector
              tone={state.tone}
              stylePack={state.stylePack}
              onToneChange={(tone) => updateState({ tone })}
              onStylePackChange={(stylePack) => updateState({ stylePack })}
            />
            
            {/* Anime Persona Toggle */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-purple-800">🎭 Anime Character Voice</h3>
                  <p className="text-sm text-purple-600">Add personality from your favorite anime characters</p>
                </div>
                <button
                  onClick={() => updateState({ showAnimePersona: !state.showAnimePersona })}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    state.showAnimePersona
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-purple-700 border border-purple-300'
                  }`}
                >
                  {state.showAnimePersona ? 'Hide Personas' : 'Choose Persona'}
                </button>
              </div>
              
              {state.showAnimePersona && (
                <AnimePersonaSelector
                  selectedPersona={state.animePersona}
                  onPersonaChange={(persona) => updateState({ animePersona: persona })}
                  platform={state.contentType === 'social-media' ? state.platform : state.contentType}
                />
              )}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            {/* Enhanced Content Input Tools */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => updateState({ showImageUpload: !state.showImageUpload })}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  state.showImageUpload
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">📸</span>
                {state.showImageUpload ? 'Hide' : 'Add'} Images
              </button>
              
              <button
                onClick={() => updateState({ showSpeechToText: !state.showSpeechToText })}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  state.showSpeechToText
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">🎤</span>
                {state.showSpeechToText ? 'Hide' : 'Voice'} Input
              </button>

              <button
                onClick={() => updateState({ generateVariations: !state.generateVariations })}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  state.generateVariations
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">🎭</span>
                {state.generateVariations ? 'Disable' : 'Enable'} A/B Testing
              </button>
            </div>

            {/* Image Upload Section */}
            {state.showImageUpload && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <ImageUpload
                  onImageUpload={(file, preview) => {
                    updateState({
                      uploadedImages: [...state.uploadedImages, { file, preview }]
                    })
                  }}
                  onImageAnalysis={(analysis) => {
                    if (state.uploadedImages.length > 0) {
                      const updatedImages = [...state.uploadedImages]
                      updatedImages[updatedImages.length - 1].analysis = analysis
                      updateState({ uploadedImages: updatedImages })
                      
                      // Auto-add image analysis to topic if empty
                      if (!state.topic.trim()) {
                        updateState({ topic: analysis })
                      }
                    }
                  }}
                  placeholder="Upload images to enhance your content"
                  showAnalysis={true}
                />
              </div>
            )}

            {/* Speech to Text Section */}
            {state.showSpeechToText && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <SpeechToText
                  onTranscript={(transcript) => {
                    updateState({ speechTranscript: transcript })
                    // Auto-fill topic if empty
                    if (!state.topic.trim()) {
                      updateState({ topic: transcript })
                    } else {
                      // Append to custom instructions
                      const newInstructions = state.customInstructions 
                        ? `${state.customInstructions}\n\nVoice notes: ${transcript}`
                        : `Voice notes: ${transcript}`
                      updateState({ customInstructions: newInstructions })
                    }
                  }}
                  placeholder="Speak your ideas, key points, or instructions..."
                  showLanguageSelector={true}
                  continuous={false}
                />
              </div>
            )}

            {/* Original Content Inputs */}
            <ContentInputs
              topic={state.topic}
              keyPoints={state.keyPoints}
              pastPost={state.pastPost}
              customInstructions={state.customInstructions}
              onTopicChange={(topic) => updateState({ topic })}
              onKeyPointsChange={(keyPoints) => updateState({ keyPoints })}
              onPastPostChange={(pastPost) => updateState({ pastPost })}
              onCustomInstructionsChange={(customInstructions) => updateState({ customInstructions })}
            />

            {/* Content Summary */}
            {(state.uploadedImages.length > 0 || state.speechTranscript) && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">📋 Content Summary</h4>
                {state.uploadedImages.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm text-purple-700">
                      📸 {state.uploadedImages.length} image{state.uploadedImages.length > 1 ? 's' : ''} uploaded
                    </span>
                  </div>
                )}
                {state.speechTranscript && (
                  <div className="mb-2">
                    <span className="text-sm text-purple-700">
                      🎤 Voice input: {state.speechTranscript.substring(0, 100)}
                      {state.speechTranscript.length > 100 ? '...' : ''}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            {/* Authentication Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">🔐 Account Status</h3>
              {authLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-blue-700">Checking authentication...</span>
                </div>
              ) : isDemoMode ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎭</span>
                  <div>
                    <div className="font-medium text-blue-800">Demo Mode Active</div>
                    <div className="text-sm text-blue-600">Using demo features with limited functionality</div>
                  </div>
                </div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-medium text-blue-800">Authenticated as {user.username}</div>
                    <div className="text-sm text-blue-600">
                      {user.tokensRemaining} tokens remaining | {user.subscriptionStatus} plan
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-medium text-red-800">Not Authenticated</div>
                    <div className="text-sm text-red-600">Please login to access full features</div>
                  </div>
                </div>
              )}
            </div>

            {/* Anime Persona Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-purple-800">🎭 Enhancement & Persona</h3>
                <button
                  onClick={() => updateState({ showAnimePersona: !state.showAnimePersona })}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                    state.showAnimePersona
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {state.showAnimePersona ? 'Hide Personas' : 'Choose Persona'}
                </button>
              </div>
              
              <p className="text-sm text-purple-600 mb-4">
                Add personality from your favorite anime characters to make your content more engaging
              </p>

              {state.showAnimePersona && (
                <AnimePersonaSelector
                  selectedPersona={state.animePersona}
                  onPersonaChange={(persona) => updateState({ animePersona: persona })}
                  platform={state.contentType === 'social-media' ? state.platform : state.contentType}
                />
              )}
            </div>

            {/* Trending Hooks for Social Media */}
            {state.contentType === 'social-media' && (
              <TrendingHooks
                platform={state.platform}
                trendingHashtags={state.trendingHashtags}
                onTrendingHashtagsChange={(hashtags) => updateState({ trendingHashtags: hashtags })}
              />
            )}
          </div>
        )
      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold mb-4 text-purple-800">Preview Your Settings</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Content Type:</strong> {state.contentType.replace('-', ' ')}</div>
                {state.contentType === 'social-media' && (
                  <>
                    <div><strong>Platform:</strong> {state.platform}</div>
                    <div><strong>Audience:</strong> {state.audience}</div>
                  </>
                )}
                <div><strong>Objective:</strong> {state.objective}</div>
                <div><strong>Style:</strong> {state.tone} ({state.stylePack})</div>
                {state.animePersona && (
                  <div className="col-span-2"><strong>Anime Persona:</strong> {state.animePersona}</div>
                )}
                <div className="col-span-2"><strong>Topic:</strong> {state.topic}</div>
                {state.keyPoints.length > 0 && (
                  <div className="col-span-2">
                    <strong>Key Points:</strong> {state.keyPoints.join(', ')}
                  </div>
                )}
                {state.generateVariations && (
                  <div className="col-span-2 flex items-center gap-2">
                    <strong>A/B Testing:</strong> 
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      Enabled
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={generatePost}
              disabled={state.isGenerating || !state.topic.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 text-lg font-medium"
            >
              {state.isGenerating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating Content...
                </>
              ) : (
                <>
                  <span className="text-xl">✨</span>
                  Generate Content {state.generateVariations ? '& Variations' : ''}
                </>
              )}
            </button>

            {/* Show Variations if they exist */}
            {state.variations.length > 0 && (
              <div className="mt-6">
                <PostVariations
                  variations={state.variations}
                  onSelectVariation={(variation) => {
                    updateState({ 
                      selectedVariation: variation,
                      generatedPost: variation.content
                    })
                  }}
                  onRate={(variationId, rating) => {
                    console.log(`Rated variation ${variationId}: ${rating} stars`)
                  }}
                  platform={state.contentType === 'social-media' ? state.platform : state.contentType}
                />
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const renderStepContent = () => {
    switch (state.step) {
      case 1:
        return renderCurrentStepControls()
      case 2:
        return renderCurrentStepControls()
      case 3:
        return renderCurrentStepControls()
      case 4:
        return renderCurrentStepControls()
      case 5:
        return renderCurrentStepControls()
      case 6:
        return renderCurrentStepControls()
      case 7:
        return renderCurrentStepControls()
      default:
        return null
    }
  }

  const canNavigateToStep = (step: number) => {
    switch (step) {
      case 1: return true
      case 2: return state.contentType === 'social-media' ? state.platform && state.audience : true
      case 3: return state.objective
      case 4: return state.tone
      case 5: return state.topic.trim().length > 0
      case 6: return true // Optional step
      case 7: return true
      default: return false
    }
  }

  return (
    <div className="writing-helper-enhanced">
      {/* Icon-Only Top Toolbar */}
      <div className="top-toolbar-enhanced">
        {/* Navigation Section */}
        <div className="toolbar-section">
          <IconButton
            icon="🏠"
            tooltip="Dashboard"
            onClick={() => setCurrentView('overview')}
            active={currentView === 'overview'}
          />
          <IconButton
            icon="📋"
            tooltip="Templates"
            onClick={() => updateState({ showTemplates: !state.showTemplates })}
            active={state.showTemplates}
          />
          <div className="toolbar-divider" />
          <IconButton
            icon="💬"
            tooltip="AI Chat Help"
            onClick={() => setShowAIChat(!showAIChat)}
            active={showAIChat}
          />
        </div>

        {/* Step Indicators */}
        <div className="toolbar-section step-indicators">
          {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => (
            <button
              key={stepNum}
              onClick={() => setState(prev => ({ ...prev, step: stepNum }))}
              disabled={!canNavigateToStep(stepNum)}
              className={`step-indicator ${
                stepNum === state.step ? 'current' : ''
              } ${stepNum < state.step ? 'completed' : ''}`}
                             title={`Step ${stepNum}: ${getStepTitle()}`}
            >
              {stepNum < state.step ? '✓' : stepNum}
            </button>
          ))}
          <span className="step-label">{getStepTitle()}</span>
        </div>

        {/* Tools Section */}
        <div className="toolbar-section">
          <IconButton
            icon="🎭"
            tooltip="Anime Personas"
            onClick={() => updateState({ showAnimePersona: !state.showAnimePersona })}
            active={state.showAnimePersona}
          />
          <IconButton
            icon="🎨"
            tooltip="Style Packs"
            onClick={() => setShowStylePacks(!showStylePacks)}
            active={showStylePacks}
          />
          <div className="toolbar-divider" />
          <IconButton
            icon="🔍"
            tooltip="Full Screen Mode"
            onClick={() => setIsFullScreenMode(!isFullScreenMode)}
            active={isFullScreenMode}
          />
          <IconButton
            icon="⚙️"
            tooltip="Settings"
            onClick={() => setShowSettings(!showSettings)}
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className={`main-layout-enhanced ${isFullScreenMode ? 'fullscreen' : ''}`}>
        {/* Left Collapsible Panel */}
        <div className={`side-panel left-panel ${isLeftPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <div className="panel-tabs">
              <button 
                className={`tab ${leftActiveTab === 'selection' ? 'active' : ''}`}
                onClick={() => setLeftActiveTab('selection')}
              >
                <span className="tab-icon">🎯</span>
                <span className="tab-label">Selection</span>
              </button>
              <button 
                className={`tab ${leftActiveTab === 'ai' ? 'active' : ''}`}
                onClick={() => setLeftActiveTab('ai')}
              >
                <span className="tab-icon">🤖</span>
                <span className="tab-label">AI Help</span>
              </button>
              <button 
                className={`tab ${leftActiveTab === 'history' ? 'active' : ''}`}
                onClick={() => setLeftActiveTab('history')}
              >
                <span className="tab-icon">📝</span>
                <span className="tab-label">History</span>
              </button>
            </div>
            <button 
              className="collapse-btn"
              onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
              title={isLeftPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            >
              {isLeftPanelCollapsed ? '▶️' : '◀️'}
            </button>
          </div>
          
          {!isLeftPanelCollapsed && (
            <div className="panel-content">
              {leftActiveTab === 'selection' && (
                <div className="selection-panel">
                  <h3>🎯 Content Settings</h3>
                  {renderCurrentStepControls()}
                </div>
              )}
              {leftActiveTab === 'ai' && (
                <div className="ai-help-panel">
                  <h3>🤖 AI Assistance</h3>
                  <div className="ai-suggestions">
                    <button className="suggestion-btn">💡 Get Ideas</button>
                    <button className="suggestion-btn">✨ Improve Tone</button>
                    <button className="suggestion-btn">🎯 Optimize Hook</button>
                    <button className="suggestion-btn">📊 Add Analytics</button>
                  </div>
                </div>
              )}
              {leftActiveTab === 'history' && (
                <div className="history-panel">
                  <h3>📝 Recent Posts</h3>
                  <div className="history-items">
                    <div className="history-item">
                      <span className="history-icon">📱</span>
                      <div className="history-info">
                        <div className="history-title">LinkedIn Post</div>
                        <div className="history-date">2 hours ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Canvas - Maximized */}
        <div className="center-canvas">
          <div className="canvas-header">
            <h2 className="canvas-title">
              <span className="step-icon">{getStepIcon()}</span>
              {getStepTitle()}
            </h2>
            <div className="canvas-actions">
              <button
                onClick={prevStep}
                disabled={state.step === 1}
                className="nav-btn secondary"
              >
                ← Previous
              </button>
              <button
                onClick={nextStep}
                disabled={state.step === 7 || !canProceed()}
                className="nav-btn primary"
              >
                Next →
              </button>
            </div>
          </div>
          
          <div className="canvas-content">
            {/* Template Library Modal */}
            {state.showTemplates && (
              <div className="template-overlay">
                <TemplateLibrary
                  onSelectTemplate={(template, platform) => {
                    setState(prev => ({
                      ...prev,
                      platform,
                      objective: template.objective,
                      tone: template.tone,
                      showTemplates: false,
                      step: 5
                    }))
                  }}
                  onClose={() => updateState({ showTemplates: false })}
                />
              </div>
            )}

            {/* Step Content */}
            <div className="step-content">
              {renderStepContent()}
            </div>
          </div>
        </div>

        {/* Right Collapsible Panel */}
        <div className={`side-panel right-panel ${isRightPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <div className="panel-tabs">
              <button 
                className={`tab ${rightActiveTab === 'actions' ? 'active' : ''}`}
                onClick={() => setRightActiveTab('actions')}
              >
                <span className="tab-icon">⚡</span>
                <span className="tab-label">Actions</span>
              </button>
              <button 
                className={`tab ${rightActiveTab === 'export' ? 'active' : ''}`}
                onClick={() => setRightActiveTab('export')}
              >
                <span className="tab-icon">📤</span>
                <span className="tab-label">Export</span>
              </button>
              <button 
                className={`tab ${rightActiveTab === 'settings' ? 'active' : ''}`}
                onClick={() => setRightActiveTab('settings')}
              >
                <span className="tab-icon">⚙️</span>
                <span className="tab-label">Settings</span>
              </button>
            </div>
            <button 
              className="collapse-btn"
              onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
              title={isRightPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            >
              {isRightPanelCollapsed ? '◀️' : '▶️'}
            </button>
          </div>
          
          {!isRightPanelCollapsed && (
            <div className="panel-content">
              {rightActiveTab === 'actions' && (
                <div className="actions-panel">
                  <h3>⚡ Quick Actions</h3>
                  <div className="action-buttons">
                    <button className="action-btn">🔄 Generate Variations</button>
                    <button className="action-btn">🎯 A/B Test</button>
                    <button className="action-btn">📊 Analytics</button>
                    <button className="action-btn">🌐 Translate</button>
                  </div>
                </div>
              )}
              {rightActiveTab === 'export' && (
                <div className="export-panel">
                  <h3>📤 Export Options</h3>
                  <PostPreview
                    generatedPost={state.generatedPost}
                    platform={state.contentType === 'social-media' ? state.platform : state.contentType}
                    characterCount={state.characterCount}
                    maxLength={state.maxLength}
                    withinLimit={state.withinLimit}
                    isGenerating={state.isGenerating}
                    onReset={resetWizard}
                  />
                </div>
              )}
              {rightActiveTab === 'settings' && (
                <div className="settings-panel">
                  <h3>⚙️ Preferences</h3>
                  <div className="setting-item">
                    <label>Auto-save drafts</label>
                    <input type="checkbox" />
                  </div>
                  <div className="setting-item">
                    <label>Show character count</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Overlay */}
      {isFullScreenMode && (
        <div className="fullscreen-overlay">
          <button 
            className="exit-fullscreen"
            onClick={() => setIsFullScreenMode(false)}
          >
            ✕ Exit Full Screen
          </button>
        </div>
      )}
    </div>
  )
}

export default WritingHelper 