import { CharacterTemplate } from '../types'

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
  }
] 