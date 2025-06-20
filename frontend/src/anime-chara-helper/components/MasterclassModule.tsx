import React, { useState, Suspense, lazy } from 'react';

// Lazy-load the demo video component
const DemoVideo = lazy(() => import('./MasterclassVideoDemo'));

interface MasterclassStep {
  key: string;
  label: string;
}

const steps: MasterclassStep[] = [
  { key: 'objectives', label: 'Objectives' },
  { key: 'concept', label: 'Concept' },
  { key: 'demo', label: 'Demo' },
  { key: 'practice', label: 'Practice' },
  { key: 'quiz', label: 'Quiz' }
];

const objectives = [
  'Understand how to identify and paint light sources',
  'Apply advanced shading techniques for realism',
  'Spot and fix common lighting mistakes in anime art'
];

const quizQuestion = {
  question: 'Which area should be the brightest if the light source is above the character?',
  options: [
    'The top of the head and shoulders',
    'The feet and lower legs',
    'The back of the character',
    'The area under the chin'
  ],
  correct: 0
};

const MasterclassModule: React.FC = () => {
  const [activeStep, setActiveStep] = useState('objectives');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const handleQuizSubmit = () => {
    if (quizAnswer === quizQuestion.correct) {
      setQuizResult('✅ Correct! The top of the head and shoulders receive the most light.');
    } else {
      setQuizResult('❌ Not quite. Review the concept and try again!');
    }
  };

  return (
    <div className="masterclass-module-modal">
      <div className="masterclass-header">
        <h2>🌟 Masterclass: Advanced Lighting</h2>
        <div className="stepper">
          {steps.map(step => (
            <button
              key={step.key}
              className={`stepper-btn${activeStep === step.key ? ' active' : ''}`}
              onClick={() => setActiveStep(step.key)}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>
      <div className="masterclass-content">
        {activeStep === 'objectives' && (
          <div className="objectives-section">
            <h3>🎯 Learning Objectives</h3>
            <ul>
              {objectives.map((obj, idx) => (
                <li key={idx}>✅ {obj}</li>
              ))}
            </ul>
          </div>
        )}
        {activeStep === 'concept' && (
          <div className="concept-section">
            <h3>💡 Concept</h3>
            <p>
              Lighting is crucial for creating depth and realism in anime art. Always identify your main light source before shading. Areas facing the light will be brightest, while areas turned away will be in shadow.
            </p>
            <img src="/tutorials/lighting-concept.png" alt="Lighting Concept" style={{ maxWidth: 320, borderRadius: 8, margin: '16px 0' }} />
          </div>
        )}
        {activeStep === 'demo' && (
          <div className="demo-section">
            <h3>🎬 Demo</h3>
            <Suspense fallback={<div>Loading video...</div>}>
              <DemoVideo src="/tutorials/lighting-demo.mp4" />
            </Suspense>
          </div>
        )}
        {activeStep === 'practice' && (
          <div className="practice-section">
            <h3>🖌️ Hands-on Practice</h3>
            <p>Download the practice sketch and try applying lighting and shading yourself!</p>
            <a href="/tutorials/lighting-practice.png" download className="download-btn">⬇️ Download Practice Sketch</a>
          </div>
        )}
        {activeStep === 'quiz' && (
          <div className="quiz-section">
            <h3>📝 Quick Quiz</h3>
            <p>{quizQuestion.question}</p>
            <ul className="quiz-options">
              {quizQuestion.options.map((opt, idx) => (
                <li key={idx}>
                  <label>
                    <input
                      type="radio"
                      name="quiz"
                      checked={quizAnswer === idx}
                      onChange={() => {
                        setQuizAnswer(idx);
                        setQuizResult(null);
                      }}
                    />
                    {opt}
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={handleQuizSubmit} className="submit-btn" disabled={quizAnswer === null}>
              Submit
            </button>
            {quizResult && <div className="quiz-result">{quizResult}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterclassModule; 