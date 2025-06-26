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
import { IoArrowBack } from 'react-icons/io5'
import { Sidebar } from '../../shared/components/Sidebar'

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

  const [prompt, setPrompt] = useState('')

  const sidebarItems = [
    {
      id: 'prompt',
      icon: '✨',
      label: 'Prompt Builder'
    },
    {
      id: 'style',
      icon: '🎨',
      label: 'Style Settings'
    },
    {
      id: 'history',
      icon: '📜',
      label: 'Generation History'
    }
  ]

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
    <div className="image-generation-mode" style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: '#fff'
    }}>
      {/* Fixed Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          <IoArrowBack /> Back to Modes
        </button>
        <div style={{
          marginLeft: 'auto',
          fontSize: '18px',
          fontWeight: 500
        }}>
          AI Image Generation
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        position="left"
        defaultCollapsed={false}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white'
        }}
      />

      {/* Main Content Area */}
      <div style={{
        marginTop: '80px',
        marginLeft: '220px',
        padding: '20px'
      }}>
        {/* Prompt Input Area */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '15px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              lineHeight: '1.6',
              resize: 'vertical'
            }}
            className="prompt-textarea"
          />
          <div style={{
            marginTop: '10px',
            display: 'flex',
            gap: '10px'
          }}>
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#4a90e2',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Generate
            </button>
            <button style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Clear
            </button>
          </div>
        </div>

        {/* Generated Images Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px'
        }}>
          {/* Placeholder for generated images */}
          <div style={{
            aspectRatio: '1',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            Generated images will appear here
          </div>
        </div>
      </div>
    </div>
  )
} 