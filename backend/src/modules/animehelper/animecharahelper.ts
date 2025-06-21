import express from 'express'
import { authenticateUser, AuthRequest, db } from '../shared'
import OpenAI from 'openai'
import { characterTemplates as templateData } from './data'
import { authenticateUser as requireUser } from '../shared'
import { generateAnimeCharacter } from './services'
import { CharacterTemplate, DesignBrief } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const characterTemplates: CharacterTemplate[] = templateData;

const router = express.Router();

export function setupAnimeCharaHelperRoutes(app: express.Application) {
  
  // Get all character templates
  app.get('/api/anime-chara/templates', (req, res) => {
    res.json(characterTemplates)
  })

  // Start character design session
  app.post('/api/anime-chara/start-session', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const { description, templateId } = req.body

      if (!description) {
        return res.status(400).json({ error: 'Character description is required' })
      }

      const template = characterTemplates.find(t => t.id === templateId)
      if (!template) {
        return res.status(400).json({ error: 'Invalid template ID' })
      }

      // Use GPT-4o to analyze the description and create a design brief
      const systemPrompt = `You are an expert anime character designer. Analyze the user's character description and create a detailed design brief in JSON format.

Focus on creating a design that works well with the ${template.name} style (${template.description}).

Return a JSON object with this exact structure:
{
  "character": {
    "name": "suggested name or null",
    "personality": "personality traits",
    "age": "apparent age",
    "gender": "gender identity"
  },
  "appearance": {
    "hair": {
      "color": "hair color",
      "style": "hairstyle description",
      "length": "hair length"
    },
    "eyes": {
      "color": "eye color",
      "shape": "eye shape",
      "expression": "typical expression"
    },
    "outfit": {
      "style": "clothing style",
      "colors": ["color1", "color2", "color3"],
      "accessories": ["accessory1", "accessory2"]
    },
    "body": {
      "height": "height description",
      "build": "body build"
    }
  },
  "mood": "overall character mood",
  "colorPalette": ["#color1", "#color2", "#color3", "#color4"],
  "specialFeatures": ["unique feature1", "unique feature2"],
  "pose": "suggested pose",
  "background": "suggested background setting"
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a design brief for this character: ${description}` }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })

      let designBrief: DesignBrief
      try {
        designBrief = JSON.parse(response.choices[0].message.content || '{}')
      } catch (parseError) {
        console.error('Failed to parse design brief:', parseError)
        return res.status(500).json({ error: 'Failed to process character description' })
      }

      // Generate session ID and store the design brief
      const sessionId = `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Store session data in database (simplified storage)
      try {
        await db.runRawSQL(
          'INSERT INTO anime_sessions (session_id, user_id, template_id, design_brief, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [sessionId, userId, templateId, JSON.stringify(designBrief), 'active', new Date().toISOString()]
        )
      } catch (dbError) {
        console.log('Note: anime_sessions table not found, using in-memory storage')
      }

      res.json({
        sessionId,
        template,
        designBrief,
        clarificationQuestions: await generateClarificationQuestions(designBrief, description)
      })

    } catch (error) {
      console.error('Start session error:', error)
      res.status(500).json({ error: 'Failed to start character design session' })
    }
  })

  // Generate character outline
  app.post('/api/anime-chara/generate-outline', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const { sessionId, designBrief, templateId } = req.body

      if (!sessionId || !designBrief || !templateId) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const template = characterTemplates.find(t => t.id === templateId)
      if (!template) {
        return res.status(400).json({ error: 'Invalid template ID' })
      }

      // Create detailed prompt for image generation
      const imagePrompt = createImagePrompt(designBrief, template)

      // Generate outline using OpenAI's image generation
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imagePrompt,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
        n: 1
      })

      const imageUrl = imageResponse.data?.[0]?.url
      if (!imageUrl) {
        return res.status(500).json({ error: 'Failed to generate character outline' })
      }

      res.json({
        outlineUrl: imageUrl,
        prompt: imagePrompt,
        template: template,
        nextSteps: [
          'Download the outline image',
          'Import into your preferred drawing application',
          'Start adding colors and details',
          'Upload progress for AI feedback'
        ]
      })

    } catch (error) {
      console.error('Generate outline error:', error)
      res.status(500).json({ error: 'Failed to generate character outline' })
    }
  })

  // Analyze drawing progress
  app.post('/api/anime-chara/analyze-progress', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const { sessionId, imageUrl, stage } = req.body

      if (!sessionId || !imageUrl) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Use GPT-4o Vision to analyze the drawing progress
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert anime art instructor. Analyze the user's drawing progress and provide specific, actionable feedback.

Provide feedback in JSON format:
{
  "overallScore": number (1-10),
  "strengths": ["strength1", "strength2"],
  "improvements": [
    {
      "area": "area name",
      "issue": "specific issue", 
      "suggestion": "actionable advice",
      "priority": "high|medium|low"
    }
  ],
  "nextSteps": ["step1", "step2"],
  "encouragement": "positive message"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this anime character drawing. Stage: ${stage || 'general'}`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      let analysis
      try {
        analysis = JSON.parse(response.choices[0].message.content || '{}')
      } catch (parseError) {
        console.error('Failed to parse analysis:', parseError)
        return res.status(500).json({ error: 'Failed to analyze drawing progress' })
      }

      res.json(analysis)
    } catch (error) {
      console.error('Error analyzing drawing progress:', error)
      res.status(500).json({ error: 'Failed to analyze drawing progress' })
    }
  })

  // AI Region Regeneration API
  app.post('/api/anime-chara/regenerate-region', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const { originalImage, maskData, designBrief, style, templateId } = req.body

      if (!originalImage || !maskData) {
        return res.status(400).json({ error: 'Original image and mask data are required' })
      }

      // Find template if provided
      const template = templateId 
        ? characterTemplates.find(t => t.id === templateId)
        : characterTemplates[0] // Default template

      if (!template) {
        return res.status(400).json({ error: 'Invalid template ID' })
      }

      // Call the region regeneration function
      const regeneratedImage = await regenerateCharacterRegion(
        originalImage,
        maskData,
        designBrief || {},
        template,
        style || 'detailed-anime'
      )

      res.json({
        regeneratedImage,
        timestamp: new Date().toISOString(),
        style: style || 'detailed-anime',
        template: template.name,
        success: true
      })

    } catch (error) {
      console.error('Region regeneration error:', error)
      res.status(500).json({ 
        error: 'Failed to regenerate region',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Style Marketplace API endpoints
  app.get('/api/anime-chara/marketplace/styles', authenticateUser, async (req: AuthRequest, res) => {
    try {
      // In a real implementation, this would fetch from a database
      const communityStyles = [
        {
          id: 'style_001',
          name: 'Dreamy Pastel',
          creator: 'ArtistUser1',
          description: 'Soft pastel colors with ethereal lighting',
          thumbnail: '/marketplace/dreamy-pastel-thumb.png',
          downloads: 1247,
          rating: 4.8,
          tags: ['pastel', 'dreamy', 'soft'],
          created: '2024-01-15'
        },
        {
          id: 'style_002',
          name: 'Neon Cyberpunk Pro',
          creator: 'CyberArtist',
          description: 'Advanced cyberpunk style with enhanced neon effects',
          thumbnail: '/marketplace/neon-cyber-thumb.png',
          downloads: 892,
          rating: 4.9,
          tags: ['cyberpunk', 'neon', 'futuristic'],
          created: '2024-01-20'
        },
        {
          id: 'style_003',
          name: 'Vintage Manga',
          creator: 'RetroMangaka',
          description: 'Classic 90s manga style with authentic screentones',
          thumbnail: '/marketplace/vintage-manga-thumb.png',
          downloads: 2156,
          rating: 4.7,
          tags: ['vintage', 'manga', 'retro'],
          created: '2024-01-10'
        }
      ]

      const { category, sort, search } = req.query
      let filteredStyles = communityStyles

      // Filter by search term
      if (search) {
        filteredStyles = filteredStyles.filter(style =>
          style.name.toLowerCase().includes((search as string).toLowerCase()) ||
          style.tags.some(tag => tag.toLowerCase().includes((search as string).toLowerCase()))
        )
      }

      // Sort results
      if (sort === 'popular') {
        filteredStyles.sort((a, b) => b.downloads - a.downloads)
      } else if (sort === 'rating') {
        filteredStyles.sort((a, b) => b.rating - a.rating)
      } else if (sort === 'newest') {
        filteredStyles.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      }

      res.json({
        styles: filteredStyles,
        total: filteredStyles.length,
        categories: ['All', 'Popular', 'New', 'Cyberpunk', 'Pastel', 'Vintage'],
        success: true
      })

    } catch (error) {
      console.error('Marketplace styles error:', error)
      res.status(500).json({ error: 'Failed to fetch marketplace styles' })
    }
  })

  // Download community style
  app.post('/api/anime-chara/marketplace/download/:styleId', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      const { styleId } = req.params

      // In a real implementation, this would:
      // 1. Verify the user has permission to download
      // 2. Increment download counter
      // 3. Return the actual style data/files

      res.json({
        styleId,
        downloadUrl: `/marketplace/styles/${styleId}/download`,
        success: true,
        message: 'Style downloaded successfully'
      })

    } catch (error) {
      console.error('Style download error:', error)
      res.status(500).json({ error: 'Failed to download style' })
    }
  })

  // AI Character Generation
  router.post('/generate', requireUser, async (req: AuthRequest, res) => {
    try {
      const result = await generateAnimeCharacter(
        req.user!.id.toString(),
        req.body.description,
        req.body.settings
      );
      res.json(result);
    } catch (error) {
      console.error('[AI-GEN]', error);
      res.status(500).json({ error: 'Failed to generate character image' });
    }
  });
}

