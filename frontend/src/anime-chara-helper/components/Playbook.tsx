import React, { useState } from 'react';

// Example data structure for expert session segments
export interface PlaybookStep {
  id: string;
  title: string;
  videoUrl: string;
  start: number;
  end: number;
  description: string;
  tooltips: { time: number; text: string }[];
  advanced?: boolean;
}

const sampleSteps: PlaybookStep[] = [
  {
    id: 'sketching',
    title: 'Sketching Basics',
    videoUrl: '/tutorials/sketching.mp4',
    start: 0,
    end: 60,
    description: 'Learn how to block out basic shapes and proportions.',
    tooltips: [
      { time: 10, text: 'Use light strokes for initial lines.' },
      { time: 30, text: 'Focus on silhouette and gesture.' }
    ]
  },
  {
    id: 'inking',
    title: 'Inking Techniques',
    videoUrl: '/tutorials/inking.mp4',
    start: 0,
    end: 45,
    description: 'Master line weight and clean outlines.',
    tooltips: [
      { time: 5, text: 'Vary line thickness for depth.' },
      { time: 25, text: 'Use quick, confident strokes.' }
    ]
  },
  {
    id: 'shading',
    title: 'Pro Shading Tips',
    videoUrl: '/tutorials/shading.mp4',
    start: 0,
    end: 50,
    description: 'Advanced: Add light and shadow for realism.',
    tooltips: [
      { time: 15, text: 'Identify your light source.' },
      { time: 35, text: 'Blend shadows smoothly.' }
    ],
    advanced: true
  }
];

interface PlaybookProps {
  steps?: PlaybookStep[];
}

const Playbook: React.FC<PlaybookProps> = ({ steps = sampleSteps }) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const visibleSteps = showAdvanced ? steps : steps.filter(s => !s.advanced);

  return (
    <div className={`playbook-sidebar${open ? ' open' : ''}`}>
      <button className="playbook-toggle" onClick={() => setOpen(!open)}>
        {open ? '▶ Hide Playbook' : '◀ Show Playbook'}
      </button>
      {open && (
        <div className="playbook-content">
          <h3 className="playbook-title">🎬 Pro Workflow Playbook</h3>
          <div className="playbook-steps">
            {visibleSteps.map(step => (
              <button
                key={step.id}
                className={`playbook-step-btn${currentStep.id === step.id ? ' active' : ''}`}
                onClick={() => setCurrentStep(step)}
              >
                {step.title}
                {step.advanced && <span className="advanced-badge">Pro</span>}
              </button>
            ))}
          </div>
          {!showAdvanced && steps.some(s => s.advanced) && (
            <button className="unlock-advanced-btn" onClick={() => setShowAdvanced(true)}>
              🔓 Show Pro Tips
            </button>
          )}
          <div className="playbook-video-section">
            <video
              key={currentStep.videoUrl}
              src={currentStep.videoUrl}
              controls
              style={{ width: '100%', borderRadius: 8 }}
            />
            <div className="playbook-description">
              <strong>{currentStep.title}</strong>
              <p>{currentStep.description}</p>
            </div>
            <ul className="playbook-tooltips">
              {currentStep.tooltips.map((tip, idx) => (
                <li key={idx}>
                  <span className="tooltip-time">{tip.time}s:</span> {tip.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playbook; 