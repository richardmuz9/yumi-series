import axios from 'axios';
import type { AIResponse } from '../../types/shared';

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await axios.post<AIResponse>('/api/ai/generate', { prompt });
    return response.data.output.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
    throw new Error('AI generation failed with unknown error');
  }
} 