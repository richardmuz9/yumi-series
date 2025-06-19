import axios from 'axios'

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://yumi77965.online/api' 
  : 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000, // 30 second timeout for compilation
})

// Research interfaces
export interface ResearchQuery {
  query: string
  source?: 'crossref' | 'arxiv' | 'pubmed' | 'all'
  maxResults?: number
}

export interface ResearchResult {
  title: string
  authors: string[]
  abstract?: string
  doi?: string
  arxivId?: string
  pubmedId?: string
  publishedDate?: string
  journal?: string
  url?: string
  citationKey?: string
}

export interface ResearchResponse {
  success: boolean
  results: ResearchResult[]
  totalFound: number
  source: string
  query: string
}

// File upload interfaces
export interface FileUploadResponse {
  success: boolean
  filename: string
  extractedText?: string
  metadata?: {
    title?: string
    author?: string
    pageCount?: number
    keywords?: string[]
  }
  error?: string
}

// Compilation interfaces
export interface CompilationRequest {
  latex: string
  options?: {
    engine?: 'pdflatex' | 'xelatex' | 'lualatex'
    bibtex?: boolean
    cleanup?: boolean
  }
}

export interface CompilationResponse {
  success: boolean
  pdfUrl?: string
  logOutput?: string
  error?: string
  warnings?: string[]
}

// Export interfaces
export interface ExportRequest {
  latex: string
  format: 'pdf' | 'docx' | 'html' | 'xlsx'
  filename?: string
  options?: Record<string, any>
}

export interface ExportResponse {
  success: boolean
  downloadUrl?: string
  filename?: string
  error?: string
}

// Plagiarism interfaces
export interface PlagiarismRequest {
  text: string
  options?: {
    threshold?: number
    checkSources?: string[]
  }
}

export interface PlagiarismResult {
  segment: string
  startIndex: number
  endIndex: number
  similarity: number
  matchedSource?: string
  matchedText?: string
}

export interface PlagiarismResponse {
  success: boolean
  overallSimilarity: number
  results: PlagiarismResult[]
  suggestions?: string[]
  error?: string
}

// Chat interfaces
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  actionType?: string
}

export interface ChatRequest {
  message: string
  context?: {
    currentLatex?: string
    activeAction?: string
  }
  history?: ChatMessage[]
}

export interface ChatResponse {
  success: boolean
  message: string
  actionData?: any
  suggestions?: string[]
  error?: string
}

// API Functions

// Research Functions
export const searchPapers = async (query: ResearchQuery): Promise<ResearchResponse> => {
  try {
    const response = await api.post('/report-writer/research', query)
    return response.data
  } catch (error) {
    console.error('Research API error:', error)
    throw new Error('Failed to search papers')
  }
}

export const getCitation = async (doi: string, format: string = 'bibtex'): Promise<string> => {
  try {
    const response = await api.get(`/report-writer/citation/${encodeURIComponent(doi)}`, {
      params: { format }
    })
    return response.data.citation
  } catch (error) {
    console.error('Citation API error:', error)
    throw new Error('Failed to get citation')
  }
}

// File Upload Functions
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/report-writer/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 1 minute for large files
    })
    
    return response.data
  } catch (error) {
    console.error('File upload error:', error)
    throw new Error('Failed to upload file')
  }
}

export const extractTextFromUrl = async (url: string): Promise<FileUploadResponse> => {
  try {
    const response = await api.post('/report-writer/extract-url', { url })
    return response.data
  } catch (error) {
    console.error('URL extraction error:', error)
    throw new Error('Failed to extract content from URL')
  }
}

// LaTeX Compilation Functions
export const compileLaTeX = async (request: CompilationRequest): Promise<CompilationResponse> => {
  try {
    const response = await api.post('/report-writer/compile', request)
    return response.data
  } catch (error) {
    console.error('LaTeX compilation error:', error)
    throw new Error('Failed to compile LaTeX')
  }
}

export const validateLaTeX = async (latex: string): Promise<{ valid: boolean; errors: string[] }> => {
  try {
    const response = await api.post('/report-writer/validate', { latex })
    return response.data
  } catch (error) {
    console.error('LaTeX validation error:', error)
    return { valid: false, errors: ['Validation service unavailable'] }
  }
}

// Export Functions
export const exportDocument = async (request: ExportRequest): Promise<ExportResponse> => {
  try {
    const response = await api.post('/report-writer/export', request)
    return response.data
  } catch (error) {
    console.error('Export error:', error)
    throw new Error('Failed to export document')
  }
}

export const getTemplates = async (): Promise<{ templates: any[] }> => {
  try {
    const response = await api.get('/report-writer/templates')
    return response.data
  } catch (error) {
    console.error('Templates error:', error)
    return { templates: [] }
  }
}

// Plagiarism Functions
export const checkPlagiarism = async (request: PlagiarismRequest): Promise<PlagiarismResponse> => {
  try {
    const response = await api.post('/report-writer/plagiarism', request)
    return response.data
  } catch (error) {
    console.error('Plagiarism check error:', error)
    throw new Error('Failed to check plagiarism')
  }
}

export const getSimilarityReport = async (text: string): Promise<any> => {
  try {
    const response = await api.post('/report-writer/similarity', { text })
    return response.data
  } catch (error) {
    console.error('Similarity report error:', error)
    throw new Error('Failed to generate similarity report')
  }
}

// Chat Functions
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await api.post('/report-writer/chat', request)
    return response.data
  } catch (error) {
    console.error('Chat API error:', error)
    throw new Error('Failed to send message')
  }
}

// Utility Functions
export const getStatus = async (): Promise<{ status: string; features: string[] }> => {
  try {
    const response = await api.get('/report-writer/status')
    return response.data
  } catch (error) {
    console.error('Status check error:', error)
    return { status: 'unknown', features: [] }
  }
}

export const getUsage = async (): Promise<{ tokensUsed: number; documentsCompiled: number }> => {
  try {
    const response = await api.get('/report-writer/usage')
    return response.data
  } catch (error) {
    console.error('Usage check error:', error)
    return { tokensUsed: 0, documentsCompiled: 0 }
  }
}

// Error handling helper
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export default {
  searchPapers,
  getCitation,
  uploadFile,
  extractTextFromUrl,
  compileLaTeX,
  validateLaTeX,
  exportDocument,
  getTemplates,
  checkPlagiarism,
  getSimilarityReport,
  sendChatMessage,
  getStatus,
  getUsage,
  handleApiError
} 