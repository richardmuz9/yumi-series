import { WritingVariation } from '../types'

// Enhanced variation generation for different content types
export async function generateContentVariations(baseContent: string, contentType: string, count: number): Promise<WritingVariation[]> {
  const variations: WritingVariation[] = []
  
  const variationStrategies = {
    'social-media': [
      { name: 'Emoji enhancement', apply: (text: string) => text.replace(/\./g, ' ✨').replace(/!/g, ' 🚀') },
      { name: 'Question addition', apply: (text: string) => text + '\n\nWhat are your thoughts? 💭' },
      { name: 'Call-to-action', apply: (text: string) => text + '\n\nShare if you agree! 👇' }
    ],
    'creative-writing': [
      { name: 'Sensory details', apply: (text: string) => text.replace(/\./g, ', with vivid details.') },
      { name: 'Emotional depth', apply: (text: string) => text.replace(/said/g, 'whispered') },
      { name: 'Pacing variation', apply: (text: string) => text.replace(/\. /g, '.\n\n') }
    ],
    'blog-article': [
      { name: 'Subheading structure', apply: (text: string) => text.replace(/\n\n/g, '\n\n## ') },
      { name: 'Data inclusion', apply: (text: string) => text + '\n\n*According to recent studies...*' },
      { name: 'Reader engagement', apply: (text: string) => text + '\n\nWhat has your experience been?' }
    ],
    'script': [
      { name: 'Character emotion', apply: (text: string) => text.replace(/:/g, ' (smiling):') },
      { name: 'Scene direction', apply: (text: string) => '[Scene: ' + text + ']' },
      { name: 'Dialogue variation', apply: (text: string) => text.replace(/\./g, '...') }
    ]
  }

  const strategies = variationStrategies[contentType as keyof typeof variationStrategies] || variationStrategies['social-media']
  
  for (let i = 0; i < Math.min(count, strategies.length); i++) {
    const strategy = strategies[i]
    const variationContent = strategy.apply(baseContent)
    
    variations.push({
      id: `var_${i + 1}`,
      content: variationContent,
      changes: [strategy.name],
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    })
  }
  
  return variations
} 