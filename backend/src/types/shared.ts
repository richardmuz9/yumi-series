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