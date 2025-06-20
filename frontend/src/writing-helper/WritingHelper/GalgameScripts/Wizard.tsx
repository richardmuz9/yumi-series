import React, { useState, useEffect } from 'react'
// import { ChevronLeft, ChevronRight, GamepadIcon, Users, Heart, MessageCircle, Settings, Sparkles, Eye, Music, Camera, Star } from 'lucide-react'
import { WizardLayout } from '../Shared/WizardLayout'
import { useWizardData, useWizardSteps, useAuth, useContentGeneration } from '../Shared/hooks'
import { GalgameWizardData, GalgameGenre, GalgameStyle, SceneType } from '../Shared/types'

const GENRES: GalgameGenre[] = [
  { id: 'romance', name: 'Romance', description: 'Love stories and relationship development', icon: () => <span>❤️</span> },
  { id: 'drama', name: 'Drama', description: 'Emotional conflicts and character development', icon: () => <span>👥</span> },
  { id: 'comedy', name: 'Comedy', description: 'Lighthearted and humorous interactions', icon: () => <span>⭐</span> },
  { id: 'mystery', name: 'Mystery', description: 'Suspenseful plots with secrets to uncover', icon: () => <span>💬</span> },
  { id: 'fantasy', name: 'Fantasy', description: 'Magical worlds and supernatural elements', icon: () => <span>✨</span> },
  { id: 'slice_of_life', name: 'Slice of Life', description: 'Everyday situations and realistic scenarios', icon: () => <span>📷</span> }
]

const STYLES: GalgameStyle[] = [
  { id: 'otome', name: 'Otome', description: 'Female protagonist, male love interests' },
  { id: 'dating_sim', name: 'Dating Sim', description: 'Multiple romance routes and choices' },
  { id: 'visual_novel', name: 'Visual Novel', description: 'Story-focused with minimal gameplay' },
  { id: 'eroge', name: 'Eroge', description: 'Adult-oriented romantic content' },
  { id: 'bishojo', name: 'Bishojo', description: 'Male protagonist, female characters' },
  { id: 'kinetic_novel', name: 'Kinetic Novel', description: 'Linear story without choices' }
]

const SCENE_TYPES: SceneType[] = [
  { id: 'introduction', name: 'Character Introduction', description: 'First meeting or character reveal' },
  { id: 'confession', name: 'Love Confession', description: 'Romantic declaration scene' },
  { id: 'conflict', name: 'Conflict/Drama', description: 'Arguments or emotional tension' },
  { id: 'comedy', name: 'Comedy Scene', description: 'Funny interactions and situations' },
  { id: 'climax', name: 'Story Climax', description: 'Peak emotional or dramatic moment' },
  { id: 'resolution', name: 'Resolution', description: 'Conclusion and character resolution' }
]

