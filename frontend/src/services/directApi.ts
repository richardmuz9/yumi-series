// Direct API service for fallback when backend is unavailable
// NOTE: Replace these with your actual API keys in production
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const QWEN_API_KEY = process.env.QWEN_API_KEY

export interface DirectChatRequest {
  message: string
  provider: 'qwen' | 'openrouter'
  model?: string
}

export interface DirectChatResponse {
  response: string
  provider: string
  model: string
}

class DirectApiService {
  private async callQwenAPI(message: string, model: string = 'qwen-turbo'): Promise<string> {
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
      throw new Error(`Qwen API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response received'
  }

  private async callOpenRouterAPI(message: string, model: string = 'anthropic/claude-3-sonnet'): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Yumi Website Builder'
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
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response received'
  }

  async chat(request: DirectChatRequest): Promise<DirectChatResponse> {
    try {
      let response: string
      
      if (request.provider === 'qwen') {
        response = await this.callQwenAPI(request.message, request.model)
      } else {
        response = await this.callOpenRouterAPI(request.message, request.model)
      }

      return {
        response,
        provider: request.provider,
        model: request.model || (request.provider === 'qwen' ? 'qwen-turbo' : 'anthropic/claude-3-sonnet')
      }
    } catch (error) {
      console.error('Direct API call failed:', error)
      throw new Error(`Failed to call ${request.provider} API: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const directApiService = new DirectApiService()