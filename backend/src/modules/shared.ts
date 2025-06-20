import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { HttpsProxyAgent } from 'https-proxy-agent'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from '../database'
import { 
  authenticateUser, 
  optionalAuth, 
  generateToken, 
  hashPassword, 
  comparePassword, 
  calculateTokenCost, 
  deductTokens,
  FREE_TIER,
  AuthRequest 
} from '../auth'
import { 
  createCheckoutSession, 
  createSubscriptionSession,
  createPortalSession, 
  processWebhookEvent, 
  verifyWebhookSignature, 
  TOKEN_PACKAGES,
  SUBSCRIPTION_PLANS,
  TokenPackageId 
} from '../stripe'

// Load configuration files
export const modelsConfig = JSON.parse(readFileSync(join(__dirname, '../../config/models.json'), 'utf8'))
export const promptsConfig = JSON.parse(readFileSync(join(__dirname, '../../config/prompts.json'), 'utf8'))
export const appConfig = JSON.parse(readFileSync(join(__dirname, '../../config/app.json'), 'utf8'))
export const postTemplatesConfig = JSON.parse(readFileSync(join(__dirname, '../../config/post-templates.json'), 'utf8'))
export const animePersonasConfig = JSON.parse(readFileSync(join(__dirname, '../../config/anime-personas.json'), 'utf8'))
export const contentBlocksConfig = JSON.parse(readFileSync(join(__dirname, '../../config/content-blocks.json'), 'utf8'))
export const userPreferencesConfig = JSON.parse(readFileSync(join(__dirname, '../../config/user-preferences.json'), 'utf8'))

// Proxy configuration for mainland China users (only in development)
export const proxyConfig = (
  process.env.NODE_ENV !== 'production' && 
  process.env.PROXY_HOST && 
  process.env.PROXY_PORT
) ? {
  httpAgent: new HttpsProxyAgent(`http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`),
  httpsAgent: new HttpsProxyAgent(`http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`)
} : {}

// Initialize AI clients with proxy support (lazy initialization)
let _openai: OpenAI | null = null
let _claude: Anthropic | null = null  
let _qwen: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
      ...proxyConfig
    })
  }
  return _openai
}

function getClaudeClient(): Anthropic {
  if (!_claude) {
    _claude = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY || 'dummy-key',
      ...proxyConfig
    })
  }
  return _claude
}

function getQwenClient(): OpenAI {
  if (!_qwen) {
    _qwen = new OpenAI({
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      apiKey: process.env.QWEN_API_KEY || 'dummy-key',
      ...proxyConfig
    })
  }
  return _qwen
}

// Proxy objects for lazy initialization
export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    return getOpenAIClient()[prop as keyof OpenAI]
  }
})

export const claude = new Proxy({} as Anthropic, {
  get(target, prop) {
    return getClaudeClient()[prop as keyof Anthropic]
  }
})

export const qwen = new Proxy({} as OpenAI, {
  get(target, prop) {
    return getQwenClient()[prop as keyof OpenAI]
  }
})

// Function to get OpenAI-compatible client (excludes Claude)
export function getOpenAICompatibleClient(provider: string): OpenAI {
  switch (provider) {
    case 'openai':
      return getOpenAIClient()
    case 'qwen':
    default:
      return getQwenClient()
  }
}

// Function to get the appropriate AI client based on provider
export function getAIClient(provider: string): OpenAI | Anthropic {
  switch (provider) {
    case 'openai':
      return getOpenAIClient()
    case 'claude':
      return getClaudeClient()
    case 'qwen':
    default:
      return getQwenClient()
  }
}

// Function to get available models
export function getAvailableModels() {
  const availableModels: any[] = []
  
  Object.entries(modelsConfig.providers).forEach(([providerName, providerConfig]: [string, any]) => {
    if (providerConfig.enabled) {
      providerConfig.models.forEach((model: any) => {
        availableModels.push({
          ...model,
          provider: providerName,
          providerName: providerName.charAt(0).toUpperCase() + providerName.slice(1)
        })
      })
    }
  })
  
  return availableModels
}

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

export const corsOptions = {
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
  optionsSuccessStatus: 200,
};

// Shared interfaces
interface User {
  id: string
  isPaid?: boolean
}

interface ExtendedUser extends User {
  isPaid?: boolean
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message?: string
  messages?: ChatMessage[]
  mode: 'agent' | 'assistant'
  provider?: 'openai' | 'qwen' | 'claude'
  model?: string
}

// Export all auth functions and types
export {
  authenticateUser, 
  optionalAuth, 
  generateToken, 
  hashPassword, 
  comparePassword, 
  calculateTokenCost, 
  deductTokens,
  FREE_TIER,
  AuthRequest,
  db
}

// Export all stripe functions and types
export {
  createCheckoutSession, 
  createSubscriptionSession,
  createPortalSession, 
  processWebhookEvent, 
  verifyWebhookSignature, 
  TOKEN_PACKAGES,
  SUBSCRIPTION_PLANS,
  TokenPackageId
}

// Utility function to create and configure Express app
export function createApp() {
  const app = express()
  
  app.use(cors(corsOptions))
  app.use(cookieParser())
  app.use(express.json())
  
  // Raw body parsing for Stripe webhooks
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))
  
  return app
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and audio files
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image and audio files are allowed'))
    }
  }
})

