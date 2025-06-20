import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Feather, Heart, Palette, BookOpen, Sparkles, Eye, Users, Pen, Star, Music, Zap } from 'lucide-react'
import { WizardLayout } from '../Shared/WizardLayout'
import { useWizardData, useWizardSteps, useAuth, useContentGeneration } from '../Shared/hooks'
import { CreativeWizardData, CreativeGenre, CreativeStyle, CreativeTone } from '../Shared/types'

const GENRES: CreativeGenre[] = [
  { id: 'short_story', name: 'Short Story', description: 'Narrative fiction under 7,500 words', icon: BookOpen },
  { id: 'poetry', name: 'Poetry', description: 'Verse, free form, or structured poems', icon: Feather },
  { id: 'flash_fiction', name: 'Flash Fiction', description: 'Very short stories under 1,000 words', icon: Zap },
  { id: 'screenplay', name: 'Screenplay', description: 'Scripts for film or theater', icon: Music },
  { id: 'song_lyrics', name: 'Song Lyrics', description: 'Lyrics for musical compositions', icon: Star },
  { id: 'monologue', name: 'Monologue', description: 'Single character dramatic speech', icon: Users }
]

const STYLES: CreativeStyle[] = [
  { id: 'literary', name: 'Literary Fiction', description: 'Character-driven, artistic prose' },
  { id: 'genre', name: 'Genre Fiction', description: 'Fantasy, sci-fi, mystery, romance' },
  { id: 'experimental', name: 'Experimental', description: 'Avant-garde, unconventional forms' },
  { id: 'traditional', name: 'Traditional', description: 'Classic storytelling techniques' },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple, sparse, understated' },
  { id: 'maximalist', name: 'Maximalist', description: 'Rich, detailed, elaborate' }
]

const TONES: CreativeTone[] = [
  { id: 'dramatic', name: 'Dramatic', description: 'Intense, emotional, serious' },
  { id: 'comedic', name: 'Comedic', description: 'Funny, lighthearted, humorous' },
  { id: 'romantic', name: 'Romantic', description: 'Love-focused, passionate, tender' },
  { id: 'mysterious', name: 'Mysterious', description: 'Suspenseful, enigmatic, dark' },
  { id: 'nostalgic', name: 'Nostalgic', description: 'Wistful, reflective, melancholy' },
  { id: 'uplifting', name: 'Uplifting', description: 'Hopeful, inspiring, positive' },
  { id: 'surreal', name: 'Surreal', description: 'Dream-like, fantastical, strange' },
  { id: 'gritty', name: 'Gritty', description: 'Raw, realistic, harsh' }
]

