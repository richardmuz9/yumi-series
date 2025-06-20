import React from 'react';

interface CrossPlatformPreviewProps {
  content: string;
  onClose: () => void;
}

interface PlatformConfig {
  name: string;
  icon: string;
  maxLength: number;
  features: string[];
}

const CrossPlatformPreview: React.FC<CrossPlatformPreviewProps> = ({
  content,
  onClose
}) => {
  const platforms: PlatformConfig[] = [
    {
      name: 'Twitter',
      icon: '🐦',
      maxLength: 280,
      features: ['Hashtags', 'Mentions', 'Threads']
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      maxLength: 3000,
      features: ['Professional tone', 'Industry insights', 'Long-form']
    },
    {
      name: 'Instagram',
      icon: '📷',
      maxLength: 2200,
      features: ['Visual focus', 'Stories', 'Hashtags']
    },
    {
      name: 'Facebook',
      icon: '📘',
      maxLength: 63206,
      features: ['Community engagement', 'Events', 'Groups']
    },
    {
      name: 'TikTok',
      icon: '🎵',
      maxLength: 150,
      features: ['Short & catchy', 'Trending sounds', 'Viral hooks']
    },
    {
      name: 'Reddit',
      icon: '🔴',
      maxLength: 40000,
      features: ['Discussion-focused', 'Community-specific', 'Detailed']
    }
  ];

  const adaptContentForPlatform = (content: string, platform: PlatformConfig): string => {
    let adaptedContent = content;

    switch (platform.name.toLowerCase()) {
      case 'twitter':
        // Truncate to fit Twitter's limit
        adaptedContent = content.substring(0, platform.maxLength);
        if (content.length > platform.maxLength) {
          adaptedContent += '... 🧵1/2';
        }
        break;
      
      case 'linkedin':
        // Add professional tone
        if (!content.includes('insights') && !content.includes('professional')) {
          adaptedContent += '\n\n#ProfessionalGrowth #Industry';
        }
        break;
      
      case 'instagram':
        // Add relevant hashtags
        if (!content.includes('#')) {
          adaptedContent += '\n\n#inspiration #motivation #lifestyle';
        }
        break;
      
      case 'tiktok':
        // Make it shorter and punchier
        const firstSentence = content.split('.')[0];
        adaptedContent = firstSentence.substring(0, platform.maxLength);
        break;
      
      case 'reddit':
        // Add discussion elements
        if (!content.includes('What do you think')) {
          adaptedContent += '\n\nWhat are your thoughts on this? Would love to hear your experiences!';
        }
        break;
      
      default:
        break;
    }

    return adaptedContent;
  };

  const getCharacterCountStatus = (length: number, maxLength: number) => {
    const percentage = (length / maxLength) * 100;
    if (percentage > 100) return { color: 'text-red-600', status: 'Over limit' };
    if (percentage > 90) return { color: 'text-orange-600', status: 'Near limit' };
    if (percentage > 80) return { color: 'text-yellow-600', status: 'Good' };
    return { color: 'text-green-600', status: 'Perfect' };
  };

  const generateHashtags = (content: string, platform: string): string[] => {
    // Simple hashtag generation based on content keywords
    const keywords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueKeywords = [...new Set(keywords)].slice(0, 5);
    
    return uniqueKeywords.map(keyword => `#${keyword}`);
  };

  return (
    <div className="cross-platform-preview-modal">
      <div className="cross-platform-preview-content">
        <div className="preview-header">
          <h3 className="text-xl font-semibold text-gray-800">
            🌐 Cross-Platform Preview
          </h3>
          <button 
            className="close-btn text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="preview-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map(platform => {
              const adaptedContent = adaptContentForPlatform(content, platform);
              const charStatus = getCharacterCountStatus(adaptedContent.length, platform.maxLength);
              const hashtags = generateHashtags(content, platform.name);

              return (
                <div key={platform.name} className="platform-preview-card">
                  <div className="platform-header">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <h4 className="font-semibold">{platform.name}</h4>
                        <div className="text-xs text-gray-500">
                          {platform.maxLength === 63206 ? '∞' : platform.maxLength} chars max
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="platform-content">
                    <div className="content-preview">
                      <div className="content-text">
                        {adaptedContent}
                      </div>
                      
                      {hashtags.length > 0 && platform.name !== 'LinkedIn' && (
                        <div className="hashtags">
                          <div className="hashtag-list">
                            {hashtags.map((tag, index) => (
                              <span key={index} className="hashtag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="content-stats">
                      <div className={`character-count ${charStatus.color}`}>
                        {adaptedContent.length} / {platform.maxLength === 63206 ? '∞' : platform.maxLength}
                        <span className="status-text">• {charStatus.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="platform-features">
                    <div className="features-label">Key Features:</div>
                    <div className="features-list">
                      {platform.features.map((feature, index) => (
                        <span key={index} className="feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="platform-actions">
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(adaptedContent);
                        alert(`Content copied for ${platform.name}!`);
                      }}
                    >
                      📋 Copy for {platform.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="preview-footer">
          <div className="footer-note">
            <span className="note-icon">💡</span>
            <span className="note-text">
              Each platform preview is automatically optimized for its audience and character limits.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossPlatformPreview; 