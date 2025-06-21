export interface CharacterData {
  name: string
  age: string
  background: string
  catchphrase: string
  personalityTraits: string[]
  visualMotifs: string[]
  designElements: string[]
  character?: {
    name: string
    traits: string[]
    motifs: string[]
  }
  sessionId?: string
  designBrief?: {
    palette: {
      name: string
      colors: string[]
    }
    pose: {
      name: string
      description: string
    }
    stage: number
  }
}

export interface LayerData {
  id: string
  name: string
  canvas: HTMLCanvasElement
  visible: boolean
  opacity: number
  blendMode: BlendMode
  locked: boolean
}

export interface ToolbarItem {
  id: string
  icon: string
  label: string
  action: () => void
}

export interface SidebarTab {
  id: string
  icon: string
  label: string
  component: React.ReactNode
}

export type DrawingTool = 'brush' | 'eraser' | 'mask' | 'selection'
export type BlendMode = 'normal' | 'multiply' | 'overlay' | 'screen' | 'soft-light'

export interface PanelState {
  isCollapsed: boolean
  selectedTab: string
}

export interface CanvasState {
  zoom: number
  position: { x: number, y: number }
  tool: DrawingTool
  color: string
  size: number
  opacity: number
  blendMode: BlendMode
  layers: LayerData[]
  activeLayerId: string
  hasDrawing: boolean
}

export interface Translation {
  previous: string
  next: string
  step: string
  of: string
}

export interface PlaybookStep {
  id: string
  title: string
  videoUrl: string
  start: number
  end: number
  description: string
  tooltips: { time: number; text: string }[]
  advanced?: boolean
}

export type Mode = 'creative' | 'ai';

export interface AIGenerateOptions {
  style?: string;
  palette?: string[];
}

export interface AIGenerateResponse {
  imageUrl: string;
  prompt: string;
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
    modelUsed: string;
    timestamp: number;
  };
} 