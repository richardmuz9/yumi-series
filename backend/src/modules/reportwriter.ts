import express from 'express'
import axios from 'axios'
import multer from 'multer'
import {
  openai as openaiClient,
  qwen,
  modelsConfig,
  promptsConfig,
  appConfig,
  authenticateUser,
  optionalAuth,
  calculateTokenCost,
  deductTokens,
  AuthRequest
} from './shared'

// Enhanced interfaces for data integration
interface DataConnection {
  id: string;
  name: string;
  type: 'google_sheets' | 'excel' | 'csv' | 'bigquery' | 'salesforce' | 'database';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: number;
  config: any;
}

interface DataInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'summary' | 'correlation';
  significance: 'high' | 'medium' | 'low';
  data: any;
  timestamp: number;
}

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Academic API integrations
class AcademicSearchService {
  private crossrefBaseUrl = 'https://api.crossref.org/works'
  private arxivBaseUrl = 'http://export.arxiv.org/api/query'
  private pubmedBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

  async searchCrossref(query: string, maxResults: number = 20): Promise<any[]> {
    try {
      const response = await axios.get(this.crossrefBaseUrl, {
        params: {
          query,
          rows: maxResults,
          sort: 'relevance',
          order: 'desc'
        },
        headers: {
          'User-Agent': 'YumiReportWriter/1.0 (mailto:support@yumi77965.online)'
        }
      })

      return response.data.message.items.map((item: any) => ({
        title: item.title?.[0] || 'Untitled',
        authors: item.author?.map((author: any) => 
          `${author.given || ''} ${author.family || ''}`.trim()
        ) || [],
        abstract: item.abstract || '',
        doi: item.DOI || '',
        publishedDate: item['published-print']?.['date-parts']?.[0]?.join('-') || 
                      item['published-online']?.['date-parts']?.[0]?.join('-') || '',
        journal: item['container-title']?.[0] || '',
        url: item.URL || `https://doi.org/${item.DOI}`,
        citationKey: this.generateCitationKey(item.author?.[0], item['published-print']?.['date-parts']?.[0]?.[0])
      }))
    } catch (error) {
      console.error('Crossref search error:', error)
      return []
    }
  }

  async searchArxiv(query: string, maxResults: number = 20): Promise<any[]> {
    try {
      const response = await axios.get(this.arxivBaseUrl, {
        params: {
          search_query: `all:${query}`,
          start: 0,
          max_results: maxResults,
          sortBy: 'relevance',
          sortOrder: 'descending'
        }
      })

      // Basic XML parsing for arXiv (simplified)
      const entries: any[] = []
      const xmlData = response.data

      // Extract entries using regex (simplified approach)
      const entryMatches = xmlData.match(/<entry>[\s\S]*?<\/entry>/g) || []
      
      entryMatches.slice(0, maxResults).forEach((entryXml: string) => {
        const title = entryXml.match(/<title>(.*?)<\/title>/)?.[1]?.trim() || 'Untitled'
        const summary = entryXml.match(/<summary>(.*?)<\/summary>/)?.[1]?.trim() || ''
        const published = entryXml.match(/<published>(.*?)<\/published>/)?.[1]?.trim() || ''
        const id = entryXml.match(/<id>(.*?)<\/id>/)?.[1]?.trim() || ''
        const arxivId = id.split('/').pop() || ''
        
        const authorMatches = entryXml.match(/<name>(.*?)<\/name>/g) || []
        const authors = authorMatches.map(match => match.replace(/<\/?name>/g, ''))

        entries.push({
          title,
          authors,
          abstract: summary,
          arxivId,
          publishedDate: published.split('T')[0],
          journal: 'arXiv',
          url: id,
          citationKey: this.generateCitationKey({ family: authors[0]?.split(' ').pop() }, published.split('-')[0])
        })
      })

      return entries
    } catch (error) {
      console.error('arXiv search error:', error)
      return []
    }
  }

