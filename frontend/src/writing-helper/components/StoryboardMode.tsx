import React, { useState } from 'react'
import { Asset } from '../../shared/types/shared'
import AssetLibrary from '../../shared/components/AssetLibrary'
import '../styles/StoryboardMode.css'

interface Scene {
  id: string
  image?: Asset
  text: string
  type: 'dialogue' | 'narration'
  character?: string
  position?: 'left' | 'center' | 'right'
  background?: Asset
}

interface StoryboardModeProps {
  mode: 'manga' | 'galgame'
  onExport: (scenes: Scene[]) => void
}

const StoryboardMode: React.FC<StoryboardModeProps> = ({ mode, onExport }) => {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [showAssetLibrary, setShowAssetLibrary] = useState(false)

  const addScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      text: '',
      type: 'dialogue'
    }
    setScenes(prev => [...prev, newScene])
    setSelectedSceneId(newScene.id)
  }

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(scene => 
      scene.id === id ? { ...scene, ...updates } : scene
    ))
  }

  const deleteScene = (id: string) => {
    setScenes(prev => prev.filter(scene => scene.id !== id))
    if (selectedSceneId === id) {
      setSelectedSceneId(null)
    }
  }

  const moveScene = (id: string, direction: 'up' | 'down') => {
    const index = scenes.findIndex(scene => scene.id === id)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === scenes.length - 1)
    ) return

    const newScenes = [...scenes]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newScenes[targetIndex]
    newScenes[targetIndex] = newScenes[index]
    newScenes[index] = temp
    setScenes(newScenes)
  }

  const handleAssetSelect = (asset: Asset) => {
    if (!selectedSceneId) return

    if (asset.type === 'background') {
      updateScene(selectedSceneId, { background: asset })
    } else {
      updateScene(selectedSceneId, { image: asset })
    }
    setShowAssetLibrary(false)
  }

  return (
    <div className="storyboard-mode">
      <div className="scene-list">
        {scenes.map(scene => (
          <div
            key={scene.id}
            className={`scene-card ${selectedSceneId === scene.id ? 'selected' : ''}`}
            onClick={() => setSelectedSceneId(scene.id)}
          >
            <div className="scene-header">
              <select
                value={scene.type}
                onChange={e => updateScene(scene.id, { type: e.target.value as Scene['type'] })}
              >
                <option value="dialogue">Dialogue</option>
                <option value="narration">Narration</option>
              </select>
              <div className="scene-actions">
                <button onClick={() => moveScene(scene.id, 'up')}>↑</button>
                <button onClick={() => moveScene(scene.id, 'down')}>↓</button>
                <button onClick={() => deleteScene(scene.id)}>×</button>
              </div>
            </div>

            {mode === 'galgame' && scene.type === 'dialogue' && (
              <div className="character-controls">
                <input
                  type="text"
                  placeholder="Character name"
                  value={scene.character || ''}
                  onChange={e => updateScene(scene.id, { character: e.target.value })}
                />
                <select
                  value={scene.position || 'center'}
                  onChange={e => updateScene(scene.id, { position: e.target.value as Scene['position'] })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}

            <div className="scene-content">
              <div className="scene-image">
                {scene.background && (
                  <img
                    src={scene.background.thumbnailUrl}
                    alt="Background"
                    className="background-image"
                  />
                )}
                {scene.image && (
                  <img
                    src={scene.image.thumbnailUrl}
                    alt="Character/Scene"
                    className={`character-image ${scene.position || 'center'}`}
                  />
                )}
                <button onClick={() => setShowAssetLibrary(true)}>
                  Add Image
                </button>
              </div>
              <textarea
                value={scene.text}
                onChange={e => updateScene(scene.id, { text: e.target.value })}
                placeholder={scene.type === 'dialogue' ? 'Enter dialogue...' : 'Enter narration...'}
              />
            </div>
          </div>
        ))}
        <button className="add-scene" onClick={addScene}>
          Add Scene
        </button>
      </div>

      <div className="storyboard-actions">
        <button onClick={() => onExport(scenes)}>
          Export {mode === 'manga' ? 'Comic' : 'Visual Novel'}
        </button>
      </div>

      {showAssetLibrary && (
        <div className="asset-library-modal">
          <div className="modal-header">
            <h3>Select Asset</h3>
            <button onClick={() => setShowAssetLibrary(false)}>×</button>
          </div>
          <AssetLibrary
            onAssetSelect={handleAssetSelect}
            mode="grid"
          />
        </div>
      )}
    </div>
  )
}

export default StoryboardMode 