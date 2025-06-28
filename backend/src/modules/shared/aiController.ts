import { Request, Response } from 'express';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { tokenManager } from './aiTokenManager';
import crypto from 'crypto';

// Custom request type with user information
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

// Qwen API setup
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const qwenHeaders = {
  'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
  'Content-Type': 'application/json'
};

interface AIRequest {
  content: string;
  provider?: 'openai' | 'claude' | 'qwen' | 'google';
  action: 'enhance' | 'analyze' | 'suggest' | 'translate' | 'summarize';
  options?: {
    style?: string;
    tone?: string;
    length?: string;
    language?: string;
  };
}

const generateCacheKey = (request: AIRequest): string => {
  const data = JSON.stringify({
    content: request.content,
    action: request.action,
    options: request.options
  });
  return crypto.createHash('md5').update(data).digest('hex');
};

const estimateTokens = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};

const getPromptForAction = (action: string, content: string, options?: any): string => {
  switch (action) {
    case 'enhance':
      return `Enhance the following content while maintaining its core message. 
              Style: ${options?.style || 'professional'}
              Tone: ${options?.tone || 'neutral'}
              Content: ${content}`;
    
    case 'analyze':
      return `Analyze the following content and provide feedback on:
              - Writing style and tone
              - Content clarity and structure
              - Grammar and spelling
              - Suggestions for improvement
              Content: ${content}`;
    
    case 'suggest':
      return `Provide specific suggestions to improve the following content:
              Content: ${content}
              Focus on:
              1. Grammar and clarity
              2. Style and tone
              3. Content structure
              4. Engagement`;
    
    case 'translate':
      return `Translate the following content to ${options?.language || 'English'}:
              Content: ${content}`;
    
    case 'summarize':
      return `Create a ${options?.length || 'brief'} summary of:
              Content: ${content}`;
    
    default:
      return content;
  }
};

const processWithRetry = async (
  processFn: () => Promise<string>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<string> => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await processFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
};

const processWithOpenAI = async (prompt: string): Promise<string> => {
  return processWithRetry(async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content || '';
  });
};

const processWithClaude = async (prompt: string): Promise<string> => {
  return processWithRetry(async () => {
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });
    
    // Handle the response content properly
    const content = message.content[0];
    if ('text' in content) {
      return content.text;
    }
    throw new Error('Unexpected response type from Claude API');
  });
};

const processWithQwen = async (prompt: string): Promise<string> => {
  return processWithRetry(async () => {
    const response = await axios.post(QWEN_API_URL, {
      model: "qwen-max",
      input: {
        prompt: prompt,
        max_tokens: 1000
      }
    }, { headers: qwenHeaders });
    
    const data = response.data as { output: { text: string } };
    return data.output.text;
  });
};

const processWithGemini = async (prompt: string, model: string = 'gemini-pro'): Promise<string> => {
  return processWithRetry(async () => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    return result.candidates[0].content.parts[0].text
  });
};

export const processAIRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, provider, action, options }: AIRequest = req.body;
    const userId = req.user?.id; // Assuming user info is attached to request
    
    if (!content || !userId) {
      return res.status(400).json({ error: 'Content and user ID are required' });
    }

    // Generate cache key and check cache
    const cacheKey = generateCacheKey(req.body);
    const cachedResponse = await tokenManager.getCachedResponse(cacheKey);
    if (cachedResponse) {
      return res.json(JSON.parse(cachedResponse));
    }

    // Select provider based on token usage and rate limits
    const selectedProvider = await tokenManager.selectProvider(userId, provider);
    const prompt = getPromptForAction(action, content, options);
    const inputTokens = estimateTokens(prompt);

    let result: string;
    switch (selectedProvider) {
      case 'claude':
        result = await processWithClaude(prompt);
        break;
      case 'qwen':
        result = await processWithQwen(prompt);
        break;
      case 'google':
        result = await processWithGemini(prompt);
        break;
      default:
        result = await processWithOpenAI(prompt);
    }

    const outputTokens = estimateTokens(result);
    await tokenManager.updateTokenUsage(userId, selectedProvider, inputTokens + outputTokens);

    // Format response based on action
    let response: any = { result };
    
    if (action === 'analyze') {
      response.analysis = {
        tone: 'professional',
        complexity: 0.7,
        sentiment: 0.5
      };
    } else if (action === 'suggest') {
      response.suggestions = [
        {
          type: 'grammar',
          message: 'Consider revising...',
          location: { line: 1, column: 1 }
        }
      ];
    }

    // Cache the response
    await tokenManager.setCachedResponse(cacheKey, JSON.stringify(response));

    res.json(response);
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
};

// Export as aiController for backward compatibility
export const aiController = processAIRequest; 