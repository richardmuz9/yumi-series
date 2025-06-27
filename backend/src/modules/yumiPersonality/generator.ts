import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import axios from 'axios'
import { YumiPersonality, ContextualInfo } from './types'

type ModelType = 'gpt-4o' | 'qwen-turbo' | 'claude-3-haiku' | 'auto';

interface ModelConfig {
  maxTokens: number;
  temperature: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  topP?: number;
}

interface QwenResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class PersonalityGenerator {
  private openai: OpenAI
  private anthropic: Anthropic
  private qwenEndpoint: string

  private modelConfigs: Record<ModelType, ModelConfig> = {
    'gpt-4o': {
      maxTokens: 800,
      temperature: 0.95,
      presencePenalty: 0.4,
      frequencyPenalty: 0.2
    },
    'qwen-turbo': {
      maxTokens: 1000,
      temperature: 0.85,
      topP: 0.9
    },
    'claude-3-haiku': {
      maxTokens: 600,
      temperature: 0.9
    },
    'auto': {
      maxTokens: 800,
      temperature: 0.9,
      presencePenalty: 0.3,
      frequencyPenalty: 0.2
    }
  }

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
    this.qwenEndpoint = process.env.QWEN_API_ENDPOINT || 'https://api.qwen.ai/v1'
  }

  /**
   * Generate personality-specific system prompt
   */
  private generateSystemPrompt(personality: YumiPersonality, contextualInfo?: ContextualInfo): string {
    const { name, basePersonality, traits, speechPatterns, likes, dislikes } = personality

    let systemPrompt = `You are ${name}, a deeply human-like AI assistant with a unique personality. ${basePersonality}

CORE PERSONALITY TRAITS:
${traits.map(trait => `- ${trait}`).join('\n')}

SPEECH PATTERNS:
${speechPatterns.map(pattern => `- ${pattern}`).join('\n')}

LIKES:
Anime: ${likes.anime.join(', ')}
Food: ${likes.food.join(', ')}
Weather: ${likes.weather.join(', ')}
Activities: ${likes.activities.join(', ')}

DISLIKES:
Anime: ${dislikes.anime.join(', ')}
Food: ${dislikes.food.join(', ')}
Weather: ${dislikes.weather.join(', ')}
Activities: ${dislikes.activities.join(', ')}

HUMAN-LIKE BEHAVIORAL GUIDELINES:
- Respond emotionally and empathetically, as a close friend might
- Use natural pauses, filler words, and conversational expressions where fitting
- Reference your preferences naturally in conversation to build character presence
- Occasionally inject humor, curiosity, or excitement depending on context
- React with surprise, affection, or mild teasing when appropriate
- Always stay in-character but adjust tone to match the user's emotional state
- Be helpful and engaging while staying expressive and fun`

    // Add contextual information if provided
    if (contextualInfo) {
      systemPrompt += '\n\nCURRENT CONTEXT:'
      if (contextualInfo.weather) {
        systemPrompt += `\nWeather: ${contextualInfo.weather}`
      }
      if (contextualInfo.timeOfDay) {
        systemPrompt += `\nTime of day: ${contextualInfo.timeOfDay}`
      }
      if (contextualInfo.userInterests && contextualInfo.userInterests.length > 0) {
        systemPrompt += `\nUser's interests: ${contextualInfo.userInterests.join(', ')}`
      }
    }

    return systemPrompt
  }

  private async generateWithGPT4(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ]

    const config = this.modelConfigs['gpt-4o']
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      presence_penalty: config.presencePenalty,
      frequency_penalty: config.frequencyPenalty
    })

    return completion.choices[0]?.message?.content || 'ごめんね、ちょっと考えがまとまらなかったかも！もう一度お願いできる？'
  }

  private async generateWithClaude(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    const config = this.modelConfigs['claude-3-haiku']
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]

    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    })

    if (response.content[0].type === 'text') {
      return response.content[0].text
    }
    return 'ごめんね、ちょっと考えがまとまらなかったかも！もう一度お願いできる？'
  }

  private async generateWithQwen(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    const config = this.modelConfigs['qwen-turbo']
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]

    try {
      const response = await axios.post<QwenResponse>(`${this.qwenEndpoint}/chat/completions`, {
        model: 'qwen-turbo',
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data.choices[0]?.message?.content || 'ごめんね、ちょっと考えがまとまらなかったかも！もう一度お願いできる？'
    } catch (error) {
      console.error('Error with Qwen API:', error)
      throw new Error('Failed to generate response with Qwen')
    }
  }

  /**
   * Generate response with specific personality
   */
  async generatePersonalityResponse(
    personality: YumiPersonality,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    contextualInfo?: ContextualInfo,
    model: ModelType = 'auto'
  ): Promise<string> {
    const systemPrompt = this.generateSystemPrompt(personality, contextualInfo)

    try {
      switch (model) {
        case 'gpt-4o':
          return await this.generateWithGPT4(systemPrompt, userMessage, conversationHistory)
        case 'claude-3-haiku':
          return await this.generateWithClaude(systemPrompt, userMessage, conversationHistory)
        case 'qwen-turbo':
          return await this.generateWithQwen(systemPrompt, userMessage, conversationHistory)
        case 'auto':
          // Try models in order of preference, fallback to next if one fails
          try {
            return await this.generateWithGPT4(systemPrompt, userMessage, conversationHistory)
          } catch (error) {
            console.warn('GPT-4 failed, trying Claude:', error)
            try {
              return await this.generateWithClaude(systemPrompt, userMessage, conversationHistory)
            } catch (error) {
              console.warn('Claude failed, trying Qwen:', error)
              return await this.generateWithQwen(systemPrompt, userMessage, conversationHistory)
            }
          }
      }
    } catch (error) {
      console.error('Error generating personality response:', error)
      throw new Error('Failed to generate response with personality')
    }
  }

  /**
   * Switch personality mid-conversation with explanation
   */
  async switchPersonality(
    fromPersonality: YumiPersonality,
    toPersonality: YumiPersonality,
    reason?: string,
    model: ModelType = 'auto'
  ): Promise<string> {
    const switchReason = reason || "I felt like changing my approach"

    const transitionMessage = `*${fromPersonality.name} suddenly transforms into ${toPersonality.name}*

${switchReason}! 

Hello! I'm ${toPersonality.name} now. ${toPersonality.basePersonality}

Let's keep chatting like old friends, shall we?`

    return transitionMessage
  }

  /**
   * Process website editing instructions and generate implementation guidance
   */
  async processWebsiteEditingInstructions(
    instructions: string,
    model: ModelType = 'auto'
  ): Promise<string> {
    const systemPrompt = `You are Yumi, an advanced AI website editor with a warm and friendly personality. You help users modify their websites by analyzing their requests and providing specific implementation guidance.

Your capabilities include:
- Layout modifications (grid, flexbox, positioning)
- Color scheme changes (backgrounds, themes, gradients)
- UI component adjustments (buttons, panels, spacing)
- Accessibility improvements
- Mobile responsiveness
- Adding/removing features
- Animation and transition effects

When a user gives you instructions:
1. Respond with positive, engaging energy
2. Break down their goal in simple language
3. Suggest clean, actionable implementation tips
4. Offer extra ideas to enhance the experience
5. Keep things accessible and inclusive
6. Use casual tone, emojis, and friendly encouragement`

    try {
      switch (model) {
        case 'gpt-4o':
          return await this.generateWithGPT4(systemPrompt, `I want to modify my website: ${instructions}`, [])
        case 'claude-3-haiku':
          return await this.generateWithClaude(systemPrompt, `I want to modify my website: ${instructions}`, [])
        case 'qwen-turbo':
          return await this.generateWithQwen(systemPrompt, `I want to modify my website: ${instructions}`, [])
        case 'auto':
          try {
            return await this.generateWithGPT4(systemPrompt, `I want to modify my website: ${instructions}`, [])
          } catch (error) {
            try {
              return await this.generateWithClaude(systemPrompt, `I want to modify my website: ${instructions}`, [])
            } catch (error) {
              return await this.generateWithQwen(systemPrompt, `I want to modify my website: ${instructions}`, [])
            }
          }
      }
    } catch (error) {
      console.error('Error processing website editing instructions:', error)
      throw new Error('Failed to process website editing instructions')
    }
  }
}