export default function GalgameScriptsWizard() {
  // Fallback for authState
  const auth = useAuth() as any
  const authState = auth.authState || auth

  // Fix useWizardData usage
  const wizardDataHook = useWizardData<GalgameWizardData>({
    contentType: 'galgame-script',
    genre: '',
    style: '',
    sceneType: '',
    characters: [],
    setting: '',
    plotSummary: '',
    dialogueLength: 'medium',
    includeChoices: false,
    animePersona: '',
    customInstructions: ''
  })
  const wizardData = wizardDataHook.data
  const updateWizardData = wizardDataHook.update

  const { currentStep, goToStep, next, prev, isLastStep } = useWizardSteps(7) as any
  const contentGen = useContentGeneration() as any
  const generateContent = contentGen.generateContent || (() => Promise.resolve())
  const isGenerating = contentGen.isGenerating || false
  const generatedContent = contentGen.generatedContent || contentGen.result || ''
  const error = contentGen.error || null

  const steps = [
    { id: 1, title: 'Genre & Style', description: 'Choose game type' },
    { id: 2, title: 'Scene Type', description: 'Select scene focus' },
    { id: 3, title: 'Characters', description: 'Define personalities' },
    { id: 4, title: 'Setting & Plot', description: 'Build context' },
    { id: 5, title: 'Script Options', description: 'Configure format' },
    { id: 6, title: 'Enhancement & Persona', description: 'Add voice' },
    { id: 7, title: 'Preview & Generate', description: 'Create script' }
  ]

  const handleGenerate = async () => {
    const request = {
      contentType: 'galgame-script',
      genre: wizardData.genre,
      style: wizardData.style,
      sceneType: wizardData.sceneType,
      characters: wizardData.characters,
      setting: wizardData.setting,
      plotSummary: wizardData.plotSummary,
      dialogueLength: wizardData.dialogueLength,
      includeChoices: wizardData.includeChoices,
      animePersona: wizardData.animePersona,
      customInstructions: wizardData.customInstructions
    }
    // Fix generateContent usage
    await generateContent(() => Promise.resolve(request))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="mx-auto h-12 w-12 text-pink-600 mb-4" style={{fontSize: 48}}>🎮</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Genre & Style</h2>
              <p className="text-gray-600">Choose the type and style of your visual novel</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Genre</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {GENRES.map((genre: GalgameGenre) => {
                    const Icon = genre.icon
                    return (
                      <button
                        key={genre.id}
                        onClick={() => updateWizardData('genre', genre.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          wizardData.genre === genre.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon />
                        <h4 className="font-semibold text-gray-900">{genre.name}</h4>
                        <p className="text-sm text-gray-600">{genre.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Game Style</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {STYLES.map((style: GalgameStyle) => (
                    <button
                      key={style.id}
                      onClick={() => updateWizardData('style', style.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        wizardData.style === style.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 text-sm">{style.name}</h4>
                      <p className="text-xs text-gray-600">{style.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="mx-auto h-12 w-12 text-pink-600 mb-4" style={{fontSize: 48}}>💬</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Scene Type</h2>
              <p className="text-gray-600">What kind of scene are you writing?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {SCENE_TYPES.map((sceneType: SceneType) => (
                <button
                  key={sceneType.id}
                  onClick={() => updateWizardData('sceneType', sceneType.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    wizardData.sceneType === sceneType.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{sceneType.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{sceneType.description}</p>
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="mx-auto h-12 w-12 text-pink-600 mb-4" style={{fontSize: 48}}>👥</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Characters</h2>
              <p className="text-gray-600">Define the characters in this scene</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Characters in Scene</label>
                <div className="space-y-3">
                  {wizardData.characters.map((character: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={character}
                        onChange={(e) => {
                          const newCharacters = [...wizardData.characters]
                          newCharacters[index] = e.target.value
                          updateWizardData('characters', newCharacters)
                        }}
                        placeholder={`Character ${index + 1} - Name, personality, role in scene`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          const newCharacters = wizardData.characters.filter((_: string, i: number) => i !== index)
                          updateWizardData('characters', newCharacters)
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateWizardData('characters', [...wizardData.characters, ''])}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-pink-500 hover:text-pink-600"
                  >
                    + Add Character
                  </button>
                </div>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-2">Character Tips:</h4>
                <ul className="text-sm text-pink-800 space-y-1">
                  <li>• Include character archetypes (tsundere, kuudere, genki, etc.)</li>
                  <li>• Describe their relationship to other characters</li>
                  <li>• Note their emotional state in this scene</li>
                  <li>• Add distinctive speech patterns or quirks</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="mx-auto h-12 w-12 text-pink-600 mb-4" style={{fontSize: 48}}>📷</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Setting & Plot</h2>
              <p className="text-gray-600">Describe the context and background</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scene Setting</label>
                <input
                  type="text"
                  value={wizardData.setting}
                  onChange={(e) => updateWizardData('setting', e.target.value)}
                  placeholder="e.g., School rooftop at sunset, Cozy café, Character's bedroom..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plot Context & Summary</label>
                <textarea
                  value={wizardData.plotSummary}
                  onChange={(e) => updateWizardData('plotSummary', e.target.value)}
                  placeholder="What's happening in this scene? What led to this moment? What are the characters trying to achieve?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-2">Common VN Settings:</h4>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-pink-800">
                  <div>• School classroom/hallway</div>
                  <div>• Park/outdoor location</div>
                  <div>• Character's home</div>
                  <div>• Shopping district</div>
                  <div>• Festival/event location</div>
                  <div>• Quiet/private space</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="mx-auto h-12 w-12 text-pink-600 mb-4" style={{fontSize: 48}}>⚙️</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Script Options</h2>
              <p className="text-gray-600">Configure the dialogue format and length</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dialogue Length</label>
                <select
                  value={wizardData.dialogueLength}
                  onChange={(e) => updateWizardData('dialogueLength', e.target.value as 'short' | 'medium' | 'long')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="short">Short Scene (10-15 lines)</option>
                  <option value="medium">Medium Scene (20-30 lines)</option>
                  <option value="long">Long Scene (40+ lines)</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeChoices"
                  checked={wizardData.includeChoices}
                  onChange={(e) => updateWizardData('includeChoices', e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="includeChoices" className="text-sm font-medium text-gray-700">
                  Include player choices/branches in the script
                </label>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-2">Script Format:</h4>
                <div className="text-sm text-pink-800 space-y-2">
                  <div><strong>Standard format:</strong> Character Name: "Dialogue"</div>
                  <div><strong>Actions:</strong> [Character action or scene direction]</div>
                  <div><strong>Choices:</strong> → Choice 1 / → Choice 2 (if enabled)</div>
                  <div><strong>Effects:</strong> *Background music*, *Sound effect*</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="mx-auto h-12 w-12 text-pink-600 mb-4" style={{fontSize: 48}}>✨</span>
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
                  onChange={(e) => updateWizardData('animePersona', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">No persona (neutral writing)</option>
                  <option value="gojo_satoru">Gojo Satoru - Confident & Charismatic</option>
                  <option value="rem">Rem - Sweet & Supportive</option>
                  <option value="tanjiro">Tanjiro - Kind & Determined</option>
                  <option value="nezuko">Nezuko - Cute & Energetic</option>
                  <option value="senku">Senku - Scientific & Logical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Script Instructions</label>
                <textarea
                  value={wizardData.customInstructions}
                  onChange={(e) => updateWizardData('customInstructions', e.target.value)}
                  placeholder="Any specific dialogue style, emotional emphasis, or scene directions you want included..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              <span className="mx-auto h-12 w-12 text-pink-600 mb-4" style={{fontSize: 48}}>👁️</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Generate</h2>
              <p className="text-gray-600">Review your settings and generate your script</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Genre:</strong> {GENRES.find(g => g.id === wizardData.genre)?.name || 'Not selected'}</div>
                <div><strong>Style:</strong> {STYLES.find(s => s.id === wizardData.style)?.name || 'Not selected'}</div>
                <div><strong>Scene:</strong> {SCENE_TYPES.find(st => st.id === wizardData.sceneType)?.name || 'Not selected'}</div>
                <div><strong>Length:</strong> {wizardData.dialogueLength}</div>
                <div><strong>Characters:</strong> {wizardData.characters.filter((c: string) => c.trim()).length} defined</div>
                <div><strong>Choices:</strong> {wizardData.includeChoices ? 'Yes' : 'No'}</div>
              </div>
              <div><strong>Setting:</strong> {wizardData.setting || 'Not specified'}</div>
              <div><strong>Plot:</strong> {wizardData.plotSummary ? `${wizardData.plotSummary.slice(0, 100)}...` : 'Not specified'}</div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !wizardData.genre || !wizardData.sceneType}
              className="w-full bg-pink-600 text-white py-4 px-6 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isGenerating ? 'Generating Script...' : 'Generate Galgame Script'}
            </button>

            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                Error: {error}
              </div>
            )}

            {generatedContent && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Generated Script:</h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{generatedContent}</pre>
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
      currentStep={currentStep}
      totalSteps={steps.length}
      stepTitle={steps[currentStep - 1].title}
      onNext={next}
      onPrev={prev}
      onBack={prev}
      canProceed={currentStep < 7}
      children={renderStepContent()}
    />
  )
} 