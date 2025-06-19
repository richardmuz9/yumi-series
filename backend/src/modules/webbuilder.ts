import express from 'express'
import {
  openai as openaiClient,
  claude,
  openrouter,
  qwen,
  getAIClient,
  getAvailableModels,
  modelsConfig,
  promptsConfig,
  appConfig,
  authenticateUser,
  optionalAuth,
  calculateTokenCost,
  deductTokens,
  AuthRequest
} from './shared'

// AI Research function (for webbuilder chat)
async function aiResearch(query: string): Promise<string> {
  try {
    // Simulate AI research without external APIs
    const researchPrompt = `Research and provide comprehensive insights about: ${query}

Please provide:
1. Current trends and developments
2. Key statistics and data points
3. Market insights and analysis
4. Best practices and recommendations
5. Relevant hashtags and keywords
6. Strategic considerations

Make this informative and actionable for content creation.`

    const completion = await qwen.chat.completions.create({
      model: modelsConfig.providers.qwen.defaultModel,
      messages: [
        { role: 'system', content: 'You are a research assistant providing comprehensive market insights and content strategy advice.' },
        { role: 'user', content: researchPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })

    return completion.choices[0]?.message?.content || 'Unable to generate research insights.'
  } catch (error) {
    console.error('AI Research error:', error)
    return 'Research functionality temporarily unavailable. Please try again later.'
  }
}

// Enhanced Web Builder data
const mockTemplates = [
  {
    id: 'template-1',
    name: 'Modern Portfolio',
    description: 'Clean, professional portfolio website',
    category: 'portfolio',
    thumbnail: '/templates/portfolio-modern.jpg',
    htmlContent: `<!DOCTYPE html><html><head><title>Portfolio</title></head><body><header><h1>John Doe</h1><p>Web Developer</p></header><main><section><h2>About</h2><p>Passionate developer...</p></section></main></body></html>`,
    cssContent: `* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; line-height: 1.6; } header { background: #333; color: white; text-align: center; padding: 2rem; }`,
    tags: ['modern', 'clean', 'responsive'],
    isPremium: false,
    author: 'Yumi AI',
    rating: 4.8,
    downloads: 1234
  },
  {
    id: 'template-2',
    name: 'Business Landing',
    description: 'Professional business landing page',
    category: 'business',
    thumbnail: '/templates/business-landing.jpg',
    htmlContent: `<!DOCTYPE html><html><head><title>Business</title></head><body><header><nav><h1>Company</h1></nav></header><main><section class="hero"><h1>Welcome to Our Business</h1><p>We provide excellent services</p><button>Get Started</button></section></main></body></html>`,
    cssContent: `* { margin: 0; padding: 0; box-sizing: border-box; } .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 4rem 2rem; }`,
    tags: ['business', 'professional', 'landing'],
    isPremium: true,
    author: 'Yumi AI',
    rating: 4.9,
    downloads: 856
  }
];

const mockComponents = [
  {
    id: 'comp-1',
    name: 'Hero Section',
    description: 'Eye-catching hero section with call-to-action',
    category: 'layout',
    icon: '🎯',
    html: `<section class="hero"><div class="container"><h1>Welcome to Our Website</h1><p>Discover amazing possibilities</p><button class="cta-btn">Get Started</button></div></section>`,
    css: `.hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 4rem 2rem; } .cta-btn { background: white; color: #667eea; padding: 1rem 2rem; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }`,
    preview: '/components/hero-preview.jpg',
    tags: ['hero', 'banner', 'cta']
  },
  {
    id: 'comp-2',
    name: 'Contact Form',
    description: 'Professional contact form with validation',
    category: 'forms',
    icon: '📝',
    html: `<form class="contact-form"><div class="form-group"><label>Name</label><input type="text" required></div><div class="form-group"><label>Email</label><input type="email" required></div><div class="form-group"><label>Message</label><textarea required></textarea></div><button type="submit">Send Message</button></form>`,
    css: `.contact-form { max-width: 500px; margin: 0 auto; padding: 2rem; } .form-group { margin-bottom: 1rem; } label { display: block; margin-bottom: 0.5rem; font-weight: bold; } input, textarea { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 4px; }`,
    js: `document.querySelector('.contact-form').addEventListener('submit', function(e) { e.preventDefault(); alert('Form submitted!'); });`,
    preview: '/components/form-preview.jpg',
    tags: ['form', 'contact', 'validation']
  }
];

export function setupWebBuilderRoutes(app: express.Application) {
  // Enhanced AI Chat for Web Building
  app.post('/api/web-builder/ai/chat', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { messages, context = {} } = req.body
      const userId = req.user?.id

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' })
      }

      const systemPrompt = `You are an expert web developer and designer. Help users build amazing websites by:

1. Generating HTML, CSS, and JavaScript code
2. Providing design suggestions and best practices
3. Explaining web development concepts
4. Helping with responsive design and accessibility
5. Suggesting improvements and optimizations

Current project context: ${JSON.stringify(context)}

Always provide practical, working code examples and clear explanations.`

      const lastMessage = messages[messages.length - 1]
      
      // Check if this is a code generation request
      const isCodeRequest = lastMessage.content.toLowerCase().includes('create') || 
                           lastMessage.content.toLowerCase().includes('generate') ||
                           lastMessage.content.toLowerCase().includes('build') ||
                           lastMessage.content.toLowerCase().includes('add')

      let aiClient = qwen
      
      const completion = await aiClient.chat.completions.create({
        model: modelsConfig.providers.qwen.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-5) // Last 5 messages for context
        ],
        max_tokens: 1500,
        temperature: 0.7
      })

      const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
      
      // Generate suggestions based on the context
      const suggestions = [
        'Add a responsive navigation menu',
        'Create a footer section',
        'Improve the color scheme',
        'Add animations and transitions',
        'Optimize for mobile devices'
      ]

      // If it's a code request, try to extract code from the response
      let codeChanges = null
      if (isCodeRequest && response.includes('```')) {
        // Simple code extraction (would be more sophisticated in real implementation)
        const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/)
        const cssMatch = response.match(/```css\n([\s\S]*?)\n```/)
        const jsMatch = response.match(/```javascript\n([\s\S]*?)\n```/)
        
        if (htmlMatch || cssMatch || jsMatch) {
          codeChanges = {
            html: htmlMatch ? htmlMatch[1] : undefined,
            css: cssMatch ? cssMatch[1] : undefined,
            js: jsMatch ? jsMatch[1] : undefined
          }
        }
      }

      res.json({
        message: response,
        suggestions: suggestions.slice(0, 3),
        codeChanges
      })

    } catch (error) {
      console.error('Web Builder Chat error:', error)
      res.status(500).json({ error: 'Failed to process chat request' })
    }
  })

  // Generate complete website
  app.post('/api/web-builder/ai/generate', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { prompt, options = {} } = req.body

      const generationPrompt = `Generate a complete website based on this description: "${prompt}"

Website type: ${options.type || 'general'}
Style: ${options.style || 'modern'}
Pages needed: ${options.pages || ['home']}

Please provide:
1. Complete HTML structure
2. Beautiful CSS styling with modern design
3. Basic JavaScript for interactivity if needed

Make it responsive, accessible, and visually appealing.`

      let aiClient = qwen
      
      const completion = await aiClient.chat.completions.create({
        model: modelsConfig.providers.qwen.defaultModel,
        messages: [{ role: 'user', content: generationPrompt }],
        max_tokens: 2000,
        temperature: 0.8
      })

      const response = completion.choices[0]?.message?.content || ''
      
      // Extract code sections (simplified implementation)
      const htmlMatch = response.match(/```html\n([\s\S]*?)\n```/)
      const cssMatch = response.match(/```css\n([\s\S]*?)\n```/)
      const jsMatch = response.match(/```javascript\n([\s\S]*?)\n```/)

      const html = htmlMatch ? htmlMatch[1] : `<!DOCTYPE html>
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

      const css = cssMatch ? cssMatch[1] : `* {
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

      const js = jsMatch ? jsMatch[1] : `// Basic interactivity
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
});`

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
        messages: inputMessages,  // Rename to avoid conflict
        model: requestedModel = modelsConfig.providers.qwen.defaultModel,
        provider: requestedProvider = 'qwen',
        context = '',
        chatHistory = []
      } = req.body

      // Force free providers to avoid credit issues
      let provider = requestedProvider
      let model = requestedModel
      
      // Redirect expensive providers to free Qwen
      if (requestedProvider === 'openrouter' || requestedProvider === 'openai' || requestedProvider === 'claude') {
        console.log(`🔄 WebBuilder: Redirecting ${requestedProvider}/${requestedModel} to qwen/qwen-turbo (free provider)`)
        provider = 'qwen'
        model = modelsConfig.providers.qwen.defaultModel
      }

      const userId = req.user?.id

      // Support both single message and messages array formats
      let userMessage: string
      if (inputMessages && Array.isArray(inputMessages) && inputMessages.length > 0) {
        // Use the last message from the array (most recent user message)
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
        // Claude API has different structure
        const response = await claude.messages.create({
          model: model,
          max_tokens: appConfig.chat?.maxTokens || 1000,
          messages: messages.filter((m: any) => m.role !== 'system'),
          system: systemPrompt
        })
        assistantMessage = response.content[0]?.text || 'I apologize, but I could not generate a response.'
      } else {
        // OpenAI-compatible APIs
        let aiClient = qwen
        if (provider === 'openai') {
          aiClient = openaiClient
        } else if (provider === 'openrouter') {
          aiClient = openrouter
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
        response: assistantMessage,  // Frontend expects 'response' field
        message: assistantMessage,   // Keep for backward compatibility
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