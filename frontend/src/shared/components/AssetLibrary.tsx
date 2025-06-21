import React, { useState, useEffect } from 'react'
import { Asset } from '../types/shared'
import '../styles/AssetLibrary.css'

interface AssetLibraryProps {
  onAssetSelect?: (asset: Asset) => void
  onAssetDrop?: (asset: Asset, target: HTMLElement) => void
  selectedAssetId?: string
  mode?: 'grid' | 'list'
  allowDrag?: boolean
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({
  onAssetSelect,
  onAssetDrop,
  selectedAssetId,
  mode = 'grid',
  allowDrag = false
}) => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<Asset['type'] | 'all'>('all')

  // Load assets from backend
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await fetch('/api/assets')
        const data = await response.json()
        setAssets(data)
      } catch (error) {
        console.error('Failed to load assets:', error)
      }
    }
    loadAssets()
  }, [])

  const filteredAssets = assets.filter(asset => {
    if (typeFilter !== 'all' && asset.type !== typeFilter) return false
    if (!filter) return true
    
    const searchTerms = filter.toLowerCase().split(' ')
    const assetText = [
      asset.metadata.name,
      ...asset.metadata.tags,
      ...(asset.metadata.mood || [])
    ].join(' ').toLowerCase()
    
    return searchTerms.every(term => assetText.includes(term))
  })

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    if (!allowDrag) return
    e.dataTransfer.setData('application/json', JSON.stringify(asset))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="asset-library">
      <div className="asset-library-header">
        <input
          type="text"
          placeholder="Search assets..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="asset-search"
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as Asset['type'] | 'all')}
          className="asset-type-filter"
        >
          <option value="all">All Types</option>
          <option value="character">Characters</option>
          <option value="background">Backgrounds</option>
          <option value="pose">Poses</option>
        </select>
      </div>

      <div className={`asset-grid ${mode}`}>
        {filteredAssets.map(asset => (
          <div
            key={asset.id}
            className={`asset-card ${selectedAssetId === asset.id ? 'selected' : ''}`}
            onClick={() => onAssetSelect?.(asset)}
            draggable={allowDrag}
            onDragStart={e => handleDragStart(e, asset)}
          >
            <img
              src={asset.thumbnailUrl}
              alt={asset.metadata.name}
              className="asset-thumbnail"
            />
            <div className="asset-info">
              <h4>{asset.metadata.name}</h4>
              <div className="asset-tags">
                {asset.metadata.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              {asset.metadata.mood && (
                <div className="asset-mood">
                  {asset.metadata.mood.map(mood => (
                    <span key={mood} className="mood">
                      {mood}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AssetLibrary 