export interface PostVariation {
  id: string
  content: string
  changes: string[]
  confidence: number
}

export interface BaseWizardState {
  step: number
  objective: string
  tone: string
  stylePack: string
  animePersona: string
  topic: string
  keyPoints: string[]
  pastPost: string
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

export interface SocialMediaState extends BaseWizardState {
  contentType: 'social-media'
  platform: string
  audience: string
  trendingHashtags: string[]
}

export interface BlogArticleState extends BaseWizardState {
  contentType: 'blog-article'
  category: string
  targetLength: number
  seoKeywords: string[]
  outline: string[]
}

export interface CreativeWritingState extends BaseWizardState {
  contentType: 'creative-writing'
  genre: string
  targetAudience: string
  setting: string
  characters: string[]
  plotPoints: string[]
}

export interface GalgameScriptState extends BaseWizardState {
  contentType: 'script'
  sceneType: string
  characters: string[]
  mood: string
  backgroundMusic: string
  visualDescription: string
}

export type WizardState = SocialMediaState | BlogArticleState | CreativeWritingState | GalgameScriptState

export interface WizardLayoutProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
  onNext: () => void
  onPrev: () => void
  onBack: () => void
  canProceed: boolean
  children: React.ReactNode
}

export interface ContentTypeOption {
  key: 'social-media' | 'blog-article' | 'creative-writing' | 'script'
  title: string
  subtitle: string
  icon: string
  description: string
}

// User and authentication types
export interface User {
  id: number
  email: string
  username: string
  tokensRemaining: number
  totalTokensUsed: number
  freeTokensUsedThisMonth: number
  subscriptionStatus: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  authLoading: boolean
  isDemoMode: boolean
} 