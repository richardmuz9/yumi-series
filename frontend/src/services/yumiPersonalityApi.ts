const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface PersonalityLikes {
  anime: string[];
  food: string[];
  weather: string[];
  activities: string[];
}

export interface PersonalityDislikes {
  anime: string[];
  food: string[];
  weather: string[];
  activities: string[];
}

export interface YumiPersonality {
  name: string;
  basePersonality: string;
  traits: string[];
  speechPatterns: string[];
  likes: PersonalityLikes;
  dislikes: PersonalityDislikes;
}

export interface PersonalityDetails {
  type: string;
  details: YumiPersonality;
}

export interface MessageAnalysis {
  matchingLikes: string[];
  matchingDislikes: string[];
  suggestedTopics: string[];
}

export interface PersonalityMood {
  moodLevel: number; // 1-10 scale
  moodDescription: string;
  reasoning: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ContextualInfo {
  weather?: string;
  timeOfDay?: string;
  userInterests?: string[];
  recentTopics?: string[];
}

// Simple API helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed: ${response.statusText}`);
  }

  return response.json();
};

class YumiPersonalityApi {
  /**
   * Get all available personality types and their details
   */
  async getPersonalities(): Promise<PersonalityDetails[]> {
    const response = await apiRequest('/api/yumi/personalities');
    return response.personalities;
  }

  /**
   * Generate a response with a specific personality
   */
  async chat(
    personalityType: string,
    message: string,
    conversationHistory: ChatMessage[] = [],
    contextualInfo: ContextualInfo = {}
  ): Promise<string> {
    const response = await apiRequest('/api/yumi/chat', {
      method: 'POST',
      body: JSON.stringify({
        personalityType,
        message,
        conversationHistory,
        contextualInfo
      }),
    });
    return response.response;
  }

  /**
   * Analyze a message for personality-relevant topics
   */
  async analyzeMessage(
    personalityType: string,
    message: string
  ): Promise<MessageAnalysis> {
    const response = await apiRequest('/api/yumi/analyze', {
      method: 'POST',
      body: JSON.stringify({
        personalityType,
        message
      }),
    });
    return response.analysis;
  }

  /**
   * Get personality mood based on contextual information
   */
  async getPersonalityMood(
    personalityType: string,
    contextualInfo: ContextualInfo = {}
  ): Promise<PersonalityMood> {
    const response = await apiRequest('/api/yumi/mood', {
      method: 'POST',
      body: JSON.stringify({
        personalityType,
        contextualInfo
      }),
    });
    return response.mood;
  }

  /**
   * Switch from one personality to another with explanation
   */
  async switchPersonality(
    fromPersonality: string,
    toPersonality: string,
    reason?: string
  ): Promise<{
    transitionMessage: string;
    newPersonality: string;
  }> {
    const response = await apiRequest('/api/yumi/switch-personality', {
      method: 'POST',
      body: JSON.stringify({
        fromPersonality,
        toPersonality,
        reason
      }),
    });
    return {
      transitionMessage: response.transitionMessage,
      newPersonality: response.newPersonality
    };
  }

  /**
   * Get current weather for mood context (if user shares location)
   */
  async getCurrentWeather(): Promise<string | null> {
    try {
      // This is a simple implementation - in production you'd use a weather API
      const now = new Date();
      const hour = now.getHours();
      const month = now.getMonth();
      
      // Simple weather simulation based on time and season
      if (month >= 2 && month <= 4) { // Spring
        return hour < 8 || hour > 18 ? 'cool spring evening' : 'pleasant spring day';
      } else if (month >= 5 && month <= 7) { // Summer
        return hour < 8 || hour > 18 ? 'warm summer evening' : 'sunny summer day';
      } else if (month >= 8 && month <= 10) { // Autumn
        return hour < 8 || hour > 18 ? 'crisp autumn evening' : 'cool autumn day';
      } else { // Winter
        return hour < 8 || hour > 18 ? 'cold winter evening' : 'chilly winter day';
      }
    } catch (error) {
      console.warn('Could not determine weather:', error);
      return null;
    }
  }

  /**
   * Get time of day for mood context
   */
  getTimeOfDay(): string {
    const hour = new Date().getHours();
    
    if (hour < 6) return 'late night';
    if (hour < 9) return 'early morning';
    if (hour < 12) return 'morning';
    if (hour < 14) return 'early afternoon';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    if (hour < 23) return 'late evening';
    return 'night';
  }

  /**
   * Create contextual info object with current environmental data
   */
  async createContextualInfo(userInterests: string[] = []): Promise<ContextualInfo> {
    const weather = await this.getCurrentWeather();
    const timeOfDay = this.getTimeOfDay();
    
    return {
      weather: weather || undefined,
      timeOfDay,
      userInterests: userInterests.length > 0 ? userInterests : undefined
    };
  }
}

export const yumiPersonalityApi = new YumiPersonalityApi();
export default yumiPersonalityApi; 