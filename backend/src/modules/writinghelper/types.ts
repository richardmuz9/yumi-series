// WritingHelper Module Types and Interfaces

export interface WritingRequest {
  contentType: 'social-media' | 'creative-writing' | 'blog-article' | 'script' | 'research-paper'
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
  citationStyle?: 'APA' | 'MLA' | 'IEEE' | 'Chicago'
  citations?: Citation[]
  equations?: Equation[]
  figures?: Figure[]
}

export interface Citation {
  id: string
  type: 'article' | 'book' | 'conference' | 'website' | 'other'
  title: string
  authors: string[]
  year: number
  source: string
  doi?: string
  url?: string
  citationStyle?: string
  bibtex: string
  inTextCitation: string
  bibliography: string
}

export interface Equation {
  id: string
  userId: string
  latex: string
  displayMode: boolean
  description?: string
  number: number
  createdAt: Date
  updatedAt: Date
}

export interface Figure {
  id: string
  userId: string
  type: 'chart' | 'image'
  title: string
  caption?: string
  source?: string
  dataJson?: string
  configJson?: string
  format: string
  createdAt: Date
  updatedAt: Date
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
  citations?: Citation[]
  equations?: Equation[]
  figures?: Figure[]
  plagiarismScore?: number
  grammarScore?: number
  clarityScore?: number
}

export interface ContentTemplate {
  id: string
  name: string
  objective: string
  tone: string
  template: string
  type?: 'research-paper' | 'white-paper' | 'business-report'
  sections?: Section[]
}

export interface Section {
  id: string
  title: string
  content: string
  type: 'text' | 'equation' | 'figure' | 'code' | 'references'
  comments?: Comment[]
}

export interface Comment {
  id: string
  userId: string
  text: string
  timestamp: Date
  resolved: boolean
}

export interface ContentTypeConfig {
  name: string
  description: string
  maxLength: number
  templates: ContentTemplate[]
  citationStyles?: Array<'APA' | 'MLA' | 'IEEE' | 'Chicago'>
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

export interface ResearchSource {
  id: string
  type: 'crossref' | 'arxiv' | 'pubmed'
  query: string
  results: Citation[]
  timestamp: Date
}

export interface PlagiarismResult {
  score: number
  matches: Array<{
    text: string
    source: string
    similarity: number
  }>
}

export interface WritingAnalysis {
  grammar: {
    score: number
    suggestions: Array<{
      text: string
      suggestion: string
      reason: string
    }>
  }
  clarity: {
    score: number
    suggestions: Array<{
      text: string
      suggestion: string
      reason: string
    }>
  }
  plagiarism: PlagiarismResult
}

export interface WritingProject {
  id: string;
  title: string;
  type: 'manga' | 'novel' | 'script';
  chapters: Array<{
    id: string;
    title: string;
    content: string;
    scenes: Array<{
      id: string;
      description: string;
      content: string;
      characters: string[];
      location?: string;
      mood?: string;
    }>;
    metadata?: {
      timeOfDay?: string;
      weather?: string;
      location?: string;
      characters?: string[];
    };
  }>;
  metadata: {
    author: string;
    description?: string;
    genre?: string[];
    targetAudience?: string;
    status: 'draft' | 'in-progress' | 'complete';
    created: string;
    modified: string;
  };
  settings: {
    language: string;
    style?: string;
    aiAssistance?: {
      enabled: boolean;
      model?: string;
      temperature?: number;
    };
  };
} 