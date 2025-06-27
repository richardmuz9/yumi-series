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

export type DrawingTool = 
  | 'brush' 
  | 'eraser' 
  | 'pencil' 
  | 'marker' 
  | 'airbrush'
  // NEW: Specialized brushes for detailed work
  | 'fine-liner'      // For precise lines like eyelashes
  | 'detail-brush'    // For tiny details and highlights
  | 'texture-brush'   // For hair texture and fabric patterns
  | 'calligraphy'     // Variable width based on pressure
  | 'pixel-brush'     // For pixel-perfect details
  // NEW: Specialized erasers
  | 'precision-eraser' // For detailed erasing
  | 'soft-eraser'     // Gradual erasing
  | 'highlight-eraser' // Creates highlights by erasing

export interface BrushSettings {
  size: number
  opacity: number
  hardness: number
  // NEW: Advanced brush properties
  tipShape: 'round' | 'square' | 'diagonal' | 'custom'
  pressureSensitivity: boolean
  texturePath?: string
  spacing: number // Distance between brush stamps
  scattering: number // Random position variation
  rotation: number // Brush rotation angle
  flowRate: number // Paint flow (different from opacity)
  smoothing: number // Stroke smoothing level
  tapering: {
    enabled: boolean
    startTaper: number // 0-100%
    endTaper: number   // 0-100%
  }
}

export interface PenConfiguration {
  id: string
  name: string
  tool: DrawingTool
  defaultSettings: BrushSettings
  category: 'basic' | 'detail' | 'texture' | 'effects'
  description: string
  icon: string
  // NEW: Specialized configurations
  minSize: number
  maxSize: number
  supportsTexture: boolean
  supportsPressure: boolean
  previewPath?: string // SVG path for tool preview
}

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten'

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

export type Mode = 'creative' | 'ai-generate'

export interface AIGenerateOptions {
  prompt: string
  style: string
  variations: number
  enhanceDetails: boolean
  keepColors: boolean
  useCharacterData: boolean
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

export interface Point {
  x: number;
  y: number;
}

export interface DrawOptions {
  color: string;
  size: number;
  opacity: number;
  blendMode: string;
}

export interface HistoryState {
  canvasState: CanvasState;
  timestamp: number;
  action: string;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'svg';
  quality?: number;
  size: number;
}

export interface AIDrawingOptions {
  mode: 'brush' | 'eraser' | 'color';
  prompt?: string;
  strength: number;
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// NEW: Version 1.2 Creation Mode Types
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  category: 'warm' | 'cool' | 'pastel' | 'vibrant' | 'neutral' | 'theme';
  theme?: string; // e.g., 'maid_cafe', 'beach', 'gothic_lolita'
}

export interface AIColorSuggestion {
  color: string;
  reason: string;
  category: 'base' | 'accent' | 'highlight' | 'shadow';
  compatibility: number; // 0-100 score
}

export interface CharacterVersion {
  id: string;
  name: string;
  thumbnail: string; // base64 or URL
  timestamp: number;
  description: string;
  canvasData: string; // serialized canvas state
  metadata: {
    pose?: string;
    expression?: string;
    outfit?: string;
    colors: string[];
  };
}

export interface CharacterLibraryItem {
  id: string;
  name: string;
  thumbnail: string;
  tags: string[];
  createdAt: number;
  lastModified: number;
  versions: CharacterVersion[];
  activeVersionId: string;
}

export interface StyleCombination {
  id: string;
  name: string;
  description: string;
  elements: {
    hairColor: string;
    outfitColors: string[];
    accessories: string[];
    background?: string;
  };
  compatibilityScore: number;
  category: 'recommended' | 'trending' | 'classic';
}

export interface SmartBrushSettings {
  mode: 'auto_fill' | 'gradient_fill' | 'pattern_recognition' | 'smart_eraser' | 'detail_enhance'
  sensitivity: number
  blendStrength: number
  preserveDetails: boolean
  // NEW: Detail-specific settings
  detailLevel: 'coarse' | 'medium' | 'fine' | 'ultra-fine'
  edgeDetection: boolean
  colorBlending: 'smooth' | 'crisp' | 'textured'
}

export interface VersionHistory {
  versions: CharacterVersion[];
  currentIndex: number;
  maxVersions: number;
}

export interface CreationModeState {
  characterLibrary: CharacterLibraryItem[];
  currentCharacter?: CharacterLibraryItem;
  versionHistory: VersionHistory;
  showSmallWindow: boolean;
  selectedLibraryItem?: string;
  aiColorSuggestions: AIColorSuggestion[];
  recommendedCombinations: StyleCombination[];
  smartBrushSettings: SmartBrushSettings;
}

// Extended canvas state for v1.2
export interface EnhancedCanvasState extends CanvasState {
  versionHistory: VersionHistory;
  smartBrushEnabled: boolean;
  aiAssistMode: boolean;
}

// AI Analysis types
export interface ImageAnalysisResult {
  dominantColors: string[];
  colorHarmony: 'complementary' | 'triadic' | 'analogous' | 'monochromatic';
  suggestedPalettes: ColorPalette[];
  styleCategory: string;
  recommendations: {
    hairColor: string[];
    accentColors: string[];
    backgroundSuggestions: string[];
  };
}

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  expressions: Record<string, string>; // expression name -> image URL
  poses: Record<string, string>; // pose name -> image URL
  metadata: {
    age?: number;
    height?: number;
    personality?: string[];
    background?: string;
    relationships?: Record<string, string>;
  };
  style: {
    hairColor: string;
    eyeColor: string;
    outfitColors: string[];
    customAttributes?: Record<string, any>;
  };
  created: string;
  modified: string;
  tags: string[];
} 