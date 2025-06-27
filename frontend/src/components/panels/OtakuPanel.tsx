import React, { useState, useEffect } from 'react';
import { 
  CONVERSATION_STARTERS, 
  OTAKU_PURITY_QUESTIONS, 
  WEEKLY_RECOMMENDATIONS,
  OTAKU_MOOD_LEVELS,
  type OtakuMoodIndicator
} from '../../shared/data/otakuPersonalityData';
import { 
  type AnimeDiscussion, 
  type OtakuPurityTest,
  type AnimeMood 
} from '../../shared/types/anime';
import './OtakuPanel.css';

export const OtakuPanel: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<AnimeMood>('excited');
  const [moodLevel, setMoodLevel] = useState<OtakuMoodIndicator>(OTAKU_MOOD_LEVELS[0]);
  const [discussions, setDiscussions] = useState<AnimeDiscussion[]>([]);
  const [currentTopic, setCurrentTopic] = useState(CONVERSATION_STARTERS[0]);
  const [userInput, setUserInput] = useState('');
  const [showPurityTest, setShowPurityTest] = useState(false);
  const [purityTest, setPurityTest] = useState<OtakuPurityTest>({
    currentLevel: 1,
    discussions: [],
    unlockedAchievements: [],
    favoriteAnime: [],
    sharedInterests: []
  });

  useEffect(() => {
    // Update mood level based on discussions
    if (discussions.length >= 5 && moodLevel.level === 1) {
      setMoodLevel(OTAKU_MOOD_LEVELS[1]);
    } else if (discussions.length >= 10 && moodLevel.level === 2) {
      setMoodLevel(OTAKU_MOOD_LEVELS[2]);
    }
  }, [discussions]);

  const handleUserResponse = () => {
    if (!userInput.trim()) return;

    const newDiscussion: AnimeDiscussion = {
      topic: currentTopic.topic,
      userResponse: userInput,
      mood: moodLevel.level,
      timestamp: Date.now()
    };

    // Simulate Yumi's response
    const yumiResponse = currentTopic.yumiReactions[
      Math.floor(Math.random() * currentTopic.yumiReactions.length)
    ];

    setDiscussions(prev => [...prev, { ...newDiscussion, yumiResponse }]);
    setUserInput('');

    // Randomly switch topics
    const nextTopic = CONVERSATION_STARTERS[
      Math.floor(Math.random() * CONVERSATION_STARTERS.length)
    ];
    setCurrentTopic(nextTopic);
  };

  const handlePurityTestQuestion = () => {
    setShowPurityTest(true);
  };

  const renderAnimeChat = () => (
    <div className="anime-chat">
      <div className="mood-indicator">
        <div className="mood-level">
          <span className="mood-emoji">{currentTopic.emoji}</span>
          <span className="mood-text">{moodLevel.description}</span>
        </div>
        {moodLevel.unlockMessage && (
          <div className="unlock-message">{moodLevel.unlockMessage}</div>
        )}
      </div>

      <div className="chat-history">
        {discussions.map((discussion, index) => (
          <div key={index} className="chat-entry">
            <div className="user-message">
              <span className="message-text">{discussion.userResponse}</span>
            </div>
            {discussion.yumiResponse && (
              <div className="yumi-message">
                <img src="/references/yumi-6.png" alt="Yumi" className="yumi-avatar" />
                <span className="message-text">{discussion.yumiResponse}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="current-topic">
        <div className="topic-prompt">
          <img src="/references/yumi-6.png" alt="Yumi" className="yumi-avatar" />
          <span className="prompt-text">{currentTopic.prompt}</span>
        </div>
        <div className="topic-input">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
            placeholder="アニメについて話そう！"
          />
          <button onClick={handleUserResponse}>送信</button>
        </div>
      </div>

      <div className="quick-actions">
        <button 
          className="purity-test-button"
          onClick={handlePurityTestQuestion}
        >
          オタク純度テスト 💫
        </button>
        <div className="weekly-recommendation">
          <h4>今週のおすすめ</h4>
          {WEEKLY_RECOMMENDATIONS.map(rec => (
            <div key={rec.id} className="recommendation-card">
              <img src={rec.imageUrl} alt={rec.title} />
              <div className="recommendation-content">
                <h5>{rec.title}</h5>
                <p>{rec.description}</p>
                <div className="yumi-thoughts">
                  <img src="/references/yumi-6.png" alt="Yumi" className="yumi-avatar-small" />
                  <p>{rec.yumiThoughts}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPurityTest = () => (
    <div className="purity-test">
      <button 
        className="back-button"
        onClick={() => setShowPurityTest(false)}
      >
        ← チャットに戻る
      </button>

      <div className="test-intro">
        <h3>オタク純度テスト</h3>
        <p>これはテストじゃないよ！一緒にアニメについて語り合おう！</p>
      </div>

      <div className="test-content">
        {OTAKU_PURITY_QUESTIONS.map(q => (
          <div key={q.id} className="question-card">
            <div className="question-header">
              <span className="category-tag">{q.category}</span>
              <span className="difficulty">
                {'⭐'.repeat(q.difficulty)}
              </span>
            </div>
            <p className="question-text">{q.question}</p>
            <p className="context-text">{q.context}</p>
            <div className="yumi-answer">
              <img src="/references/yumi-6.png" alt="Yumi" className="yumi-avatar" />
              <div className="answer-content">
                <p>{q.yumiAnswer}</p>
                <p className="reaction">{q.yumiReaction}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="otaku-panel">
      {showPurityTest ? renderPurityTest() : renderAnimeChat()}
    </div>
  );
}; 