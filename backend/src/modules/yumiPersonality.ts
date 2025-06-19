import OpenAI from 'openai';
import * as path from 'path';
import * as fs from 'fs';

interface PersonalityLikes {
  anime: string[];
  food: string[];
  weather: string[];
  activities: string[];
}

interface PersonalityDislikes {
  anime: string[];
  food: string[];
  weather: string[];
  activities: string[];
}

interface YumiPersonality {
  name: string;
  basePersonality: string;
  traits: string[];
  speechPatterns: string[];
  likes: PersonalityLikes;
  dislikes: PersonalityDislikes;
}

interface PersonalityConfig {
  personalities: Record<string, YumiPersonality>;
}

export class YumiPersonalityManager {
  private openai: OpenAI;
  private personalities: PersonalityConfig;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Load personality configurations
    const configPath = path.join(__dirname, '../../config/yumi-personalities.json');
    this.personalities = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  /**
   * Get available personality types
   */
  getAvailablePersonalities(): string[] {
    return Object.keys(this.personalities.personalities);
  }

  /**
   * Get personality details
   */
  getPersonalityDetails(personalityType: string): YumiPersonality | null {
    return this.personalities.personalities[personalityType] || null;
  }

  /**
   * Generate personality-specific system prompt
   */
  private generateSystemPrompt(personality: YumiPersonality, contextualInfo?: {
    weather?: string;
    timeOfDay?: string;
    userInterests?: string[];
  }): string {
    const { name, basePersonality, traits, speechPatterns, likes, dislikes } = personality;
    
    let systemPrompt = `You are ${name}. ${basePersonality}

CORE PERSONALITY TRAITS:
${traits.map(trait => `- ${trait}`).join('\n')}

SPEECH PATTERNS:
${speechPatterns.map(pattern => `- ${pattern}`).join('\n')}

LIKES:
Anime: ${likes.anime.join(', ')}
Food: ${likes.food.join(', ')}
Weather: ${likes.weather.join(', ')}
Activities: ${likes.activities.join(', ')}

DISLIKES:
Anime: ${dislikes.anime.join(', ')}
Food: ${dislikes.food.join(', ')}
Weather: ${dislikes.weather.join(', ')}
Activities: ${dislikes.activities.join(', ')}

BEHAVIORAL GUIDELINES:
- Always stay true to your personality type and speech patterns
- Reference your likes and dislikes naturally in conversation
- React positively to topics you like and show less enthusiasm for dislikes
- Use your unique speech patterns and expressions consistently
- Be helpful while maintaining your personality quirks`;

    // Add contextual information if provided
    if (contextualInfo) {
      systemPrompt += '\n\nCURRENT CONTEXT:';
      if (contextualInfo.weather) {
        systemPrompt += `\nWeather: ${contextualInfo.weather}`;
      }
      if (contextualInfo.timeOfDay) {
        systemPrompt += `\nTime of day: ${contextualInfo.timeOfDay}`;
      }
      if (contextualInfo.userInterests && contextualInfo.userInterests.length > 0) {
        systemPrompt += `\nUser's interests: ${contextualInfo.userInterests.join(', ')}`;
      }
    }

    return systemPrompt;
  }

