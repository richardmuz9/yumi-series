// ReportWriter Module Types and Interfaces

export interface DataConnection {
  id: string
  name: string
  type: 'google_sheets' | 'excel' | 'csv' | 'bigquery' | 'salesforce' | 'database'
  status: 'connected' | 'disconnected' | 'error'
  lastSync: number
  config: any
}

export interface DataInsight {
  id: string
  title: string
  description: string
  type: 'trend' | 'anomaly' | 'summary' | 'correlation'
  significance: 'high' | 'medium' | 'low'
  data: any
  timestamp: number
}

export interface AcademicSource {
  title: string
  authors: string[]
  abstract: string
  doi?: string
  arxivId?: string
  pubmedId?: string
  publishedDate: string
  journal: string
  url: string
  citationKey: string
}

export interface ResearchRequest {
  query: string
  source?: 'all' | 'crossref' | 'arxiv' | 'pubmed'
  maxResults?: number
}

export interface ReportSection {
  id: string
  title: string
  content: string
  type: 'introduction' | 'methodology' | 'results' | 'discussion' | 'conclusion'
  order: number
}

export interface ReportGenerationRequest {
  title: string
  topic: string
  sections: string[]
  style: 'academic' | 'business' | 'technical' | 'informal'
  length: 'short' | 'medium' | 'long'
  includeCharts?: boolean
  includeCitations?: boolean
  sources?: AcademicSource[]
  customInstructions?: string
}

export interface ReportGenerationResponse {
  content: string
  sections: ReportSection[]
  wordCount: number
  estimatedReadTime: number
  citations?: string[]
  charts?: ChartData[]
  latex?: string
}

export interface ChartData {
  id: string
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area'
  title: string
  data: any[]
  config: any
}

export interface LaTeXDocument {
  title: string
  author: string
  content: string
  packages: string[]
  bibliography?: string[]
}

export interface CollaborationSession {
  id: string
  reportId: string
  participants: string[]
  changes: any[]
  createdAt: string
  lastActivity: string
}

export interface Comment {
  id: string
  sectionId: string
  author: string
  content: string
  resolved: boolean
  createdAt: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  sections: string[]
  style: string
  preview: string
} 