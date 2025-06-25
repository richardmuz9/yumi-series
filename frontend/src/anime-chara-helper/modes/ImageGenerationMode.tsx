import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import { IconBar } from '../components/IconBar'
import AIGeneratePanel from '../components/AIGeneratePanel'
import { AIOutlineGenerator } from '../components/AIOutlineGenerator'
import { ExportPanel } from '../components/ExportPanel'
import ReferenceSearch from '../components/ReferenceSearch'
import { YumiReferenceModal } from '../components/YumiReferenceModal'
import { Dialog, DialogContent, Alert, Button, Typography } from '@mui/material'
import { Box } from '@mui/material'
import { CharacterData, DrawingTool } from '../types'

interface ImageGenerationModeProps {
  onBack: () => void
  onSwitchToCreation: () => void
  uploadedFiles: File[]
  onFileUpload: (files: File[]) => void
  selectedReferenceUrl: string | null
  showCustomization: boolean
  onCustomizeToggle: () => void
  showYumiReferences: boolean
  setShowYumiReferences: (show: boolean) => void
  onYumiReferenceSelect: (url: string) => void
}

export const ImageGenerationMode: React.FC<ImageGenerationModeProps> = ({
  onBack,
  onSwitchToCreation,
  uploadedFiles,
  onFileUpload,
  selectedReferenceUrl,
  showCustomization,
  onCustomizeToggle,
  showYumiReferences,
  setShowYumiReferences,
  onYumiReferenceSelect
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // AI Generation state
  const [hasImageGenAccess, setHasImageGenAccess] = useState(false)
  const [freeTrialsUsed, setFreeTrialsUsed] = useState(0)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [context, setContext] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('brush')
  
  // Dialog states
  const [showOutlineGenerator, setShowOutlineGenerator] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  // Character data for AI generation
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    age: '',
    background: '',
    catchphrase: '',
    personalityTraits: [],
    visualMotifs: [],
    designElements: []
  })

  useEffect(() => {
    if (user) {
      // Check image generation access and free trial usage
      api.get('/api/billing/image-gen-status').then(response => {
        setHasImageGenAccess(response.data.hasAccess)
        setFreeTrialsUsed(response.data.freeTrialsUsed || 0)
      }).catch(console.error)
    }
  }, [user])

  const handleToolChange = (tool: string) => {
    if (tool === 'ai-outline') {
      setShowOutlineGenerator(true)
      return
    }
    
    setSelectedTool(tool as DrawingTool)
  }

  const handleContextChange = (newContext: string | null) => {
    setContext(newContext)
  }

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImageUrl(imageUrl)
    console.log('Image generated:', imageUrl)
  }

  const handleOutlineGenerated = (outlineUrl: string) => {
    setShowOutlineGenerator(false)
    console.log('Outline generated:', outlineUrl)
  }

  const handleImageGenerationAttempt = () => {
    if (!hasImageGenAccess && freeTrialsUsed >= 3) {
      setShowPaymentDialog(true)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false)
    setHasImageGenAccess(true)
    // Refresh the billing status
    api.get('/api/billing/image-gen-status').then(response => {
      setHasImageGenAccess(response.data.hasAccess)
      setFreeTrialsUsed(response.data.freeTrialsUsed || 0)
    }).catch(console.error)
  }

  const renderContextPanel = () => {
    switch (context) {
      case 'export':
        return <ExportPanel />
      case 'search':
        return (
          <ReferenceSearch
            onSelect={(imageUrl) => {
              console.log('Reference image selected:', imageUrl)
            }}
            onClose={() => setContext(null)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="image-generation-mode">
      {/* Icon Bar - AI Mode */}
      <IconBar
        mode="ai-generate"
        context={context}
        setMode={() => {}} // Mode is fixed to ai-generate
        setContext={handleContextChange}
        onBack={onBack}
        onToolChange={handleToolChange}
        selectedTool={selectedTool}
        onCustomizeToggle={onCustomizeToggle}
        onFileUpload={onFileUpload}
        onYumiRefsToggle={() => setShowYumiReferences(true)}
        // v1.2 props (disabled in AI mode)
        onCharacterLibraryToggle={() => {}}
        onAIColorAssistantToggle={() => {}}
        onSmartBrushToggle={() => {}}
        onVersionHistoryToggle={() => {}}
      />

      {/* Customization Panel */}
      {showCustomization && (
        <div className="customization-panel anime-customization">
          <h3>🤖 AI Generation Mode</h3>
          
          <div className="customization-section">
            <h4>Generation Status</h4>
            <div className="status-info">
              <div className="status-item">
                <span>Access Level: </span>
                <span className={hasImageGenAccess ? 'status-premium' : 'status-free'}>
                  {hasImageGenAccess ? 'Premium' : 'Free Trial'}
                </span>
              </div>
              {!hasImageGenAccess && (
                <div className="status-item">
                  <span>Free Trials Used: </span>
                  <span>{freeTrialsUsed}/3</span>
                </div>
              )}
            </div>
          </div>

          <div className="customization-section">
            <h4>Quick Actions</h4>
            <div className="quick-tools">
              <button onClick={onSwitchToCreation}>
                🎨 Switch to Creation Mode
              </button>
              <button onClick={() => setShowOutlineGenerator(true)}>
                ✏️ AI Outline Generator
              </button>
            </div>
          </div>

          <div className="customization-section">
            <h4>Uploaded References</h4>
            {uploadedFiles.length > 0 ? (
              <div className="uploaded-files">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>{file.name}</span>
                    <small>({(file.size / 1024).toFixed(1)} KB)</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>No files uploaded yet. Use the upload icon to add reference images.</p>
            )}
          </div>
        </div>
      )}

      {/* Main AI Generate Panel */}
      <div className="ai-generate-container">
        <AIGeneratePanel
          onDone={handleImageGenerated}
          hasImageGenAccess={hasImageGenAccess}
          freeTrialsUsed={freeTrialsUsed}
          onPaymentRequired={handleImageGenerationAttempt}
        />
      </div>

      {/* Generated Image Display */}
      {generatedImageUrl && (
        <div className="generated-image-overlay">
          <div className="generated-image-container">
            <img src={generatedImageUrl} alt="Generated character" />
            <div className="image-actions">
              <button onClick={() => setContext('export')}>
                📤 Export
              </button>
              <button onClick={onSwitchToCreation}>
                🎨 Edit in Creation Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Panel */}
      {context && (
        <div className="context-panel">
          {renderContextPanel()}
        </div>
      )}

      {/* AI Outline Generator Dialog */}
      <Dialog 
        open={showOutlineGenerator} 
        onClose={() => setShowOutlineGenerator(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <AIOutlineGenerator
            onOutlineGenerated={handleOutlineGenerated}
            onClose={() => setShowOutlineGenerator(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog 
        open={showPaymentDialog} 
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box textAlign="center" p={3}>
            <Typography variant="h6" gutterBottom>
              🎨 Unlock Image Generation
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={3}>
              You've used all your free trials. Purchase access to continue creating amazing anime characters!
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => alert('Premium access is currently unavailable.')}
              fullWidth
              sx={{ mb: 2 }}
            >
              💎 Get Premium Access
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setShowPaymentDialog(false)}
              fullWidth
            >
              Maybe Later
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Yumi Reference Modal */}
      {showYumiReferences && (
        <YumiReferenceModal
          onClose={() => setShowYumiReferences(false)}
          onSelect={onYumiReferenceSelect}
        />
      )}
    </div>
  )
} 