import React, { useState, useEffect } from 'react'
import writingHelperData from '../../data/writingHelperData.json'

interface PostVariation {
  id: string
  content: string
  hook: string
  sentiment: string
  sentimentScore: number
  engagement: {
    likes: number
    comments: number
    shares: number
  } | null
}

interface PostPreviewProps {
  generatedPost: string
  platform: string
  characterCount: number
  maxLength: number
  withinLimit: boolean
  isGenerating: boolean
  onReset: () => void
}

export const PostPreview: React.FC<PostPreviewProps> = ({
  generatedPost,
  platform,
  characterCount,
  maxLength,
  withinLimit,
  isGenerating,
  onReset
}) => {
  const [selectedVariation, setSelectedVariation] = useState(0)
  const [variations, setVariations] = useState<PostVariation[]>([])
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false)
  const [showCrossPlatformPreview, setShowCrossPlatformPreview] = useState(false)
  const [selectedVariationForTracking, setSelectedVariationForTracking] = useState<string | null>(null)

  // Generate A/B variations when post is generated
  useEffect(() => {
    if (generatedPost && !isGenerating) {
      generateVariations()
    }
  }, [generatedPost, isGenerating])

  const generateVariations = () => {
    const baseVariation: PostVariation = {
      id: 'original',
      content: generatedPost,
      hook: extractHook(generatedPost),
      sentiment: analyzeSentiment(generatedPost).label,
      sentimentScore: analyzeSentiment(generatedPost).score,
      engagement: null
    }

    // Generate 2 additional variations
    const variations: PostVariation[] = [
      baseVariation,
      {
        id: 'variation_1',
        content: generateVariationContent(generatedPost, 'emoji'),
        hook: extractHook(generatedPost).replace(/^/, '🚀 '),
        sentiment: 'Energetic',
        sentimentScore: 0.8,
        engagement: null
      },
      {
        id: 'variation_2',
        content: generateVariationContent(generatedPost, 'question'),
        hook: extractHook(generatedPost) + ' What do you think?',
        sentiment: 'Engaging',
        sentimentScore: 0.7,
        engagement: null
      }
    ]

    setVariations(variations)
  }

  const extractHook = (content: string): string => {
    const lines = content.split('\n')
    return lines[0]?.substring(0, 50) + (lines[0]?.length > 50 ? '...' : '')
  }

  const analyzeSentiment = (content: string): { label: string; score: number } => {
    // Simple sentiment analysis (in real app, use AI API)
    const positiveWords = writingHelperData.sentimentAnalysis.positiveWords
    const negativeWords = writingHelperData.sentimentAnalysis.negativeWords
    
    const words = content.toLowerCase().split(/\s+/)
    const positiveCount = words.filter(word => positiveWords.some(pos => word.includes(pos))).length
    const negativeCount = words.filter(word => negativeWords.some(neg => word.includes(neg))).length
    
    const score = (positiveCount - negativeCount + 5) / 10 // Normalize to 0-1
    const clampedScore = Math.max(0, Math.min(1, score))
    
    if (clampedScore > 0.7) return { label: 'Positive', score: clampedScore }
    if (clampedScore < 0.3) return { label: 'Negative', score: clampedScore }
    return { label: 'Neutral', score: clampedScore }
  }

  const generateVariationContent = (original: string, type: 'emoji' | 'question'): string => {
    if (type === 'emoji') {
      return original.replace(/\./g, ' ✨').replace(/!/g, ' 🚀')
    }
    return original + '\n\nWhat are your thoughts on this? Share in the comments! 👇'
  }

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'negative': return 'text-red-600 bg-red-50'
      case 'energetic': return 'text-orange-600 bg-orange-50'
      case 'engaging': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCurrentVariation = (): PostVariation | null => {
    return variations[selectedVariation] || null
  }

  const markAsPublished = (variationId: string, engagement: PostVariation['engagement']) => {
    setVariations(prev => prev.map(v => 
      v.id === variationId ? { ...v, engagement } : v
    ))
    setSelectedVariationForTracking(variationId)
  }

  const copyToClipboard = () => {
    const currentVariation = getCurrentVariation()
    const contentToCopy = currentVariation?.content || generatedPost
    
    navigator.clipboard.writeText(contentToCopy)
      .then(() => {
        alert('Post copied to clipboard!')
      })
      .catch(() => {
        alert('Failed to copy to clipboard')
      })
  }

  const getPlatformIcon = () => {
    return writingHelperData.platformIcons[platform as keyof typeof writingHelperData.platformIcons] || writingHelperData.platformIcons.default
  }

  const getPlatformName = () => {
    return writingHelperData.platformNames[platform as keyof typeof writingHelperData.platformNames] || platform
  }

  const getCharacterCountColor = () => {
    const percentage = (characterCount / maxLength) * 100
    if (percentage > 100) return 'text-red-600'
    if (percentage > 90) return 'text-orange-600'
    if (percentage > 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const renderCrossPlatformPreview = () => {
    const currentContent = getCurrentVariation()?.content || generatedPost
    const platforms = writingHelperData.crossPlatformPreview
    
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          🌐 Cross-Platform Preview
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map(platformName => (
            <div key={platformName} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {platformName === 'linkedin' ? '💼' : platformName === 'twitter' ? '🐦' : '📱'}
                </span>
                <span className="text-sm font-medium capitalize">{platformName}</span>
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-24 overflow-hidden">
                {currentContent.substring(0, platformName === 'twitter' ? 280 : 500)}
                {currentContent.length > (platformName === 'twitter' ? 280 : 500) && '...'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {currentContent.length} / {platformName === 'twitter' ? '280' : '∞'} chars
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{getPlatformIcon()}</span>
          <h3 className="text-lg font-semibold text-gray-800">
            {getPlatformName()} Preview
          </h3>
          {variations.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                A/B TESTING
              </span>
            </div>
          )}
        </div>
        
        {/* Character Count and Sentiment */}
        <div className="flex items-center justify-between">
          {characterCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-medium ${getCharacterCountColor()}`}>
                {characterCount} / {maxLength}
              </span>
              <span className="text-gray-500">characters</span>
              {!withinLimit && (
                <span className="text-red-600 text-xs">⚠️ Over limit</span>
              )}
            </div>
          )}
          
          {getCurrentVariation() && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(getCurrentVariation()!.sentiment)}`}>
                {getCurrentVariation()!.sentiment} ({Math.round(getCurrentVariation()!.sentimentScore * 100)}%)
              </span>
            </div>
          )}
        </div>

        {/* A/B Variation Selector */}
        {variations.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Variations:</span>
            {variations.map((variation, index) => (
              <button
                key={variation.id}
                onClick={() => setSelectedVariation(index)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedVariation === index
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index === 0 ? 'Original' : `Var ${index}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600 text-center">
              Generating your perfect post with A/B variations...
            </p>
            <p className="text-sm text-gray-500 text-center mt-2">
              This may take a few seconds
            </p>
          </div>
        ) : generatedPost ? (
          <div className="space-y-6">
            {/* Generated Post */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px]">
              <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
                {getCurrentVariation()?.content || generatedPost}
              </div>
            </div>

            {/* Sentiment Analysis */}
            {getCurrentVariation() && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <button
                  onClick={() => setShowSentimentAnalysis(!showSentimentAnalysis)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-800">🔍 Sentiment Analysis</span>
                  <span className="text-gray-400">{showSentimentAnalysis ? '▼' : '▶'}</span>
                </button>
                
                {showSentimentAnalysis && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Tone:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(getCurrentVariation()!.sentiment)}`}>
                        {getCurrentVariation()!.sentiment}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getCurrentVariation()!.sentimentScore * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(getCurrentVariation()!.sentimentScore * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cross-Platform Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <button
                onClick={() => setShowCrossPlatformPreview(!showCrossPlatformPreview)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-800">🌐 Cross-Platform Preview</span>
                <span className="text-gray-400">{showCrossPlatformPreview ? '▼' : '▶'}</span>
              </button>
              
              {showCrossPlatformPreview && (
                <div className="mt-4">
                  {renderCrossPlatformPreview()}
                </div>
              )}
            </div>

            {/* Performance Tracking */}
            {variations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  📊 Performance Tracking
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Mark which variation you published and track its performance:
                </p>
                <div className="space-y-2">
                  {variations.map((variation, index) => (
                    <div key={variation.id} className="flex items-center justify-between bg-white rounded p-2">
                      <span className="text-sm">
                        {index === 0 ? 'Original' : `Variation ${index}`} - {variation.sentiment}
                      </span>
                      <button
                        onClick={() => markAsPublished(variation.id, { likes: 0, comments: 0, shares: 0 })}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          selectedVariationForTracking === variation.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {selectedVariationForTracking === variation.id ? 'Published' : 'Mark as Published'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Character Limit Warning */}
            {!withinLimit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <span>⚠️</span>
                  <span className="text-sm font-medium">
                    Post exceeds {getPlatformName()} character limit
                  </span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  Consider shortening your content or key points
                </p>
              </div>
            )}

            {/* Success Message */}
            {withinLimit && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <span>✅</span>
                  <span className="text-sm font-medium">
                    Perfect! Your post is ready for {getPlatformName()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                <span className="text-lg">📋</span>
                Copy {selectedVariation > 0 ? `Variation ${selectedVariation}` : 'Original'} to Clipboard
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium flex items-center justify-center gap-2">
                  <span className="text-lg">📅</span>
                  Schedule Post
                </button>
                
                <button
                  onClick={onReset}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🔄</span>
                  Create New
                </button>
              </div>
            </div>

            {/* Platform-Specific Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                💡 {getPlatformName()} Tips
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                {platform === 'linkedin' && (
                  <>
                    <p>• Post during business hours for better engagement</p>
                    <p>• Use 3-5 hashtags maximum</p>
                    <p>• Ask questions to encourage comments</p>
                  </>
                )}
                {platform === 'xiaohongshu' && (
                  <>
                    <p>• Use 5-10 relevant hashtags</p>
                    <p>• Include emojis for visual appeal</p>
                    <p>• Share personal experiences</p>
                  </>
                )}
                {platform === 'twitter' && (
                  <>
                    <p>• Tweet during peak hours (9am-10am, 7pm-9pm)</p>
                    <p>• Use 1-2 hashtags for better reach</p>
                    <p>• Keep it concise and engaging</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4 opacity-50">✨</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Ready to Generate
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Complete the wizard steps and click "Generate Post" to see your AI-crafted content with A/B variations here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {generatedPost && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            🤖 Generated by Yumi AI • A/B Testing Ready • Optimized for {getPlatformName()}
          </div>
        </div>
      )}
    </div>
  )
} 