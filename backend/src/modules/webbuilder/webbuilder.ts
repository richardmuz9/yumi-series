// WebBuilder Module - Main Routes File
import express from 'express'
import {
  openai as openaiClient,
  claude,
  qwen,
  modelsConfig,
  promptsConfig,
  appConfig,
  authenticateUser,
  optionalAuth,
  calculateTokenCost,
  deductTokens,
  AuthRequest
} from '../shared'

// Import split components
import { mockTemplates, mockComponents } from './data'
import { aiResearch, generateChatResponse } from './services'
import { 
  WebBuilderChatRequest, 
  WebBuilderGenerateRequest,
  WebsiteGenerationOptions
} from './types'

export function setupWebBuilderRoutes(app: express.Application) {
  // Enhanced AI Chat for Web Building
  app.post('/api/web-builder/ai/chat', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { messages, context = {} }: WebBuilderChatRequest = req.body
      const userId = req.user?.id

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' })
      }

      const result = await generateChatResponse(messages, context)
      res.json(result)

    } catch (error) {
      console.error('Web Builder Chat error:', error)
      res.status(500).json({ error: 'Failed to process chat request' })
    }
  })

  // Generate complete website
  app.post('/api/web-builder/ai/generate', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { prompt, options = {} }: WebBuilderGenerateRequest = req.body

      const generationPrompt = `Generate a complete website based on this description: "${prompt}"

Website type: ${options.type || 'general'}
Style: ${options.style || 'modern'}
Pages needed: ${options.pages || ['home']}
Color scheme: ${options.colorScheme || 'modern blue and white'}

Please provide:
1. Complete HTML structure
2. Beautiful CSS styling with modern design
3. Basic JavaScript for interactivity if needed

Make it responsive, accessible, and visually appealing.`

      const completion = await qwen.chat.completions.create({
        model: modelsConfig.providers.qwen.defaultModel,
        messages: [{ role: 'user', content: generationPrompt }],
        max_tokens: 2000,
        temperature: 0.8
      })

      const response = completion.choices[0]?.message?.content || ''
      
      // Extract code sections
      const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/)
      const cssMatch = response.match(/```css\n([\s\S]*?)\n```/)
      const jsMatch = response.match(/```javascript\n([\s\S]*?)\n```/)

      const html = htmlMatch ? htmlMatch[1] : generateFallbackHTML(prompt)
      const css = cssMatch ? cssMatch[1] : generateFallbackCSS()
      const js = jsMatch ? jsMatch[1] : generateFallbackJS()

      res.json({
        html,
        css,
        js,
        explanation: response,
        suggestions: [
          'Add more sections to your website',
          'Customize the color scheme',
          'Add contact information',
          'Include social media links'
        ]
      })

    } catch (error) {
      console.error('Website generation error:', error)
      res.status(500).json({ error: 'Failed to generate website' })
    }
  })

  // Templates endpoints
  app.get('/api/web-builder/templates', optionalAuth, (req, res) => {
    try {
      const { category } = req.query
      let templates = mockTemplates
      
      if (category) {
        templates = templates.filter(t => t.category === category)
      }
      
      res.json(templates)
    } catch (error) {
      console.error('Templates error:', error)
      res.status(500).json({ error: 'Failed to load templates' })
    }
  })

  app.get('/api/web-builder/templates/:id', optionalAuth, (req, res) => {
    try {
      const template = mockTemplates.find(t => t.id === req.params.id)
      if (!template) {
        return res.status(404).json({ error: 'Template not found' })
      }
      res.json(template)
    } catch (error) {
      console.error('Template error:', error)
      res.status(500).json({ error: 'Failed to load template' })
    }
  })

  // Components endpoints
  app.get('/api/web-builder/components', optionalAuth, (req, res) => {
    try {
      const { category } = req.query
      let components = mockComponents
      
      if (category) {
        components = components.filter(c => c.category === category)
      }
      
      res.json(components)
    } catch (error) {
      console.error('Components error:', error)
      res.status(500).json({ error: 'Failed to load components' })
    }
  })

  // Projects endpoints
  app.get('/api/web-builder/projects', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id
      
      // Mock project data - in real implementation, fetch from database
      const mockProjects = [
        {
          id: 'project-1',
          name: 'My Portfolio',
          description: 'Personal portfolio website',
          htmlContent: '<h1>Portfolio</h1>',
          cssContent: 'h1 { color: blue; }',
          status: 'draft',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          deployments: []
        }
      ]
      
      res.json(mockProjects)
    } catch (error) {
      console.error('Projects error:', error)
      res.status(500).json({ error: 'Failed to load projects' })
    }
  })

  app.post('/api/web-builder/projects', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { name, description, templateId } = req.body
      const userId = req.user?.id

      let htmlContent = '<h1>New Website</h1>'
      let cssContent = 'h1 { color: #333; }'
      
      // If template is specified, use template content
      if (templateId) {
        const template = mockTemplates.find(t => t.id === templateId)
        if (template) {
          htmlContent = template.htmlContent
          cssContent = template.cssContent
        }
      }

      const newProject = {
        id: `project-${Date.now()}`,
        name: name || 'New Website',
        description: description || 'My awesome website',
        htmlContent,
        cssContent,
        jsContent: '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        deployments: []
      }

      res.json(newProject)
    } catch (error) {
      console.error('Create project error:', error)
      res.status(500).json({ error: 'Failed to create project' })
    }
  })

  app.get('/api/web-builder/projects/:id', authenticateUser, async (req: AuthRequest, res) => {
    try {
      // Mock project data
      const project = {
        id: req.params.id,
        name: 'Sample Project',
        description: 'A sample project',
        htmlContent: '<h1>Sample Website</h1><p>This is a sample project.</p>',
        cssContent: 'h1 { color: #667eea; } p { color: #666; }',
        jsContent: 'console.log("Project loaded");',
        status: 'draft',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        deployments: []
      }
      
      res.json(project)
    } catch (error) {
      console.error('Project error:', error)
      res.status(500).json({ error: 'Failed to load project' })
    }
  })

  app.put('/api/web-builder/projects/:id', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const projectData = req.body
      
      // Mock update - in real implementation, save to database
      const updatedProject = {
        ...projectData,
        id: req.params.id,
        lastModified: new Date().toISOString()
      }
      
      res.json(updatedProject)
    } catch (error) {
      console.error('Update project error:', error)
      res.status(500).json({ error: 'Failed to update project' })
    }
  })

  // Deployment endpoint
  app.post('/api/web-builder/projects/:id/deploy', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { platform, domain, environment } = req.body
      
      // Mock deployment
      const deployment = {
        id: `deploy-${Date.now()}`,
        platform,
        url: domain || `https://${req.params.id}-${platform}.app`,
        status: 'success',
        deployedAt: new Date().toISOString(),
        environment
      }
      
      res.json({
        deployment,
        url: deployment.url
      })
    } catch (error) {
      console.error('Deployment error:', error)
      res.status(500).json({ error: 'Failed to deploy website' })
    }
  })

  // Stats endpoint
  app.get('/api/web-builder/stats', authenticateUser, async (req: AuthRequest, res) => {
    try {
      res.json({
        totalProjects: 5,
        totalTemplates: mockTemplates.length,
        totalComponents: mockComponents.length,
        recentActivity: [
          {
            type: 'project_created',
            message: 'Created new portfolio project',
            timestamp: new Date().toISOString()
          }
        ]
      })
    } catch (error) {
      console.error('Stats error:', error)
      res.status(500).json({ error: 'Failed to load stats' })
    }
  })

  // Legacy chat endpoint (keep for backward compatibility)
  app.post('/api/chat', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { 
        message, 
        messages: inputMessages,
        model: requestedModel = modelsConfig.providers.qwen.defaultModel,
        provider: requestedProvider = 'qwen',
        context = '',
        chatHistory = []
      } = req.body

      // Force free providers to avoid credit issues
      let provider = requestedProvider
      let model = requestedModel
      
      // Redirect expensive providers to free Qwen
      if (requestedProvider === 'openai' || requestedProvider === 'claude') {
        console.log(`🔄 WebBuilder: Redirecting ${requestedProvider}/${requestedModel} to qwen/qwen-turbo (free provider)`)
        provider = 'qwen'
        model = modelsConfig.providers.qwen.defaultModel
      }

      const userId = req.user?.id

      // Support both single message and messages array formats
      let userMessage: string
      if (inputMessages && Array.isArray(inputMessages) && inputMessages.length > 0) {
        userMessage = inputMessages[inputMessages.length - 1]?.content || ''
      } else if (message) {
        userMessage = message
      } else {
        return res.status(400).json({ error: 'Message or messages array is required' })
      }

      // Enhanced system prompt with research capability
      const systemPrompt = promptsConfig.website_builder + 
        (context ? `\n\nAdditional context: ${context}` : '') +
        '\n\nIf the user asks about trends, research, or market insights, use the AI research function to provide comprehensive information.'

      // Check if this is a research query
      const isResearchQuery = userMessage.toLowerCase().includes('trend') || 
                             userMessage.toLowerCase().includes('research') ||
                             userMessage.toLowerCase().includes('market') ||
                             userMessage.toLowerCase().includes('insight')

      let enhancedMessage = userMessage
      if (isResearchQuery) {
        const researchResults = await aiResearch(userMessage)
        enhancedMessage = `${userMessage}\n\nResearch findings: ${researchResults}`
      }

      // Calculate token cost
      const tokenCost = calculateTokenCost(model, enhancedMessage.length)

      // Check and deduct tokens
      if (userId) {
        const deductionResult = await deductTokens(userId, tokenCost, model, 'Chat message')
        if (!deductionResult.success) {
          return res.status(402).json({ 
            error: 'Insufficient tokens', 
            required: tokenCost,
            available: deductionResult.remainingTokens || 0
          })
        }
      }

      // Prepare messages array
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ]

      // Add chat history
      if (chatHistory && chatHistory.length > 0) {
        messages.push(...chatHistory.slice(-10)) // Last 10 messages for context
      }

      // Add current message
      messages.push({ role: 'user', content: enhancedMessage })

      // Select AI client and generate response
      let assistantMessage: string

      // Handle different providers
      if (provider === 'claude') {
        const response = await claude.messages.create({
          model: model,
          max_tokens: appConfig.chat?.maxTokens || 1000,
          messages: messages.filter((m: any) => m.role !== 'system'),
          system: systemPrompt
        })
        assistantMessage = response.content[0]?.text || 'I apologize, but I could not generate a response.'
      } else {
        let aiClient = qwen
        if (provider === 'openai') {
          aiClient = openaiClient
        }

        const completion = await aiClient.chat.completions.create({
          model: model,
          messages: messages,
          max_tokens: appConfig.chat?.maxTokens || 1000,
          temperature: appConfig.chat?.temperature || 0.7
        })
        assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
      }

      res.json({
        response: assistantMessage,
        message: assistantMessage,
        model: model,
        provider: provider,
        tokensUsed: tokenCost,
        hasResearch: isResearchQuery
      })

    } catch (error: any) {
      console.error('Chat error:', error)
      
      if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60
        })
      } else {
        res.status(500).json({ 
          error: 'Failed to process your request. Please try again.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }
    }
  })

  // Settings endpoints
  app.get('/api/settings', authenticateUser, async (req: AuthRequest, res) => {
    try {
      res.json({
        models: modelsConfig,
        prompts: promptsConfig,
        appConfig: appConfig
      })
    } catch (error) {
      console.error('Settings error:', error)
      res.status(500).json({ error: 'Failed to get settings' })
    }
  })

  app.post('/api/settings', authenticateUser, async (req: AuthRequest, res) => {
    try {
      // In a real implementation, you would save user preferences
      res.json({ message: 'Settings saved successfully' })
    } catch (error) {
      console.error('Save settings error:', error)
      res.status(500).json({ error: 'Failed to save settings' })
    }
  })
}

// Helper functions
function generateFallbackHTML(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
</head>
<body>
    <header>
        <h1>Welcome to Your Website</h1>
        <p>Generated by AI based on: ${prompt}</p>
    </header>
    <main>
        <section>
            <h2>About</h2>
            <p>This website was generated based on your requirements.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 Generated Website</p>
    </footer>
</body>
</html>`
}

function generateFallbackCSS(): string {
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 4rem 2rem;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    margin-bottom: 3rem;
}

footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 2rem;
}`
}

function generateFallbackJS(): string {
  return `// Basic interactivity
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
});`
} 