// AnimeHelper Module Services and Business Logic
import OpenAI from 'openai'
import { DesignBrief, CharacterTemplate, ProgressAnalysis } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Generate clarification questions for character design
export async function generateClarificationQuestions(designBrief: DesignBrief, originalDescription: string): Promise<string[]> {
  try {
    const questions = []
    
    // Analyze what might be missing or unclear
    if (!designBrief.character.name) {
      questions.push("What would you like to name this character?")
    }
    
    if (designBrief.appearance.outfit.style === 'casual') {
      questions.push("What specific type of casual outfit would you prefer? (e.g., school uniform, streetwear, traditional)")
    }
    
    if (designBrief.mood === 'neutral') {
      questions.push("What kind of personality or mood should this character express?")
    }
    
    if (!designBrief.background) {
      questions.push("What setting or background would fit this character? (e.g., modern city, fantasy world, school)")
    }
    
    if (designBrief.specialFeatures.length === 0) {
      questions.push("Are there any special features or unique elements you'd like to add? (e.g., markings, tattoos, accessories)")
    }
    
    return questions.slice(0, 3) // Limit to 3 questions
  } catch (error) {
    console.error('Error generating clarification questions:', error)
    return []
  }
}

// Create detailed image generation prompt
export function createImagePrompt(designBrief: DesignBrief, template: CharacterTemplate): string {
  const { character, appearance, mood, pose, background } = designBrief
  
  let prompt = `Anime character, ${template.style}, ${character.gender}, ${character.age} years old, `
  
  // Character personality and mood
  prompt += `${character.personality} personality, ${mood} expression, `
  
  // Hair details
  prompt += `${appearance.hair.length} ${appearance.hair.color} hair in ${appearance.hair.style} style, `
  
  // Eye details
  prompt += `${appearance.eyes.color} ${appearance.eyes.shape} eyes with ${appearance.eyes.expression} expression, `
  
  // Body and outfit
  prompt += `${appearance.body.height} height, ${appearance.body.build} build, `
  prompt += `wearing ${appearance.outfit.style} outfit in ${appearance.outfit.colors.join(' and ')} colors, `
  
  // Accessories
  if (appearance.outfit.accessories.length > 0) {
    prompt += `accessories: ${appearance.outfit.accessories.join(', ')}, `
  }
  
  // Special features
  if (designBrief.specialFeatures.length > 0) {
    prompt += `special features: ${designBrief.specialFeatures.join(', ')}, `
  }
  
  // Pose and composition
  prompt += `${pose}, `
  
  // Background
  if (background) {
    prompt += `background: ${background}, `
  }
  
  // Style characteristics from template
  prompt += `art style: ${template.characteristics.join(', ')}, `
  
  // Quality enhancers
  prompt += `high quality, detailed, anime art, professional illustration, vibrant colors, clean lines`
  
  return prompt
}

// Regenerate specific character region
export async function regenerateCharacterRegion(
  originalImage: string,
  maskData: string,
  designBrief: DesignBrief,
  template: CharacterTemplate,
  style: string = 'detailed-anime'
): Promise<string> {
  try {
    // Create prompt based on the region being regenerated
    const prompt = createImagePrompt(designBrief, template)
    
    // In a real implementation, this would use OpenAI's image editing API
    // For now, return a placeholder URL
    const editedImageUrl = `https://api.placeholder.com/edited-character-${Date.now()}.png`
    
    return editedImageUrl
  } catch (error) {
    console.error('Error regenerating character region:', error)
    throw new Error('Failed to regenerate character region')
  }
}

