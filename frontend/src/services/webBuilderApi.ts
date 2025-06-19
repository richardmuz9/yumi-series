// API utility function for making authenticated requests
const directApiCall = async (url: string, options: RequestInit = {}) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}

// Types
export interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  htmlContent: string
  cssContent: string
  jsContent?: string
  tags: string[]
  isPremium: boolean
  author: string
  rating: number
  downloads: number
}

export interface WebsiteProject {
  id: string
  name: string
  description: string
  htmlContent: string
  cssContent: string
  jsContent?: string
  thumbnail?: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  lastModified: string
  deployments: Deployment[]
  analytics?: ProjectAnalytics
}

export interface ComponentBlock {
  id: string
  name: string
  description: string
  category: 'layout' | 'content' | 'forms' | 'navigation' | 'media' | 'interactive'
  icon: string
  html: string
  css: string
  js?: string
  props?: ComponentProp[]
  preview: string
  tags: string[]
}

export interface ComponentProp {
  name: string
  type: 'text' | 'number' | 'color' | 'boolean' | 'select' | 'image'
  label: string
  defaultValue: any
  options?: string[]
}

export interface Deployment {
  id: string
  platform: 'vercel' | 'netlify' | 'github' | 'custom'
  url: string
  status: 'pending' | 'success' | 'failed'
  deployedAt: string
  environment: 'development' | 'staging' | 'production'
  buildLog?: string
}

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'github' | 'custom'
  domain?: string
  environment: 'development' | 'staging' | 'production'
  envVariables?: Record<string, string>
  buildCommand?: string
  outputDirectory?: string
}

export interface ProjectAnalytics {
  visitors: number
  pageViews: number
  bounceRate: number
  avgSessionDuration: number
  topPages: Array<{ path: string; views: number }>
  traffic: Array<{ date: string; visitors: number }>
  performanceScore: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  codeChanges?: {
    html?: string
    css?: string
    js?: string
  }
  suggestions?: string[]
}

export interface AIGenerationRequest {
  prompt: string
  type: 'complete' | 'component' | 'style' | 'feature'
  context?: {
    existingCode?: {
      html: string
      css: string
      js?: string
    }
    projectType?: string
    targetAudience?: string
  }
}

export interface AIGenerationResponse {
  html: string
  css: string
  js?: string
  explanation: string
  suggestions: string[]
}

export interface WebBuilderStats {
  totalProjects: number
  totalTemplates: number
  totalComponents: number
  recentActivity: Array<{
    type: 'project_created' | 'project_updated' | 'deployment' | 'template_used'
    message: string
    timestamp: string
  }>
}

// API Service Class
export class WebBuilderService {
  
  // Project Management
  static async getProjects(): Promise<WebsiteProject[]> {
    return directApiCall('/api/web-builder/projects')
  }

  static async getProject(projectId: string): Promise<WebsiteProject> {
    return directApiCall(`/api/web-builder/projects/${projectId}`)
  }

