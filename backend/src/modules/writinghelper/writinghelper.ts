import express from 'express'
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
} from '../shared'
import { generateWritingContent, optimizeForPlatform } from './services'
import { WritingRequest, WritingVariation, WritingResponse } from './types'
import { contentTypePrompts, platformLimits, animePersonaPrompts } from './data'

// Enhanced variation generation for different content types
function generateContentVariations(baseContent: string, contentType: string, count: number): WritingVariation[] {
  const variations: WritingVariation[] = []
  
  const variationStrategies = {
    'social-media': [
      { name: 'Emoji enhancement', apply: (text: string) => text.replace(/\./g, ' ✨').replace(/!/g, ' 🚀') },
      { name: 'Question addition', apply: (text: string) => text + '\n\nWhat are your thoughts? 💭' },
      { name: 'Call-to-action', apply: (text: string) => text + '\n\nShare if you agree! 👇' }
    ],
    'creative-writing': [
      { name: 'Sensory details', apply: (text: string) => text.replace(/\./g, ', with vivid details.') },
      { name: 'Emotional depth', apply: (text: string) => text.replace(/said/g, 'whispered') },
      { name: 'Pacing variation', apply: (text: string) => text.replace(/\. /g, '.\n\n') }
    ],
    'blog-article': [
      { name: 'Subheading structure', apply: (text: string) => text.replace(/\n\n/g, '\n\n## ') },
      { name: 'Data inclusion', apply: (text: string) => text + '\n\n*According to recent studies...*' },
      { name: 'Reader engagement', apply: (text: string) => text + '\n\nWhat has your experience been?' }
    ],
    'script': [
      { name: 'Character emotion', apply: (text: string) => text.replace(/:/g, ' (smiling):') },
      { name: 'Scene direction', apply: (text: string) => '[Scene: ' + text + ']' },
      { name: 'Dialogue variation', apply: (text: string) => text.replace(/\./g, '...') }
    ]
  }

  const strategies = variationStrategies[contentType as keyof typeof variationStrategies] || variationStrategies['social-media']
  
  for (let i = 0; i < Math.min(count, strategies.length); i++) {
    const strategy = strategies[i]
    const variationContent = strategy.apply(baseContent)
    
    variations.push({
      id: `var_${i + 1}`,
      content: variationContent,
      changes: [strategy.name],
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    })
  }
  
  return variations
}

