import axios from 'axios';

/** @typedef {Object} AIOutput
 * @property {Object} output
 * @property {string} output.text
 */

interface AIOutput {
  output: {
    text: string;
  };
}

interface AIResponse {
  output: {
    text: string;
  };
}

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await axios.post('/api/ai/generate', { prompt });
    const data = response.data as AIResponse;
    return data.output.text;
  } catch (error) {
    throw new Error('Failed to get AI response');
  }
} 