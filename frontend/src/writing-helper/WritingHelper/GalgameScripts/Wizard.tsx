import React from 'react'
import WizardLayout from '../Shared/WizardLayout'

interface GalgameScriptsWizardProps {
  onBack: () => void
}

const GalgameScriptsWizard: React.FC<GalgameScriptsWizardProps> = ({ onBack }) => {
  return (
    <WizardLayout
      currentStep={1}
      totalSteps={8}
      stepTitle="Galgame Scripts - Coming Soon"
      onNext={() => {}}
      onPrev={() => {}}
      onBack={onBack}
      canProceed={false}
    >
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-2xl font-bold mb-4">Galgame Scripts Wizard</h2>
        <p className="text-gray-600 mb-8">
          This wizard will help you create immersive visual novel dialogue and scene scripts.
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-purple-600">
            🎮 <strong>Specialized Content!</strong>
            <br />
            Advanced visual novel scripting features are being developed for this unique content type.
          </div>
        </div>
      </div>
    </WizardLayout>
  )
}

export default GalgameScriptsWizard 