// Parse user description into design brief
export function parseDescriptionToDesignBrief(description: string): DesignBrief {
  // Initialize with defaults
  const designBrief: DesignBrief = {
    character: {
      personality: 'friendly',
      age: 'young adult',
      gender: 'female'
    },
    appearance: {
      hair: {
        color: 'brown',
        style: 'long',
        length: 'medium'
      },
      eyes: {
        color: 'brown',
        shape: 'large',
        expression: 'gentle'
      },
      outfit: {
        style: 'casual',
        colors: ['blue', 'white'],
        accessories: []
      },
      body: {
        height: 'average',
        build: 'slim'
      }
    },
    mood: 'happy',
    colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    specialFeatures: [],
    pose: 'standing confidently'
  }
  
  const lowerDesc = description.toLowerCase()
  
  // Gender detection
  if (lowerDesc.includes('boy') || lowerDesc.includes('male') || lowerDesc.includes('man')) {
    designBrief.character.gender = 'male'
  }
  
  // Hair color detection
  const hairColors = ['blonde', 'brown', 'black', 'red', 'blue', 'green', 'purple', 'pink', 'white', 'silver']
  for (const color of hairColors) {
    if (lowerDesc.includes(color + ' hair')) {
      designBrief.appearance.hair.color = color
      break
    }
  }
  
  // Eye color detection
  const eyeColors = ['blue', 'brown', 'green', 'purple', 'red', 'golden', 'silver']
  for (const color of eyeColors) {
    if (lowerDesc.includes(color + ' eyes')) {
      designBrief.appearance.eyes.color = color
      break
    }
  }
  
  // Age detection
  if (lowerDesc.includes('child') || lowerDesc.includes('kid')) {
    designBrief.character.age = 'child'
  } else if (lowerDesc.includes('teen')) {
    designBrief.character.age = 'teenager'
  } else if (lowerDesc.includes('adult')) {
    designBrief.character.age = 'adult'
  }
  
  // Outfit style detection
  if (lowerDesc.includes('school uniform')) {
    designBrief.appearance.outfit.style = 'school uniform'
  } else if (lowerDesc.includes('gothic')) {
    designBrief.appearance.outfit.style = 'gothic'
  } else if (lowerDesc.includes('magical')) {
    designBrief.appearance.outfit.style = 'magical girl'
  } else if (lowerDesc.includes('armor')) {
    designBrief.appearance.outfit.style = 'armor'
  }
  
  // Mood detection
  if (lowerDesc.includes('sad') || lowerDesc.includes('crying')) {
    designBrief.mood = 'sad'
  } else if (lowerDesc.includes('angry') || lowerDesc.includes('fierce')) {
    designBrief.mood = 'angry'
  } else if (lowerDesc.includes('mysterious')) {
    designBrief.mood = 'mysterious'
  } else if (lowerDesc.includes('happy') || lowerDesc.includes('cheerful')) {
    designBrief.mood = 'happy'
  }
  
  return designBrief
}

// Generate character variations
export function generateCharacterVariations(baseDesignBrief: DesignBrief): DesignBrief[] {
  const variations: DesignBrief[] = []
  
  // Hair color variations
  const hairColorVariation = { ...baseDesignBrief }
  const hairColors = ['blonde', 'brown', 'black', 'red', 'blue', 'purple']
  hairColorVariation.appearance.hair.color = hairColors[Math.floor(Math.random() * hairColors.length)]
  variations.push(hairColorVariation)
  
  // Outfit style variations
  const outfitVariation = { ...baseDesignBrief }
  const outfitStyles = ['casual', 'formal', 'gothic', 'magical girl', 'school uniform']
  outfitVariation.appearance.outfit.style = outfitStyles[Math.floor(Math.random() * outfitStyles.length)]
  variations.push(outfitVariation)
  
  // Mood variations
  const moodVariation = { ...baseDesignBrief }
  const moods = ['happy', 'mysterious', 'confident', 'gentle', 'serious']
  moodVariation.mood = moods[Math.floor(Math.random() * moods.length)]
  variations.push(moodVariation)
  
  return variations
}

// Analyze user progress and provide suggestions
export function analyzeProgress(generationHistory: any[]): ProgressAnalysis {
  const analysis: ProgressAnalysis = {
    totalAttempts: generationHistory.length,
    successfulGenerations: generationHistory.filter(g => g.success).length,
    favoriteStyles: [],
    improvementSuggestions: [],
    skillLevel: 'beginner'
  }
  
  // Determine skill level
  if (analysis.totalAttempts > 20) {
    analysis.skillLevel = 'advanced'
  } else if (analysis.totalAttempts > 10) {
    analysis.skillLevel = 'intermediate'
  }
  
  // Generate suggestions based on usage patterns
  if (analysis.successfulGenerations / analysis.totalAttempts < 0.5) {
    analysis.improvementSuggestions.push('Try being more specific in your character descriptions')
    analysis.improvementSuggestions.push('Use reference images for better results')
  }
  
  if (analysis.totalAttempts < 5) {
    analysis.improvementSuggestions.push('Experiment with different art styles and templates')
    analysis.improvementSuggestions.push('Try the guided character creation mode')
  }
  
  return analysis
} 