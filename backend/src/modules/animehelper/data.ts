// AnimeHelper Module Data and Templates
import { CharacterTemplate } from './types'

export const characterTemplates: CharacterTemplate[] = [
  {
    id: 'chibi',
    name: 'Chibi Style',
    style: 'Super deformed, cute proportions',
    description: 'Large head, small body, expressive eyes',
    thumbnail: '/templates/chibi.png',
    proportions: { headRatio: 0.4, bodyRatio: 0.6, limbRatio: 0.8 },
    characteristics: ['Large eyes', 'Small nose', 'Rounded features', 'Simplified anatomy']
  },
  {
    id: 'bishojo',
    name: 'Bishōjo Style',
    style: 'Beautiful girl aesthetic',
    description: 'Elegant proportions, detailed features',
    thumbnail: '/templates/bishojo.png',
    proportions: { headRatio: 0.15, bodyRatio: 0.85, limbRatio: 1.0 },
    characteristics: ['Detailed eyes', 'Flowing hair', 'Graceful pose', 'Realistic proportions']
  },
  {
    id: 'shonen',
    name: 'Shōnen Style',
    style: 'Dynamic action hero',
    description: 'Strong, energetic character design',
    thumbnail: '/templates/shonen.png',
    proportions: { headRatio: 0.12, bodyRatio: 0.88, limbRatio: 1.1 },
    characteristics: ['Sharp features', 'Dynamic pose', 'Strong jawline', 'Spiky hair']
  },
  {
    id: 'mecha-girl',
    name: 'Mecha Girl',
    style: 'Sci-fi android aesthetic',
    description: 'Futuristic character with tech elements',
    thumbnail: '/templates/mecha-girl.png',
    proportions: { headRatio: 0.14, bodyRatio: 0.86, limbRatio: 0.95 },
    characteristics: ['Mechanical details', 'Glowing elements', 'Sleek design', 'Tech accessories']
  },
  {
    id: 'magical-girl',
    name: 'Magical Girl',
    style: 'Fantasy magical aesthetic',
    description: 'Whimsical character with magical elements',
    thumbnail: '/templates/magical-girl.png',
    proportions: { headRatio: 0.16, bodyRatio: 0.84, limbRatio: 0.9 },
    characteristics: ['Flowing costume', 'Magical accessories', 'Sparkle effects', 'Cute expression']
  },
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
  },
  {
    id: 'gothic-lolita',
    name: 'Gothic Lolita',
    style: 'Dark elegant gothic style',
    description: 'Sophisticated gothic fashion with dark themes',
    thumbnail: '/templates/gothic-lolita.png',
    proportions: { headRatio: 0.15, bodyRatio: 0.85, limbRatio: 0.95 },
    characteristics: ['Dark color palette', 'Elaborate frills', 'Gothic accessories', 'Mysterious aura', 'Victorian influences', 'Dramatic lighting']
  },
  {
    id: 'shoujo-sparkle',
    name: 'Shoujo Sparkle',
    style: 'Classic shoujo manga style',
    description: 'Romantic shoujo with sparkles and flowers',
    thumbnail: '/templates/shoujo-sparkle.png',
    proportions: { headRatio: 0.16, bodyRatio: 0.84, limbRatio: 0.9 },
    characteristics: ['Sparkle effects', 'Flower backgrounds', 'Long eyelashes', 'Romantic poses', 'Soft features', 'Dream-like quality']
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    style: '8-bit retro pixel style',
    description: 'Retro gaming inspired pixel character',
    thumbnail: '/templates/pixel-art.png',
    proportions: { headRatio: 0.2, bodyRatio: 0.8, limbRatio: 0.9 },
    characteristics: ['Pixelated style', 'Limited color palette', 'Blocky features', 'Retro gaming feel', 'Sharp edges', '8-bit aesthetic']
  },
  {
    id: 'horror-creepy',
    name: 'Horror Creepy',
    style: 'Eerie horror aesthetic',
    description: 'Dark and unsettling character design',
    thumbnail: '/templates/horror-creepy.png',
    proportions: { headRatio: 0.14, bodyRatio: 0.86, limbRatio: 1.0 },
    characteristics: ['Dark atmosphere', 'Unsettling features', 'Gothic elements', 'Shadow effects', 'Mysterious aura', 'Horror motifs']
  }
];

export const colorPalettes = {
  pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA'],
  vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
  dark: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7'],
  neon: ['#FF073A', '#00F5FF', '#39FF14', '#FF1493', '#FFFF00'],
  monochrome: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'],
  sunset: ['#FF6B35', '#F7931E', '#FFD23F', '#6A994E', '#A7C957'],
  ocean: ['#006A6B', '#0E86D4', '#68BBE3', '#A7ECEE', '#DCF2F1'],
  forest: ['#2F5233', '#4F7942', '#6B8E5A', '#87A96B', '#A3C585']
};

export const poseOptions = [
  'standing confidently',
  'sitting casually',
  'action pose',
  'peaceful meditation',
  'dynamic jumping',
  'elegant dance',
  'reading a book',
  'looking over shoulder',
  'arms crossed',
  'waving hello',
  'thinking pose',
  'running forward',
  'magical casting',
  'combat stance',
  'relaxed lounging'
];

export const moodOptions = [
  'happy and cheerful',
  'mysterious and alluring',
  'confident and strong',
  'gentle and kind',
  'playful and mischievous',
  'serious and focused',
  'dreamy and ethereal',
  'energetic and excited',
  'calm and peaceful',
  'dramatic and intense'
]; 