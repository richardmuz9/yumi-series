// AnimeHelper Module Types and Interfaces

export interface CharacterTemplate {
  id: string
  name: string
  style: string
  description: string
  thumbnail: string
  proportions: {
    headRatio: number
    bodyRatio: number
    limbRatio: number
  }
  characteristics: string[]
}

export interface DesignBrief {
  character: {
    name?: string
    personality: string
    age: string
    gender: string
  }
  appearance: {
    hair: {
      color: string
      style: string
      length: string
    }
    eyes: {
      color: string
      shape: string
      expression: string
    }
    outfit: {
      style: string
      colors: string[]
      accessories: string[]
    }
    body: {
      height: string
      build: string
    }
  }
  mood: string
  colorPalette: string[]
  specialFeatures: string[]
  pose: string
  background?: string
}

export interface CharacterGenerationRequest {
  description: string
  templateId?: string
  style?: string
  colorPalette?: string[]
  pose?: string
  background?: string
  enableChatMode?: boolean
}

export interface CharacterGenerationResponse {
  imageUrl: string
  designBrief: DesignBrief
  template: CharacterTemplate
  promptUsed: string
  clarificationQuestions?: string[]
  suggestions?: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface CharacterChatRequest {
  message: string
  chatHistory?: ChatMessage[]
  currentCharacter?: DesignBrief
}

export interface RegenerateRequest {
  originalImage: string
  maskData: string
  region: 'face' | 'hair' | 'outfit' | 'background' | 'full'
  designBrief: DesignBrief
  templateId: string
  style?: string
}

export interface ProgressAnalysis {
  totalAttempts: number
  successfulGenerations: number
  favoriteStyles: string[]
  improvementSuggestions: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
}

export interface StructuredPrompt {
  subject: string;
  pose: string;
  expression: string;
  clothingAndAccessories: string;
  hairAndColorPalette: string;
  lightingAndMood: string;
  artStyleAndDetail: string;
  finishAndPostProcess: string;
}

export interface AIGenerationSettings {
  referenceImage?: string; // base64 encoded image
  iterations: number; // number of variations to generate
  useCustomModel: boolean;
  postProcessing: {
    upscale: boolean;
    denoise: boolean;
    lineArtCleanup: boolean;
    colorCorrection: {
      contrast: number;
      saturation: number;
      bloom: number;
    };
  };
}

export interface GeneratedImage {
  url: string;
  prompt: StructuredPrompt;
  settings: AIGenerationSettings;
  metadata: {
    referenceImageId?: string;
    modelUsed: string;
    timestamp: number;
  };
} 