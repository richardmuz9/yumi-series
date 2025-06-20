import React from 'react'
import WizardLayout from '../Shared/WizardLayout'

interface CreativeWritingWizardProps {
  onBack: () => void
}

const CreativeWritingWizard: React.FC<CreativeWritingWizardProps> = ({ onBack }) => {
  return (
    <WizardLayout
      currentStep={1}
      totalSteps={6}
      stepTitle="Creative Writing - Coming Soon"
      onNext={() => {}}
      onPrev={() => {}}
      onBack={onBack}
      canProceed={false}
    >
      <div className="text-center py-20">
        <div className="text-6xl mb-4">✍️</div>
        <h2 className="text-2xl font-bold mb-4">Creative Writing Wizard</h2>
        <p className="text-gray-600 mb-8">
          This wizard will help you craft compelling stories, poems, and creative content.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-amber-600">
            ✨ <strong>Featured Content Type!</strong>
            <br />
            This popular option is currently being enhanced and will be available soon.
          </div>
        </div>
      </div>
    </WizardLayout>
  )
}

export default CreativeWritingWizard 