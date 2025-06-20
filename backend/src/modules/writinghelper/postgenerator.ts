import express from 'express'
import {
  openai as openaiClient,
  qwen,
  modelsConfig,
  promptsConfig,
  appConfig,
  postTemplatesConfig,
  animePersonasConfig,
  contentBlocksConfig,
  userPreferencesConfig,
  authenticateUser,
  optionalAuth,
  calculateTokenCost,
  deductTokens,
  AuthRequest
} from '../shared'

interface PostGenerateRequest {
  platform: string
  audience: string
  objective: string
  tone: string
  stylePack?: string
  animePersona?: string
  topic: string
  keyPoints: string[]
  pastPost?: string
  trendingHashtags?: string[]
  customInstructions?: string
  contentBlocks?: {
    hook?: string
    body?: string
    cta?: string
  }
  generateVariations?: boolean
  variationCount?: number
  model?: string
  provider?: string
}

interface PostVariation {
  id: string
  content: string
  changes: string[]
  confidence: number
}

interface UserFeedback {
  postId: string
  rating?: number
  thumbs?: 'up' | 'down'
  selectedVariation?: string
  engagementMetrics?: {
    likes: number
    comments: number
    shares: number
    clicks?: number
  }
}

// Utility function to generate variations
function generatePostVariations(basePost: string, count: number): PostVariation[] {
  const variations: PostVariation[] = []
  const synonyms = contentBlocksConfig.variationTemplates.synonyms
  
  for (let i = 0; i < count; i++) {
    let variationContent = basePost
    const changes: string[] = []
    
    // Apply synonym replacements
    Object.entries(synonyms).forEach(([original, replacements]) => {
      if (Array.isArray(replacements)) {
        const regex = new RegExp(`\\b${original}\\b`, 'gi')
        if (regex.test(variationContent) && Math.random() > 0.5) {
          const replacement = replacements[Math.floor(Math.random() * replacements.length)]
          variationContent = variationContent.replace(regex, replacement)
          changes.push(`Replaced "${original}" with "${replacement}"`)
        }
      }
    })
    
    // Randomly shuffle sentences in multi-sentence posts
    if (variationContent.includes('.') && Math.random() > 0.7) {
      const sentences = variationContent.split('.').filter(s => s.trim())
      if (sentences.length > 2) {
        // Shuffle middle sentences, keep first and last
        const firstSentence = sentences[0]
        const lastSentence = sentences[sentences.length - 1]
        const middleSentences = sentences.slice(1, -1)
        
        // Simple shuffle
        for (let j = middleSentences.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1))
          ;[middleSentences[j], middleSentences[k]] = [middleSentences[k], middleSentences[j]]
        }
        
        variationContent = [firstSentence, ...middleSentences, lastSentence].join('. ') + '.'
        changes.push('Reordered sentences for variety')
      }
    }
    
    variations.push({
      id: `var_${i + 1}`,
      content: variationContent,
      changes,
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    })
  }
  
  return variations
}

