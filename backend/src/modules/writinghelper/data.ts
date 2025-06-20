// WritingHelper Module Data and Configuration
import { WritingRequest, ContentTypeConfig, PlatformLimits, AnimePersonaConfig, VariationStrategy } from './types'

// Content type prompts and configurations
export const contentTypePrompts = {
  'social-media': {
    systemPrompt: 'You are a social media expert who creates engaging, authentic posts.',
    basePrompt: (req: WritingRequest) => `Create a ${req.platform} post for ${req.audience} audience with ${req.objective} objective and ${req.tone} tone.`
  },
  'creative-writing': {
    systemPrompt: 'You are a creative writing assistant who helps craft compelling stories, poems, and narratives.',
    basePrompt: (req: WritingRequest) => `Create a creative piece for ${req.audience} with ${req.objective} objective in a ${req.tone} tone.`
  },
  'blog-article': {
    systemPrompt: 'You are a professional content writer who creates informative and engaging blog articles.',
    basePrompt: (req: WritingRequest) => `Write a blog article for ${req.audience} about ${req.topic} with ${req.objective} objective in a ${req.tone} tone.`
  },
  'script': {
    systemPrompt: 'You are a visual novel and galgame script writer who creates engaging character dialogues and scenes.',
    basePrompt: (req: WritingRequest) => `Write a galgame/visual novel script scene for ${req.audience} with ${req.objective} objective in a ${req.tone} tone.`
  }
}

// Platform-specific limitations and features
export const platformLimits: PlatformLimits = {
  twitter: {
    maxLength: 280,
    recommendedLength: 240,
    features: ['hashtags', 'mentions', 'threads']
  },
  instagram: {
    maxLength: 2200,
    recommendedLength: 125,
    features: ['hashtags', 'stories', 'reels']
  },
  facebook: {
    maxLength: 63206,
    recommendedLength: 400,
    features: ['hashtags', 'mentions', 'links']
  },
  linkedin: {
    maxLength: 3000,
    recommendedLength: 1300,
    features: ['professional-tone', 'industry-hashtags']
  }
}

// Anime persona configurations
export const animePersonaPrompts: AnimePersonaConfig = {
  gojo_satoru: "Write with Gojo Satoru's confident, playful, and slightly arrogant personality. Use phrases like 'Throughout Heaven and Earth, I alone am the honored one' style confidence.",
  rem: "Write with Rem's devoted, gentle, and emotionally expressive personality. Show loyalty and care in the tone.",
  tanjiro: "Write with Tanjiro's kind, determined, and empathetic personality. Show compassion and strong moral values.",
  default: ""
}

// Content templates for each type
export const contentTemplates: { [key: string]: ContentTypeConfig } = {
  'social-media': {
    name: 'Social Media Posts',
    description: 'Engaging posts for social platforms',
    maxLength: 3000,
    templates: [
      {
        id: 'announcement',
        name: 'Product Announcement',
        objective: 'Introduce product',
        tone: 'Professional',
        template: 'Exciting news! We\'re launching {product}...'
      },
      {
        id: 'thought_leadership',
        name: 'Thought Leadership',
        objective: 'Share insights',
        tone: 'Authoritative',
        template: 'Here\'s what I\'ve learned about {topic}...'
      },
      {
        id: 'engagement',
        name: 'Engagement Post',
        objective: 'Drive interaction',
        tone: 'Conversational',
        template: 'Question for you: What\'s your take on {topic}?'
      },
      {
        id: 'behind_scenes',
        name: 'Behind the Scenes',
        objective: 'Show authenticity',
        tone: 'Personal',
        template: 'A peek behind the curtain: {story}...'
      }
    ]
  },
  'creative-writing': {
    name: 'Creative Writing',
    description: 'Stories, poems, and creative narratives',
    maxLength: 10000,
    templates: [
      {
        id: 'short_story',
        name: 'Short Story',
        objective: 'Tell a story',
        tone: 'Narrative',
        template: 'In a world where {setting}, {character} discovers...'
      },
      {
        id: 'poem',
        name: 'Poetry',
        objective: 'Express emotion',
        tone: 'Lyrical',
        template: 'Like {metaphor}, the {subject} {action}...'
      },
      {
        id: 'character_sketch',
        name: 'Character Development',
        objective: 'Develop character',
        tone: 'Descriptive',
        template: '{character_name} was not what anyone expected...'
      },
      {
        id: 'dialogue',
        name: 'Dialogue Scene',
        objective: 'Show interaction',
        tone: 'Conversational',
        template: '"You don\'t understand," {character} said...'
      }
    ]
  },
  'blog-article': {
    name: 'Blog Articles',
    description: 'Long-form informative content',
    maxLength: 20000,
    templates: [
      {
        id: 'how_to',
        name: 'How-To Guide',
        objective: 'Educate readers',
        tone: 'Instructional',
        template: 'Learn how to {skill} with these proven steps...'
      },
      {
        id: 'opinion',
        name: 'Opinion Piece',
        objective: 'Share perspective',
        tone: 'Persuasive',
        template: 'Why {topic} matters more than you think...'
      },
      {
        id: 'listicle',
        name: 'List Article',
        objective: 'Provide value',
        tone: 'Informative',
        template: '{number} Essential {items} Every {audience} Should Know'
      },
      {
        id: 'case_study',
        name: 'Case Study',
        objective: 'Demonstrate results',
        tone: 'Analytical',
        template: 'How {company} achieved {result} through {method}...'
      }
    ]
  },
  'script': {
    name: 'Galgame Scripts',
    description: 'Visual novel dialogues and scenes',
    maxLength: 5000,
    templates: [
      {
        id: 'romance_scene',
        name: 'Romance Scene',
        objective: 'Build relationship',
        tone: 'Romantic',
        template: '[Character approaches nervously] "I\'ve been wanting to tell you..."'
      },
      {
        id: 'conflict_scene',
        name: 'Conflict Scene',
        objective: 'Create tension',
        tone: 'Dramatic',
        template: '[Tension fills the room] "You knew all along, didn\'t you?"'
      },
      {
        id: 'comedy_scene',
        name: 'Comedy Scene',
        objective: 'Provide humor',
        tone: 'Lighthearted',
        template: '[Character stumbles comically] "That was... totally intentional!"'
      },
      {
        id: 'exposition_scene',
        name: 'Exposition Scene',
        objective: 'Reveal information',
        tone: 'Informative',
        template: '[Character explains seriously] "Let me tell you about {topic}..."'
      }
    ]
  }
}

