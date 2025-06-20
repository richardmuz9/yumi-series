import React, { useState } from 'react'
import writingHelperData from '../../data/writingHelperData.json'

interface ObjectiveSelectorProps {
  objective: string
  platform: string
  onObjectiveChange: (objective: string) => void
}

export const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
  objective,
  platform,
  onObjectiveChange
}) => {
  const [customObjective, setCustomObjective] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const commonObjectives = writingHelperData.objectives.common
  const contentTypeSpecificObjectives = writingHelperData.objectives

  const allObjectives = [
    ...commonObjectives,
    ...(contentTypeSpecificObjectives[platform as keyof typeof contentTypeSpecificObjectives] || [])
  ]

  const handleObjectiveSelect = (selectedObjective: string) => {
    if (selectedObjective === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      onObjectiveChange(selectedObjective)
    }
  }

  const handleCustomSubmit = () => {
    if (customObjective.trim()) {
      onObjectiveChange(customObjective.trim())
      setShowCustom(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          What's your post objective?
        </h2>
        <p className="text-gray-600 mb-6">
          Choose what you want to achieve with this post
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allObjectives.map((obj) => (
          <button
            key={obj.id}
            onClick={() => handleObjectiveSelect(obj.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              objective === obj.id
                ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{obj.icon}</span>
              <span className="font-medium text-gray-800">{obj.name}</span>
            </div>
            <p className="text-sm text-gray-600">{obj.description}</p>
          </button>
        ))}
        
        {/* Custom Objective Option */}
        <button
          onClick={() => handleObjectiveSelect('custom')}
          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
            showCustom
              ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✏️</span>
            <span className="font-medium text-gray-800">Custom</span>
          </div>
          <p className="text-sm text-gray-600">Define your own objective</p>
        </button>
      </div>

      {/* Custom Objective Input */}
      {showCustom && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">
            Custom Objective
          </h3>
          <div className="space-y-4">
            <textarea
              value={customObjective}
              onChange={(e) => setCustomObjective(e.target.value)}
              placeholder="Describe what you want to achieve with this post..."
              className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleCustomSubmit}
                disabled={!customObjective.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Use This Objective
              </button>
              <button
                onClick={() => {
                  setShowCustom(false)
                  setCustomObjective('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Objective Preview */}
      {objective && !showCustom && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <span className="text-lg">✅</span>
            <span className="font-medium">Selected: {objective}</span>
          </div>
        </div>
      )}
    </div>
  )
} 