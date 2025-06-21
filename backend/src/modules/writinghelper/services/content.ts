import {
  openai as openaiClient,
  qwen,
  modelsConfig,
  calculateTokenCost,
  deductTokens
} from '../../shared'
import { WritingRequest, WritingResponse, WritingVariation } from '../types'
import { contentTypePrompts, platformLimits } from '../data'
import { generateContentVariations } from './variations'

export async function generateWritingContent(request: WritingRequest, userId?: number): Promise<WritingResponse> {
  const {
    contentType,
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
    generateVariations,
    variationCount = 3,
    model = modelsConfig.providers.qwen.defaultModel,
    provider = 'qwen'
  } = request

  let content = ''
  let tokenCost = 0

  // Get prompts for content type
  const { systemPrompt, basePrompt } = contentTypePrompts[contentType]

  // Build user prompt
  let userPrompt = basePrompt(request)

  // Add key points if provided
  if (keyPoints?.length) {
    userPrompt += `\n\nKey points to include:\n${keyPoints.map(p => `- ${p}`).join('\n')}`
  }

  // Add past post for reference if provided
  if (pastPost) {
    userPrompt += `\n\nReference this past post for style:\n${pastPost}`
  }

  // Add trending hashtags for social media
  if (contentType === 'social-media' && trendingHashtags?.length) {
    userPrompt += `\n\nConsider using these trending hashtags where relevant: ${trendingHashtags.join(' ')}`
  }

  // Add custom instructions if provided
  if (customInstructions) {
    userPrompt += `\n\nAdditional instructions:\n${customInstructions}`
  }

  try {
    console.log('[WritingHelper] Generating content with prompt:', userPrompt)
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
    console.log('[WritingHelper] Content generated:', content)
  } catch (error) {
    console.error('[WritingHelper] Content generation error:', error)
    throw new Error('Failed to generate content: ' + (error instanceof Error ? error.message : error))
  }

  // Determine max length
  const maxLength = platform && platformLimits[platform] 
    ? platformLimits[platform].maxLength 
    : contentType === 'social-media' ? 3000 
    : contentType === 'blog-article' ? 20000 
    : 5000

  // Generate variations if requested
  let variations: WritingVariation[] = []
  if (generateVariations && variationCount) {
    try {
      variations = await generateContentVariations(content, contentType, variationCount)
    } catch (error) {
      console.error('[WritingHelper] Error generating variations:', error)
      variations = [] // Fallback to empty array on error
    }
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
    variationCount: variations.length
  }
} 