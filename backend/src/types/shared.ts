export interface Asset {
  id: string
  url: string
  thumbnailUrl: string
  type: 'character' | 'background' | 'pose'
  metadata: {
    name: string
    tags: string[]
    palette?: string[]
    mood?: string[]
    createdAt: string
    updatedAt: string
  }
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