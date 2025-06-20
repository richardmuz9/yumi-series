// WritingHelper Module Services and Business Logic
import {
  openai as openaiClient,
  qwen,
  modelsConfig,
  calculateTokenCost,
  deductTokens
} from '../shared'
import { WritingRequest, WritingVariation, WritingResponse } from './types'
import { contentTypePrompts, platformLimits, animePersonaPrompts } from './data'

// Enhanced variation generation for different content types
export function generateContentVariations(baseContent: string, contentType: string, count: number): WritingVariation[] {
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

// Generate content using AI
export async function generateWritingContent(
  request: WritingRequest, 
  userId?: number
): Promise<WritingResponse> {
  const {
    contentType,
    platform,
    audience,
    objective,
    tone,
    topic,
    keyPoints,
    customInstructions,
    animePersona,
    model = modelsConfig.providers.qwen.defaultModel,
    provider = 'qwen'
  } = request

  // Get content type configuration
  const typeConfig = contentTypePrompts[contentType]
  if (!typeConfig) {
    throw new Error(`Unsupported content type: ${contentType}`)
  }

  // Build the prompt
  let systemPrompt = typeConfig.systemPrompt
  
  // Add anime persona if specified
  if (animePersona && animePersonaPrompts[animePersona]) {
    systemPrompt += `\n\nPersonality Context: ${animePersonaPrompts[animePersona]}`
  }

  let userPrompt = typeConfig.basePrompt(request)
  
  // Add topic and key points
  userPrompt += `\n\nTopic: ${topic}`
  if (keyPoints.length > 0) {
    userPrompt += `\nKey points to cover: ${keyPoints.join(', ')}`
  }
  
  // Add custom instructions
  if (customInstructions) {
    userPrompt += `\nAdditional instructions: ${customInstructions}`
  }

  // Add platform-specific constraints
  if (platform && platformLimits[platform]) {
    const limits = platformLimits[platform]
    userPrompt += `\n\nPlatform: ${platform} (max ${limits.maxLength} characters, recommended ${limits.recommendedLength})`
  }

  // Calculate token cost
  const tokenCost = calculateTokenCost(model, userPrompt.length)

  // Check and deduct tokens if user is provided
  if (userId) {
    const deductionResult = await deductTokens(userId, tokenCost, model, 'Writing content')
    if (!deductionResult.success) {
      throw new Error(`Insufficient tokens. Required: ${tokenCost}, Available: ${deductionResult.remainingTokens || 0}`)
    }
  }

  // Generate content
  let content: string
  
  try {
    const completion = await qwen.chat.completions.create({
      model: modelsConfig.providers.qwen.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
    content = completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Content generation error:', error)
    throw new Error('Failed to generate content')
  }

  // Determine max length
  const maxLength = platform && platformLimits[platform] 
    ? platformLimits[platform].maxLength 
    : contentType === 'social-media' ? 3000 
    : contentType === 'blog-article' ? 20000 
    : 5000

  // Generate variations if requested
  let variations: WritingVariation[] | undefined
  if (request.generateVariations && request.variationCount) {
    variations = generateContentVariations(content, contentType, request.variationCount)
  }

  return {
    content,
    contentType,
    platform,
    characterCount: content.length,
    maxLength,
    withinLimit: content.length <= maxLength,
    provider,
    model,
    tokensUsed: tokenCost,
    variations,
    variationCount: variations?.length
  }
}

// Optimize content for specific platform
export function optimizeForPlatform(content: string, platform: string): string {
  if (!platformLimits[platform]) {
    return content
  }

  const limits = platformLimits[platform]
  
  // Truncate if too long
  if (content.length > limits.maxLength) {
    content = content.substring(0, limits.maxLength - 3) + '...'
  }

  // Platform-specific optimizations
  switch (platform) {
    case 'twitter':
      // Add thread indicators if needed
      if (content.length > 200) {
        content += '\n\n🧵 Thread below...'
      }
      break
    
    case 'instagram':
      // Add hashtag suggestions
      if (!content.includes('#')) {
        content += '\n\n#content #social #engagement'
      }
      break
    
    case 'linkedin':
      // Make more professional
      content = content.replace(/!/g, '.').replace(/😊/g, '')
      break
  }

  return content
}

// Analyze content quality
export function analyzeContentQuality(content: string, contentType: string): {
  score: number
  suggestions: string[]
  strengths: string[]
} {
  const suggestions: string[] = []
  const strengths: string[] = []
  let score = 70 // Base score

  // Length analysis
  if (content.length < 50) {
    suggestions.push('Content might be too short for engagement')
    score -= 10
  } else if (content.length > 100) {
    strengths.push('Good content length')
    score += 5
  }

  // Engagement elements
  if (content.includes('?')) {
    strengths.push('Includes engaging questions')
    score += 5
  }

  if (contentType === 'social-media') {
    if (content.includes('#')) {
      strengths.push('Includes hashtags for discoverability')
      score += 5
    } else {
      suggestions.push('Consider adding relevant hashtags')
      score -= 5
    }

    if (/[\u{1F600}-\u{1F64F}]/u.test(content)) {
      strengths.push('Uses emojis for visual appeal')
      score += 3
    }
  }

  // Call to action
  const cta_patterns = /share|comment|like|follow|subscribe|click|visit|read more/i
  if (cta_patterns.test(content)) {
    strengths.push('Includes call-to-action')
    score += 8
  } else {
    suggestions.push('Consider adding a call-to-action')
    score -= 3
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    suggestions,
    strengths
  }
} 