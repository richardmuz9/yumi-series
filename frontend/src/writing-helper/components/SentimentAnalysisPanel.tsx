import React from 'react';

interface SentimentAnalysisProps {
  content: string;
  sentiment: string;
  sentimentScore: number;
  onClose: () => void;
}

const SentimentAnalysisPanel: React.FC<SentimentAnalysisProps> = ({
  content,
  sentiment,
  sentimentScore,
  onClose
}) => {
  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'energetic': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'engaging': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string): string => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      case 'energetic': return '⚡';
      case 'engaging': return '🤝';
      default: return '😐';
    }
  };

  const getScorePercentage = () => Math.round(sentimentScore * 100);

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Weak';
    return 'Very Weak';
  };

  const analyzeKeywords = (content: string) => {
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq: { [key: string]: number } = {};
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));
  };

  const keywords = analyzeKeywords(content);

  return (
    <div className="sentiment-analysis-modal">
      <div className="sentiment-analysis-content">
        <div className="sentiment-header">
          <h3 className="text-lg font-semibold text-gray-800">
            🧠 Sentiment Analysis
          </h3>
          <button 
            className="close-btn text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="sentiment-body space-y-6">
          {/* Overall Sentiment */}
          <div className="sentiment-overview">
            <div className={`sentiment-badge ${getSentimentColor(sentiment)} border rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getSentimentIcon(sentiment)}</span>
                <div>
                  <div className="font-semibold text-lg">{sentiment}</div>
                  <div className="text-sm opacity-75">
                    {getScoreDescription(getScorePercentage())} • {getScorePercentage()}% confidence
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Score Bar */}
          <div className="sentiment-score">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentiment Score
            </label>
            <div className="sentiment-score-bar">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    sentimentScore > 0.7 ? 'bg-green-500' :
                    sentimentScore > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${getScorePercentage()}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>
          </div>

          {/* Key Words */}
          <div className="key-words">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Most Frequent Words
            </label>
            <div className="flex flex-wrap gap-2">
              {keywords.map(({ word, count }) => (
                <span 
                  key={word}
                  className="keyword-tag bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                >
                  {word} ({count})
                </span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optimization Suggestions
            </label>
            <div className="space-y-2">
              {sentimentScore < 0.5 && (
                <div className="recommendation-item bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Consider adding more positive language or emotional hooks to increase engagement.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {sentiment.toLowerCase() === 'neutral' && (
                <div className="recommendation-item bg-blue-50 border-l-4 border-blue-400 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-blue-400">💡</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Try adding emotions, questions, or call-to-actions to make the content more engaging.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {sentimentScore > 0.7 && (
                <div className="recommendation-item bg-green-50 border-l-4 border-green-400 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-green-400">✅</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Great sentiment! This content is likely to resonate well with your audience.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysisPanel; 