import React, { useState, useEffect } from 'react'
import { postGeneratorService } from '../../services/postGeneratorApi'

interface TrendingHooksProps {
  platform: string
  trendingHashtags: string[]
  onTrendingHashtagsChange: (hashtags: string[]) => void
}

export const TrendingHooks: React.FC<TrendingHooksProps> = ({
  platform,
  trendingHashtags,
  onTrendingHashtagsChange
}) => {
  const [trends, setTrends] = useState<Array<{ tag: string; count: number }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrends = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await postGeneratorService.getTrends(platform)
      setTrends(response.trends)
    } catch (err) {
      setError('Failed to fetch trends. Please try again.')
      console.error('Trends fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Auto-fetch trends when platform changes
    if (platform) {
      fetchTrends()
    }
  }, [platform])

  const toggleHashtag = (tag: string) => {
    const isSelected = trendingHashtags.includes(tag)
    if (isSelected) {
      onTrendingHashtagsChange(trendingHashtags.filter(h => h !== tag))
    } else {
      onTrendingHashtagsChange([...trendingHashtags, tag])
    }
  }

  const addCustomHashtag = () => {
    const customTag = prompt('Enter a custom hashtag (without #):')
    if (customTag && customTag.trim()) {
      const formattedTag = customTag.trim().startsWith('#') 
        ? customTag.trim() 
        : `#${customTag.trim()}`
      
      if (!trendingHashtags.includes(formattedTag)) {
        onTrendingHashtagsChange([...trendingHashtags, formattedTag])
      }
    }
  }

  const removeHashtag = (tag: string) => {
    onTrendingHashtagsChange(trendingHashtags.filter(h => h !== tag))
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case 'linkedin': return '💼'
      case 'xiaohongshu': return '📱'
      case 'twitter': return '🐦'
      default: return '📊'
    }
  }

  const getPlatformName = () => {
    switch (platform) {
      case 'linkedin': return 'LinkedIn'
      case 'xiaohongshu': return '小红书 / Rednote'
      case 'twitter': return 'Twitter'
      default: return platform
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Trending Hooks (Optional)
        </h2>
        <p className="text-gray-600 mb-6">
          Add trending hashtags to boost your post's reach
        </p>
      </div>

      {/* Platform Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getPlatformIcon()}</span>
          <span className="font-medium text-gray-800">{getPlatformName()}</span>
          <button
            onClick={fetchTrends}
            disabled={isLoading}
            className="ml-auto px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm flex items-center gap-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                Fetching...
              </>
            ) : (
              <>
                <span>🔄</span>
                Refresh Trends
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-red-700">{error}</span>
            <button
              onClick={fetchTrends}
              className="ml-auto text-red-600 hover:text-red-700 text-sm underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Trending Tags */}
      {trends.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">
            🔥 Trending Now on {getPlatformName()}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trends.map((trend, index) => (
              <button
                key={index}
                onClick={() => toggleHashtag(trend.tag)}
                className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                  trendingHashtags.includes(trend.tag)
                    ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{trend.tag}</span>
                  <span className="text-sm text-gray-500">{trend.count.toLocaleString()} posts</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {trendingHashtags.includes(trend.tag) ? 'Selected' : 'Click to add'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Hashtag */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">
            Custom Hashtags
          </h3>
          <button
            onClick={addCustomHashtag}
            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm flex items-center gap-1"
          >
            <span>+</span>
            Add Custom
          </button>
        </div>
      </div>

      {/* Selected Hashtags */}
      {trendingHashtags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">
            Selected Hashtags ({trendingHashtags.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-purple-100 border border-purple-300 rounded-full text-purple-800"
              >
                <span className="text-sm font-medium">{tag}</span>
                <button
                  onClick={() => removeHashtag(tag)}
                  className="text-purple-600 hover:text-purple-800 text-xs w-4 h-4 flex items-center justify-center rounded-full hover:bg-purple-200 transition-colors"
                  title="Remove hashtag"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            These hashtags will be incorporated into your post where relevant
          </p>
        </div>
      )}

      {/* Empty State */}
      {trendingHashtags.length === 0 && trends.length > 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No hashtags selected</p>
          <p className="text-sm text-gray-400">
            Click on trending hashtags above or add custom ones to boost your reach
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && trends.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600">Fetching trending hashtags...</p>
        </div>
      )}
    </div>
  )
} 