import { CharacterTemplate } from '../types'

export const enhancedCharacterTemplates: CharacterTemplate[] = [
  {
    id: 'gorgeous-anime',
    name: 'Gorgeous Anime',
    style: 'Ultra-detailed beautiful style',
    description: 'Studio-quality detailed artwork with photorealistic shading',
    thumbnail: '/templates/gorgeous-anime.png',
    proportions: { headRatio: 0.14, bodyRatio: 0.86, limbRatio: 1.0 },
    characteristics: ['Hyper-detailed eyes', 'Realistic hair physics', 'Perfect proportions', 'Professional lighting', 'Soft gradients', 'High-end anime quality']
  },
  {
    id: 'manga-sketch',
    name: 'Manga Sketch',
    style: 'Black and white manga style',
    description: 'Traditional manga artwork with clean line art',
    thumbnail: '/templates/manga-sketch.png',
    proportions: { headRatio: 0.13, bodyRatio: 0.87, limbRatio: 1.0 },
    characteristics: ['Clean line art', 'Screentone effects', 'Dynamic angles', 'Speed lines', 'Bold outlines', 'Monochrome palette']
  },
  {
    id: 'semi-realistic',
    name: 'Semi-Realistic',
    style: 'Anime-realistic hybrid',
    description: 'Realistic proportions with anime features',
    thumbnail: '/templates/semi-realistic.png',
    proportions: { headRatio: 0.11, bodyRatio: 0.89, limbRatio: 1.05 },
    characteristics: ['Realistic anatomy', 'Anime facial features', 'Natural lighting', 'Detailed textures', 'Human proportions', 'Sophisticated shading']
  },
  {
    id: 'kawaii-moe',
    name: 'Kawaii Moe',
    style: 'Ultra-cute moe style',
    description: 'Adorable characters with maximum cuteness',
    thumbnail: '/templates/kawaii-moe.png',
    proportions: { headRatio: 0.18, bodyRatio: 0.82, limbRatio: 0.85 },
    characteristics: ['Giant sparkling eyes', 'Soft pastel colors', 'Blushing cheeks', 'Innocent expressions', 'Fluffy details', 'Heart motifs']
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    style: 'Futuristic cyberpunk aesthetic',
    description: 'High-tech character with neon accents',
    thumbnail: '/templates/cyberpunk-neon.png',
    proportions: { headRatio: 0.13, bodyRatio: 0.87, limbRatio: 1.0 },
    characteristics: ['Neon highlights', 'Tech augmentations', 'Glowing elements', 'Sharp edges', 'Urban aesthetic', 'Digital effects']
  }
] 