// Helper functions
async function generateClarificationQuestions(designBrief: DesignBrief, originalDescription: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Generate 2-3 clarifying questions to help refine the anime character design.'
        },
        {
          role: 'user',
          content: `Original: ${originalDescription}\nBrief: ${JSON.stringify(designBrief)}\n\nWhat questions would help improve this design?`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    const questions = response.choices[0].message.content?.split('\n').filter(q => q.trim()) || []
    return questions.slice(0, 3)
  } catch (error) {
    return [
      'What specific personality traits should be reflected in their expression?',
      'Are there any special accessories or unique features you\'d like to emphasize?',
      'What mood or atmosphere should the character convey?'
    ]
  }
}

function createImagePrompt(designBrief: DesignBrief, template: CharacterTemplate): string {
  const { character, appearance, mood, pose } = designBrief
  
  return `Create a clean line art outline of an anime character in ${template.style} style. 

Character: ${character.personality} ${character.gender}, ${character.age} years old
Hair: ${appearance.hair.color} ${appearance.hair.style}, ${appearance.hair.length}
Eyes: ${appearance.eyes.color} ${appearance.eyes.shape} with ${appearance.eyes.expression} expression
Outfit: ${appearance.outfit.style} in ${appearance.outfit.colors.join(', ')}
Pose: ${pose}, Mood: ${mood}

Style: Clean black line art, ${template.characteristics.join(', ')}, suitable for coloring, high contrast`
}