// Variation strategies for different content types
export const variationStrategies: { [key: string]: VariationStrategy[] } = {
  'social-media': [
    { name: 'Emoji enhancement', apply: (text: string) => text.replace(/\./g, ' ✨').replace(/!/g, ' 🚀') },
    { name: 'Question addition', apply: (text: string) => text + '\n\nWhat are your thoughts? 💭' },
    { name: 'Call-to-action', apply: (text: string) => text + '\n\nShare if you agree! 👇' },
    { name: 'Hashtag optimization', apply: (text: string) => text + '\n\n#trending #content #engagement' },
    { name: 'Personal touch', apply: (text: string) => 'From my experience: ' + text }
  ],
  'creative-writing': [
    { name: 'Sensory details', apply: (text: string) => text.replace(/\./g, ', with vivid sensory details.') },
    { name: 'Emotional depth', apply: (text: string) => text.replace(/said/g, 'whispered emotionally') },
    { name: 'Pacing variation', apply: (text: string) => text.replace(/\. /g, '.\n\nThen, ') },
    { name: 'Dialogue addition', apply: (text: string) => text + '\n\n"This changes everything," they murmured.' },
    { name: 'Metaphor enhancement', apply: (text: string) => text.replace(/was/g, 'was like a') }
  ],
  'blog-article': [
    { name: 'Subheading structure', apply: (text: string) => text.replace(/\n\n/g, '\n\n## Key Point: ') },
    { name: 'Data inclusion', apply: (text: string) => text + '\n\n*According to recent studies, this approach shows 40% better results.*' },
    { name: 'Reader engagement', apply: (text: string) => text + '\n\nWhat has your experience been with this? Let me know in the comments!' },
    { name: 'Expert quote', apply: (text: string) => text + '\n\nAs industry expert Jane Doe notes: "This trend is here to stay."' },
    { name: 'Actionable tips', apply: (text: string) => text + '\n\n**Pro Tip:** Try implementing this gradually for best results.' }
  ],
  'script': [
    { name: 'Character emotion', apply: (text: string) => text.replace(/:/g, ' (smiling warmly):') },
    { name: 'Scene direction', apply: (text: string) => '[Gentle music plays]\n' + text + '\n[Scene fades]' },
    { name: 'Dialogue variation', apply: (text: string) => text.replace(/\./g, '... *pause*') },
    { name: 'Character action', apply: (text: string) => text + '\n[Character reaches out hesitantly]' },
    { name: 'Atmosphere setting', apply: (text: string) => '[Soft lighting, cherry blossoms falling]\n' + text }
  ]
}

// Style packs for different writing approaches
export const stylePacks = {
  casual: {
    id: 'casual',
    name: 'Casual & Friendly',
    description: 'Relaxed, conversational tone',
    toneAdjustments: {
      professional: 'friendly professional',
      formal: 'approachable',
      serious: 'thoughtful but relaxed'
    },
    templateModifiers: ['keep it simple', 'use everyday language', 'be conversational']
  },
  academic: {
    id: 'academic',
    name: 'Academic & Scholarly',
    description: 'Formal, research-based approach',
    toneAdjustments: {
      casual: 'scholarly informal',
      emotional: 'analytically passionate',
      humorous: 'intellectually witty'
    },
    templateModifiers: ['use precise terminology', 'include evidence', 'maintain objectivity']
  },
  creative: {
    id: 'creative',
    name: 'Creative & Artistic',
    description: 'Imaginative, expressive style',
    toneAdjustments: {
      formal: 'artistically sophisticated',
      technical: 'creatively analytical',
      simple: 'beautifully simple'
    },
    templateModifiers: ['use vivid imagery', 'employ metaphors', 'show don\'t tell']
  }
} 