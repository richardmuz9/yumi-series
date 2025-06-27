import React, { useState } from 'react';
import './SenseiPanel.css';

interface JapaneseLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
  }[];
}

const JAPANESE_LESSONS: JapaneseLesson[] = [
  {
    id: 'te-form',
    title: '～て-form の使い方',
    description: '動詞の接続形を学びましょう',
    content: `
      て-form は日本語の重要な文法です。
      基本形から変換する方法：
      1. う段 → って
      2. く、ぐ → いて、いで
      3. す → して
      4. む、ぶ、ぬ → んで
      5. る → って
    `,
    quiz: [
      {
        question: '「食べる」のて-form は？',
        options: ['食べって', '食べて', '食べで', '食べれ'],
        answer: 1
      },
      {
        question: '「書く」のて-form は？',
        options: ['書って', '書いで', '書いて', '書くて'],
        answer: 2
      }
    ]
  },
  {
    id: 'kanji-basics',
    title: '漢字の基本',
    description: '漢字の書き方と読み方',
    content: `
      漢字の基本的な書き方：
      1. 筆順を守る
      2. バランスを整える
      3. はね、はらい、とめを意識する
    `,
    quiz: [
      {
        question: '「木」の正しい筆順は？',
        options: [
          '↓→↙↗',
          '→↓↙↗',
          '↗↙↓→',
          '↓↗↙→'
        ],
        answer: 0
      }
    ]
  }
];

export const SenseiPanel: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const lesson = selectedLesson 
    ? JAPANESE_LESSONS.find(l => l.id === selectedLesson)
    : null;

  const handleNextQuiz = () => {
    if (!lesson) return;
    if (currentQuizIndex < lesson.quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setShowAnswer(false);
      setSelectedOption(null);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setShowAnswer(true);
  };

  return (
    <div className="sensei-panel">
      {!selectedLesson ? (
        <div className="lesson-list">
          <h3>日本語レッスン</h3>
          <div className="lesson-grid">
            {JAPANESE_LESSONS.map(lesson => (
              <div 
                key={lesson.id}
                className="lesson-card"
                onClick={() => setSelectedLesson(lesson.id)}
              >
                <h4>{lesson.title}</h4>
                <p>{lesson.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : lesson ? (
        <div className="lesson-content">
          <button 
            className="back-button"
            onClick={() => {
              setSelectedLesson(null);
              setCurrentQuizIndex(0);
              setShowAnswer(false);
            }}
          >
            ← レッスン一覧に戻る
          </button>
          
          <h3>{lesson.title}</h3>
          <div className="lesson-explanation">
            <pre>{lesson.content}</pre>
          </div>

          <div className="quiz-section">
            <h4>確認クイズ</h4>
            <div className="quiz-card">
              <p className="quiz-question">
                {lesson.quiz[currentQuizIndex].question}
              </p>
              <div className="quiz-options">
                {lesson.quiz[currentQuizIndex].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(i)}
                    className={`quiz-option ${
                      showAnswer
                        ? i === lesson.quiz[currentQuizIndex].answer
                          ? 'correct'
                          : selectedOption === i
                          ? 'incorrect'
                          : ''
                        : selectedOption === i
                        ? 'selected'
                        : ''
                    }`}
                    disabled={showAnswer}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {showAnswer && (
                <div className="quiz-feedback">
                  {selectedOption === lesson.quiz[currentQuizIndex].answer ? (
                    <p className="correct-feedback">正解です！</p>
                  ) : (
                    <p className="incorrect-feedback">
                      不正解です。正しい答えは「
                      {lesson.quiz[currentQuizIndex].options[lesson.quiz[currentQuizIndex].answer]}
                      」です。
                    </p>
                  )}
                  {currentQuizIndex < lesson.quiz.length - 1 && (
                    <button className="next-quiz-button" onClick={handleNextQuiz}>
                      次の問題へ →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}; 