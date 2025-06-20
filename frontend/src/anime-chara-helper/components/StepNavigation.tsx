import React from 'react';

type Step = 'idea' | 'template' | 'outline' | 'drawing' | 'complete';

interface StepNavigationProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  canProgress: boolean;
  onPrevious: () => void;
  onNext: () => void;
  t: any; // Translation object
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onStepChange,
  canProgress,
  onPrevious,
  onNext,
  t
}) => {
  const steps: { key: Step; title: string; icon: string; description: string }[] = [
    {
      key: 'idea',
      title: 'Character Idea',
      icon: '💭',
      description: 'Define your character concept'
    },
    {
      key: 'template',
      title: 'Template',
      icon: '📋',
      description: 'Choose a base template'
    },
    {
      key: 'outline',
      title: 'AI Outline',
      icon: '🤖',
      description: 'Generate character outline'
    },
    {
      key: 'drawing',
      title: 'Drawing',
      icon: '🎨',
      description: 'Draw and customize'
    },
    {
      key: 'complete',
      title: 'Complete',
      icon: '✅',
      description: 'Export and share'
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="step-navigation">
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
        <div className="progress-text">
          Step {currentStepIndex + 1} of {steps.length}
        </div>
      </div>

      {/* Step Buttons */}
      <div className="step-buttons">
        {steps.map((step, index) => (
          <button
            key={step.key}
            className={`step-btn ${getStepStatus(index)}`}
            onClick={() => onStepChange(step.key)}
            disabled={index > currentStepIndex + 1}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
            {getStepStatus(index) === 'completed' && (
              <div className="step-checkmark">✓</div>
            )}
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="step-controls">
        <button
          onClick={onPrevious}
          disabled={currentStepIndex === 0}
          className="nav-btn prev-btn"
        >
          ← Previous
        </button>
        
        <div className="current-step-info">
          <span className="step-icon">{steps[currentStepIndex].icon}</span>
          <span className="step-title">{steps[currentStepIndex].title}</span>
        </div>
        
        <button
          onClick={onNext}
          disabled={currentStepIndex === steps.length - 1 || !canProgress}
          className="nav-btn next-btn"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default StepNavigation; 