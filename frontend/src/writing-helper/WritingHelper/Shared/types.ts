export interface PostVariation {
  id: string
  content: string
  changes: string[]
  confidence: number
}

// Wizard Data Types
export interface SocialWizardData {
  contentType: 'social-media'
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
}

export interface BlogWizardData {
  contentType: 'blog-article'
  objective: string
  tone: string
  style: string
  topic: string
  keyPoints: string[]
  targetAudience: string
  wordCount: number
  keywords: string[]
  animePersona: string
  customInstructions: string
}

export interface CreativeWizardData {
  contentType: 'creative-writing'
  genre: string
  style: string
  tone: string
  theme: string
  setting: string
  characters: string[]
  plotPoints: string[]
  wordCount: number
  animePersona: string
  customInstructions: string
}

export interface GalgameWizardData {
  contentType: 'galgame-script'
  genre: string
  style: string
  sceneType: string
  characters: string[]
  setting: string
  plotSummary: string
  dialogueLength: 'short' | 'medium' | 'long'
  includeChoices: boolean
  animePersona: string
  customInstructions: string
}

// Option Types
export interface SocialMediaPlatform {
  id: string
  name: string
  description: string
  maxLength: number
  icon: any
}

export interface SocialMediaAudience {
  id: string
  name: string
  description: string
}

export interface SocialMediaObjective {
  id: string
  name: string
  description: string
  icon: any
}

export interface SocialMediaTone {
  id: string
  name: string
  description: string
}

export interface SocialMediaStylePack {
  id: string
  name: string
  description: string
}

export interface BlogArticleObjective {
  id: string
  name: string
  description: string
  icon: any
}

export interface BlogArticleTone {
  id: string
  name: string
  description: string
}

export interface BlogArticleStyle {
  id: string
  name: string
  description: string
  example: string
}

export interface CreativeGenre {
  id: string
  name: string
  description: string
  icon: any
}

export interface CreativeStyle {
  id: string
  name: string
  description: string
}

export interface CreativeTone {
  id: string
  name: string
  description: string
}

export interface GalgameGenre {
  id: string
  name: string
  description: string
  icon: any
}

export interface GalgameStyle {
  id: string
  name: string
  description: string
}

export interface SceneType {
  id: string
  name: string
  description: string
}

// Legacy types for compatibility
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

// Component Props
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
  tokens?: number
  tokensRemaining?: number
  totalTokensUsed?: number
  freeTokensUsedThisMonth?: number
  subscriptionStatus?: string
  createdAt?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isDemo: boolean
  authLoading: boolean
} 