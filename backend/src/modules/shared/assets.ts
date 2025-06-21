import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { Asset } from '../../types/shared'
import { AuthRequest } from '../shared'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// In-memory asset database (replace with real DB in production)
let assets: Asset[] = []

// Save asset function
export async function saveAsset(userId: string, assetData: {
  url: string;
  type: Asset['type'];
  metadata: {
    name: string;
    tags: string[];
    mood: string[];
  };
}): Promise<Asset> {
  const asset: Asset = {
    id: uuidv4(),
    url: assetData.url,
    thumbnailUrl: assetData.url, // For now, use same URL for thumbnail
    type: assetData.type,
    metadata: {
      name: assetData.metadata.name,
      tags: assetData.metadata.tags,
      mood: assetData.metadata.mood,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  assets.push(asset)
  return asset
}

// Get all assets
router.get('/', (req, res) => {
  res.json(assets)
})

// Upload new asset
router.post('/', upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded')
    }

    const { type, name, tags, mood } = req.body

    // Generate thumbnail
    const thumbnailName = `thumb_${req.file.filename}`
    const thumbnailPath = path.join(req.file.destination, thumbnailName)
    
    await sharp(req.file.path)
      .resize(300, 300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(thumbnailPath)

    const asset = await saveAsset(req.user?.id.toString() || 'anonymous', {
      url: `/uploads/${req.file.filename}`,
      type: type as Asset['type'],
      metadata: {
        name: name || 'Untitled',
        tags: tags ? JSON.parse(tags) : [],
        mood: mood ? JSON.parse(mood) : []
      }
    })

    res.json(asset)
  } catch (error) {
    console.error('Asset upload error:', error)
    res.status(500).json({ error: 'Failed to upload asset' })
  }
})

// Update asset metadata
router.patch('/:id', (req, res) => {
  const { id } = req.params
  const { name, tags, mood } = req.body

  const asset = assets.find(a => a.id === id)
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' })
  }

  if (name) asset.metadata.name = name
  if (tags) asset.metadata.tags = JSON.parse(tags)
  if (mood) asset.metadata.mood = JSON.parse(mood)
  asset.metadata.updatedAt = new Date().toISOString()

  res.json(asset)
})

// Delete asset
router.delete('/:id', (req, res) => {
  const { id } = req.params

  const asset = assets.find(a => a.id === id)
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' })
  }

  // Delete files
  const basePath = path.join(__dirname, '../../../')
  const filePath = path.join(basePath, asset.url)
  const thumbnailPath = path.join(basePath, asset.thumbnailUrl)

  try {
    fs.unlinkSync(filePath)
    fs.unlinkSync(thumbnailPath)
  } catch (error) {
    console.error('File deletion error:', error)
  }

  assets = assets.filter(a => a.id !== id)
  res.json({ success: true })
})

export default router 