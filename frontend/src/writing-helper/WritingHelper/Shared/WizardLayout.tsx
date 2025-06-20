import React from 'react'
import { WizardLayoutProps } from './types'

export const WizardLayout: React.FC<WizardLayoutProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  onNext,
  onPrev,
  onBack,
  canProceed,
  children
}) => {
  return (
    <div className="wizard-layout">
      {/* Header with Step Progress */}
      <div className="wizard-header">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="back-button flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Selection
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">{stepTitle}</h1>
          
          <div className="step-counter text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="step-indicators flex items-center justify-center mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < totalSteps && (
                <div
                  className={`w-8 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="wizard-content flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {children}
      </div>

      {/* Navigation Footer */}
      <div className="wizard-footer flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onPrev}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg transition-all duration-300 ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ← Previous
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Step {currentStep}</span>
          <span>•</span>
          <span>{stepTitle}</span>
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-3 rounded-lg transition-all duration-300 ${
            !canProceed
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : currentStep === totalSteps
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {currentStep === totalSteps ? 'Generate Content' : 'Next →'}
        </button>
      </div>

      <style>
        {`
        .wizard-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .wizard-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .wizard-content {
          flex: 1;
          min-height: 400px;
        }

        .wizard-footer {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .wizard-layout {
            padding: 10px;
          }
          
          .wizard-header {
            padding: 16px;
          }
          
          .wizard-content {
            padding: 16px;
          }
          
          .wizard-footer {
            padding: 16px;
          }
          
          .step-indicators {
            flex-wrap: wrap;
            gap: 8px;
          }
        }
        `}
      </style>
    </div>
  )
} 