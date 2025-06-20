// ReportWriter Module Main Routes
import express from 'express'
import multer from 'multer'
import { authenticateUser, optionalAuth, AuthRequest } from '../shared'
import { academicSearch, reportGenerator } from './services'
import { ReportGenerationRequest, ResearchRequest } from './types'

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

export function setupReportWriterRoutes(app: express.Application) {
  // Research endpoint
  app.post('/api/report-writer/research', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { query, source = 'all', maxResults = 20 }: ResearchRequest = req.body
      
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' })
      }

      let results = []

      if (source === 'all') {
        results = await academicSearch.searchAll(query, maxResults)
      } else if (source === 'crossref') {
        results = await academicSearch.searchCrossref(query, maxResults)
      } else if (source === 'arxiv') {
        results = await academicSearch.searchArxiv(query, maxResults)
      } else {
        return res.status(400).json({ error: 'Invalid source specified' })
      }

      res.json({
        query,
        source,
        results,
        totalResults: results.length
      })
    } catch (error: any) {
      console.error('Research error:', error)
      res.status(500).json({ 
        error: 'Failed to search academic sources',
        details: error.message 
      })
    }
  })

  // Generate report endpoint
  app.post('/api/report-writer/generate', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const request: ReportGenerationRequest = req.body
      const userId = req.user?.id

      const response = await reportGenerator.generateReport(request, userId)
      
      res.json(response)
    } catch (error: any) {
      console.error('Report generation error:', error)
      res.status(500).json({ 
        error: 'Failed to generate report',
        details: error.message 
      })
    }
  })

  // Upload files endpoint
  app.post('/api/report-writer/upload', authenticateUser, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      const fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }

      res.json({
        success: true,
        file: fileInfo,
        message: 'File uploaded successfully'
      })
    } catch (error: any) {
      console.error('File upload error:', error)
      res.status(500).json({ 
        error: 'Failed to upload file',
        details: error.message 
      })
    }
  })

  // Get templates endpoint
  app.get('/api/report-writer/templates', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const templates = [
        {
          id: 'academic-paper',
          name: 'Academic Paper',
          description: 'Standard academic paper format',
          sections: ['abstract', 'introduction', 'methodology', 'results', 'conclusion']
        },
        {
          id: 'business-report',
          name: 'Business Report',
          description: 'Professional business report format',
          sections: ['executive-summary', 'analysis', 'recommendations']
        }
      ]

      res.json({ templates })
    } catch (error) {
      console.error('Error fetching templates:', error)
      res.status(500).json({ error: 'Failed to fetch templates' })
    }
  })

  // Save draft endpoint
  app.post('/api/report-writer/drafts', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { title, content, sections } = req.body
      const userId = req.user?.id

      const draft = {
        id: Date.now().toString(),
        title,
        content,
        sections,
        userId,
        createdAt: new Date().toISOString()
      }

      res.json({ success: true, draft })
    } catch (error) {
      console.error('Error saving draft:', error)
      res.status(500).json({ error: 'Failed to save draft' })
    }
  })

  // Get user drafts
  app.get('/api/report-writer/drafts', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const drafts = [
        {
          id: '1',
          title: 'Sample Report',
          lastModified: '2024-01-15T10:30:00Z',
          wordCount: 1250
        }
      ]

      res.json({ drafts })
    } catch (error) {
      console.error('Error fetching drafts:', error)
      res.status(500).json({ error: 'Failed to fetch drafts' })
    }
  })
} 