  static async createProject(data: {
    name: string
    description: string
    templateId?: string
  }): Promise<WebsiteProject> {
    return directApiCall('/api/web-builder/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  static async updateProject(projectId: string, data: Partial<WebsiteProject>): Promise<WebsiteProject> {
    return directApiCall(`/api/web-builder/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  static async deleteProject(projectId: string): Promise<{ success: boolean }> {
    return directApiCall(`/api/web-builder/projects/${projectId}`, {
      method: 'DELETE'
    })
  }

  static async duplicateProject(projectId: string, newName?: string): Promise<WebsiteProject> {
    return directApiCall(`/api/web-builder/projects/${projectId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newName })
    })
  }

  // Template Management
  static async getTemplates(category?: string): Promise<Template[]> {
    const params = category ? `?category=${category}` : ''
    return directApiCall(`/api/web-builder/templates${params}`)
  }

  static async getTemplate(templateId: string): Promise<Template> {
    return directApiCall(`/api/web-builder/templates/${templateId}`)
  }

  static async searchTemplates(query: string, filters?: {
    category?: string
    tags?: string[]
    isPremium?: boolean
  }): Promise<Template[]> {
    const params = new URLSearchParams({ query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.append(key, String(value))
          }
        }
      })
    }
    
    return directApiCall(`/api/web-builder/templates/search?${params}`)
  }

  // Component Library
  static async getComponentLibrary(category?: string): Promise<ComponentBlock[]> {
    const params = category ? `?category=${category}` : ''
    return directApiCall(`/api/web-builder/components${params}`)
  }

  static async getComponent(componentId: string): Promise<ComponentBlock> {
    return directApiCall(`/api/web-builder/components/${componentId}`)
  }

  static async createCustomComponent(data: Omit<ComponentBlock, 'id'>): Promise<ComponentBlock> {
    return directApiCall('/api/web-builder/components', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // AI Generation
  static async generateWebsite(prompt: string, options?: {
    type?: string
    style?: string
    pages?: string[]
  }): Promise<AIGenerationResponse> {
    return directApiCall('/api/web-builder/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, options })
    })
  }

  static async generateComponent(prompt: string, category: string): Promise<AIGenerationResponse> {
    return directApiCall('/api/web-builder/ai/generate-component', {
      method: 'POST',
      body: JSON.stringify({ prompt, category })
    })
  }

  static async improveCode(code: {
    html: string
    css: string
    js?: string
  }, instructions: string): Promise<AIGenerationResponse> {
    return directApiCall('/api/web-builder/ai/improve', {
      method: 'POST',
      body: JSON.stringify({ code, instructions })
    })
  }

  static async chatWithAI(messages: ChatMessage[], context?: any): Promise<{
    message: string
    suggestions?: string[]
    codeChanges?: {
      html?: string
      css?: string
      js?: string
    }
  }> {
    return directApiCall('/api/web-builder/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, context })
    })
  }

  // Code Analysis and Optimization
  static async analyzeCode(code: {
    html: string
    css: string
    js?: string
  }): Promise<{
    performance: number
    accessibility: number
    seo: number
    bestPractices: number
    issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      line?: number
      file: 'html' | 'css' | 'js'
    }>
    suggestions: string[]
  }> {
    return directApiCall('/api/web-builder/analyze', {
      method: 'POST',
      body: JSON.stringify(code)
    })
  }

  static async optimizeCode(code: {
    html: string
    css: string
    js?: string
  }, options: {
    minify?: boolean
    removeUnused?: boolean
    optimizeImages?: boolean
  }): Promise<{
    html: string
    css: string
    js?: string
    savings: {
      originalSize: number
      optimizedSize: number
      percentage: number
    }
  }> {
    return directApiCall('/api/web-builder/optimize', {
      method: 'POST',
      body: JSON.stringify({ code, options })
    })
  }

  // Deployment
  static async deployWebsite(projectId: string, config: DeploymentConfig): Promise<{
    deployment: Deployment
    url: string
  }> {
    return directApiCall(`/api/web-builder/projects/${projectId}/deploy`, {
      method: 'POST',
      body: JSON.stringify(config)
    })
  }

  static async getDeployments(projectId: string): Promise<Deployment[]> {
    return directApiCall(`/api/web-builder/projects/${projectId}/deployments`)
  }

  static async getDeploymentStatus(deploymentId: string): Promise<Deployment> {
    return directApiCall(`/api/web-builder/deployments/${deploymentId}`)
  }

  static async deleteDeployment(deploymentId: string): Promise<{ success: boolean }> {
    return directApiCall(`/api/web-builder/deployments/${deploymentId}`, {
      method: 'DELETE'
    })
  }

  // Domain Management
  static async getDomains(): Promise<Array<{
    id: string
    domain: string
    status: 'active' | 'pending' | 'failed'
    projectId?: string
    expiresAt?: string
  }>> {
    return directApiCall('/api/web-builder/domains')
  }

  static async connectDomain(domain: string, projectId: string): Promise<{
    success: boolean
    verification: {
      type: 'CNAME' | 'A'
      name: string
      value: string
    }
  }> {
    return directApiCall('/api/web-builder/domains', {
      method: 'POST',
      body: JSON.stringify({ domain, projectId })
    })
  }

  // Analytics
  static async getProjectAnalytics(projectId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<ProjectAnalytics> {
    return directApiCall(`/api/web-builder/projects/${projectId}/analytics?range=${timeRange}`)
  }

  static async getWebBuilderStats(): Promise<WebBuilderStats> {
    return directApiCall('/api/web-builder/stats')
  }

  // Asset Management
  static async uploadAsset(file: File, projectId?: string): Promise<{
    url: string
    filename: string
    size: number
    type: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    if (projectId) formData.append('projectId', projectId)

    return directApiCall('/api/web-builder/assets/upload', {
      method: 'POST',
      body: formData
    })
  }

  static async getAssets(projectId?: string): Promise<Array<{
    id: string
    filename: string
    url: string
    size: number
    type: string
    uploadedAt: string
  }>> {
    const params = projectId ? `?projectId=${projectId}` : ''
    return directApiCall(`/api/web-builder/assets${params}`)
  }

  static async deleteAsset(assetId: string): Promise<{ success: boolean }> {
    return directApiCall(`/api/web-builder/assets/${assetId}`, {
      method: 'DELETE'
    })
  }

  // Collaboration
  static async shareProject(projectId: string, permissions: {
    email: string
    role: 'viewer' | 'editor' | 'admin'
  }): Promise<{ success: boolean }> {
    return directApiCall(`/api/web-builder/projects/${projectId}/share`, {
      method: 'POST',
      body: JSON.stringify(permissions)
    })
  }

  static async getProjectCollaborators(projectId: string): Promise<Array<{
    id: string
    email: string
    role: 'viewer' | 'editor' | 'admin'
    addedAt: string
  }>> {
    return directApiCall(`/api/web-builder/projects/${projectId}/collaborators`)
  }

  // Import/Export
  static async exportProject(projectId: string, format: 'zip' | 'github' | 'figma'): Promise<{
    downloadUrl: string
    expiresAt: string
  }> {
    return directApiCall(`/api/web-builder/projects/${projectId}/export?format=${format}`)
  }

  static async importProject(data: {
    source: 'zip' | 'github' | 'figma' | 'url'
    url?: string
    file?: File
    options?: any
  }): Promise<WebsiteProject> {
    const formData = new FormData()
    formData.append('source', data.source)
    if (data.url) formData.append('url', data.url)
    if (data.file) formData.append('file', data.file)
    if (data.options) formData.append('options', JSON.stringify(data.options))

    return directApiCall('/api/web-builder/projects/import', {
      method: 'POST',
      body: formData
    })
  }

  // Version Control
  static async getProjectVersions(projectId: string): Promise<Array<{
    id: string
    message: string
    createdAt: string
    author: string
    changes: {
      html: boolean
      css: boolean
      js: boolean
    }
  }>> {
    return directApiCall(`/api/web-builder/projects/${projectId}/versions`)
  }

  static async createVersion(projectId: string, message: string): Promise<{ success: boolean }> {
    return directApiCall(`/api/web-builder/projects/${projectId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
  }

  static async restoreVersion(projectId: string, versionId: string): Promise<WebsiteProject> {
    return directApiCall(`/api/web-builder/projects/${projectId}/versions/${versionId}/restore`, {
      method: 'POST'
    })
  }

  // Form Builder
  static async createForm(projectId: string, formData: {
    name: string
    fields: Array<{
      type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio'
      name: string
      label: string
      required: boolean
      options?: string[]
    }>
    settings: {
      method: 'POST' | 'GET'
      action?: string
      successMessage: string
      errorMessage: string
    }
  }): Promise<{
    id: string
    html: string
    css: string
    js: string
  }> {
    return directApiCall(`/api/web-builder/projects/${projectId}/forms`, {
      method: 'POST',
      body: JSON.stringify(formData)
    })
  }

  // SEO Tools
  static async analyzeSEO(projectId: string): Promise<{
    score: number
    issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      impact: 'high' | 'medium' | 'low'
    }>
    suggestions: string[]
    keywords: string[]
    metaTags: {
      title?: string
      description?: string
      keywords?: string
    }
  }> {
    return directApiCall(`/api/web-builder/projects/${projectId}/seo`)
  }

  static async generateSEOContent(projectId: string, targetKeywords: string[]): Promise<{
    title: string
    description: string
    headings: string[]
    content: string
  }> {
    return directApiCall(`/api/web-builder/projects/${projectId}/seo/generate`, {
      method: 'POST',
      body: JSON.stringify({ targetKeywords })
    })
  }
} 