export function setupPostGeneratorRoutes(app: express.Application) {
  // Get post templates
  app.get('/api/post-generator/templates', optionalAuth, (req, res) => {
    try {
      res.json(postTemplatesConfig)
    } catch (error) {
      console.error('Templates error:', error)
      res.status(500).json({ error: 'Failed to load templates' })
    }
  })

  // Get anime personas
  app.get('/api/post-generator/anime-personas', optionalAuth, (req, res) => {
    try {
      res.json(animePersonasConfig)
    } catch (error) {
      console.error('Anime personas error:', error)
      res.status(500).json({ error: 'Failed to load anime personas' })
    }
  })

  // Get content blocks
  app.get('/api/post-generator/content-blocks', optionalAuth, (req, res) => {
    try {
      res.json(contentBlocksConfig)
    } catch (error) {
      console.error('Content blocks error:', error)
      res.status(500).json({ error: 'Failed to load content blocks' })
    }
  })

  // Generate post
  app.post('/api/generate-post', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const {
        platform,
        audience,
        objective,
        tone,
        stylePack,
        animePersona,
        topic,
        keyPoints,
        pastPost,
        trendingHashtags,
        customInstructions,
        contentBlocks,
        generateVariations = false,
        variationCount = 3,
        model,
        provider = appConfig.defaults.provider
      }: PostGenerateRequest = req.body

      const userId = req.user?.id

      // Build the prompt
      let prompt = `Create a ${platform} post for ${audience} audience with ${objective} objective and ${tone} tone.

Topic: ${topic}
Key Points: ${keyPoints.join(', ')}
`

      if (stylePack) {
        prompt += `Style Pack: ${stylePack}\n`
      }

      if (animePersona && animePersonasConfig.personas[animePersona]) {
        const persona = animePersonasConfig.personas[animePersona]
        prompt += `Write in the style of ${persona.name}: ${persona.voiceProfile}\n`
        prompt += `Use phrases like: ${persona.catchphrases.join(', ')}\n`
      }

      if (contentBlocks) {
        prompt += `Structure: Hook: ${contentBlocks.hook || 'engaging opening'}, Body: ${contentBlocks.body || 'main content'}, CTA: ${contentBlocks.cta || 'call to action'}\n`
      }

      if (pastPost) {
        prompt += `Reference style from this past post: ${pastPost}\n`
      }

      if (trendingHashtags && trendingHashtags.length > 0) {
        prompt += `Include relevant hashtags: ${trendingHashtags.join(', ')}\n`
      }

      if (customInstructions) {
        prompt += `Additional instructions: ${customInstructions}\n`
      }

      // Platform-specific constraints
      const platformLimits = postTemplatesConfig.platforms[platform]
      if (platformLimits) {
        prompt += `Character limit: ${platformLimits.characterLimit}\n`
        prompt += `Platform style: ${platformLimits.style}\n`
      }

      prompt += `\nGenerate an engaging, authentic post that follows ${platform} best practices. Make it conversational and valuable to the audience.`

      // Select AI client
      let aiClient
      let selectedModel: string

      switch (provider) {
        case 'openai':
          aiClient = openaiClient
          selectedModel = model || modelsConfig.providers.openai.defaultModel
          break
        case 'qwen':
          aiClient = qwen
          selectedModel = model || modelsConfig.providers.qwen.defaultModel
          break
        default:
          aiClient = qwen
          selectedModel = modelsConfig.providers.qwen.defaultModel
      }

      // Calculate token cost
      const tokenCost = calculateTokenCost(selectedModel, prompt.length)

      // Check and deduct tokens
      if (userId) {
        const deductionResult = await deductTokens(userId, tokenCost, selectedModel, 'Post generation')
        if (!deductionResult.success) {
          return res.status(402).json({ 
            error: 'Insufficient tokens', 
            required: tokenCost,
            available: deductionResult.remainingTokens || 0
          })
        }
      }

      // Generate the post
      const completion = await aiClient.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: 'system', content: 'You are a social media expert who creates engaging, authentic posts.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: appConfig.chat.maxTokens,
        temperature: 0.8
      })

      const generatedPost = completion.choices[0]?.message?.content || 'Failed to generate post.'

      let response: any = {
        success: true,
        post: generatedPost,
        platform,
        provider,
        model: selectedModel,
        tokensUsed: tokenCost
      }

      // Generate variations if requested
      if (generateVariations) {
        const variations = generatePostVariations(generatedPost, variationCount)
        response.variations = variations
        response.variationCount = variations.length
      }

      res.json(response)

    } catch (error: any) {
      console.error('Post generation error:', error)
      
      if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60
        })
      } else {
        res.status(500).json({ 
          error: 'Failed to generate post. Please try again.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }
    }
  })

  // Get user preferences
  app.get('/api/post-generator/preferences', authenticateUser, async (req: AuthRequest, res) => {
    try {
      // Return default preferences structure
      res.json({
        preferences: userPreferencesConfig.defaultPreferences,
        learningAlgorithm: userPreferencesConfig.learningAlgorithm
      })
    } catch (error) {
      console.error('Preferences error:', error)
      res.status(500).json({ error: 'Failed to get preferences' })
    }
  })

  // Submit feedback
  app.post('/api/post-generator/feedback', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const feedback: UserFeedback = req.body
      
      // In a real implementation, you would store this feedback in a database
      // and use it to improve future recommendations
      
      console.log('User feedback received:', feedback)
      
      res.json({
        success: true,
        message: 'Feedback recorded successfully'
      })
    } catch (error) {
      console.error('Feedback error:', error)
      res.status(500).json({ error: 'Failed to record feedback' })
    }
  })

  // Get recommendations
  app.get('/api/post-generator/recommendations', authenticateUser, async (req: AuthRequest, res) => {
    try {
      // Return sample recommendations based on user preferences
      const recommendations = {
        suggestedPersonas: ['gojo_satoru', 'rem', 'tanjiro'],
        trendingTopics: ['AI trends', 'productivity tips', 'lifestyle hacks'],
        optimalPostTimes: ['9:00 AM', '2:00 PM', '7:00 PM'],
        engagementTips: [
          'Use questions to encourage comments',
          'Include relevant hashtags',
          'Share personal experiences',
          'Add visual elements when possible'
        ]
      }
      
      res.json(recommendations)
    } catch (error) {
      console.error('Recommendations error:', error)
      res.status(500).json({ error: 'Failed to get recommendations' })
    }
  })
} 
