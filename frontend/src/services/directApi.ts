// Direct API service for fallback when backend is unavailable
// NOTE: Replace these with your actual API keys in production
const QWEN_API_KEY = process.env.QWEN_API_KEY

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://137.184.89.215:3001');

export interface DirectChatRequest {
  message: string
  provider: 'qwen'
  model?: string
}

export interface DirectChatResponse {
  response: string
  provider: string
  model: string
}

class DirectApiService {
  private async callQwenAPI(message: string, model: string = 'qwen-turbo'): Promise<string> {
    if (!QWEN_API_KEY) {
      throw new Error('Qwen API key not configured. Please use the backend API.')
    }

    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: message }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 429) {
        throw new Error('Qwen API rate limit exceeded. Please wait a minute before trying again.')
      }
      
      if (response.status === 401) {
        throw new Error('Invalid Qwen API key. Please check your configuration.')
      }
      
      if (response.status === 400) {
        throw new Error(`Qwen API error: ${errorData.error?.message || 'Invalid request'}`)
      }
      
      throw new Error(`Qwen API error: ${errorData.error?.message || `HTTP ${response.status}`}`)
    }

    const data = await response.json()
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Qwen API')
    }
    
    return data.choices[0].message.content
  }

  async chat(request: DirectChatRequest): Promise<DirectChatResponse> {
    try {
      if (request.provider !== 'qwen') {
        throw new Error(`Provider ${request.provider} is not supported in direct API mode. Please use Qwen or the backend API.`)
      }

      const response = await this.callQwenAPI(request.message, request.model)

      return {
        response,
        provider: 'qwen',
        model: request.model || 'qwen-turbo'
      }
    } catch (error) {
      console.error('Direct API call failed:', error)
      throw error instanceof Error ? error : new Error('Failed to call Qwen API')
    }
  }
}

export const directApiService = new DirectApiService()