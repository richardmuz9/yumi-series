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
import ImageUpload from '../ImageUpload'
import SpeechToText from '../SpeechToText'
import writingHelperData from '../../data/writingHelperData.json'

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

  const updateState = (updates: Partial<WritingHelperState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    setState(prev => ({ ...prev, step: prev.step + 1 }))
  }

  const prevStep = () => {
    setState(prev => ({ ...prev, step: prev.step - 1 }))
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">✒️</span>
              Writing Helper
            </h1>
            <p className="text-gray-600">AI-powered writing assistant for scripts, blogs, posts & creative content</p>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    stepNum === state.step
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : stepNum < state.step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNum < state.step ? '✓' : stepNum}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              Step {state.step} of 7: {getStepTitle()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6">
        {/* Wizard Steps */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          {/* Template Library Toggle */}
          {!state.showTemplates && state.contentType === 'social-media' && (
            <div className="mb-6">
              <button
                onClick={() => updateState({ showTemplates: true })}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span className="text-lg">📚</span>
                Browse Templates
              </button>
            </div>
          )}

          {state.showTemplates ? (
            <TemplateLibrary
              onSelectTemplate={(template, platform) => {
                setState(prev => ({
                  ...prev,
                  platform,
                  objective: template.objective,
                  tone: template.tone,
                  showTemplates: false,
                  step: 5 // Skip to content inputs
                }))
              }}
              onClose={() => updateState({ showTemplates: false })}
            />
          ) : (
            <>
              {state.step === 1 && (
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
              )}

              {state.step === 2 && state.contentType === 'social-media' && (
                <PlatformSelector
                  platform={state.platform}
                  audience={state.audience}
                  onPlatformChange={(platform) => updateState({ platform })}
                  onAudienceChange={(audience) => updateState({ audience })}
                />
              )}

              {state.step === 2 && state.contentType !== 'social-media' && (
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
              )}

              {state.step === 3 && (
                <ObjectiveSelector
                  objective={state.objective}
                  platform={state.contentType === 'social-media' ? state.platform : state.contentType}
                  onObjectiveChange={(objective) => updateState({ objective })}
                />
              )}

              {state.step === 4 && (
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
              )}

              {state.step === 5 && (
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
              )}

              {state.step === 6 && state.contentType === 'social-media' && (
                <TrendingHooks
                  platform={state.platform}
                  trendingHashtags={state.trendingHashtags}
                  onTrendingHashtagsChange={(hashtags) => updateState({ trendingHashtags: hashtags })}
                />
              )}

              {(state.step === 6 && state.contentType !== 'social-media') || (state.step === 7) && (
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
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={state.step === 1}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  <span>←</span>
                  Previous
                </button>

                <button
                  onClick={nextStep}
                  disabled={state.step === 7 || !canProceed()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  Next
                  <span>→</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Post Preview */}
        <div className="w-96 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
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
      </div>
    </div>
  )
}

export default WritingHelper 