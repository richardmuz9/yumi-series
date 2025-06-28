import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { modelsConfig } from './configLoaders'

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
let _gemini: any = null

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

// Gemini client using fetch API
function getGeminiClient() {
  if (!_gemini) {
    _gemini = {
      apiKey: process.env.GEMINI_API_KEY || 'dummy-key',
      async generateContent(model: string, prompt: string) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        })
        
        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        return {
          choices: [{
            message: {
              content: result.candidates[0].content.parts[0].text
            }
          }]
        }
      }
    }
  }
  return _gemini
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

export const gemini = new Proxy({} as any, {
  get(target, prop) {
    return getGeminiClient()[prop]
  }
})

// Function to get OpenAI-compatible client (excludes Claude and Gemini)
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
export function getAIClient(provider: string): OpenAI | Anthropic | any {
  switch (provider) {
    case 'openai':
      return getOpenAIClient()
    case 'claude':
      return getClaudeClient()
    case 'google':
      return getGeminiClient()
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