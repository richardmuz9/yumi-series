import React from 'react'
import writingHelperData from '../../data/writingHelperData.json'

interface StyleSelectorProps {
  tone: string
  stylePack: string
  onToneChange: (tone: string) => void
  onStylePackChange: (stylePack: string) => void
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  tone,
  stylePack,
  onToneChange,
  onStylePackChange
}) => {
  const tones = writingHelperData.tones
  const stylePacks = writingHelperData.stylePacks

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Choose Your Tone
        </h2>
        <p className="text-gray-600 mb-6">
          Select the overall feeling of your post
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tones.map((t) => (
            <button
              key={t.id}
              onClick={() => onToneChange(t.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                tone === t.id
                  ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{t.icon}</span>
                <span className="font-medium text-gray-800">{t.name}</span>
              </div>
              <p className="text-sm text-gray-600">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Style Pack (Optional)
        </h2>
        <p className="text-gray-600 mb-6">
          Add a special personality to your writing style
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stylePacks.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onStylePackChange(pack.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                stylePack === pack.id
                  ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{pack.icon}</span>
                <span className="font-medium text-gray-800">{pack.name}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{pack.description}</p>
              <div className="text-xs text-purple-600 bg-purple-100 rounded px-2 py-1 inline-block">
                Example: {pack.example}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      {(tone || stylePack) && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">
            Style Preview
          </h3>
          <div className="space-y-2">
            {tone && (
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-medium">Tone:</span>
                <span className="text-gray-800">{tone}</span>
              </div>
            )}
            {stylePack && (
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-medium">Style Pack:</span>
                <span className="text-gray-800">{stylePacks.find(p => p.id === stylePack)?.name}</span>
              </div>
            )}
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 italic">
              Your post will be written with a <strong>{tone.toLowerCase()}</strong> tone
              {stylePack && (
                <span> and a <strong>{stylePacks.find(p => p.id === stylePack)?.name.toLowerCase()}</strong> style</span>
              )}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 