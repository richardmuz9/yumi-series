import express from 'express'
import { authenticateUser, AuthRequest, db } from './shared'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Character design templates
interface CharacterTemplate {
  id: string
  name: string
  style: string
  description: string
  thumbnail: string
  proportions: {
    headRatio: number
    bodyRatio: number
    limbRatio: number
  }
  characteristics: string[]
}

const characterTemplates: CharacterTemplate[] = [
  {
    id: 'chibi',
    name: 'Chibi Style',
    style: 'Super deformed, cute proportions',
    description: 'Large head, small body, expressive eyes',
    thumbnail: '/templates/chibi.png',
    proportions: { headRatio: 0.4, bodyRatio: 0.6, limbRatio: 0.8 },
    characteristics: ['Large eyes', 'Small nose', 'Rounded features', 'Simplified anatomy']
  },
  {
    id: 'bishojo',
    name: 'Bishōjo Style',
    style: 'Beautiful girl aesthetic',
    description: 'Elegant proportions, detailed features',
    thumbnail: '/templates/bishojo.png',
    proportions: { headRatio: 0.15, bodyRatio: 0.85, limbRatio: 1.0 },
    characteristics: ['Detailed eyes', 'Flowing hair', 'Graceful pose', 'Realistic proportions']
  },
  {
    id: 'shonen',
    name: 'Shōnen Style',
    style: 'Dynamic action hero',
    description: 'Strong, energetic character design',
    thumbnail: '/templates/shonen.png',
    proportions: { headRatio: 0.12, bodyRatio: 0.88, limbRatio: 1.1 },
    characteristics: ['Sharp features', 'Dynamic pose', 'Strong jawline', 'Spiky hair']
  },
  {
    id: 'mecha-girl',
    name: 'Mecha Girl',
    style: 'Sci-fi android aesthetic',
    description: 'Futuristic character with tech elements',
    thumbnail: '/templates/mecha-girl.png',
    proportions: { headRatio: 0.14, bodyRatio: 0.86, limbRatio: 0.95 },
    characteristics: ['Mechanical details', 'Glowing elements', 'Sleek design', 'Tech accessories']
  },
  {
    id: 'magical-girl',
    name: 'Magical Girl',
    style: 'Fantasy magical aesthetic',
    description: 'Whimsical character with magical elements',
    thumbnail: '/templates/magical-girl.png',
    proportions: { headRatio: 0.16, bodyRatio: 0.84, limbRatio: 0.9 },
    characteristics: ['Flowing costume', 'Magical accessories', 'Sparkle effects', 'Cute expression']
  },
  // NEW ENHANCED STYLE PRESETS
  {
    id: 'gorgeous-anime',
    name: 'Gorgeous Anime',
    style: 'Ultra-detailed beautiful style',
    description: 'Studio-quality detailed artwork with photorealistic shading',
    thumbnail: '/templates/gorgeous-anime.png',
    proportions: { headRatio: 0.14, bodyRatio: 0.86, limbRatio: 1.0 },
    characteristics: ['Hyper-detailed eyes', 'Realistic hair physics', 'Perfect proportions', 'Professional lighting', 'Soft gradients', 'High-end anime quality']
  },
  {
    id: 'manga-sketch',
    name: 'Manga Sketch',
    style: 'Black and white manga style',
    description: 'Traditional manga artwork with clean line art',
    thumbnail: '/templates/manga-sketch.png',
    proportions: { headRatio: 0.13, bodyRatio: 0.87, limbRatio: 1.0 },
    characteristics: ['Clean line art', 'Screentone effects', 'Dynamic angles', 'Speed lines', 'Bold outlines', 'Monochrome palette']
  },
  {
    id: 'semi-realistic',
    name: 'Semi-Realistic',
    style: 'Anime-realistic hybrid',
    description: 'Realistic proportions with anime features',
    thumbnail: '/templates/semi-realistic.png',
    proportions: { headRatio: 0.11, bodyRatio: 0.89, limbRatio: 1.05 },
    characteristics: ['Realistic anatomy', 'Anime facial features', 'Natural lighting', 'Detailed textures', 'Human proportions', 'Sophisticated shading']
  },
  {
    id: 'kawaii-moe',
    name: 'Kawaii Moe',
    style: 'Ultra-cute moe style',
    description: 'Adorable characters with maximum cuteness',
    thumbnail: '/templates/kawaii-moe.png',
    proportions: { headRatio: 0.18, bodyRatio: 0.82, limbRatio: 0.85 },
    characteristics: ['Giant sparkling eyes', 'Soft pastel colors', 'Blushing cheeks', 'Innocent expressions', 'Fluffy details', 'Heart motifs']
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    style: 'Futuristic cyberpunk aesthetic',
    description: 'High-tech character with neon accents',
    thumbnail: '/templates/cyberpunk-neon.png',
    proportions: { headRatio: 0.13, bodyRatio: 0.87, limbRatio: 1.0 },
    characteristics: ['Neon highlights', 'Tech augmentations', 'Glowing elements', 'Sharp edges', 'Urban aesthetic', 'Digital effects']
  },
  {
    id: 'gothic-lolita',
    name: 'Gothic Lolita',
    style: 'Dark elegant gothic style',
    description: 'Sophisticated gothic fashion with dark themes',
    thumbnail: '/templates/gothic-lolita.png',
    proportions: { headRatio: 0.15, bodyRatio: 0.85, limbRatio: 0.95 },
    characteristics: ['Dark color palette', 'Elaborate frills', 'Gothic accessories', 'Mysterious aura', 'Victorian influences', 'Dramatic lighting']
  },
  {
    id: 'shoujo-sparkle',
    name: 'Shoujo Sparkle',
    style: 'Classic shoujo manga style',
    description: 'Romantic shoujo with sparkles and flowers',
    thumbnail: '/templates/shoujo-sparkle.png',
    proportions: { headRatio: 0.16, bodyRatio: 0.84, limbRatio: 0.9 },
    characteristics: ['Sparkle effects', 'Flower backgrounds', 'Long eyelashes', 'Romantic poses', 'Soft features', 'Dream-like quality']
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    style: '8-bit retro pixel style',
    description: 'Retro gaming inspired pixel character',
    thumbnail: '/templates/pixel-art.png',
    proportions: { headRatio: 0.2, bodyRatio: 0.8, limbRatio: 0.9 },
    characteristics: ['Pixelated style', 'Limited color palette', 'Blocky features', 'Retro gaming feel', 'Sharp edges', '8-bit aesthetic']
  },
  {
    id: 'watercolor-soft',
    name: 'Watercolor Soft',
    style: 'Soft watercolor painting style',
    description: 'Gentle watercolor artwork with soft edges',
    thumbnail: '/templates/watercolor-soft.png',
    proportions: { headRatio: 0.15, bodyRatio: 0.85, limbRatio: 0.95 },
    characteristics: ['Soft brushstrokes', 'Watercolor textures', 'Gentle gradients', 'Organic shapes', 'Pastel tones', 'Artistic flow']
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    style: 'Simple minimalist design',
    description: 'Clean, simple lines with minimal detail',
    thumbnail: '/templates/minimalist-clean.png',
    proportions: { headRatio: 0.14, bodyRatio: 0.86, limbRatio: 1.0 },
    characteristics: ['Simple lines', 'Minimal details', 'Clean composition', 'Geometric shapes', 'Limited colors', 'Modern aesthetic']
  },
  {
    id: 'vintage-retro',
    name: 'Vintage Retro',
    style: 'Classic retro anime style',
    description: '80s-90s classic anime aesthetic',
    thumbnail: '/templates/vintage-retro.png',
    proportions: { headRatio: 0.12, bodyRatio: 0.88, limbRatio: 1.1 },
    characteristics: ['Retro color palette', 'Classic proportions', 'Bold outlines', 'Vintage shading', 'Nostalgic feel', '80s aesthetic']
  },
  {
    id: 'dark-fantasy',
    name: 'Dark Fantasy',
    style: 'Dark fantasy aesthetic',
    description: 'Mysterious and dramatic dark fantasy style',
    thumbnail: '/templates/dark-fantasy.png',
    proportions: { headRatio: 0.13, bodyRatio: 0.87, limbRatio: 1.0 },
    characteristics: ['Dark atmosphere', 'Dramatic lighting', 'Fantasy elements', 'Mystical details', 'Rich shadows', 'Ethereal quality']
  },
  {
    id: 'sports-dynamic',
    name: 'Sports Dynamic',
    style: 'Athletic action style',
    description: 'Dynamic sports anime with action poses',
    thumbnail: '/templates/sports-dynamic.png',
    proportions: { headRatio: 0.11, bodyRatio: 0.89, limbRatio: 1.1 },
    characteristics: ['Athletic build', 'Dynamic poses', 'Motion lines', 'Sports equipment', 'Energetic aura', 'Action-focused']
  },
  {
    id: 'slice-of-life',
    name: 'Slice of Life',
    style: 'Everyday realistic style',
    description: 'Natural, everyday anime style',
    thumbnail: '/templates/slice-of-life.png',
    proportions: { headRatio: 0.13, bodyRatio: 0.87, limbRatio: 1.0 },
    characteristics: ['Natural expressions', 'Casual clothing', 'Realistic settings', 'Warm lighting', 'Comfortable poses', 'Relatable features']
  },
  {
    id: 'horror-creepy',
    name: 'Horror Creepy',
    style: 'Eerie horror aesthetic',
    description: 'Unsettling horror anime style',
    thumbnail: '/templates/horror-creepy.png',
    proportions: { headRatio: 0.14, bodyRatio: 0.86, limbRatio: 0.95 },
    characteristics: ['Eerie atmosphere', 'Distorted features', 'Dark shadows', 'Unsettling details', 'Horror elements', 'Creepy ambiance']
  }
]

interface DesignBrief {
  character: {
    name?: string
    personality: string
    age: string
    gender: string
  }
  appearance: {
    hair: {
      color: string
      style: string
      length: string
    }
    eyes: {
      color: string
      shape: string
      expression: string
    }
    outfit: {
      style: string
      colors: string[]
      accessories: string[]
    }
    body: {
      height: string
      build: string
    }
  }
  mood: string
  colorPalette: string[]
  specialFeatures: string[]
  pose: string
  background?: string
}

export function setupAnimeCharaHelperRoutes(app: express.Application) {
  
  // Get character templates
  app.get('/api/anime-chara/templates', authenticateUser, async (req: AuthRequest, res) => {
    try {
      res.json({
        templates: characterTemplates,
        total: characterTemplates.length
      })
    } catch (error) {
      console.error('Get templates error:', error)
      res.status(500).json({ error: 'Failed to get character templates' })
    }
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

      res.json({
        analysis,
        timestamp: new Date().toISOString(),
        stage: stage || 'general'
      })

    } catch (error) {
      console.error('Analyze progress error:', error)
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