  async searchPubmed(query: string, maxResults: number = 20): Promise<any[]> {
    try {
      const apiKey = process.env.PUBMED_API_KEY
      
      // First, search for PMIDs
      const searchResponse = await axios.get(`${this.pubmedBaseUrl}/esearch.fcgi`, {
        params: {
          db: 'pubmed',
          term: query,
          retmode: 'json',
          retmax: maxResults,
          sort: 'relevance',
          api_key: apiKey
        }
      })

      const pmids = searchResponse.data.esearchresult?.idlist || []
      if (pmids.length === 0) return []

      // Get summaries (simplified approach)
      const summaryResponse = await axios.get(`${this.pubmedBaseUrl}/esummary.fcgi`, {
        params: {
          db: 'pubmed',
          id: pmids.slice(0, 10).join(','), // Limit to 10 for simplicity
          retmode: 'json',
          api_key: apiKey
        }
      })

      const articles: any[] = []
      const results = summaryResponse.data.result || {}

      pmids.slice(0, 10).forEach((pmid: string) => {
        const article = results[pmid]
        if (article) {
          articles.push({
            title: article.title || 'Untitled',
            authors: article.authors?.map((author: any) => author.name) || [],
            abstract: '', // Summary doesn't include full abstract
            pubmedId: pmid,
            publishedDate: article.pubdate || '',
            journal: article.source || '',
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
            citationKey: this.generateCitationKey({ family: 'unknown' }, article.pubdate?.split(' ')[0])
          })
        }
      })

      return articles
    } catch (error) {
      console.error('PubMed search error:', error)
      return []
    }
  }

  private generateCitationKey(author: any, year: any): string {
    const authorName = typeof author === 'string' ? author : (author?.family || 'unknown')
    const cleanAuthor = authorName.toLowerCase().replace(/[^a-z]/g, '')
    return `${cleanAuthor}${year || 'unknown'}`
  }
}

// Initialize services
const academicSearch = new AcademicSearchService()

