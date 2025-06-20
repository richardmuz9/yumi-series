import React from 'react'
import writingHelperData from '../../data/writingHelperData.json'

interface PlatformSelectorProps {
  platform: string
  audience: string
  onPlatformChange: (platform: string) => void
  onAudienceChange: (audience: string) => void
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  platform,
  audience,
  onPlatformChange,
  onAudienceChange
}) => {
  const platforms = writingHelperData.platforms
  const audiences = writingHelperData.audiences.socialMedia

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Choose Your Platform
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => onPlatformChange(p.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                platform === p.id
                  ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{p.icon}</span>
                <span className="font-medium text-gray-800">{p.name}</span>
              </div>
              <p className="text-sm text-gray-600">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Target Audience
        </h2>
        <div className="space-y-2">
          {audiences.map((a) => (
            <label
              key={a.id}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                audience === a.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <input
                type="radio"
                name="audience"
                value={a.id}
                checked={audience === a.id}
                onChange={(e) => onAudienceChange(e.target.value)}
                className="w-4 h-4 text-purple-600 mr-3"
              />
              <div>
                <div className="font-medium text-gray-800">{a.name}</div>
                <div className="text-sm text-gray-600">{a.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
} 