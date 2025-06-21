import { CharacterTemplate } from '../types'

export const specialCharacterTemplates: CharacterTemplate[] = [
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
    id: 'watercolor-soft',
    name: 'Watercolor Soft',
    style: 'Soft watercolor painting style',
    description: 'Gentle watercolor artwork with soft edges',
    thumbnail: '/templates/watercolor-soft.png',
    proportions: { headRatio: 0.15, bodyRatio: 0.85, limbRatio: 0.95 },
    characteristics: ['Soft brushstrokes', 'Watercolor textures', 'Gentle gradients', 'Organic shapes', 'Pastel tones', 'Artistic flow']
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    style: 'Simple minimalist design',
    description: 'Clean, simple lines with minimal detail',
    thumbnail: '/templates/minimalist-clean.png',
    proportions: { headRatio: 0.14, bodyRatio: 0.86, limbRatio: 1.0 },
    characteristics: ['Simple lines', 'Minimal details', 'Clean composition', 'Geometric shapes', 'Limited colors', 'Modern aesthetic']
  }
] 