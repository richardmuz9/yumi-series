import axios from 'axios';

interface EquationResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function generateEquation(prompt: string): Promise<string> {
  try {
    const response = await axios.post('/api/equations/generate', { prompt });
    const data = response.data as EquationResponse;
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from equation generation');
    }
    return data.choices[0].message.content.trim();
  } catch (error) {
    throw new Error('Failed to generate equation');
  }
}