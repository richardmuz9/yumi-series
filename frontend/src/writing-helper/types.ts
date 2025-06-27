import { ReactNode } from 'react';

// Writing Helper Types
export interface WritingContent {
  text: string;
  type: 'blog' | 'social' | 'creative' | 'script' | 'research';
  style?: WritingStyle;
  metadata?: ContentMetadata;
  citations?: Citation[];
  equations?: Equation[];
  figures?: Figure[];
}

export interface WritingStyle {
  tone: string;
  voice: 'active' | 'passive';
  length: 'short' | 'medium' | 'long';
  citationStyle?: 'APA' | 'MLA' | 'IEEE' | 'Chicago';
}

export interface ContentMetadata {
  title?: string;
  tags?: string[];
  platform?: string;
  targetAudience?: string;
  createdAt: Date;
  updatedAt: Date;
  authors?: string[];
  abstract?: string;
  keywords?: string[];
}

export interface Citation {
  id: string;
  type: 'article' | 'book' | 'conference' | 'website' | 'other';
  title: string;
  authors: string[];
  year: number;
  source: string;
  doi?: string;
  url?: string;
  bibtex: string;
  inTextCitation: string;
  bibliography: string;
}

export interface Equation {
  id: string;
  latex: string;
  displayMode: boolean;
  description?: string;
  number: number;
}

export interface Figure {
  id: string;
  type: 'chart' | 'image';
  title: string;
  caption?: string;
  source?: string;
  dataJson?: string;
  configJson?: string;
  format: string;
}

export interface AIAssistConfig {
  enabled: boolean;
  analysisTypes: Array<'grammar' | 'style' | 'tone' | 'sentiment' | 'plagiarism' | 'clarity'>;
  autoSuggest: boolean;
  creativityLevel: number;
  model?: string;
  provider?: string;
}

export interface Template {
  id: string;
  name: string;
  type: WritingContent['type'];
  content: string;
  style: WritingStyle;
  metadata?: ContentMetadata;
  sections?: Section[];
}

export interface Section {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'equation' | 'figure' | 'code' | 'references';
  comments?: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
  resolved: boolean;
}

export interface WritingStats {
  wordCount: number;
  readingTime: number;
  sentiment: number;
  complexity: number;
  citationCount: number;
  figureCount: number;
  equationCount: number;
}

export type ToolKey = 'templates' | 'style' | 'trending' | 'ai' | 'enhance' | 'export' | 'test' | 
  'research' | 'citations' | 'equations' | 'figures' | 'versions' | 'summary';

export interface Tool {
  key: ToolKey;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
}

export type ToolsConfig = Record<ToolKey, Tool>;

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