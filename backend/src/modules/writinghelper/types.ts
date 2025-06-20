// WritingHelper Module Types and Interfaces

export interface WritingRequest {
  contentType: 'social-media' | 'creative-writing' | 'blog-article' | 'script'
  platform?: string
  audience: string
  objective: string
  tone: string
  stylePack?: string
  animePersona?: string
  topic: string
  keyPoints: string[]
  pastPost?: string
  trendingHashtags?: string[]
  customInstructions?: string
  generateVariations?: boolean
  variationCount?: number
  model?: string
  provider?: string
}

export interface WritingVariation {
  id: string
  content: string
  changes: string[]
  confidence: number
}

export interface WritingResponse {
  content: string
  contentType: string
  platform?: string
  characterCount: number
  maxLength: number
  withinLimit: boolean
  provider: string
  model: string
  tokensUsed?: number
  tokensRemaining?: number
  variations?: WritingVariation[]
  variationCount?: number
}

export interface ContentTemplate {
  id: string
  name: string
  objective: string
  tone: string
  template: string
}

export interface ContentTypeConfig {
  name: string
  description: string
  maxLength: number
  templates: ContentTemplate[]
}

export interface PlatformLimits {
  [platform: string]: {
    maxLength: number
    recommendedLength: number
    features: string[]
  }
}

export interface AnimePersonaConfig {
  [persona: string]: string
}

export interface VariationStrategy {
  name: string
  apply: (text: string) => string
}

export interface StylePack {
  id: string
  name: string
  description: string
  toneAdjustments: {
    [tone: string]: string
  }
  templateModifiers: string[]
}

export interface VariationStrategy {
  name: string
  apply: (text: string) => string
} 