export function setupWritingHelperRoutes(app: express.Application) {
  // Get writing templates and configuration
  app.get('/api/writing-helper/templates', optionalAuth, (req, res) => {
    try {
      const templates = {
        contentTypes: {
          'social-media': {
            name: 'Social Media Posts',
            description: 'Engaging posts for social platforms',
            maxLength: 3000,
            templates: [
              {
                id: 'announcement',
                name: 'Product Announcement',
                objective: 'Introduce product',
                tone: 'Professional',
                template: 'Exciting news! We\'re launching {product}...'
              },
              {
                id: 'thought_leadership',
                name: 'Thought Leadership',
                objective: 'Share insights',
                tone: 'Authoritative',
                template: 'Here\'s what I\'ve learned about {topic}...'
              }
            ]
          },
          'creative-writing': {
            name: 'Creative Writing',
            description: 'Stories, poems, and creative narratives',
            maxLength: 10000,
            templates: [
              {
                id: 'short_story',
                name: 'Short Story',
                objective: 'Tell a story',
                tone: 'Narrative',
                template: 'In a world where {setting}, {character} discovers...'
              },
              {
                id: 'poem',
                name: 'Poetry',
                objective: 'Express emotion',
                tone: 'Lyrical',
                template: 'Like {metaphor}, the {subject} {action}...'
              }
            ]
          },
          'blog-article': {
            name: 'Blog Articles',
            description: 'Long-form informative content',
            maxLength: 20000,
            templates: [
              {
                id: 'how_to',
                name: 'How-To Guide',
                objective: 'Educate readers',
                tone: 'Instructional',
                template: 'Learn how to {skill} with these proven steps...'
              },
              {
                id: 'opinion',
                name: 'Opinion Piece',
                objective: 'Share perspective',
                tone: 'Persuasive',
                template: 'Why {topic} matters more than you think...'
              }
            ]
          },
          'script': {
            name: 'Galgame Scripts',
            description: 'Visual novel dialogues and scenes',
            maxLength: 5000,
            templates: [
              {
                id: 'character_intro',
                name: 'Character Introduction',
                objective: 'Introduce character',
                tone: 'Character-driven',
                template: '[Character enters scene]\n{Character}: "Hello, I\'m {name}..."'
              },
              {
                id: 'dramatic_scene',
                name: 'Dramatic Scene',
                objective: 'Create tension',
                tone: 'Dramatic',
                template: '[Music: Tense]\n{Character}: "I never thought it would come to this..."'
              }
            ]
          }
        },
        animePersonas: Object.keys(animePersonaPrompts)
      }
      
      res.json(templates)
    } catch (error) {
      console.error('Writing templates error:', error)
      res.status(500).json({ error: 'Failed to load writing templates' })
    }
  })

  // Get trending hashtags and topics for a platform
  app.get('/api/trends/:platform', optionalAuth, (req, res) => {
    try {
      const { platform } = req.params
      
      // Mock trending data - in production this would come from actual social media APIs
      const trendingData = {
        linkedin: {
          trends: [
            { tag: '#Leadership', count: 15420 },
            { tag: '#Innovation', count: 12890 },
            { tag: '#AI', count: 11250 },
            { tag: '#Productivity', count: 9870 },
            { tag: '#RemoteWork', count: 8540 },
            { tag: '#Technology', count: 7320 },
            { tag: '#Business', count: 6890 },
            { tag: '#Career', count: 6240 },
            { tag: '#Marketing', count: 5780 },
            { tag: '#Networking', count: 5120 }
          ],
          platform: 'linkedin'
        },
        twitter: {
          trends: [
            { tag: '#TechNews', count: 25600 },
            { tag: '#AI', count: 18790 },
            { tag: '#Crypto', count: 16540 },
            { tag: '#Breaking', count: 14230 },
            { tag: '#Innovation', count: 12890 },
            { tag: '#Startup', count: 11650 },
            { tag: '#Development', count: 10420 },
            { tag: '#Marketing', count: 9180 },
            { tag: '#Design', count: 8750 },
            { tag: '#Business', count: 7890 }
          ],
          platform: 'twitter'
        },
        xiaohongshu: {
          trends: [
            { tag: '#生活方式', count: 32100 },
            { tag: '#美食', count: 28560 },
            { tag: '#旅行', count: 24890 },
            { tag: '#时尚', count: 21450 },
            { tag: '#护肤', count: 19230 },
            { tag: '#健身', count: 17680 },
            { tag: '#摄影', count: 15920 },
            { tag: '#学习', count: 14560 },
            { tag: '#工作', count: 13240 },
            { tag: '#分享', count: 12180 }
          ],
          platform: 'xiaohongshu'
        },
        instagram: {
          trends: [
            { tag: '#InstaDaily', count: 45200 },
            { tag: '#PhotoOfTheDay', count: 38940 },
            { tag: '#Lifestyle', count: 32180 },
            { tag: '#Fashion', count: 28650 },
            { tag: '#Travel', count: 25430 },
            { tag: '#Food', count: 22890 },
            { tag: '#Fitness', count: 20140 },
            { tag: '#Art', count: 18760 },
            { tag: '#Nature', count: 16520 },
            { tag: '#Motivation', count: 14890 }
          ],
          platform: 'instagram'
        },
        facebook: {
          trends: [
            { tag: '#Community', count: 18960 },
            { tag: '#Family', count: 16420 },
            { tag: '#News', count: 14780 },
            { tag: '#Local', count: 13250 },
            { tag: '#Events', count: 11890 },
            { tag: '#Business', count: 10650 },
            { tag: '#Education', count: 9420 },
            { tag: '#Health', count: 8790 },
            { tag: '#Technology', count: 7980 },
            { tag: '#Entertainment', count: 7320 }
          ],
          platform: 'facebook'
        }
      }

      const platformData = trendingData[platform as keyof typeof trendingData]
      
      if (!platformData) {
        return res.status(404).json({ 
          error: 'Platform not supported',
          supportedPlatforms: Object.keys(trendingData)
        })
      }

      res.json(platformData)
    } catch (error) {
      console.error('Trends fetch error:', error)
      res.status(500).json({ error: 'Failed to fetch trends' })
    }
  })

  // Generate content
  app.post('/api/generate-content', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const {
        contentType = 'social-media',
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
        generateVariations = false,
        variationCount = 3,
        model,
        provider = appConfig.defaults.provider
      }: WritingRequest = req.body

      const userId = req.user?.id

      // Get content type configuration
      const contentConfig = contentTypePrompts[contentType]
      if (!contentConfig) {
        return res.status(400).json({ error: 'Invalid content type' })
      }

      // Build the enhanced prompt
      let prompt = contentConfig.basePrompt(req.body)
      
      prompt += `\n\nTopic: ${topic}`
      
      if (keyPoints.length > 0) {
        prompt += `\nKey Points: ${keyPoints.join(', ')}`
      }

      if (stylePack) {
        prompt += `\nStyle Pack: ${stylePack}`
      }

      // Add anime persona influence
      if (animePersona && animePersonaPrompts[animePersona as keyof typeof animePersonaPrompts]) {
        prompt += `\n\nPersonality Influence: ${animePersonaPrompts[animePersona as keyof typeof animePersonaPrompts]}`
      }

      if (pastPost) {
        prompt += `\nReference style from this past content: ${pastPost}`
      }

      if (trendingHashtags && trendingHashtags.length > 0 && contentType === 'social-media') {
        prompt += `\nInclude relevant hashtags: ${trendingHashtags.join(', ')}`
      }

      if (customInstructions) {
        prompt += `\nAdditional instructions: ${customInstructions}`
      }

      // Content type specific instructions
      switch (contentType) {
        case 'social-media':
          if (platform) {
            prompt += `\nPlatform: ${platform} - follow ${platform} best practices and formatting`
          }
          prompt += `\nMake it engaging, authentic, and valuable to the audience.`
          break
        case 'creative-writing':
          prompt += `\nFocus on vivid imagery, character development, and emotional resonance. Use creative language and storytelling techniques.`
          break
        case 'blog-article':
          prompt += `\nStructure as a well-organized article with clear sections, informative content, and actionable insights. Include introduction, body, and conclusion.`
          break
        case 'script':
          prompt += `\nFormat as a visual novel script with character names, dialogue, and scene directions. Make it engaging and true to the visual novel format.`
          break
      }

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
        const deductionResult = await deductTokens(userId, tokenCost, selectedModel, 'Content generation')
        if (!deductionResult.success) {
          return res.status(402).json({ 
            error: 'Insufficient tokens', 
            required: tokenCost,
            available: deductionResult.remainingTokens || 0
          })
        }
      }

      // Generate the content
      const completion = await aiClient.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: 'system', content: contentConfig.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: contentType === 'blog-article' ? 4000 : appConfig.chat.maxTokens,
        temperature: contentType === 'creative-writing' ? 0.9 : 0.8
      })

      const generatedContent = completion.choices[0]?.message?.content || 'Failed to generate content.'

      // Determine content limits
      const maxLengths = {
        'social-media': platform === 'twitter' ? 280 : 3000,
        'creative-writing': 10000,
        'blog-article': 20000,
        'script': 5000
      }

      const maxLength = maxLengths[contentType] || 3000
      const characterCount = generatedContent.length
      const withinLimit = characterCount <= maxLength

      let response: WritingResponse = {
        content: generatedContent,
        contentType,
        platform,
        characterCount,
        maxLength,
        withinLimit,
        provider,
        model: selectedModel,
        tokensUsed: tokenCost
      }

      // Generate variations if requested
      if (generateVariations) {
        const variations = generateContentVariations(generatedContent, contentType, variationCount)
        response.variations = variations
        response.variationCount = variations.length
      }

      res.json(response)

    } catch (error: any) {
      console.error('Content generation error:', error)
      
      if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60
        })
      } else {
        res.status(500).json({ 
          error: 'Failed to generate content. Please try again.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }
    }
  })

  // Get content suggestions
  app.get('/api/writing-helper/suggestions', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { contentType, topic } = req.query
      
      const suggestions = {
        'social-media': {
          keyPoints: ['Engagement hook', 'Value proposition', 'Call to action', 'Personal story'],
          tones: ['Professional', 'Casual', 'Inspiring', 'Humorous'],
          objectives: ['Introduce product', 'Share insights', 'Build community', 'Drive traffic']
        },
        'creative-writing': {
          keyPoints: ['Character development', 'Setting description', 'Conflict introduction', 'Emotional arc'],
          tones: ['Dramatic', 'Romantic', 'Mysterious', 'Adventure'],
          objectives: ['Tell a story', 'Explore emotion', 'Create atmosphere', 'Develop character']
        },
        'blog-article': {
          keyPoints: ['Introduction hook', 'Main argument', 'Supporting evidence', 'Actionable conclusion'],
          tones: ['Informative', 'Persuasive', 'Analytical', 'Personal'],
          objectives: ['Educate readers', 'Share expertise', 'Solve problems', 'Inspire action']
        },
        'script': {
          keyPoints: ['Character introduction', 'Dialogue flow', 'Scene setting', 'Emotional beats'],
          tones: ['Romantic', 'Dramatic', 'Comedy', 'Slice-of-life'],
          objectives: ['Introduce character', 'Develop relationship', 'Create tension', 'Resolve conflict']
        }
      }

      const contentSuggestions = suggestions[contentType as keyof typeof suggestions] || suggestions['social-media']
      
      res.json({
        suggestions: contentSuggestions,
        topicIdeas: topic ? [
          `How to ${topic}`,
          `The future of ${topic}`,
          `My experience with ${topic}`,
          `5 things about ${topic}`
        ] : []
      })
    } catch (error) {
      console.error('Suggestions error:', error)
      res.status(500).json({ error: 'Failed to get suggestions' })
    }
  })

  // Generate content endpoint
  app.post('/api/writing-helper/generate', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const request: WritingRequest = req.body
      const response = await generateWritingContent(request, userId)
      res.json(response)
    } catch (error) {
      console.error('Writing generation error:', error)
      res.status(500).json({ error: 'Failed to generate writing content' })
    }
  })

  // Get content type configurations
  app.get('/api/writing-helper/content-types', (req, res) => {
    try {
      const contentTypes = Object.keys(contentTypePrompts).map(type => ({
        id: type,
        name: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: (contentTypePrompts as any)[type].description || `Generate ${type} content`,
        fields: (contentTypePrompts as any)[type].fields || []
      }))

      res.json({ contentTypes })
    } catch (error) {
      console.error('Error fetching content types:', error)
      res.status(500).json({ error: 'Failed to fetch content types' })
    }
  })

  // Get platform limitations
  app.get('/api/writing-helper/platforms', (req, res) => {
    try {
      const platforms = Object.keys(platformLimits).map(platform => ({
        id: platform,
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        ...platformLimits[platform]
      }))

      res.json({ platforms })
    } catch (error) {
      console.error('Error fetching platforms:', error)
      res.status(500).json({ error: 'Failed to fetch platforms' })
    }
  })

  // Optimize content for platform
  app.post('/api/writing-helper/optimize', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { content, platform } = req.body

      if (!content || !platform) {
        return res.status(400).json({ error: 'Content and platform are required' })
      }

      const optimizedContent = optimizeForPlatform(content, platform)
      
      res.json({ 
        optimizedContent,
        platform,
        originalLength: content.length,
        optimizedLength: optimizedContent.length
      })
    } catch (error: any) {
      console.error('Content optimization error:', error)
      res.status(500).json({ 
        error: 'Failed to optimize content',
        details: error.message 
      })
    }
  })

  // Get writing suggestions
  app.post('/api/writing-helper/suggestions', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { contentType, topic, audience } = req.body

      const suggestions = {
        tones: ['professional', 'casual', 'enthusiastic', 'informative', 'persuasive'],
        objectives: ['inform', 'persuade', 'entertain', 'educate', 'inspire'],
        keyPoints: [
          `Key aspects of ${topic}`,
          `Benefits and advantages`,
          `Challenges and solutions`,
          `Future implications`,
          `Practical applications`
        ],
        hashtags: topic ? [
          `#${topic.replace(/\s+/g, '')}`,
          '#content',
          '#insights',
          '#knowledge'
        ] : []
      }

      res.json(suggestions)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      res.status(500).json({ error: 'Failed to generate suggestions' })
    }
  })

  // Get analytics for content
  app.post('/api/writing-helper/analytics', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { content, contentType } = req.body

      if (!content) {
        return res.status(400).json({ error: 'Content is required' })
      }

      const analytics = {
        characterCount: content.length,
        wordCount: content.split(/\s+/).filter((word: string) => word.length > 0).length,
        sentenceCount: content.split(/[.!?]+/).filter((s: string) => s.trim().length > 0).length,
        readingTime: Math.ceil(content.split(/\s+/).length / 200), // 200 words per minute
        hashtags: (content.match(/#\w+/g) || []).length,
        mentions: (content.match(/@\w+/g) || []).length,
        emojis: (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length
      }

      res.json(analytics)
    } catch (error) {
      console.error('Error analyzing content:', error)
      res.status(500).json({ error: 'Failed to analyze content' })
    }
  })

  // Save template endpoint
  app.post('/api/writing-helper/templates', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { name, content, contentType, description } = req.body
      const userId = req.user?.id

      // In a real implementation, you would save to database
      const template = {
        id: Date.now().toString(),
        name,
        content,
        contentType,
        description,
        userId,
        createdAt: new Date().toISOString()
      }

      res.json({ success: true, template })
    } catch (error) {
      console.error('Error saving template:', error)
      res.status(500).json({ error: 'Failed to save template' })
    }
  })

  // Get user templates
  app.get('/api/writing-helper/templates', authenticateUser, async (req: AuthRequest, res) => {
    try {
      // In a real implementation, you would fetch from database
      const templates = [
        {
          id: '1',
          name: 'Product Launch Post',
          contentType: 'social-media',
          description: 'Template for announcing new products',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Blog Introduction',
          contentType: 'blog-article',
          description: 'Standard blog post introduction template',
          createdAt: '2024-01-02T00:00:00Z'
        }
      ]

      res.json({ templates })
    } catch (error) {
      console.error('Error fetching templates:', error)
      res.status(500).json({ error: 'Failed to fetch templates' })
    }
  })

  // Get trending topics/hashtags
  app.get('/api/writing-helper/trending', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const trending = {
        topics: [
          'AI and Technology',
          'Remote Work',
          'Sustainability',
          'Digital Marketing',
          'Personal Development'
        ],
        hashtags: [
          '#AI',
          '#TechTrends',
          '#RemoteWork',
          '#Sustainability',
          '#DigitalMarketing',
          '#PersonalGrowth',
          '#Innovation',
          '#FutureOfWork'
        ]
      }

      res.json(trending)
    } catch (error) {
      console.error('Error fetching trending data:', error)
      res.status(500).json({ error: 'Failed to fetch trending data' })
    }
  })
} 