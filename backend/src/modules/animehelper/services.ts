// AnimeHelper Module Services and Business Logic
import OpenAI from 'openai'
import { DesignBrief, CharacterTemplate, ProgressAnalysis, StructuredPrompt, AIGenerationSettings, GeneratedImage } from './types'
import { z } from 'zod'
import { chargeUserCredits } from '../billing'
import { processImage } from '../shared/imageProcessing'
import { db } from '../shared'
import { saveAsset } from '../shared/assets'
import { Asset } from '../../types/shared'

interface GenerateImageResult {
  url: string;
  prompt: StructuredPrompt;
  settings: AIGenerationSettings;
  metadata: {
    referenceImageId?: string;
    modelUsed: string;
    timestamp: number;
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const generateImagePromptSchema = z.object({
  prompt: z.string().min(1),
  options: z.object({
    style: z.string().optional(),
    palette: z.array(z.string()).optional(),
  }).optional(),
})

export type GenerateImagePromptRequest = z.infer<typeof generateImagePromptSchema>

// Generate clarification questions for character design
export async function generateClarificationQuestions(designBrief: DesignBrief, originalDescription: string): Promise<string[]> {
  try {
    console.log('[AnimeHelper] Generating clarification questions for:', designBrief, originalDescription)
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
    
    console.log('[AnimeHelper] Clarification questions generated:', questions)
    return questions.slice(0, 3) // Limit to 3 questions
  } catch (error) {
    console.error('[AnimeHelper] Error generating clarification questions:', error)
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

async function generateStructuredPrompt(description: string): Promise<StructuredPrompt> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an expert anime character designer. Break down the user's character description into a structured format with these fields:
          - Subject: The main character description
          - Pose: Specific pose and viewing angle
          - Expression: Facial expression and emotion
          - Clothing & Accessories: Detailed outfit description
          - Hair & Color Palette: Hair style, colors, and overall color scheme
          - Lighting & Mood: Lighting setup and atmospheric effects
          - Art Style & Detail: Specific anime art style and detail level
          - Finish & Post-Process: Resolution and post-processing effects
          
          Format each field as a concise, vivid description.`
      },
      {
        role: 'user',
        content: description
      }
    ]
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('Failed to generate structured prompt');

  // Parse the response into structured format
  const lines = response.split('\n');
  const prompt: Partial<StructuredPrompt> = {};
  
  lines.forEach(line => {
    const [key, value] = line.split(':').map(s => s.trim());
    switch (key) {
      case 'Subject': prompt.subject = value; break;
      case 'Pose': prompt.pose = value; break;
      case 'Expression': prompt.expression = value; break;
      case 'Clothing & Accessories': prompt.clothingAndAccessories = value; break;
      case 'Hair & Color Palette': prompt.hairAndColorPalette = value; break;
      case 'Lighting & Mood': prompt.lightingAndMood = value; break;
      case 'Art Style & Detail': prompt.artStyleAndDetail = value; break;
      case 'Finish & Post-Process': prompt.finishAndPostProcess = value; break;
    }
  });

  return prompt as StructuredPrompt;
}

async function assemblePrompt(structuredPrompt: StructuredPrompt): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert at writing DALL·E prompts. Combine the structured character description into a single, flowing prompt that will generate a high-quality anime character. Keep it under 50 words while preserving all important details.'
      },
      {
        role: 'user',
        content: JSON.stringify(structuredPrompt, null, 2)
      }
    ]
  });

  return completion.choices[0]?.message?.content || '';
}

async function generateImage(structuredPrompt: StructuredPrompt, settings: AIGenerationSettings): Promise<string> {
  // Assemble into DALL·E prompt
  const finalPrompt = await assemblePrompt(structuredPrompt);

  // Generate image
  const imageResponse = await openai.images.generate({
    model: settings.useCustomModel ? 'dall-e-3-anime' : 'dall-e-3',
    prompt: finalPrompt,
    n: 1,
    size: '1024x1024',
    response_format: 'url',
    quality: 'hd',
  });

  if (!imageResponse.data || imageResponse.data.length === 0) {
    throw new Error('No images generated');
  }

  const imageUrl = imageResponse.data[0]?.url;
  if (!imageUrl) {
    throw new Error('Generated image URL is undefined');
  }

  return imageUrl;
}

export async function generateAnimeCharacter(
  userId: string,
  description: string,
  settings: AIGenerationSettings
): Promise<GenerateImageResult[]> {
  try {
    // Estimate API cost based on iterations and features
    const apiCost = estimateGenerationCost(settings);
    
    // Charge user credits
    const billingResult = await chargeUserCredits(userId, apiCost);
    if (!billingResult.success) {
      throw new Error(billingResult.error || 'Failed to charge credits');
    }

    // Step 1: Generate structured prompt
    const structuredPrompt = await generateStructuredPrompt(description);

    // Step 2: Generate image using OpenAI
    const imageUrl = await generateImage(structuredPrompt, settings);
    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }

    // Step 3: Process the image with the user's settings
    const processedImageUrl = await processImage(imageUrl, {
      upscale: settings.postProcessing.upscale,
      denoise: settings.postProcessing.denoise,
      lineArtCleanup: settings.postProcessing.lineArtCleanup,
      colorCorrection: settings.postProcessing.colorCorrection
    });

    if (!processedImageUrl) {
      throw new Error('Failed to process image');
    }

    // Step 4: Save to asset library
    const savedAsset = await saveAsset(userId, {
      url: processedImageUrl,
      type: 'character',
      metadata: {
        name: `Character - ${new Date().toISOString()}`,
        tags: ['ai-generated', 'anime', 'character'],
        mood: []
      }
    });

    // Return the generated image with metadata
    const result: GenerateImageResult = {
      url: processedImageUrl,
      prompt: structuredPrompt,
      settings,
      metadata: {
        referenceImageId: settings.referenceImage ? savedAsset.id : undefined,
        modelUsed: settings.useCustomModel ? 'dall-e-3-anime' : 'dall-e-3',
        timestamp: Date.now()
      }
    };

    return [result];
  } catch (error) {
    console.error('Error generating character:', error);
    throw error;
  }
}

function estimateGenerationCost(settings: AIGenerationSettings): number {
  // Base costs in credits
  const GPT4_COST = 10;
  const DALLE_COST = 25;
  
  // Multiply by number of iterations
  const baseCost = (GPT4_COST * 2) + (DALLE_COST * settings.iterations);
  
  // Add costs for additional features
  let featureCost = 0;
  if (settings.useCustomModel) featureCost += 15;
  if (settings.postProcessing.upscale) featureCost += 5;
  if (settings.postProcessing.denoise) featureCost += 5;
  if (settings.postProcessing.lineArtCleanup) featureCost += 10;
  
  // Apply business markup (3.5x)
  return (baseCost + featureCost) * 3.5;
} 