// Health check endpoint
export function addHealthCheck(app: express.Application) {
  app.get('/api/health', (req, res) => {
    try {
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: appConfig.version || '1.0.0',
        enabledProviders: Object.entries(modelsConfig.providers)
          .filter(([_, provider]: [string, any]) => provider.enabled)
          .map(([name, _]: [string, any]) => name),
        defaults: {
          provider: appConfig.defaults?.provider || 'qwen',
          model: appConfig.defaults?.model || 'qwen-turbo',
          mode: appConfig.defaults?.mode || 'assistant'
        },
        apiKeys: {
          openai: !!process.env.OPENAI_API_KEY,
          claude: !!process.env.CLAUDE_API_KEY,
          qwen: !!process.env.QWEN_API_KEY
        }
      })
    } catch (error) {
      console.error('Health check error:', error)
      res.status(500).json({ 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      })
    }
  })

  // Models endpoint
  app.get('/api/models', optionalAuth, (req: AuthRequest, res) => {
    try {
      const availableModels = getAvailableModels()
      res.json({
        models: availableModels,
        providers: modelsConfig.providers,
        defaultProvider: appConfig.defaults?.provider || 'qwen',
        defaultModel: appConfig.defaults?.model || 'qwen-turbo'
      })
    } catch (error) {
      console.error('Models endpoint error:', error)
      res.status(500).json({ error: 'Failed to get models' })
    }
  })

  // Image analysis endpoint
  app.post('/api/analyze-image', authenticateUser, upload.single('image'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' })
      }

      const { filename } = req.body
      const imageBuffer = req.file.buffer
      const base64Image = imageBuffer.toString('base64')

      // Use GPT-4 Vision for image analysis
      const client = getOpenAICompatibleClient('openai')
      
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and provide a detailed description that could be used for social media content creation. Include key visual elements, mood, colors, and potential content ideas. Keep it concise but informative.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${req.file.mimetype};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })

      const analysis = response.choices[0]?.message?.content || 'Image analysis completed'

      // Deduct tokens for image analysis
      const tokenCost = calculateTokenCost('gpt-4o', 300)
      if (req.user) {
        await deductTokens(req.user.id, tokenCost, 'gpt-4o', 'Image analysis')
      }

      res.json({ 
        analysis,
        filename: filename || req.file.originalname,
        tokensUsed: tokenCost
      })
    } catch (error) {
      console.error('Image analysis error:', error)
      res.status(500).json({ error: 'Failed to analyze image' })
    }
  })

  // Speech transcription endpoint
  app.post('/api/transcribe', authenticateUser, upload.single('audio'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' })
      }

      const { language = 'en' } = req.body
      
      // Use OpenAI Whisper for transcription
      const client = getOpenAICompatibleClient('openai')
      
      // Create a Blob for Whisper API (Node.js doesn't have File constructor)
      const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype })

      const response = await client.audio.transcriptions.create({
        file: audioBlob as any, // Type assertion for compatibility
        model: 'whisper-1',
        language: language.split('-')[0], // Convert 'en-US' to 'en'
        response_format: 'text'
      })

      // Deduct tokens for transcription (estimate based on audio duration)
      const tokenCost = calculateTokenCost('whisper-1', 100)
      if (req.user) {
        await deductTokens(req.user.id, tokenCost, 'whisper-1', 'Audio transcription')
      }

      res.json({ 
        text: response,
        language,
        tokensUsed: tokenCost
      })
    } catch (error) {
      console.error('Transcription error:', error)
      res.status(500).json({ error: 'Failed to transcribe audio' })
    }
  })

  // Chat endpoint for model recommendations
  app.post('/api/chat', authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { 
        message, 
        messages, 
        provider: requestedProvider = 'qwen', 
        model: requestedModel = 'qwen-turbo', 
        mode = 'assistant' 
      } = req.body

      // Support both single message and messages array formats
      let userMessage: string
      if (messages && Array.isArray(messages) && messages.length > 0) {
        // Use the last message from the array (most recent user message)
        userMessage = messages[messages.length - 1]?.content || ''
      } else if (message) {
        userMessage = message
      } else {
        return res.status(400).json({ error: 'Message or messages array is required' })
      }

      // Check user's paid status
      const isPaid = req.user?.subscriptionStatus === 'premium_monthly' || req.user?.subscriptionStatus === 'paid_tokens'
      
      // Determine provider and model based on paid status
      let provider = requestedProvider
      let model = requestedModel

      if (!isPaid && (provider === 'openai' || provider === 'claude')) {
        console.log(`🔄 Redirecting ${provider}/${model} to qwen/qwen-turbo (free provider)`)
        provider = 'qwen'
        model = 'qwen-turbo'
      }

      // Get the appropriate client
      const client = getOpenAICompatibleClient(provider)
      
      // Prepare system prompt based on mode
      let systemPrompt = 'You are a helpful AI assistant.'
      if (mode === 'writing') {
        systemPrompt = 'You are a writing assistant helping users create engaging content.'
      } else if (mode === 'anime') {
        systemPrompt = 'You are an anime character design assistant helping users create unique characters.'
      }

      // Prepare messages array
      const messageArray: ChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        }
      ]

      // Add chat history if provided
      if (messages && Array.isArray(messages)) {
        messageArray.push(...(messages as ChatMessage[]))
      } else {
        messageArray.push({
          role: 'user',
          content: userMessage
        })
      }

      try {
        const response = await client.chat.completions.create({
          model,
          messages: messageArray,
          max_tokens: 1000,
          temperature: 0.7
        })

        const assistantMessage = response.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at this time.'

        // Deduct tokens for chat
        const tokenCost = calculateTokenCost(model, userMessage.length)
        if (req.user) {
          await deductTokens(req.user.id, tokenCost, model, 'Chat')
        }

        res.json({ 
          response: assistantMessage,
          message: assistantMessage,
          model,
          provider,
          tokensUsed: tokenCost
        })
      } catch (error: any) {
        console.error('Chat API error:', error)
        
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
    } catch (error) {
      console.error('Chat error:', error)
      res.status(500).json({ error: 'Failed to process chat request' })
    }
  })
} 