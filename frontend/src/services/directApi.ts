// Direct API service for fallback when backend is unavailable
// NOTE: Replace these with your actual API keys in production
const QWEN_API_KEY = process.env.QWEN_API_KEY

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

  async chat(request: DirectChatRequest): Promise<DirectChatResponse> {
    try {
      let response: string
      
      response = await this.callQwenAPI(request.message, request.model)

      return {
        response,
        provider: 'qwen',
        model: request.model || 'qwen-turbo'
      }
    } catch (error) {
      console.error('Direct API call failed:', error)
      throw new Error(`Failed to call qwen API: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const directApiService = new DirectApiService()