export default function CreativeWritingWizard() {
  const { authState } = useAuth()
  const [wizardData, updateWizardData] = useWizardData<CreativeWizardData>({
    contentType: 'creative-writing',
    genre: '',
    style: '',
    tone: '',
    theme: '',
    setting: '',
    characters: [],
    plotPoints: [],
    wordCount: 1500,
    animePersona: '',
    customInstructions: ''
  })

  const { currentStep, goToStep, goNext, goBack, isLastStep } = useWizardSteps(7)
  const { generateContent, isGenerating, generatedContent, error } = useContentGeneration()

  const steps = [
    { id: 1, title: 'Genre & Length', description: 'Choose format' },
    { id: 2, title: 'Style & Tone', description: 'Set the mood' },
    { id: 3, title: 'Theme & Setting', description: 'Build the world' },
    { id: 4, title: 'Characters', description: 'Create personalities' },
    { id: 5, title: 'Plot Structure', description: 'Plan the story' },
    { id: 6, title: 'Enhancement & Persona', description: 'Add voice' },
    { id: 7, title: 'Preview & Generate', description: 'Create your work' }
  ]

  const handleGenerate = async () => {
    const request = {
      contentType: 'creative-writing',
      genre: wizardData.genre,
      style: wizardData.style,
      tone: wizardData.tone,
      theme: wizardData.theme,
      setting: wizardData.setting,
      characters: wizardData.characters,
      plotPoints: wizardData.plotPoints,
      wordCount: wizardData.wordCount,
      animePersona: wizardData.animePersona,
      customInstructions: wizardData.customInstructions
    }

    await generateContent(request)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Feather className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Creative Genre</h2>
              <p className="text-gray-600">What type of creative work do you want to write?</p>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {GENRES.map((genre) => {
                  const Icon = genre.icon
                  return (
                    <button
                      key={genre.id}
                      onClick={() => updateWizardData({ genre: genre.id })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        wizardData.genre === genre.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${
                        wizardData.genre === genre.id ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                      <h3 className="font-semibold text-gray-900">{genre.name}</h3>
                      <p className="text-sm text-gray-600">{genre.description}</p>
                    </button>
                  )
                })}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Word Count</label>
                <select
                  value={wizardData.wordCount}
                  onChange={(e) => updateWizardData({ wordCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={300}>Flash Piece (300 words)</option>
                  <option value={1000}>Short Work (1,000 words)</option>
                  <option value={2500}>Medium Work (2,500 words)</option>
                  <option value={5000}>Long Work (5,000 words)</option>
                  <option value={10000}>Extended Work (10,000+ words)</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Palette className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Style & Tone</h2>
              <p className="text-gray-600">Define the artistic approach and emotional feel</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Writing Style</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => updateWizardData({ style: style.id })}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        wizardData.style === style.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">{style.name}</h4>
                      <p className="text-sm text-gray-600">{style.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Emotional Tone</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  {TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => updateWizardData({ tone: tone.id })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        wizardData.tone === tone.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 text-sm">{tone.name}</h4>
                      <p className="text-xs text-gray-600">{tone.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Theme & Setting</h2>
              <p className="text-gray-600">Establish the core message and world of your story</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Central Theme</label>
                <input
                  type="text"
                  value={wizardData.theme}
                  onChange={(e) => updateWizardData({ theme: e.target.value })}
                  placeholder="e.g., Love conquers all, The price of ambition, Coming of age..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Setting & Context</label>
                <textarea
                  value={wizardData.setting}
                  onChange={(e) => updateWizardData({ setting: e.target.value })}
                  placeholder="Describe the time, place, and circumstances of your story. Be as detailed or abstract as you like..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Setting Ideas:</h4>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-purple-800">
                  <div>• Modern urban environment</div>
                  <div>• Fantasy medieval world</div>
                  <div>• Post-apocalyptic future</div>
                  <div>• Small rural town</div>
                  <div>• Space station/alien world</div>
                  <div>• Historical period</div>
                  <div>• Dream/surreal landscape</div>
                  <div>• Single room/confined space</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Characters</h2>
              <p className="text-gray-600">Create the people who will bring your story to life</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Characters</label>
                <div className="space-y-3">
                  {wizardData.characters.map((character, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={character}
                        onChange={(e) => {
                          const newCharacters = [...wizardData.characters]
                          newCharacters[index] = e.target.value
                          updateWizardData({ characters: newCharacters })
                        }}
                        placeholder={`Character ${index + 1} - Name and brief description`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          const newCharacters = wizardData.characters.filter((_, i) => i !== index)
                          updateWizardData({ characters: newCharacters })
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateWizardData({ characters: [...wizardData.characters, ''] })}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600"
                  >
                    + Add Character
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Character Tips:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Include key personality traits and motivations</li>
                  <li>• Consider relationships between characters</li>
                  <li>• Think about character arcs and growth</li>
                  <li>• Add distinctive details that make them memorable</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Pen className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Plot Structure</h2>
              <p className="text-gray-600">Outline the key events and turning points</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plot Points & Key Events</label>
                <div className="space-y-2">
                  {wizardData.plotPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...wizardData.plotPoints]
                          newPoints[index] = e.target.value
                          updateWizardData({ plotPoints: newPoints })
                        }}
                        placeholder={`Plot point ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          const newPoints = wizardData.plotPoints.filter((_, i) => i !== index)
                          updateWizardData({ plotPoints: newPoints })
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateWizardData({ plotPoints: [...wizardData.plotPoints, ''] })}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600"
                  >
                    + Add Plot Point
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Story Structure Ideas:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
                  <div>
                    <strong>Three-Act Structure:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Setup & inciting incident</li>
                      <li>• Rising action & climax</li>
                      <li>• Resolution & denouement</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Character Arc:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Initial state</li>
                      <li>• Challenge/conflict</li>
                      <li>• Growth/change</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhancement & Persona</h2>
              <p className="text-gray-600">Add unique voice and final touches</p>
            </div>

            <div className="space-y-6">
              {/* Auth Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Status:</h3>
                {authState.isAuthenticated ? (
                  <div className="text-green-600">
                    ✅ Authenticated as {authState.user?.username || 'User'}
                    <br />
                    💰 Tokens: {authState.user?.tokens || 0} remaining
                  </div>
                ) : authState.isDemo ? (
                  <div className="text-blue-600">🎭 Demo Mode - Limited features</div>
                ) : (
                  <div className="text-amber-600">⚠️ Guest Mode - Please login for full features</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Anime Persona (Optional)</label>
                <select
                  value={wizardData.animePersona}
                  onChange={(e) => updateWizardData({ animePersona: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">No persona (neutral voice)</option>
                  <option value="gojo_satoru">Gojo Satoru - Confident & Charismatic</option>
                  <option value="rem">Rem - Sweet & Supportive</option>
                  <option value="tanjiro">Tanjiro - Kind & Determined</option>
                  <option value="nezuko">Nezuko - Cute & Energetic</option>
                  <option value="senku">Senku - Scientific & Logical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Creative Instructions</label>
                <textarea
                  value={wizardData.customInstructions}
                  onChange={(e) => updateWizardData({ customInstructions: e.target.value })}
                  placeholder="Any specific narrative techniques, stylistic preferences, or creative constraints..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Eye className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Generate</h2>
              <p className="text-gray-600">Review your creative vision and generate your work</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Genre:</strong> {GENRES.find(g => g.id === wizardData.genre)?.name || 'Not selected'}</div>
                <div><strong>Word Count:</strong> ~{wizardData.wordCount} words</div>
                <div><strong>Style:</strong> {STYLES.find(s => s.id === wizardData.style)?.name || 'Not selected'}</div>
                <div><strong>Tone:</strong> {TONES.find(t => t.id === wizardData.tone)?.name || 'Not selected'}</div>
                <div><strong>Characters:</strong> {wizardData.characters.filter(c => c.trim()).length} defined</div>
                <div><strong>Plot Points:</strong> {wizardData.plotPoints.filter(p => p.trim()).length} outlined</div>
              </div>
              <div><strong>Theme:</strong> {wizardData.theme || 'Not specified'}</div>
              <div><strong>Setting:</strong> {wizardData.setting ? `${wizardData.setting.slice(0, 100)}...` : 'Not specified'}</div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !wizardData.genre}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isGenerating ? 'Creating Your Story...' : 'Generate Creative Work'}
            </button>

            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                Error: {error}
              </div>
            )}

            {generatedContent && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Generated Creative Work:</h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <WizardLayout
      title="Creative Writing"
      subtitle="Craft stories, poems, and artistic narratives"
      steps={steps}
      currentStep={currentStep}
      onStepClick={goToStep}
      onBack={goBack}
      onNext={goNext}
      canGoNext={currentStep < 7}
      canGoBack={currentStep > 1}
      isLastStep={isLastStep}
    >
      {renderStepContent()}
    </WizardLayout>
  )
} 