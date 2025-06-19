import React from 'react'

interface ContentInputsProps {
  topic: string
  keyPoints: string[]
  pastPost: string
  customInstructions: string
  onTopicChange: (topic: string) => void
  onKeyPointsChange: (keyPoints: string[]) => void
  onPastPostChange: (pastPost: string) => void
  onCustomInstructionsChange: (instructions: string) => void
}

export const ContentInputs: React.FC<ContentInputsProps> = ({
  topic,
  keyPoints,
  pastPost,
  customInstructions,
  onTopicChange,
  onKeyPointsChange,
  onPastPostChange,
  onCustomInstructionsChange
}) => {
  const addKeyPoint = () => {
    const newPoint = prompt('Enter a key point:')
    if (newPoint && newPoint.trim()) {
      onKeyPointsChange([...keyPoints, newPoint.trim()])
    }
  }

  const removeKeyPoint = (index: number) => {
    onKeyPointsChange(keyPoints.filter((_, i) => i !== index))
  }

  const editKeyPoint = (index: number) => {
    const newPoint = prompt('Edit key point:', keyPoints[index])
    if (newPoint !== null) {
      if (newPoint.trim()) {
        const updated = [...keyPoints]
        updated[index] = newPoint.trim()
        onKeyPointsChange(updated)
      } else {
        removeKeyPoint(index)
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Content Details
        </h2>
        <p className="text-gray-600 mb-6">
          Tell us about your topic and key points
        </p>
      </div>

      {/* Topic Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Topic <span className="text-red-500">*</span>
        </label>
        <textarea
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="What's your post about? (e.g., 'Our new AI website builder that helps small businesses create professional sites')"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
        />
        <p className="text-xs text-gray-500">
          Be specific about what you want to discuss
        </p>
      </div>

      {/* Key Points */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Key Points (Optional)
          </label>
          <button
            onClick={addKeyPoint}
            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm flex items-center gap-1"
          >
            <span>+</span>
            Add Point
          </button>
        </div>
        
        {keyPoints.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">No key points added yet</p>
            <button
              onClick={addKeyPoint}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Click to add your first key point
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {keyPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="flex-1 text-gray-800">{point}</span>
                <button
                  onClick={() => editKeyPoint(index)}
                  className="text-purple-600 hover:text-purple-700 text-sm px-2 py-1 rounded hover:bg-purple-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeKeyPoint(index)}
                  className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-100 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          Add specific benefits, features, or points you want to highlight
        </p>
      </div>

      {/* Past Post (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Reference Past Post (Optional)
        </label>
        <textarea
          value={pastPost}
          onChange={(e) => onPastPostChange(e.target.value)}
          placeholder="Paste a previous post for style continuity..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-500">
          AI will maintain consistency with your previous posting style
        </p>
      </div>

      {/* Custom Instructions (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Additional Instructions (Optional)
        </label>
        <textarea
          value={customInstructions}
          onChange={(e) => onCustomInstructionsChange(e.target.value)}
          placeholder="Any specific requirements? (e.g., 'Include a call-to-action', 'Mention our website URL', 'Use emojis sparingly')"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
        />
        <p className="text-xs text-gray-500">
          Special requirements or formatting preferences
        </p>
      </div>

      {/* Content Summary */}
      {topic && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">
            Content Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-purple-600">Topic:</span>
              <span className="text-gray-800 ml-2">{topic}</span>
            </div>
            {keyPoints.length > 0 && (
              <div>
                <span className="font-medium text-purple-600">Key Points:</span>
                <div className="ml-2 mt-1">
                  {keyPoints.map((point, index) => (
                    <div key={index} className="text-gray-800">
                      • {point}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pastPost && (
              <div>
                <span className="font-medium text-purple-600">Has reference post:</span>
                <span className="text-gray-800 ml-2">Yes</span>
              </div>
            )}
            {customInstructions && (
              <div>
                <span className="font-medium text-purple-600">Custom instructions:</span>
                <span className="text-gray-800 ml-2">Yes</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 