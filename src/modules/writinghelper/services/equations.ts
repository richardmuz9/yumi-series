import axios from 'axios';
import type { OpenAIResponse } from '../../../types/shared';

export async function generateEquation(description: string): Promise<string> {
  try {
    const response = await axios.post<OpenAIResponse>('/api/equations/generate', { description });
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Equation generation failed: ${error.message}`);
    }
    throw new Error('Equation generation failed with unknown error');
  }
} 