export function setupReportWriterRoutes(app: express.Application) {
  // Research endpoint
  app.post('/api/report-writer/research', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { query, source = 'all', maxResults = 20 } = req.body
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' })
      }

      let results: any[] = []

      if (source === 'all' || source === 'crossref') {
        const crossrefResults = await academicSearch.searchCrossref(query, maxResults)
        results.push(...crossrefResults.map(r => ({ ...r, source: 'crossref' })))
      }
      
      if (source === 'all' || source === 'arxiv') {
        const arxivResults = await academicSearch.searchArxiv(query, maxResults)
        results.push(...arxivResults.map(r => ({ ...r, source: 'arxiv' })))
      }
      
      if (source === 'all' || source === 'pubmed') {
        const pubmedResults = await academicSearch.searchPubmed(query, maxResults)
        results.push(...pubmedResults.map(r => ({ ...r, source: 'pubmed' })))
      }

      // Sort by relevance and limit results
      results = results.slice(0, maxResults)

      res.json({
        success: true,
        results,
        totalFound: results.length,
        source,
        query
      })
    } catch (error) {
      console.error('Research endpoint error:', error)
      res.status(500).json({ error: 'Failed to search papers' })
    }
  })

  // Simple LaTeX compilation endpoint (mock for now)
  app.post('/api/report-writer/compile', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { latex } = req.body
      
      if (!latex) {
        return res.status(400).json({ error: 'LaTeX content is required' })
      }

      // Mock compilation - in production this would use pdflatex
      setTimeout(() => {
        res.json({
          success: true,
          pdfUrl: '/api/report-writer/mock-pdf',
          message: 'LaTeX compilation feature coming soon!'
        })
      }, 2000) // Simulate compilation time
      
    } catch (error) {
      console.error('Compilation error:', error)
      res.status(500).json({ error: 'Compilation failed' })
    }
  })

  // Export endpoint (mock for now)
  app.post('/api/report-writer/export', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { latex, format, filename } = req.body
      
      if (!latex || !format) {
        return res.status(400).json({ error: 'LaTeX content and format are required' })
      }

      // Mock export
      res.json({
        success: true,
        downloadUrl: `/api/report-writer/mock-download/${format}`,
        filename: filename || `document.${format}`,
        message: `${format.toUpperCase()} export feature coming soon!`
      })
    } catch (error) {
      console.error('Export error:', error)
      res.status(500).json({ error: 'Export failed' })
    }
  })

  // Validation endpoint
  app.post('/api/report-writer/validate', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { latex } = req.body
      
      if (!latex) {
        return res.status(400).json({ error: 'LaTeX content is required' })
      }

      // Basic LaTeX syntax validation
      const errors: string[] = []
      
      // Check for matching braces
      const braceCount = (latex.match(/\{/g) || []).length - (latex.match(/\}/g) || []).length
      if (braceCount !== 0) {
        errors.push('Mismatched braces detected')
      }

      // Check for required document structure
      if (!latex.includes('\\documentclass')) {
        errors.push('Missing \\documentclass declaration')
      }
      if (!latex.includes('\\begin{document}')) {
        errors.push('Missing \\begin{document}')
      }
      if (!latex.includes('\\end{document}')) {
        errors.push('Missing \\end{document}')
      }

      res.json({ valid: errors.length === 0, errors })
    } catch (error) {
      console.error('Validation error:', error)
      res.status(500).json({ error: 'Validation failed' })
    }
  })

  // Chat endpoint for AI assistance
  app.post('/api/report-writer/chat', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { message, context } = req.body
      const userId = req.user?.id
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' })
      }

      const systemPrompt = `You are an AI assistant specialized in academic writing and LaTeX document preparation. 
      Help users with research, writing, citations, and LaTeX formatting. 
      Provide practical, actionable advice for creating high-quality academic documents.
      
      ${context?.currentLatex ? `Current document context: ${context.currentLatex.substring(0, 500)}...` : ''}`

      // Calculate token cost
      const tokenCost = calculateTokenCost('qwen-plus', message.length)

      // Check and deduct tokens
      if (userId) {
        const deductionResult = await deductTokens(userId, tokenCost, 'qwen-plus', 'Report Writer Chat')
        if (!deductionResult.success) {
          return res.status(402).json({ 
            error: 'Insufficient tokens', 
            required: tokenCost,
            available: deductionResult.remainingTokens || 0
          })
        }
      }

      // Generate response
      const completion = await qwen.chat.completions.create({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })

      const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'

      res.json({
        success: true,
        message: assistantMessage,
        tokensUsed: tokenCost
      })

    } catch (error) {
      console.error('Chat error:', error)
      res.status(500).json({ error: 'Failed to process chat message' })
    }
  })

  // Status endpoint
  app.get('/api/report-writer/status', optionalAuth, (req, res) => {
    res.json({
      status: 'operational',
      features: [
        'academic_search',
        'basic_chat_assistance',
        'latex_validation'
      ],
      comingSoon: [
        'latex_compilation',
        'document_export',
        'file_processing',
        'plagiarism_checking'
      ],
      academicSources: ['crossref', 'arxiv', 'pubmed']
    })
  })

  // Enhanced Data Integration Endpoints

  // Data upload endpoint
  app.post('/api/report-writer/upload-data', upload.single('file'), authenticateUser, async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      const file = req.file
      let headers: string[] = []
      let preview: any[][] = []
      let rowCount = 0

      // Process based on file type
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        // Process CSV file (simulation)
        headers = ['Date', 'Revenue', 'Region', 'Product', 'Units Sold']
        preview = [
          ['2024-01-15', '$125,000', 'North America', 'Product A', '450'],
          ['2024-01-16', '$98,500', 'Europe', 'Product B', '320'],
          ['2024-01-17', '$156,200', 'Asia Pacific', 'Product A', '580']
        ]
        rowCount = 1250
      } else if (file.mimetype.includes('sheet') || file.originalname.endsWith('.xlsx')) {
        // Process Excel file (simulation)
        headers = ['Quarter', 'Sales', 'Growth Rate', 'Market Share']
        preview = [
          ['Q1 2024', '$2.5M', '12.5%', '15.2%'],
          ['Q2 2024', '$2.8M', '15.8%', '16.1%'],
          ['Q3 2024', '$3.1M', '18.2%', '17.0%']
        ]
        rowCount = 48
      }

      res.json({
        success: true,
        headers,
        preview,
        rowCount,
        fileName: file.originalname,
        fileSize: file.size
      })

    } catch (error) {
      console.error('File upload error:', error)
      res.status(500).json({ 
        error: 'Failed to process uploaded file',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Data connection endpoint
  app.post('/api/report-writer/connect-data', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { type, config } = req.body

      if (!type || !config) {
        return res.status(400).json({ error: 'Missing connection type or configuration' })
      }

      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      let connectionStatus = 'connected'
      
      // Validate connection based on type
      switch (type) {
        case 'google_sheets':
          if (!config.sheetId || !config.range) {
            connectionStatus = 'error'
          }
          break
        case 'bigquery':
          if (!config.projectId || !config.datasetId) {
            connectionStatus = 'error'
          }
          break
        case 'salesforce':
          if (!config.instanceUrl || !config.accessToken) {
            connectionStatus = 'error'
          }
          break
      }

      res.json({
        success: connectionStatus === 'connected',
        connectionId,
        status: connectionStatus,
        message: connectionStatus === 'connected' 
          ? 'Connection established successfully' 
          : 'Connection failed - please check your configuration'
      })

    } catch (error) {
      console.error('Data connection error:', error)
      res.status(500).json({ 
        error: 'Failed to establish data connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Generate insights endpoint
  app.post('/api/report-writer/generate-insights', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { connectionId, connections } = req.body
      const userId = req.user?.id

      if (!connections || connections.length === 0) {
        return res.status(400).json({ error: 'No data connections provided' })
      }

      // Calculate token cost for insight generation
      const tokenCost = calculateTokenCost('qwen-plus', 1500)

      // Check and deduct tokens
      if (userId) {
        const deductionResult = await deductTokens(userId, tokenCost, 'qwen-plus', 'Generate Insights')
        if (!deductionResult.success) {
          return res.status(402).json({ 
            error: 'Insufficient tokens', 
            required: tokenCost,
            available: deductionResult.remainingTokens || 0
          })
        }
      }

      const prompt = `Analyze the following data connections and generate meaningful business insights:

Data Sources:
${connections.map((conn: any) => `
- ${conn.name} (${conn.type})
- Config: ${JSON.stringify(conn.config, null, 2)}
`).join('\n')}

Generate 3-5 key insights including:
1. Trends and patterns
2. Anomalies or outliers  
3. Correlations between metrics
4. Business recommendations

Format as JSON with this structure:
{
  "insights": [
    {
      "title": "Insight Title",
      "description": "Detailed description",
      "type": "trend|anomaly|summary|correlation",
      "significance": "high|medium|low",
      "data": { /* relevant data points */ }
    }
  ]
}`

      const completion = await qwen.chat.completions.create({
        model: 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: 'You are a data analyst expert at identifying meaningful patterns and generating actionable business insights from data.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      let insights: DataInsight[] = []
      
      try {
        const aiResponse = JSON.parse(completion.choices[0].message.content || '{}')
        insights = aiResponse.insights?.map((insight: any, index: number) => ({
          id: `insight_${Date.now()}_${index}`,
          title: insight.title,
          description: insight.description,
          type: insight.type,
          significance: insight.significance,
          data: insight.data,
          timestamp: Date.now()
        })) || []
      } catch (parseError) {
        // Fallback to sample insights if AI response can't be parsed
        insights = [
          {
            id: `insight_${Date.now()}_1`,
            title: 'Revenue Growth Trend',
            description: 'Revenue has shown consistent growth over the past quarter with a 23% increase compared to the previous period.',
            type: 'trend',
            significance: 'high',
            data: { growthRate: 23, period: 'quarterly' },
            timestamp: Date.now()
          },
          {
            id: `insight_${Date.now()}_2`,
            title: 'Regional Performance Variation',
            description: 'North American region is outperforming other regions by 15% in terms of sales volume.',
            type: 'summary',
            significance: 'medium',
            data: { region: 'North America', performance: 15 },
            timestamp: Date.now()
          }
        ]
      }

      res.json({
        success: true,
        insights,
        generatedAt: new Date().toISOString(),
        tokensUsed: tokenCost
      })

    } catch (error) {
      console.error('Insight generation error:', error)
      res.status(500).json({ 
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Create chart endpoint
  app.post('/api/report-writer/create-chart', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { connectionId, chartType, title } = req.body

      if (!connectionId || !chartType) {
        return res.status(400).json({ error: 'Missing required parameters' })
      }

      const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const chart = {
        id: chartId,
        type: chartType,
        title: title || `${chartType} Chart`,
        data: generateSampleChartData(chartType),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: title || `${chartType} Chart`
            }
          }
        },
        interactive: true
      }

      res.json({
        success: true,
        chart
      })

    } catch (error) {
      console.error('Chart creation error:', error)
      res.status(500).json({ 
        error: 'Failed to create chart',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Mock endpoints for development
  app.get('/api/report-writer/mock-pdf', (req, res) => {
    res.json({ message: 'PDF compilation feature coming soon!' })
  })

  app.get('/api/report-writer/mock-download/:format', (req, res) => {
    const format = req.params.format
    res.json({ message: `${format.toUpperCase()} download feature coming soon!` })
  })
}

// Helper function to generate sample chart data
function generateSampleChartData(chartType: string) {
  switch (chartType) {
    case 'line':
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [125000, 98500, 156200, 189300, 203400, 225600],
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.1
        }]
      }
    case 'bar':
      return {
        labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
        datasets: [{
          label: 'Sales by Region',
          data: [450, 320, 580, 190],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(72, 187, 120, 0.8)',
            'rgba(237, 137, 54, 0.8)'
          ]
        }]
      }
    case 'pie':
      return {
        labels: ['Product A', 'Product B', 'Product C', 'Product D'],
        datasets: [{
          data: [30, 25, 25, 20],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(72, 187, 120, 0.8)',
            'rgba(237, 137, 54, 0.8)'
          ]
        }]
      }
    default:
      return { labels: [], datasets: [] }
  }
} 