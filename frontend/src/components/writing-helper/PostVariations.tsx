import React, { useState } from 'react'

interface PostVariation {
  id: string
  content: string
  changes: string[]
  confidence: number
}

interface PostVariationsProps {
  variations: PostVariation[]
  onSelectVariation: (variation: PostVariation) => void
  onRate: (variationId: string, rating: number) => void
  platform: string
}

export const PostVariations: React.FC<PostVariationsProps> = ({
  variations,
  onSelectVariation,
  onRate,
  platform
}) => {
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [ratings, setRatings] = useState<Record<string, number>>({})

  const handleVariationSelect = (variation: PostVariation) => {
    setSelectedVariation(variation.id)
    onSelectVariation(variation)
  }

  const handleRate = (variationId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [variationId]: rating }))
    onRate(variationId, rating)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.8) return 'text-blue-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Excellent'
    if (confidence >= 0.8) return 'Good'
    if (confidence >= 0.7) return 'Fair'
    return 'Basic'
  }

  const StarRating: React.FC<{ variationId: string; currentRating?: number }> = ({ 
    variationId, 
    currentRating = 0 
  }) => {
    const [hoverRating, setHoverRating] = useState(0)
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(variationId, star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`text-lg transition-colors ${
              star <= (hoverRating || currentRating)
                ? 'text-yellow-500'
                : 'text-gray-300 hover:text-yellow-400'
            }`}
          >
            ⭐
          </button>
        ))}
      </div>
    )
  }

  if (variations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">✨</div>
        <p className="text-gray-600">No variations generated</p>
        <p className="text-sm text-gray-500 mt-1">
          Enable "Generate Variations" to see multiple versions
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          🎭 Post Variations ({variations.length})
        </h3>
        <div className="text-sm text-gray-500">
          Click to select • Rate with stars
        </div>
      </div>

      <div className="space-y-4">
        {variations.map((variation, index) => (
          <div
            key={variation.id}
            className={`relative border-2 rounded-xl p-4 transition-all duration-300 cursor-pointer ${
              selectedVariation === variation.id
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
            }`}
            onClick={() => handleVariationSelect(variation)}
          >
            {/* Variation Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Variation {String.fromCharCode(65 + index)}
                  </span>
                  {selectedVariation === variation.id && (
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                
                {/* Confidence Score */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Quality:</span>
                  <span className={`text-xs font-medium ${getConfidenceColor(variation.confidence)}`}>
                    {getConfidenceLabel(variation.confidence)} ({Math.round(variation.confidence * 100)}%)
                  </span>
                </div>
              </div>

              {/* Star Rating */}
              <StarRating 
                variationId={variation.id} 
                currentRating={ratings[variation.id]}
              />
            </div>

            {/* Post Content */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {variation.content}
              </div>
            </div>

            {/* Changes Made */}
            {variation.changes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Changes Made:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {variation.changes.map((change, changeIndex) => (
                    <span
                      key={changeIndex}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {change}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Character Count */}
            <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>{variation.content.length} characters</span>
              <div className="flex items-center gap-2">
                <span>For {platform === 'xiaohongshu' ? '小红书' : platform}</span>
                {selectedVariation === variation.id && (
                  <span className="text-purple-600 font-medium">
                    ← Currently selected
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Variation Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📊 Variation Statistics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {variations.length}
            </div>
            <div className="text-blue-700">Generated</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {Math.round(variations.reduce((sum, v) => sum + v.confidence, 0) / variations.length * 100)}%
            </div>
            <div className="text-blue-700">Avg Quality</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {Object.keys(ratings).length}
            </div>
            <div className="text-blue-700">Rated</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {selectedVariation ? '1' : '0'}
            </div>
            <div className="text-blue-700">Selected</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">
          💡 Pro Tips
        </h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Higher quality scores indicate better AI confidence in the variation</li>
          <li>• Rate variations to help improve future recommendations</li>
          <li>• Selected variation will be used for final post preview</li>
          <li>• Changes show what was modified from the base post</li>
        </ul>
      </div>
    </div>
  )
} 