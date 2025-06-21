// Writing Helper Types
export interface WritingContent {
  text: string;
  type: 'blog' | 'social' | 'creative' | 'script';
  style?: WritingStyle;
  metadata?: ContentMetadata;
}

export interface WritingStyle {
  tone: string;
  voice: 'active' | 'passive';
  length: 'short' | 'medium' | 'long';
}

export interface ContentMetadata {
  title?: string;
  tags?: string[];
  platform?: string;
  targetAudience?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAssistConfig {
  enabled: boolean;
  analysisTypes: Array<'grammar' | 'style' | 'tone' | 'sentiment'>;
  autoSuggest: boolean;
  creativityLevel: number;
}

export interface Template {
  id: string;
  name: string;
  type: WritingContent['type'];
  content: string;
  style: WritingStyle;
  metadata?: ContentMetadata;
}

export interface WritingStats {
  wordCount: number;
  readingTime: number;
  sentiment: number;
  complexity: number;
} 