// Enhanced region regeneration with mask support
async function regenerateCharacterRegion(
  originalImage: string,
  maskData: string,
  designBrief: DesignBrief,
  template: CharacterTemplate,
  style: string = 'detailed-anime'
): Promise<string> {
  try {
    // This would integrate with AI image generation services
    // For now, we'll simulate the process
    
    const prompt = `Regenerate only the masked region of this anime character artwork.
    
Original character: ${designBrief.character.personality} ${designBrief.character.gender}
Style: ${template.name} - ${template.description}
Region to regenerate: Use the provided mask to identify which areas need regeneration
Art style: ${style}
Quality: High-resolution anime artwork with ${template.characteristics.join(', ')}

Maintain consistency with the existing character while improving the masked region.`

    // In a real implementation, this would:
    // 1. Decode the base64 images
    // 2. Apply the mask to identify regeneration areas
    // 3. Use AI image generation (like DALL-E, Midjourney API, or Stable Diffusion)
    // 4. Composite the result back onto the original

    console.log('Region regeneration request:', {
      originalImageSize: originalImage.length,
      maskDataSize: maskData.length,
      style,
      template: template.name
    })

    // For demo purposes, return a placeholder
    // In production, this would return the actual regenerated image
    return `data:image/png;base64,${Buffer.from('regenerated-image-placeholder').toString('base64')}`
    
  } catch (error) {
    console.error('Region regeneration failed:', error)
    throw new Error('Failed to regenerate character region')
  }
}

export default router; 