import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, FileText, Target, Palette, Edit3, TrendingUp, Sparkles, Eye, Users, Clock, BookOpen, Zap, Coffee } from 'lucide-react'
import { WizardLayout } from '../Shared/WizardLayout'
import { useWizardData, useWizardSteps, useAuth, useContentGeneration } from '../Shared/hooks'
import { BlogWizardData, BlogArticleObjective, BlogArticleTone, BlogArticleStyle } from '../Shared/types'

const OBJECTIVES: BlogArticleObjective[] = [
  { id: 'educate', name: 'Educate Readers', description: 'Teach something new or explain complex topics', icon: BookOpen },
  { id: 'persuade', name: 'Persuade/Convince', description: 'Change minds or drive action', icon: Target },
  { id: 'entertain', name: 'Entertain', description: 'Engage and amuse your audience', icon: Coffee },
  { id: 'inspire', name: 'Inspire', description: 'Motivate and uplift readers', icon: Zap },
  { id: 'review', name: 'Review/Analyze', description: 'Evaluate products, services, or ideas', icon: Eye },
  { id: 'guide', name: 'How-to Guide', description: 'Provide step-by-step instructions', icon: FileText }
]

const TONES: BlogArticleTone[] = [
  { id: 'professional', name: 'Professional', description: 'Formal, authoritative, business-focused' },
  { id: 'conversational', name: 'Conversational', description: 'Friendly, approachable, personal' },
  { id: 'academic', name: 'Academic', description: 'Scholarly, research-based, detailed' },
  { id: 'casual', name: 'Casual', description: 'Relaxed, informal, easy-going' },
  { id: 'inspirational', name: 'Inspirational', description: 'Motivating, uplifting, encouraging' },
  { id: 'humorous', name: 'Humorous', description: 'Funny, witty, entertaining' }
]

const STYLES: BlogArticleStyle[] = [
  { id: 'listicle', name: 'Listicle', description: 'Numbered or bulleted list format', example: '10 Ways to...' },
  { id: 'tutorial', name: 'Tutorial', description: 'Step-by-step instructional guide', example: 'How to Master...' },
  { id: 'opinion', name: 'Opinion Piece', description: 'Personal perspective or commentary', example: 'Why I Believe...' },
  { id: 'case_study', name: 'Case Study', description: 'Real-world example or analysis', example: 'How Company X...' },
  { id: 'interview', name: 'Interview', description: 'Q&A format with experts', example: 'Expert Insights on...' },
  { id: 'comparison', name: 'Comparison', description: 'Compare products, services, or ideas', example: 'X vs Y: Which...' }
]

