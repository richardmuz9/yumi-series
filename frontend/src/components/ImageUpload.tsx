import React, { useState, useRef, useCallback } from 'react'
import './ImageUpload.css'

interface ImageUploadProps {
  onImageUpload: (file: File, preview: string) => void
  onImageAnalysis?: (analysis: string) => void
  maxSize?: number // in MB
  acceptedFormats?: string[]
  placeholder?: string
  showAnalysis?: boolean
}

interface UploadedImage {
  file: File
  preview: string
  analysis?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageAnalysis,
  maxSize = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  placeholder = "Drop images here or click to upload",
  showAnalysis = true
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzeImage = async (file: File, preview: string): Promise<string> => {
    if (!showAnalysis) return ''
    
    try {
      setIsAnalyzing(true)
      
      // Convert image to base64 for API
      const base64 = preview.split(',')[1]
      
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          image: base64,
          filename: file.name
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const result = await response.json()
      return result.analysis || 'Image uploaded successfully'
    } catch (error) {
      console.error('Image analysis error:', error)
      return 'Image uploaded (analysis unavailable)'
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      // Check file type
      if (!acceptedFormats.includes(file.type)) {
        alert(`Invalid file type: ${file.type}. Please upload: ${acceptedFormats.join(', ')}`)
        return false
      }
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max size: ${maxSize}MB`)
        return false
      }
      
      return true
    })

    for (const file of validFiles) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const preview = e.target?.result as string
        
        // Analyze image if enabled
        const analysis = await analyzeImage(file, preview)
        
        const uploadedImage: UploadedImage = {
          file,
          preview,
          analysis
        }
        
        setUploadedImages(prev => [...prev, uploadedImage])
        onImageUpload(file, preview)
        
        if (analysis && onImageAnalysis) {
          onImageAnalysis(analysis)
        }
      }
      reader.readAsDataURL(file)
    }
  }, [acceptedFormats, maxSize, onImageUpload, onImageAnalysis, showAnalysis])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      })
      
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(video, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' })
            const preview = canvas.toDataURL()
            
            onImageUpload(file, preview)
            setUploadedImages(prev => [...prev, { file, preview }])
          }
        }, 'image/png')
        
        stream.getTracks().forEach(track => track.stop())
      }
    } catch (error) {
      console.error('Screenshot error:', error)
      alert('Screenshot capture failed. Please try uploading an image file instead.')
    }
  }

  return (
    <div className="image-upload-container">
      <div 
        className={`image-upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          <div className="upload-icon">📸</div>
          <p className="upload-text">{placeholder}</p>
          <p className="upload-hint">
            Supports: {acceptedFormats.map(f => f.split('/')[1]).join(', ')} • Max: {maxSize}MB
          </p>
          
          <div className="upload-actions">
            <button type="button" className="upload-btn primary">
              📁 Choose Files
            </button>
            <button type="button" className="upload-btn secondary" onClick={(e) => {
              e.stopPropagation()
              takeScreenshot()
            }}>
              📷 Screenshot
            </button>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="analysis-loading">
          <div className="loading-spinner"></div>
          <span>Analyzing image...</span>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="uploaded-images">
          <h4>📷 Uploaded Images ({uploadedImages.length})</h4>
          <div className="images-grid">
            {uploadedImages.map((img, index) => (
              <div key={index} className="image-item">
                <div className="image-preview">
                  <img src={img.preview} alt={`Upload ${index + 1}`} />
                  <button 
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
                <div className="image-info">
                  <div className="image-name">{img.file.name}</div>
                  <div className="image-size">
                    {(img.file.size / 1024).toFixed(1)} KB
                  </div>
                  {img.analysis && (
                    <div className="image-analysis">
                      <strong>AI Analysis:</strong>
                      <p>{img.analysis}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload 