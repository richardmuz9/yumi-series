import React from 'react'
import WizardLayout from '../Shared/WizardLayout'

interface BlogArticlesWizardProps {
  onBack: () => void
}

const BlogArticlesWizard: React.FC<BlogArticlesWizardProps> = ({ onBack }) => {
  return (
    <WizardLayout
      currentStep={1}
      totalSteps={5}
      stepTitle="Blog Articles - Coming Soon"
      onNext={() => {}}
      onPrev={() => {}}
      onBack={onBack}
      canProceed={false}
    >
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📄</div>
        <h2 className="text-2xl font-bold mb-4">Blog Articles Wizard</h2>
        <p className="text-gray-600 mb-8">
          This wizard will help you create long-form articles and blog posts.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-yellow-600">
            🚧 <strong>Coming Soon!</strong>
            <br />
            This content type is being developed and will be available in a future update.
          </div>
        </div>
      </div>
    </WizardLayout>
  )
}

export default BlogArticlesWizard 