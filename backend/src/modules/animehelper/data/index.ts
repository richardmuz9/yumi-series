import { characterTemplates } from './templates'
import { enhancedCharacterTemplates } from './enhanced-templates'
import { specialCharacterTemplates } from './special-templates'

export const allCharacterTemplates = [
  ...characterTemplates,
  ...enhancedCharacterTemplates,
  ...specialCharacterTemplates
]

export {
  characterTemplates,
  enhancedCharacterTemplates,
  specialCharacterTemplates
} 