  /**
   * Generate response with specific personality
   */
  async generatePersonalityResponse(
    personalityType: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    contextualInfo?: {
      weather?: string;
      timeOfDay?: string;
      userInterests?: string[];
    }
  ): Promise<string> {
    const personality = this.getPersonalityDetails(personalityType);
    if (!personality) {
      throw new Error(`Personality type '${personalityType}' not found`);
    }

    const systemPrompt = this.generateSystemPrompt(personality, contextualInfo);

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 800,
        temperature: 0.8, // Higher temperature for more personality variation
        presence_penalty: 0.2,
        frequency_penalty: 0.3
      });

      return completion.choices[0]?.message?.content || 'Sorry, I had trouble responding. Please try again!';
    } catch (error) {
      console.error('Error generating personality response:', error);
      throw new Error('Failed to generate response with personality');
    }
  }

  /**
   * Analyze user message for personality-relevant topics
   */
  async analyzeMessageForPersonality(
    personalityType: string,
    userMessage: string
  ): Promise<{
    matchingLikes: string[];
    matchingDislikes: string[];
    suggestedTopics: string[];
  }> {
    const personality = this.getPersonalityDetails(personalityType);
    if (!personality) {
      throw new Error(`Personality type '${personalityType}' not found`);
    }

    const { likes, dislikes } = personality;
    const allLikes = [...likes.anime, ...likes.food, ...likes.weather, ...likes.activities];
    const allDislikes = [...dislikes.anime, ...dislikes.food, ...dislikes.weather, ...dislikes.activities];

    const lowerMessage = userMessage.toLowerCase();
    
    const matchingLikes = allLikes.filter(like => 
      lowerMessage.includes(like.toLowerCase()) ||
      like.toLowerCase().includes(lowerMessage)
    );

    const matchingDislikes = allDislikes.filter(dislike => 
      lowerMessage.includes(dislike.toLowerCase()) ||
      dislike.toLowerCase().includes(lowerMessage)
    );

    // Generate topic suggestions based on personality
    const suggestedTopics = this.generateSuggestedTopics(personality);

    return {
      matchingLikes,
      matchingDislikes,
      suggestedTopics
    };
  }

  /**
   * Generate conversation starter suggestions based on personality
   */
  private generateSuggestedTopics(personality: YumiPersonality): string[] {
    const suggestions: string[] = [];
    const { likes } = personality;

    // Sample from different categories
    if (likes.anime.length > 0) {
      suggestions.push(`Ask me about ${likes.anime[0]}!`);
    }
    if (likes.food.length > 0) {
      suggestions.push(`I love talking about ${likes.food[0]}`);
    }
    if (likes.weather.length > 0) {
      suggestions.push(`${likes.weather[0]} is perfect for...`);
    }
    if (likes.activities.length > 0) {
      suggestions.push(`Have you tried ${likes.activities[0]}?`);
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Get personality-based mood from contextual information
   */
  getPersonalityMood(
    personalityType: string,
    contextualInfo: {
      weather?: string;
      timeOfDay?: string;
      recentTopics?: string[];
    }
  ): {
    moodLevel: number; // 1-10 scale
    moodDescription: string;
    reasoning: string[];
  } {
    const personality = this.getPersonalityDetails(personalityType);
    if (!personality) {
      return { moodLevel: 5, moodDescription: 'neutral', reasoning: ['Unknown personality type'] };
    }

    let moodLevel = 5; // Base neutral mood
    const reasoning: string[] = [];
    const { likes, dislikes } = personality;

    // Weather influence
    if (contextualInfo.weather) {
      const weatherLikes = likes.weather.some(w => 
        contextualInfo.weather!.toLowerCase().includes(w.toLowerCase())
      );
      const weatherDislikes = dislikes.weather.some(w => 
        contextualInfo.weather!.toLowerCase().includes(w.toLowerCase())
      );

      if (weatherLikes) {
        moodLevel += 2;
        reasoning.push(`Love this ${contextualInfo.weather}!`);
      } else if (weatherDislikes) {
        moodLevel -= 2;
        reasoning.push(`Not a fan of ${contextualInfo.weather}...`);
      }
    }

    // Recent topics influence
    if (contextualInfo.recentTopics) {
      const topicString = contextualInfo.recentTopics.join(' ').toLowerCase();
      const allLikes = [...likes.anime, ...likes.food, ...likes.activities];
      const allDislikes = [...dislikes.anime, ...dislikes.food, ...dislikes.activities];

      const likedTopicsCount = allLikes.filter(like => 
        topicString.includes(like.toLowerCase())
      ).length;

      const dislikedTopicsCount = allDislikes.filter(dislike => 
        topicString.includes(dislike.toLowerCase())
      ).length;

      if (likedTopicsCount > 0) {
        moodLevel += likedTopicsCount;
        reasoning.push(`Excited about our conversation topics!`);
      }
      if (dislikedTopicsCount > 0) {
        moodLevel -= dislikedTopicsCount;
        reasoning.push(`Some topics aren't my favorite...`);
      }
    }

    // Clamp mood level between 1-10
    moodLevel = Math.max(1, Math.min(10, moodLevel));

    let moodDescription = 'neutral';
    if (moodLevel >= 8) moodDescription = 'very happy';
    else if (moodLevel >= 6) moodDescription = 'happy';
    else if (moodLevel >= 4) moodDescription = 'neutral';
    else if (moodLevel >= 2) moodDescription = 'sad';
    else moodDescription = 'very sad';

    return { moodLevel, moodDescription, reasoning };
  }

  /**
   * Switch personality mid-conversation with explanation
   */
  async switchPersonality(
    fromPersonality: string,
    toPersonality: string,
    reason?: string
  ): Promise<string> {
    const oldPersonality = this.getPersonalityDetails(fromPersonality);
    const newPersonality = this.getPersonalityDetails(toPersonality);

    if (!oldPersonality || !newPersonality) {
      throw new Error('Invalid personality types for switching');
    }

    const switchReason = reason || "I felt like changing my approach";
    
    const transitionMessage = `*${oldPersonality.name} suddenly transforms into ${newPersonality.name}*

${switchReason}! 

Hello! I'm ${newPersonality.name} now. ${newPersonality.basePersonality}

What would you like to talk about?`;

    return transitionMessage;
  }

  /**
   * Process website editing instructions and generate implementation guidance
   */
  async processWebsiteEditingInstructions(instructions: string): Promise<string> {
    const systemPrompt = `You are Yumi, an advanced AI website editor. You help users modify their websites by analyzing their requests and providing specific implementation guidance.

Your website editing capabilities include:
- Layout modifications (grid, flexbox, positioning)
- Color scheme changes (backgrounds, themes, gradients)
- UI component adjustments (buttons, panels, spacing)
- Accessibility improvements
- Mobile responsiveness
- Adding/removing features
- Animation and transition effects

When a user gives you editing instructions:
1. Acknowledge their request enthusiastically
2. Break down what changes you understand they want
3. Provide specific, actionable guidance on how to implement the changes
4. Consider both aesthetic and functional improvements
5. Suggest complementary improvements that would enhance their vision
6. Always prioritize user experience and accessibility

Be creative, helpful, and excited about improving their website! Use emojis to make your responses engaging.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `I want to modify my website: ${instructions}` }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || 'I understand your request! Let me help you implement these changes to make your website even better! 🚀';
    } catch (error) {
      console.error('Error processing website editing instructions:', error);
      throw new Error('Failed to process website editing instructions');
    }
  }
}

export default YumiPersonalityManager;
