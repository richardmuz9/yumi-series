// ReportWriter Module Services and Business Logic
import axios from 'axios'
import { qwen, modelsConfig, calculateTokenCost, deductTokens } from '../shared'
import { AcademicSource, ReportGenerationRequest, ReportGenerationResponse, ChartData } from './types'

// Academic API integrations
export class AcademicSearchService {
  private crossrefBaseUrl = 'https://api.crossref.org/works'
  private arxivBaseUrl = 'http://export.arxiv.org/api/query'
  private pubmedBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

  async searchCrossref(query: string, maxResults: number = 20): Promise<AcademicSource[]> {
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

  async searchArxiv(query: string, maxResults: number = 20): Promise<AcademicSource[]> {
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

      const entries: AcademicSource[] = []
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

  async searchPubmed(query: string, maxResults: number = 20): Promise<AcademicSource[]> {
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

      const articles: AcademicSource[] = []
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

  async searchAll(query: string, maxResults: number = 20): Promise<AcademicSource[]> {
    const resultsPerSource = Math.ceil(maxResults / 2)
    
    const [crossrefResults, arxivResults] = await Promise.all([
      this.searchCrossref(query, resultsPerSource),
      this.searchArxiv(query, resultsPerSource)
    ])

    return [...crossrefResults, ...arxivResults].slice(0, maxResults)
  }
}

// AI Report Generation Service
export class ReportGenerationService {
  async generateReport(request: ReportGenerationRequest, userId?: number): Promise<ReportGenerationResponse> {
    const { title, topic, sections, style, length, sources = [] } = request

    // Build comprehensive prompt
    const systemPrompt = this.buildSystemPrompt(style)
    const userPrompt = this.buildUserPrompt(request)

    // Calculate token cost
    const tokenCost = calculateTokenCost(modelsConfig.providers.qwen.defaultModel, userPrompt.length)

    // Check and deduct tokens if user is provided
    if (userId) {
      const deductionResult = await deductTokens(userId, tokenCost, modelsConfig.providers.qwen.defaultModel, 'Report generation')
      if (!deductionResult.success) {
        throw new Error(`Insufficient tokens. Required: ${tokenCost}, Available: ${deductionResult.remainingTokens || 0}`)
      }
    }

    try {
      const completion = await qwen.chat.completions.create({
        model: modelsConfig.providers.qwen.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.getMaxTokensForLength(length),
        temperature: 0.7
      })

      const content = completion.choices[0]?.message?.content || ''
      
      // Parse sections from content
      const reportSections = this.parseContentIntoSections(content, sections)
      
      return {
        content,
        sections: reportSections,
        wordCount: this.countWords(content),
        estimatedReadTime: this.calculateReadTime(content)
      }

    } catch (error) {
      console.error('Report generation error:', error)
      throw new Error('Failed to generate report')
    }
  }

  private buildSystemPrompt(style: string): string {
    const stylePrompts = {
      academic: 'You are an academic researcher writing a scholarly report. Use formal language, proper citations, and structured arguments.',
      business: 'You are a business analyst creating a professional report. Focus on actionable insights, clear recommendations, and executive summary.',
      technical: 'You are a technical writer creating detailed documentation. Use precise terminology, step-by-step explanations, and clear examples.',
      informal: 'You are writing an informative but approachable report. Use conversational tone while maintaining accuracy and clarity.'
    }

    return stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.academic
  }

  private buildUserPrompt(request: ReportGenerationRequest): string {
    let prompt = `Write a comprehensive report titled "${request.title}" about ${request.topic}.`
    
    if (request.sections.length > 0) {
      prompt += `\n\nThe report should include these sections: ${request.sections.join(', ')}`
    }

    if (request.sources && request.sources.length > 0) {
      prompt += `\n\nReference these sources when relevant:\n`
      request.sources.forEach(source => {
        prompt += `- ${source.title} by ${source.authors.join(', ')} (${source.journal}, ${source.publishedDate})\n`
      })
    }

    if (request.customInstructions) {
      prompt += `\n\nAdditional instructions: ${request.customInstructions}`
    }

    return prompt
  }

  private getMaxTokensForLength(length: string): number {
    const lengthMap = {
      short: 1000,
      medium: 2000,
      long: 3000
    }
    return lengthMap[length as keyof typeof lengthMap] || 2000
  }

  private parseContentIntoSections(content: string, sectionNames: string[]): any[] {
    const sections: any[] = []
    const lines = content.split('\n')
    let currentSection = { id: 'intro', title: 'Introduction', content: '', type: 'introduction', order: 0 }
    
    lines.forEach((line) => {
      if (line.startsWith('##') || line.startsWith('#')) {
        if (currentSection.content.trim()) {
          sections.push(currentSection)
        }
        currentSection = {
          id: `section_${sections.length}`,
          title: line.replace(/#+\s*/, ''),
          content: '',
          type: 'content',
          order: sections.length
        }
      } else {
        currentSection.content += line + '\n'
      }
    })

    if (currentSection.content.trim()) {
      sections.push(currentSection)
    }

    return sections
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length
  }

  private calculateReadTime(text: string): number {
    const wordsPerMinute = 200
    const wordCount = this.countWords(text)
    return Math.ceil(wordCount / wordsPerMinute)
  }
}

// Initialize services
export const academicSearch = new AcademicSearchService()
export const reportGenerator = new ReportGenerationService() 