export default function BlogArticlesWizard() {
  const { authState } = useAuth()
  const [wizardData, updateWizardData] = useWizardData<BlogWizardData>({
    contentType: 'blog-article',
    objective: '',
    tone: '',
    style: '',
    topic: '',
    keyPoints: [],
    targetAudience: '',
    wordCount: 1500,
    keywords: [],
    animePersona: '',
    customInstructions: ''
  })

  const { currentStep, goToStep, goNext, goBack, isLastStep } = useWizardSteps(7)
  const { generateContent, isGenerating, generatedContent, error } = useContentGeneration()

  const steps = [
    { id: 1, title: 'Target Audience', description: 'Define your readers' },
    { id: 2, title: 'Objective', description: 'Choose your goal' },
    { id: 3, title: 'Style & Tone', description: 'Set the voice' },
    { id: 4, title: 'Content Input', description: 'Add your ideas' },
    { id: 5, title: 'SEO & Keywords', description: 'Optimize discovery' },
    { id: 6, title: 'Enhancement & Persona', description: 'Add personality' },
    { id: 7, title: 'Preview & Generate', description: 'Create your article' }
  ]

  const handleGenerate = async () => {
    const request = {
      contentType: 'blog-article',
      objective: wizardData.objective,
      tone: wizardData.tone,
      style: wizardData.style,
      topic: wizardData.topic,
      keyPoints: wizardData.keyPoints,
      targetAudience: wizardData.targetAudience,
      wordCount: wizardData.wordCount,
      keywords: wizardData.keywords,
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
              <Users className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Who Are You Writing For?</h2>
              <p className="text-gray-600">Define your target audience to create more relevant content</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <input
                  type="text"
                  value={wizardData.targetAudience}
                  onChange={(e) => updateWizardData({ targetAudience: e.target.value })}
                  placeholder="e.g., Small business owners, College students, Marketing professionals..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Word Count</label>
                <select
                  value={wizardData.wordCount}
                  onChange={(e) => updateWizardData({ wordCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={800}>Short Article (800 words)</option>
                  <option value={1500}>Medium Article (1,500 words)</option>
                  <option value={2500}>Long Article (2,500 words)</option>
                  <option value={4000}>In-depth Article (4,000+ words)</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's Your Objective?</h2>
              <p className="text-gray-600">Choose the main goal of your blog article</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {OBJECTIVES.map((objective) => {
                const Icon = objective.icon
                return (
                  <button
                    key={objective.id}
                    onClick={() => updateWizardData({ objective: objective.id })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      wizardData.objective === objective.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mb-2 ${
                      wizardData.objective === objective.id ? 'text-indigo-600' : 'text-gray-600'
                    }`} />
                    <h3 className="font-semibold text-gray-900">{objective.name}</h3>
                    <p className="text-sm text-gray-600">{objective.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Palette className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Style & Tone</h2>
              <p className="text-gray-600">Choose how you want to communicate</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article Style</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => updateWizardData({ style: style.id })}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        wizardData.style === style.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">{style.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{style.description}</p>
                      <p className="text-xs text-indigo-600 italic">{style.example}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Writing Tone</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => updateWizardData({ tone: tone.id })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        wizardData.tone === tone.id
                          ? 'border-indigo-500 bg-indigo-50'
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

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Edit3 className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Input</h2>
              <p className="text-gray-600">Provide the core information for your article</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Article Topic/Title</label>
                <input
                  type="text"
                  value={wizardData.topic}
                  onChange={(e) => updateWizardData({ topic: e.target.value })}
                  placeholder="e.g., The Ultimate Guide to Remote Work Productivity"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Points to Cover</label>
                <div className="space-y-2">
                  {wizardData.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...wizardData.keyPoints]
                          newPoints[index] = e.target.value
                          updateWizardData({ keyPoints: newPoints })
                        }}
                        placeholder={`Key point ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          const newPoints = wizardData.keyPoints.filter((_, i) => i !== index)
                          updateWizardData({ keyPoints: newPoints })
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateWizardData({ keyPoints: [...wizardData.keyPoints, ''] })}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
                  >
                    + Add Key Point
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">SEO & Keywords</h2>
              <p className="text-gray-600">Optimize your article for search engines</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Keywords</label>
                <div className="space-y-2">
                  {wizardData.keywords.map((keyword, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => {
                          const newKeywords = [...wizardData.keywords]
                          newKeywords[index] = e.target.value
                          updateWizardData({ keywords: newKeywords })
                        }}
                        placeholder={`Keyword ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          const newKeywords = wizardData.keywords.filter((_, i) => i !== index)
                          updateWizardData({ keywords: newKeywords })
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateWizardData({ keywords: [...wizardData.keywords, ''] })}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
                  >
                    + Add Keyword
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">SEO Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Include main keyword in title and first paragraph</li>
                  <li>• Use keywords naturally throughout content</li>
                  <li>• Aim for 1-2% keyword density</li>
                  <li>• Use related keywords and synonyms</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhancement & Persona</h2>
              <p className="text-gray-600">Add personality and final touches</p>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions</label>
                <textarea
                  value={wizardData.customInstructions}
                  onChange={(e) => updateWizardData({ customInstructions: e.target.value })}
                  placeholder="Any specific requirements, style preferences, or additional context..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <Eye className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Generate</h2>
              <p className="text-gray-600">Review your settings and generate your blog article</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Audience:</strong> {wizardData.targetAudience || 'Not specified'}</div>
                <div><strong>Word Count:</strong> ~{wizardData.wordCount} words</div>
                <div><strong>Objective:</strong> {OBJECTIVES.find(o => o.id === wizardData.objective)?.name || 'Not selected'}</div>
                <div><strong>Style:</strong> {STYLES.find(s => s.id === wizardData.style)?.name || 'Not selected'}</div>
                <div><strong>Tone:</strong> {TONES.find(t => t.id === wizardData.tone)?.name || 'Not selected'}</div>
                <div><strong>Keywords:</strong> {wizardData.keywords.length} specified</div>
              </div>
              <div><strong>Topic:</strong> {wizardData.topic || 'Not specified'}</div>
              <div><strong>Key Points:</strong> {wizardData.keyPoints.filter(p => p.trim()).length} points</div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !wizardData.topic}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isGenerating ? 'Generating Article...' : 'Generate Blog Article'}
            </button>

            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                Error: {error}
              </div>
            )}

            {generatedContent && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Generated Article:</h3>
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
      title="Blog Articles"
      subtitle="Create compelling long-form content"
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